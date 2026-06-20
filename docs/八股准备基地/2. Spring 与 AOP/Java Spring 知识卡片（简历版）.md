---
priority: 1
---

# Java Spring 知识卡片（简历版）

这份卡片按你当前简历的项目强度整理。

目标不是 Java / Spring 全量源码级覆盖，而是：

- 能撑住普通 Java 后端一面 / 二面的基本盘追问
- 能把集合、反射、动态代理、AOP、事务讲清楚
- 能支撑 `苍穹外卖 AI 智能客服 Agent` 和 `黑马点评` 的后端工程追问
- 能把 Spring Boot 项目里的业务代码、事务边界、拦截链路说清楚

---

## 1. Java 基础总纲

- Java 基础不是背 API
- 面试重点是：
- 集合
- 并发
- JVM
- 反射
- 动态代理
- 异常
- 泛型
- 对你简历来说
- 集合、代理、AOP、事务最容易被追问
- 记一句：
- `Java 基本盘要能解释 Spring 为什么这样实现`

## 2. HashMap

- HashMap 底层是数组 + 链表 + 红黑树
- key 先算 hash
- 再定位数组下标
- 冲突时挂链表
- 链表太长会树化
- 树化条件常见是：
- 链表长度达到 8
- 数组长度至少 64
- 扩容一般是 2 倍
- 负载因子默认 0.75
- 面试重点：
- hash 扰动
- 扩容
- 链表转红黑树
- equals / hashCode

## 3. equals 和 hashCode

- equals 判断对象是否相等
- hashCode 用于哈希定位
- 如果两个对象 equals 相等
- hashCode 必须相等
- 如果 hashCode 相等
- equals 不一定相等
- 在 HashMap / HashSet 里
- 先看 hash
- 再看 equals
- 记一句：
- `hashCode 决定桶位置，equals 决定是不是同一个 key`

## 4. ConcurrentHashMap

- ConcurrentHashMap 是线程安全的 HashMap
- JDK 8 之后核心是：
- CAS
- synchronized
- volatile
- 分桶加锁
- 不是锁整张表
- 并发性能比 Hashtable 好
- 高频追问：
- 为什么 key 和 value 不能为 null
- 因为并发场景下无法区分：
- 是没有这个 key
- 还是 key 存在但 value 为 null

## 5. ArrayList

- ArrayList 底层是数组
- 查询快
- 按下标 O(1)
- 中间插入和删除慢
- 因为要移动元素
- 默认容量常见是 10
- 扩容通常是 1.5 倍
- 适合读多、按下标访问多的场景

## 6. LinkedList

- LinkedList 底层是双向链表
- 插入删除节点本身快
- 但查找位置慢
- 不适合频繁按下标访问
- 实际开发里不一定比 ArrayList 常用
- 因为链表节点对象多
- 缓存局部性差
- 内存开销更高

## 7. HashSet

- HashSet 底层基于 HashMap
- 元素存在 HashMap 的 key 上
- value 是固定占位对象
- 去重依赖：
- hashCode
- equals
- 所以自定义对象放进 HashSet
- 必须正确重写 equals 和 hashCode

## 8. 反射

- 反射是在运行期获取类信息和操作对象
- 可以获取：
- Class
- 构造器
- 方法
- 字段
- 注解
- Spring 大量使用反射
- 比如：
- Bean 创建
- 注解解析
- 依赖注入
- AOP 方法调用
- 反射缺点：
- 性能略低
- 破坏封装
- 编译期检查弱

## 9. 动态代理

- 动态代理是在运行期生成代理对象
- 作用是增强原对象方法
- 常见用途：
- AOP
- 事务
- 日志
- 权限
- RPC
- Spring AOP 主要依赖动态代理
- 记一句：
- `动态代理让增强逻辑和业务逻辑解耦`

## 10. JDK 动态代理

- JDK 动态代理基于接口
- 被代理类必须实现接口
- 核心是：
- Proxy
- InvocationHandler
- 调用方法时进入 invoke
- 优点：
- JDK 自带
- 适合接口编程
- 局限：
- 没有接口时不好用

## 11. CGLIB 代理

- CGLIB 基于继承生成子类
- 不要求目标类实现接口
- 通过重写方法实现增强
- 局限：
- final 类不能代理
- final 方法不能增强
- Spring 中：
- 有接口通常用 JDK 动态代理
- 没接口通常用 CGLIB

## 12. IoC

- IoC = 控制反转
- 对象创建权交给 Spring 容器
- 以前是自己 new
- 现在是容器创建和管理
- 好处：
- 解耦
- 统一生命周期
- 方便依赖注入
- 方便 AOP 增强
- 面试口径：
- `IoC 解决对象创建和依赖管理问题`

## 13. DI

- DI = 依赖注入
- 是 IoC 的实现方式
- 常见注入方式：
- 构造器注入
- setter 注入
- 字段注入
- 推荐构造器注入
- 原因：
- 依赖明确
- 更利于测试
- 可以配合 final
- 避免对象半初始化

## 14. Bean 生命周期

- Bean 生命周期常见流程：
- 实例化
- 属性填充
- Aware 回调
- BeanPostProcessor 前置处理
- 初始化方法
- BeanPostProcessor 后置处理
- 使用
- 销毁
- AOP 代理通常在后置处理阶段生成
- 记一句：
- `Bean 生命周期是 Spring 扩展点的主线`

## 15. 循环依赖

- Spring 主要通过三级缓存解决单例 Bean 的循环依赖
- 一级缓存：完整单例对象
- 二级缓存：早期对象
- 三级缓存：对象工厂
- 主要解决 setter 注入循环依赖
- 构造器循环依赖解决不了
- 因为对象还没创建出来
- 高频口径：
- `三级缓存的关键是提前暴露早期引用，并兼容 AOP 代理`

## 16. AOP

- AOP = 面向切面编程
- 作用是把横切逻辑抽出来
- 常见横切逻辑：
- 日志
- 事务
- 权限
- 限流
- 监控
- 项目口径：
- `Redisson 滑动窗口限流可以通过 AOP 拦截 HTTP 接口统一处理`

## 17. AOP 核心概念

- Join Point：连接点
- Pointcut：切点
- Advice：通知
- Aspect：切面
- Target：目标对象
- Proxy：代理对象
- 常见通知：
- 前置
- 后置
- 环绕
- 异常
- 最常用的是环绕通知
- 因为可以控制方法执行前后

## 18. Spring AOP 原理

- Spring AOP 底层主要是动态代理
- 调用方拿到的是代理对象
- 不是原始对象
- 代理对象在方法前后织入增强逻辑
- 所以 AOP 只对 Spring 容器管理的 Bean 生效
- 同类 this 自调用会绕过代理
- 所以事务和切面可能失效

## 19. 事务本质

- Spring 事务本质也是 AOP
- 在目标方法前开启事务
- 方法正常结束提交
- 方法抛异常回滚
- 关键点：
- 方法必须经过代理对象调用
- 异常必须向外抛出
- 数据库引擎要支持事务
- 记一句：
- `事务依赖代理，回滚依赖异常向外抛出`

## 20. 事务传播行为

- 传播行为解决方法互相调用时事务怎么处理
- 最常见：
- REQUIRED
- 当前有事务就加入
- 没有就新建
- REQUIRES_NEW
- 挂起当前事务
- 新开一个事务
- SUPPORTS
- 有事务就加入
- 没有就非事务执行
- 面试重点：
- 能讲清 REQUIRED 和 REQUIRES_NEW 的区别

## 21. 事务失效

- 常见失效场景：
- this 自调用
- 方法不是 public
- 异常被 catch 吞掉
- checked exception 默认不回滚
- 类没有交给 Spring 管理
- 数据库引擎不支持事务
- 方法被 final 修饰导致代理增强不了
- 解决思路：
- 通过代理对象调用
- 异常继续抛出
- 指定 rollbackFor
- 保证 Bean 由 Spring 管理

## 22. MyBatis

- MyBatis 是半自动 ORM 框架
- SQL 由开发者控制
- 映射由框架完成
- 优点：
- 灵活
- 适合复杂 SQL
- 容易做性能优化
- 缺点：
- SQL 要自己维护
- 动态 SQL 复杂时容易出错

## 23. MyBatis 动态 SQL

- 动态 SQL 用于按条件拼接 SQL
- 常见标签：
- if
- choose
- where
- set
- foreach
- 高频场景：
- 条件查询
- 批量插入
- 批量更新
- in 查询
- 注意：
- 避免 SQL 拼接注入风险
- 优先使用参数绑定

## 24. MyBatis 一级缓存

- 一级缓存默认开启
- 作用域是 SqlSession
- 同一个 SqlSession 内相同查询可以命中
- Spring 项目里一次请求通常不是长期复用同一个 SqlSession
- 所以不能过度依赖一级缓存
- 修改、提交、回滚会清空缓存

## 25. MyBatis 二级缓存

- 二级缓存作用域是 namespace
- 需要额外开启
- 实际互联网项目里不常重度依赖
- 原因：
- 数据一致性难控制
- 多表查询容易失效
- 分布式场景更复杂
- 项目里更常用 Redis / Caffeine 做缓存治理

## 26. N+1 问题

- N+1 是典型 ORM 查询问题
- 先查 1 次主表
- 再对每条记录查 1 次关联表
- 数据多时 SQL 次数爆炸
- 常见解决：
- join 查询
- 批量查询
- in 查询
- 结果组装
- 项目口径：
- `接口慢不一定是单条 SQL 慢，也可能是 SQL 次数太多`

## 27. 过滤器、拦截器、AOP

- Filter 是 Servlet 规范
- 最外层
- 适合处理请求级通用逻辑
- Interceptor 是 Spring MVC 机制
- 适合处理 Controller 前后逻辑
- AOP 面向方法增强
- 适合 service 方法、注解、事务、限流
- 记一句：
- `Filter 管 Web 入口，Interceptor 管 MVC 流程，AOP 管方法增强`

## 28. 统一异常处理

- Spring Boot 常用 `@RestControllerAdvice`
- 统一捕获业务异常和系统异常
- 好处：
- 返回格式统一
- 避免异常栈直接暴露给前端
- 便于日志记录
- 项目口径：
- `后端接口要让异常可控、可观测、可定位`

## 29. 参数校验

- 常见注解：
- @NotNull
- @NotBlank
- @Min
- @Max
- @Valid
- 参数校验不只是前端做
- 后端必须兜底
- 对 AI Tool Calling 更重要
- 因为模型生成的参数也可能错
- 项目口径：
- `模型给出的工具参数也必须走后端参数校验`

## 30. 项目高分口径

- 我的 Java / Spring 基本盘主要落在两个项目里
- 在 `黑马点评` 里
- Spring Boot 承接接口和业务编排
- Redis + Lua + 事务兜住秒杀一致性
- MyBatis 负责复杂 SQL 和持久化
- 在 `苍穹外卖 AI 智能客服 Agent` 里
- Spring Boot 承接 AI Agent 后端业务模块
- Spring AOP 做 HTTP 限流等横切治理
- Spring AI Advisor 链组织上下文、记忆、RAG 和工具调用
- Spring 事务、状态机、唯一约束和参数校验负责兜住模型调用风险

## 31. 面试一句话总结

- `Java 基本盘支撑业务代码，Spring 负责对象管理、代理增强和事务治理`
- `AOP 的核心是动态代理，事务也是基于代理实现`
- `MyBatis 适合复杂 SQL，但缓存和一致性不能只靠 MyBatis`
- `在我的项目里，Spring 不只是写接口，而是承接限流、事务、Agent 编排和安全校验`

---

**相关链接**：[[代理模式]] | [[Spring AOP]] | [[Java 值传递]] | [[JIT 和 AOT]] | [[苍穹外卖AI客服]] | [[黑马点评]]
