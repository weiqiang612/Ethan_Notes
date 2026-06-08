---
grill_count: 0
last_grilled: "2026-06-08"
priority: 1
---

# Spring AI 核心抽象

## 1. 通用思想：它在 Agent 里是什么？
Spring AI 不是一个单独的“大模型 SDK 包装器”，而是一层专门给 Java / Spring 生态准备的 Agent 工程框架。它要解决的核心问题，不是“怎么调用某一家模型”，而是“怎么把企业里的数据、API、记忆、检索和模型推理，用统一抽象串成可维护的 AI 系统”。

如果从 Agent 视角看，Spring AI 提供的是四层核心抽象：

1. **ChatClient**：交互入口层，负责把请求组织成统一调用接口。
2. **Advisor**：编排控制层，负责在模型调用前后做增强、注入、短路、过滤和回溯处理。
3. **Tool Calling**：行动层，负责让模型请求本地工具，并由应用执行再回填结果。
4. **Chat Memory / RAG / Vector Store**：状态和知识层，负责补齐短期上下文与长期外部知识。

一句话概括：**Spring AI 把 Agent 通用思想，从“概念图”变成了 Spring 风格的工程装配线。**

## 2. Spring AI 落点：由哪些抽象和链路承载？
### 核心抽象
- **ChatClient**：对聊天模型的统一 Fluent API，设计习惯接近 `WebClient` / `RestClient`。它屏蔽底层模型厂商差异，是整个调用链的门面层。
- **Advisor**：类似专为 LLM 生命周期设计的中间件 / 责任链。它能拦截未封口的请求与响应，对 Prompt、上下文、结果进行增强。
- **Tool Calling**：工具定义、参数 Schema、执行生命周期都被框架封装，底层由 `ToolCallingManager` 负责调度。
- **ChatMemory**：短期会话记忆抽象，用于维持上下文，而不是保存全量聊天历史。
- **RAG / Vector Store**：向量库与检索增强的统一承载层，可以通过 Advisor 方式织入调用链。

### 在 Agent 分层中的位置
- **入口层**：`ChatClient`
- **编排层**：`Advisor`
- **行动层**：`Tool Calling`
- **状态与知识层**：`ChatMemory`、`RAG`、`VectorStore`

### 高频边界
- Spring AI 解决的是**统一抽象和调用链装配**，不是替你做业务裁决。
- 模型可以表达“想调什么工具”，但**不能直接越过应用去访问真实 API**。
- `ChatMemory` 是上下文记忆，不是审计历史库。

## 3. 项目口径：在我的项目里怎么落地？
在我的 `[[苍穹外卖AI客服]]` 项目里，我把 Spring AI 当成 Agent 的“运行底座”。`ChatClient` 负责统一入口，`Advisor` 负责上下文注入、RAG 检索、工具过滤和安全拦截，`Tool Calling` 负责把订单查询、取消订单、FAQ 检索这些能力交给模型去“申请使用”，再由 Java 代码实际执行，`ChatMemory` 和向量检索则分别补齐对话短期上下文和私域知识。

我对这套抽象的理解不是“框架会不会用”，而是它帮我把 Agent 架构落到了明确的工程层次上：模型只负责推理和意图表达，Spring AI 负责把请求编排成完整链路，真正高风险的权限校验、状态机判断、幂等控制和结果持久化仍然放在后端代码里。

---
**相关链接**：[[AI Agent 核心概念]] | [[上下文工程]] | [[Spring AI Advisor 链]] | [[Spring AI 与我的项目]] | [[苍穹外卖AI客服]]
