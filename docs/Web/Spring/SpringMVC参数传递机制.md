这份总结涵盖了 SpringMVC 参数绑定的核心逻辑、常用注解及应用场景，建议收藏作为开发手册。

------

## 🛠️ SpringMVC 参数传递全景指南

SpringMVC 的参数传递机制本质上是一系列 **ArgumentResolvers（参数解析器）** 在工作。它会根据你方法参数上的**注解**和**参数类型**，决定去请求的哪个位置（URL、Header、Body）找数据。

------

### 一、 核心注解速查表

| **传参方式**    | **注解**         | **数据来源**                                           | **常见场景**              | **默认行为**             |
| --------------- | ---------------- | ------------------------------------------------------ | ------------------------- | ------------------------ |
| **路径变量**    | `@PathVariable`  | URL 路径 (如 `/user/{id}`)                             | RESTful 接口获取 ID       | 必填                     |
| **查询参数**    | `@RequestParam`  | URL `?` 后或表单 `Content-Type: x-www-form-urlencoded` | 简单过滤、分页、强制传参  | 默认必填，支持默认值     |
| **JSON 请求体** | `@RequestBody`   | HTTP Request Body (`application/json`)                 | 前后端分离，传递复杂对象  | 必须有 Setter 和无参构造 |
| **请求头**      | `@RequestHeader` | HTTP Headers                                           | 获取 Token、App-Version   | 默认必填                 |
| **Cookie**      | `@CookieValue`   | HTTP Cookies                                           | 获取 SessionID 或偏好设置 | 默认必填                 |

------

### 二、 三大绑定机制深度解析

#### 1. 简单类型/单个参数 (@RequestParam)

- **映射规则**：按名称匹配。
- **优势**：可以重命名参数（如前端传 `u_id`，后端收 `userId`），且可以设置 `defaultValue`。
- **注意**：如果不加注解且名称一致，Spring 也能自动匹配，但无法设置“必填”校验。

#### 2. POJO 对象自动绑定 (无注解)

- **映射规则**：Spring 反射调用对象的 **Setter 方法**。只要请求参数名（Query String 或 Form）与对象属性名一致，即可注入。
- **级联支持**：支持 `address.city` 这种嵌套属性的注入。
- **混合使用**：如果一个参数既在 `@RequestParam` 中，也在 POJO 中，**两者都会被赋值**。

#### 3. JSON 反序列化 (@RequestBody)

- **映射规则**：底层调用 **Jackson** 库，将请求体中的 JSON 字符串转为 Java 对象。
- **唯一性**：一个请求方法中 **只能有一个** `@RequestBody`（因为请求体流只能读取一次）。
- **适用性**：处理复杂的层级结构、List 集合等。

------

### 三、 开发中的“避坑”准则

1. **400 Bad Request 错误**：
   - 通常是因为标注了 `@RequestParam` 但前端没传该值。
   - 或者日期格式不匹配（需配合 `@DateTimeFormat` 或 `@JsonFormat`）。
2. **对象属性为 null**：
   - 检查是否有对应的 **Setter 方法**。
   - 检查 JSON 字段名是否与 Java 字段名完全一致（大小写敏感）。
   - 如果是表单提交，确认 `Content-Type` 是否为 `application/x-www-form-urlencoded`。
3. **GET 请求传对象**：
   - GET 请求没有 Body，因此**不能**使用 `@RequestBody`。只能使用“POJO 自动绑定”，参数会挂在 URL 后面。

------

### 四、 最佳实践建议

- **查询、过滤、删除**：优先使用 `@PathVariable`（定位资源）和 `@RequestParam`（过滤条件）。
- **新增、修改（复杂对象）**：一律使用 `@PostMapping` + `@RequestBody` + JSON。
- **安全性**：敏感信息（如密码、Token）**严禁**通过 URL 参数（GET）传递，必须放入 POST 的请求体或 Header 中。