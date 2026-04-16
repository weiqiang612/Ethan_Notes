# HttpClient

### 1.1 介绍

**HttpClient** 是现代编程中用于发送 HTTP 请求（如 GET、POST、PUT、DELETE）并接收 HTTP 响应的核心工具类库。它充当了浏览器与服务器之间的桥梁，允许应用程序通过代码与各种 Web 服务和 API 进行交互。一句话，它的作用就是让开发者可以通过编码的方式发送和处理HTTP请求。

### 1.2 功能

核心功能：

- **发送请求**：配置 URL、请求头（Headers）、查询参数（Query Params）和请求体（Body）。
- **处理响应**：获取状态码（如 200 OK, 404 Not Found）、响应头和返回的数据（通常是 JSON 或 XML）。
- **连接管理**：支持连接池复用，减少建立 TCP 连接的开销。
- **异步支持**：现代 HttpClient 通常支持非阻塞的异步操作，提高程序并发性能。

### 1.3 工作流程

HttpClient 的工作流程

HttpClient 的操作通常遵循以下生命周期：

1. **实例化**：创建客户端对象（建议复用，避免耗尽端口）。
2. **构建请求 (HttpRequest)**：设置目标 URL 和方法。
3. **发送请求**：通过客户端发出请求。
4. **接收响应 (HttpResponse)**：解析服务器返回的数据。
5. **异常处理**：处理网络超时、断网或服务器错误。

### 1.4 入门

1. 导入Maven坐标

   ```xml
   <!-- httpclient -->
   <dependency>
       <groupId>org.apache.httpcomponents</groupId>
       <artifactId>httpclient</artifactId>
   </dependency>
   ```

   注意：AliOSS依赖httpclient包，所以如果导入阿里云或腾讯云OSS服务后，就不需要再导入该依赖了

2. 