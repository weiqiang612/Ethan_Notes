## 回答主链

`用户问题 -> 提示词/上下文 -> Harness/Agent Loop -> 记忆 -> 工具/MCP -> RAG -> 安全/校验/拒答 -> 最终回答`

---

## 1. 提示词工程

- 角色
- 目标
- 约束
- 输出格式
- Few-shot
- SOP
- 结构化输出
- Prompt 是指令层

## 2. 上下文工程

- Context 是供给层
- 动态上下文装配
- Token 预算
- Lost in the Middle
- 滑动窗口
- 上下文裁剪
- JIT 加载
- LRU / 上下文卸载
- 规则 + 记忆 + 工具描述 + 当前状态

## 3. Harness / Agent Loop

- Agent = LLM + Planning + Memory + Tools
- Agent = Model + Harness
- Harness Engineering
- Prompt 是指令层，Context 是供给层，Harness 是执行控制层
- Agent Loop
- Decide -> Act -> Observe
- while loop
- 最大轮次限制
- Workflow
- Agentic Workflow
- Spring AI Advisor 链
- 六层拆解
- 信息边界层
- 工具系统层
- 编排执行层
- 记忆与状态层
- 评估与观测层
- 约束与恢复层
- 缓存短路 -> 上下文注入 -> RAG 注入 -> 工具白名单 -> 安全熔断
- 不是“调模型”，而是“给模型搭执行系统”

## 4. 记忆

- 短期记忆
- 长期记忆
- 会话记忆
- 跨会话记忆
- 工作记忆
- 摘要压缩
- 向量记忆
- 规则记忆
- Memory Retrieval
- Memory Write-back
- Encode -> Storage -> Retrieval -> Consolidation -> Reflection -> Forgetting
- 异步提纯落库
- 置信度阈值
- 记忆去噪
- 冲突覆盖
- 时间衰减
- Context Rot
- 长期记忆是个性化事实
- RAG 是共享知识库
- 记忆和 RAG 分区注入

## 5. 工具

- Function Calling
- Tool Calling
- 工具意图识别
- 参数生成
- 参数校验
- 工具执行器
- 观察结果回写
- 工具白名单
- 两级工具过滤
- 重复签名检测
- 工具签名 = toolName + normalizedArgs
- 幂等控制
- 结果回查
- 数据库真实状态兜底
- 人工二次确认
- 人工确认 / 降级
- 高风险动作不能只靠模型拍板
- 超过 4 轮强制 fallback
- 工具死循环熔断

## 6. MCP

- Model Context Protocol
- JSON-RPC 2.0
- 工具接入标准
- 工具发现
- 宿主与工具解耦
- 标准化协议
- 可插拔工具生态
- Host / Client / Server
- initialize 握手
- capabilities 协商
- Resources / Tools / Prompts
- stdio
- streamable HTTP
- 本地工具 vs 远程服务
- stdout 不能打普通日志
- JSON-RPC 更像方法调用，REST 更像资源访问
- Function Calling 是调用意图
- MCP 是工具接入协议

## 7. RAG

- Retrieval-Augmented Generation
- 离线索引的目标是建立 干净、完整、可过滤、可追溯 的向量数据库
- 检索时根据业务场景，多租户场景要做租户隔离（检索根据元数据，不要检索到其他租户的知识）、版本隔离（是否为当前业务版本）
- 先检索，再回答
- 基于证据回答
- 离线建索引
- 文档解析
- 数据清洗
- chunking
- embedding
- metadata
- 向量检索
- BM25
- Hybrid Search
- Recall
- Rerank
- Context Construction
- Citation
- Faithfulness
- 拒答机制
- Reject / Answer Logic

## 8. RAG 排障链路

- 召回不到：解析 / 切块 / metadata / query rewrite
- 召回很多但答不好：没做 rerank / 噪声过多 / top-k 失控
- 答案流畅但不忠实：证据边界没收紧 / 没有限制只基于上下文回答
- 线上调优玄学：没有拆开看 recall、rerank、context、generation
- 分层诊断：candidate recall -> reranking -> context construction -> reject/answer logic

## 9. 安全治理

- 权限过滤
- 参数校验
- 结果校验
- 风险分级
- 人工兜底
- fallback
- 熔断
- 限流
- 重试
- 幂等
- 审计
- 生产可控
- 幂等控制 -> 结果回查 -> 数据库真实状态兜底 -> 人工确认/降级

## 10. 项目高频口径词

- 苍穹外卖 AI 客服
- 高风险退单 / 退款
- 权限校验
- 状态机
- 审计
- FAQ
- 业务规则
- 语义缓存
- Advisor 链编排
- SafeToolCallAdvisor
- 重复签名检测
- 工具死循环熔断
- 超过 4 轮强制 fallback
- 高风险退单 / 退款二次确认
- 订单状态机校验
- 结果持久化校验
- FAQ 语义缓存短路

## 11. Harness 高频答辩词

- Harness 不是 Prompt 增强，而是执行控制系统
- 核心价值：持续执行、持续校验、持续恢复
- 六层里最容易被追问的是：编排执行层、评估观测层、约束恢复层
- 说安全不要停在“加护栏”
- 要落到：白名单、签名检测、最大轮次、幂等、结果回查、人工确认
- 对高风险链路要有事故级说法
- 标准链：幂等控制 -> 结果回查 -> 数据库真实状态兜底 -> 人工确认/降级

## 12. MCP 高频答辩词

- MCP 讲清三件事：谁在调用、怎么通信、暴露什么能力
- 谁在调用：Host / Client / Server
- 怎么通信：JSON-RPC 2.0
- 本地常见传输：STDIO
- 远程常见传输：streamable HTTP
- 暴露什么能力：Resources / Tools / Prompts
- Function Calling 负责“想调什么”
- MCP 负责“工具怎么接进来”

## 13. 一句总纲

`用户问题进来以后，系统不是直接让模型裸答，而是先做提示词和上下文装配，再由 Harness 驱动 Agent Loop 结合记忆、工具和 RAG 找证据，最后经过安全校验、拒答或降级后，输出一个稳定、准确、可追溯的回答。`
