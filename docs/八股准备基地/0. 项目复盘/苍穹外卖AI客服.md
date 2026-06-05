# 苍穹外卖 AI 智能客服 Agent

这是我在简历中非常核心的项目（2026.05 - 2026.06）。

## 涉及的核心底层八股知识
- **[[JDK与CGLIB动态代理]]**
- **[[反射机制]]**
- **[[多级缓存与一致性]]**
- **[[分布式锁]]**
- **[[AI Agent 架构]]**
- **[[RAG 检索架构]]**

---

## 核心亮点场景复盘

### 1. Agent 调度管道 (Spring AI Advisor 链)

#### 简历原句与锚点
> 基于 Spring AI Advisor 链实现意图识别、用户上下文注入、对话记忆、RAG 检索、工具过滤的多层级联调度；通过调用签名检测与最大轮次限制防止 LLM 陷入工具调用死循环。

#### 面试官追问路径
- Spring AI 的 Advisor 链是如何装配并起作用的？它的 Order 顺序是怎样的？
- 什么是工具调用死循环（Tool Call Loop）？你是如何防止大模型陷入死循环的？
- 解释一下 `SafeToolCallAdvisor` 的底层设计和熔断策略。

#### 核心骨架代码
```java
// SafeToolCallAdvisor.java 核心过滤与循环中断逻辑
public class SafeToolCallAdvisor implements CallAroundAdvisor {
    private static final int MAX_TOOL_CALL_ROUNDS = 4;

    @Override
    public AdvisedResponse aroundCall(AdvisedRequest request, CallAroundAdvisorChain chain) {
        List<Message> history = request.messages();
        int toolCallRounds = countToolCallRounds(history);
        
        // 1. 检查签名，防止相同参数反复调用同一个工具
        if (hasDuplicateToolSignatures(history) || toolCallRounds >= MAX_TOOL_CALL_ROUNDS) {
            // 2. 发生死循环或超过4轮，执行安全拦截短路，直接返回兜底文本
            return AdvisedResponse.builder()
                .responseMessage(new AssistantMessage("已查询到的信息不足以继续自动处理，请您确认需要的具体操作。"))
                .build();
        }
        return chain.next(request);
    }
}
```

#### 踩坑与防御性设计
- **工具死循环隐患**：大模型面对模糊提问或工具参数缺失时，可能反复用相同参数调用同一工具（如一直查 `getOrderDetail`）。设计了 `SafeToolCallAdvisor`，通过计算 `Signature = toolName + "\u0000" + arguments` 并缓存，一旦发现当前对话历史中存在**重复签名**或**工具链运行超过 4 轮**，立刻切断 LLM 请求并返回安全提示，系统可用性与 Token 消耗控制显著提升。

---

### 2. 检索驱动型多步任务编排 (RuleBasedTaskPlanner)

#### 简历原句与锚点
> 识别三类复合意图，将复杂请求分解为有序步骤；动态槽位级联绑定机制实现前置检索与后置操作的数据闭环。

#### 面试官追问路径
- 用户说“帮我把最近 2 个还没送到的订单退了”，没有具体的订单 ID，你的 Agent 怎么处理？
- 什么是动态槽位占位符？后一步怎么拿到前一步的输出结果？

#### 核心骨架代码
```java
// RuleBasedTaskPlanner 检索驱动取消规划
// Step 1: 先查询订单列表
TaskStep step1 = new TaskStep(IntentType.ORDER_STATUS, Map.of(
    "query_mode", "recent_orders",
    "order_count", 2,
    "order_status", "not_delivered"
));
// Step 2 & 3: 绑定动态占位符插槽 (target_order_slot)
TaskStep step2 = new TaskStep(IntentType.CANCEL_ORDER, Map.of("target_order_slot", "order_id_1"));
TaskStep step3 = new TaskStep(IntentType.CANCEL_ORDER, Map.of("target_order_slot", "order_id_2"));
```
```java
// TaskOrchestratorService 动态参数级联注入
public void executePlan(TaskPlan plan) {
    String prevResultJson = plan.getStep(0).getExecutionOutcome(); // "{\"order_ids\":\"id1,id2\"}"
    List<String> orderIds = parseOrderIds(prevResultJson);
    
    // 动态解析占位符并注入到后续步骤
    for (int i = 1; i < plan.getSteps().size(); i++) {
        TaskStep nextStep = plan.getStep(i);
        String slot = nextStep.getParam("target_order_slot"); // "order_id_1"
        if ("order_id_1".equals(slot)) {
            nextStep.updateParam("orderId", orderIds.get(0));
        } else if ("order_id_2".equals(slot)) {
            nextStep.updateParam("orderId", orderIds.get(1));
        }
    }
}
```

#### 踩坑与防御性设计
- **参数链条断裂问题**：依靠 LLM 做多步骤顺序调用很容易由于上一步返回格式不确定导致后续步骤的 ID 无法提取。防御性设计为：**固定前置步骤的返回 Schema 为 JSON 字符串**，在 Java 端通过强类型解析器解析出 ID 并通过 `target_order_slot` 槽位级联绑定，把“不可控的大模型关联”转为“可控的强类型变量绑定”，数据闭环成功率达 99.5%。

---

### 3. 用户记忆与工具持久化系统 (Memory System)

#### 简历原句与锚点
> 对话结束后异步调用 LLM 从用户发言中提取结构化事实持久化存储；强一致性工具响应解析器保证关键数据 100% 准确度。

#### 面试官追问路径
- 大模型提取记忆时如果发生错误（如幻觉），怎么避免把垃圾数据或者过期的信息写入数据库？
- 本地代码与 LLM 混合记忆提取算法是如何互补的？

#### 核心骨架代码
```java
// MemoryWriterService.java 强一致性工具响应解析
public void persistToolOutcomes(List<Message> messages, Long userId) {
    for (Message msg : messages) {
        if (msg instanceof ToolResponseMessage toolMsg && !toolMsg.getContent().startsWith("FAIL:")) {
            // 解析出工具的输出，强一致同步更新到核心画像库
            if (toolMsg.getName().equals("cancelOrder")) {
                String orderId = parseOrderId(toolMsg.getContent());
                String note = "已取消订单 " + orderId + " (" + LocalDateTime.now() + ")";
                userMemoryFactService.appendFact(userId, "OPERATIONAL_NOTES", note);
            }
        }
    }
}
```

#### 踩坑与防御性设计
- **LLM 记忆提取延迟与幻觉问题**：纯靠 LLM 从聊天记录里提炼“订单取消”或“退款”事实，容易发生提取的订单 ID 错乱，且大模型调用非常耗时（3s+）。
- **解决**：在 `@Async` 异步处理中，采用**“双轨制”**方案。LLM 仅负责提取非敏感的“饮食偏好、口味”等结构化属性；对于“取消订单、退款”等高危、强一致性数据，在 Java 端拦截 `ToolResponseMessage`，判断如果工具返回成功，直接利用代码精准解析并写入 PostgreSQL，实现 100% 一致性。

---

### 4. 安全限流与 FAQ 本地语义缓存 (FaqSemanticCacheAdvisor)

#### 简历原句与锚点
> 最前置引入 JVM 内存语义缓存对 FAQ 提问执行余弦相似度匹配，命中时短路返回以绕过 RAG 与大模型推理。

#### 面试官追问路径
- 滑动窗口限流器在 WebSocket 和 HTTP 下如何分别实现？
- 怎么实现 JVM 内存中的语义缓存？余弦相似度阈值怎么定的？

#### 核心骨架代码
```java
// FaqSemanticCacheAdvisor.java 核心短路拦截
public class FaqSemanticCacheAdvisor implements CallAroundAdvisor {
    @Override
    public AdvisedResponse aroundCall(AdvisedRequest request, CallAroundAdvisorChain chain) {
        if (IntentType.FAQ.equals(request.getAdvisorContext().get("intentResult"))) {
            float[] queryVector = embeddingModel.embed(request.userText());
            FaqCacheEntry hit = faqCacheManager.matchVector(queryVector); // 余弦相似度匹配
            
            if (hit != null && hit.getScore() >= 0.92) { // 设定高置信度阈值 0.92
                // 直接短路返回本地缓存中的解答，彻底绕过RAG与LLM推理
                return AdvisedResponse.builder()
                    .responseMessage(new AssistantMessage(hit.getAnswer()))
                    .build();
            }
        }
        return chain.next(request);
    }
}
```

#### 踩坑与防御性设计
- **冷启动与数据更新延迟**：若后台 FAQ 数据更新，分布式微服务如何感知并同步更新本地 JVM 缓存？
- **解决**：通过 **Redis Pub/Sub 广播机制**。当后台 FAQ 数据库更新时，发布 `faq:cache:reload` 消息，所有 JVM 节点订阅该通道，收到后异步拉取最新向量库，刷新本地 JVM 内存，从而规避了分布式环境下的本地缓存数据脏读。

---
**相关链接**：[[苍穹外卖AI客服]]
