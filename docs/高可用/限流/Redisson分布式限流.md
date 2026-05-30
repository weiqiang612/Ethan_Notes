# Redisson分布式滑动窗口限流实战

> 💡 **导读**
> 在构建高并发、高可用的互联网微服务架构时，为了防止外部高昂计费 API 被滥用、保障核心 LLM 接口及内部数据库资源不被突发超限流量压垮，**限流（Rate Limiting）** 是一道不可或缺的铜墙铁壁。本篇笔记系统地梳理了基于 **Redisson RRateLimiter** 的分布式滑动窗口限流技术实战。

---

## 一、 为什么需要分布式限流？

传统的单机限流（如 Guava `RateLimiter` 或本地 Semaphore 计数）是**进程级**的：
*   **痛点**：在多台服务器集群部署的生产环境下，由于每台服务器本地的状态无法共享，导致全局计数失效。例如，限制单个用户 1 分钟最多调用 20 次，若用户轮询调用了 3 台独立节点，全局频次实际上会膨胀到 60 次。
*   **对策**：采用 **Redis 分布式限流**。将限流器的状态、计数指标统一存储于中央 Redis 缓存中。所有的应用服务器在进入核心方法前，统一去 Redis 扣减额度，达成集群全局共享的分布式保护。

---

## 二、 Redisson 滑动窗口限流底层原理

Redisson 的 `RRateLimiter` 采用了目前业界先进的**滑动窗口（Sliding Window）**计数算法，相比于老旧的固定窗口算法，它能完美消除“窗口边界流量瞬间翻倍”的安全隐患。

### 1. Redis 内部数据结构
Redisson 会在 Redis 中为每个限流 Key（如 `rate_limit:ai:{userId}`）自动建立几个核心内部结构：
1.  **String 元数据 Key**：储存该限流器的速率配置（如：每 60 秒限流 20 次）。
2.  **ZSet 历史记录 Key**：记录该用户每一次获取令牌的**高精度时间戳**。

### 2. 滑动窗口 Lua 原子控制算法
为了在高并发下保证“检查频次 -> 扣减令牌 -> 写入时间戳”的完整性，Redisson 在底层采用了 **Redis Lua 脚本**。Redis 接收到 Lua 后，会以**单线程且原子**的机制在内部执行以下四大步骤：

```text
[请求进来]
   │
   ▼
1. 清理过期记录 ──► 根据当前时间戳 T，清理并移除 Redis 中早于 T - 60秒 之外的时间戳
   │
   ▼
2. 统计现存频次 ──► 统计 Redis 中 60 秒窗口内现存的时间戳记录总数 N
   │
   ▼
3. 判定超速决策 ──► 比较 N 与 额度限制（20 次）：
   ├── 若 N < 20 (放行) ──► 4. 将当前时间戳追加记入 ZSet，扣减 1 令牌，返回 true
   └── 若 N >= 20 (拦截) ──► 直接拒绝请求，不记录时间戳，返回 false
```

---

## 三、 RRateLimiter 核心 API 语法释义

在 Java 代码中，我们利用 `RedissonClient` 提供的接口执行限流。以下是核心 API 语法的深度解析：

### 1. 声明/获取限流器实例
```java
RRateLimiter rateLimiter = redissonClient.getRateLimiter(key);
```
*   **释义**：传入 Redis 唯一 Key 创建限流器 Java 代理对象。此步不会向 Redis 发送真实网络连接。

### 2. 检查限流器是否存在
```java
boolean exists = rateLimiter.isExists();
```
*   **释义**：检查 Redis 中是否已经存在此限流器的限流规则配置。常用于按需懒加载初始化。

### 3. 初始化限流规则参数
```java
boolean success = rateLimiter.trySetRate(
    RateType type, 
    long rate, 
    long rateInterval, 
    RateIntervalUnit unit
);
```
*   **参数详解**：
    *   `RateType type`：**限流模式**。
        *   `RateType.OVERALL`：**全局共享限流**（最常用，多台服务器全局共享计数）。
        *   `RateType.PER_CLIENT`：**单客户端节点限流**（只限制当前 JVM 节点的独立调用）。
    *   `long rate`：**许可频次额度**。即滑动窗口周期内允许的最大请求次数（例如 `20` 次）。
    *   `long rateInterval`：**滑动时间窗口区间长度**（例如 `60` 秒）。
    *   `RateIntervalUnit unit`：**时间单位**。可选天、小时、分、秒（`RateIntervalUnit.SECONDS`）。

### 4. 设置限流器自身的缓存有效期 (TTL)
```java
boolean success = rateLimiter.expire(Duration duration);
```
*   **释义**：显式设置这个限流器 Key 在 Redis 中的缓存生命周期。一旦该用户停止请求的时间超过了此周期，限流器会自动销毁，以防 Redis 产生无用僵尸 Key。

### 5. 尝试扣减令牌（非阻塞）
```java
boolean allowed = rateLimiter.tryAcquire(long permits);
```
*   **释义**：尝试立刻扣减 `permits`（通常是 `1`）个令牌。此 API 是**非阻塞的**，会在毫秒级内瞬间返回 `true`（允许放行）或 `false`（超速拦截）。

---

## 四、 生产级高可靠性架构设计

在真实的工业级项目中，我们通过了多项精妙的可靠性架构设计，规避了常见生产痛点：

### 1. 懒加载设计（Lazy Initialization）
*   **实现**：不采取系统启动时一次性预载所有用户的设计，而是当且仅当用户第一条请求进来时（`!rateLimiter.isExists()`），在 Redis 中按需自动初始化创建。
*   **优势**：节约海量不活跃用户的空间占用。

### 2. 显式缓存重用与自动过期保护（TTL）
*   **实现**：在初始化完速率后，立刻通过 `rateLimiter.expire(properties.getWindowSeconds())` 给该限流 Key 设定一个与窗口时间等长的生存周期。
*   **优势**：防止随着时间推移产生大量的僵尸用户 Key 滞留 Redis，杜绝了内存溢出隐患（符合 `never-do.md` 禁止项中 "Cache without explicit TTL" 的红线规范）。

### 3. 优雅容灾降级（Graceful Degradation）
*   **实现**：
    ```java
    try {
        // 限流处理逻辑...
        return rateLimiter.tryAcquire(1);
    } catch (Exception e) {
        log.error("Failed to acquire rate limit...", e);
        return true; // 降级放行
    }
    ```
*   **优势**：限流是“保护伞”，不能绑架主业务。当 Redis 发生罕见的网络闪断、连接爆满甚至宕机异常时，切面捕获异常并返回 `true`（放行）。这确保了安全防御组件的故障，绝不会引起正常用户体验的大面积崩塌（500 报错）。

### 4. 剩余解禁秒数换算（Retry-After）
*   **实现**：
    ```java
    long ttl = redissonClient.getKeys().remainTimeToLive(key);
    ```
*   **优势**：当用户被拦截时，我们向 Redis 索要该用户 Key 的剩余 TTL 生存期。这个毫秒值除以 1000 就是该滑动窗口自动清空并解封的倒计时，从而为前端提供了完美的等待倒计时提示（如：`请在 X 秒后再试`）。

---

## 五、 工业级 `RateLimitManager` 核心实现范本

以下为项目在实际生产中落地的高内聚限流配置管理器代码：

```java
package com.weiqiang.skyai.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RRateLimiter;
import org.redisson.api.RateIntervalUnit;
import org.redisson.api.RateType;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitManager {

    private final RedissonClient redissonClient;
    private final RateLimitProperties properties;

    /**
     * 尝试获取一个限流令牌
     *
     * @param userId 用户 ID
     * @return true - 获取成功，正常访问；false - 获取失败，限流拦截
     */
    public boolean tryAcquire(String userId) {
        String key = "rate_limit:ai:" + userId;
        try {
            RRateLimiter rateLimiter = redissonClient.getRateLimiter(key);
            if (!rateLimiter.isExists()) {
                // 1. 设置滑动窗口规则：OVERALL 全局模式，设置额度和窗口时长
                rateLimiter.trySetRate(
                        RateType.OVERALL,
                        properties.getRequestsPerMinute(),
                        properties.getWindowSeconds(),
                        RateIntervalUnit.SECONDS
                );
                // 2. 显式设置 Redis Key 过期时间，规避缓存泄露
                rateLimiter.expire(Duration.ofSeconds(properties.getWindowSeconds()));
            }
            return rateLimiter.tryAcquire(1);
        } catch (Exception e) {
            log.error("Failed to acquire rate limit token for user: {}", userId, e);
            // Redis 宕机或网络闪断时的优雅降级策略：允许访问，以保护业务可用性
            return true;
        }
    }

    /**
     * 获取限制解除所需的等待秒数
     *
     * @param userId 用户 ID
     * @return 限制解除的估算剩余秒数
     */
    public long getRetryAfterSeconds(String userId) {
        String key = "rate_limit:ai:" + userId;
        try {
            // 获取对应限流组件的 TTL 缓存剩余时间
            long ttl = redissonClient.getKeys().remainTimeToLive(key);
            if (ttl <= 0) {
                return properties.getWindowSeconds();
            }
            // 毫秒转秒，确保至少返回 1 秒以提供有效的倒计时
            return Math.max(1, ttl / 1000);
        } catch (Exception e) {
            return properties.getWindowSeconds();
        }
    }
}
```
