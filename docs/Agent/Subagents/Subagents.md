# Subagent

1. 有一个很好的思路：给 parent agent 配几个用于做其他事情的Agent，比如reviewer 、research、QA（test），让更便宜的模型去做简单的事情，只给调用者一个总结，这样做有两个好处：
   * 减轻 parent agent 的压力，parent agent 可以不会被这些简单的事情污染上下文
   * 节约token
2. 上面推荐的三种 subagent，以下是对其的说明：
   * research：类似于 context7 工具，或者去web上搜索一些信息
   * reviewer：code review 专员，提升代码的质量
   * QA：写测试的，TDD驱动