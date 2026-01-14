# web登录认证

>
>
>## 一、会话技术
>
>1. **会话**：用户打开浏览器，访问web服务器的资源，会话建立，直到有一方断开连接，会话结束。一次会话中可以包含多次请求和响应
>
>2. **会话跟踪**：一种维护浏览器状态的方法，服务器需要识别多次请求是否来自于同一浏览器，以便在同一次会话的多次请求间==共享数据==
>
>3. **会话跟踪方案**：
>
> * 客户端会话跟踪技术：Cookie
> * 服务端会话跟踪技术：Session
>
> * 令牌技术
>
>
>4. **Cookie**：客户端向服务器发送的请求头中有 Cookie:name=value 的信息，服务器端拿到Cookie后，做了一些业务操作后，会将一些信息存储到Cookie里，在响应头中以 Set-Cookie:name=value 的形式返回给客户端，浏览器会自动保存该Cookie
>
> * 优点：HTTP协议中支持的技术
>	* 缺点：
>
>	  * 移动端 **浏览器** 使用 $\text{Cookie}$；移动端 **原生 $\text{APP}$** 不直接使用 $\text{HTTP}$ 的 $\text{Cookie}$，但通常使用 **$\text{Token}$** 或本地存储来维护会话
>
>	  * 不安全，可能被 **$\text{CSRF}$**（跨站请求伪造）和 **$\text{XSS}$**（跨站脚本攻击）利用，用户可以自己禁用Cookie
>
>	  * 不能跨域（协议、IP/域名、端口）：$\text{Cookie}$ 受限于 **`Domain`** 和 **`Path`** 属性，确实无法跨**顶级域**共享（如 `a.com` 到 `b.com`）。但可以跨**子域**共享（如 `api.a.com` 到 `www.a.com`）。在前后端分离的开发模式中，前后端程序部署在不同的服务器上，前后端的Cookie共享很麻烦。
>
>
>
>5. **Session**：Session方式中 Session对象存储在服务器端，在请求和响应的时候只在Cookie中传输Session对象的ID
>  * 优点：存储在服务端，安全
>  * 缺点：
>    * 服务器集群环境下无法直接使用Session
>    * Cookie的缺点
>
>6. **令牌技术**：在服务器端登陆成功后，会生成一个令牌返回给客户端/浏览器，客户端在本地存储令牌，之后的请求都会携带令牌给服务端，服务端在处理请求时都会先校验令牌判断用户是否合法，再执行相关的响应操作
>
> * 优点：
>   * 支持PC端，移动端
>   * 解决集群环境下的认证问题
>   * 减轻服务器端存储压力
>
> * 缺点：需要自己实现
>
>7. **JWT令牌**：
>
>* 全称：JSON Web Token
>
>* 定义了一种简洁的（JWT令牌本身就是一个字符串）、自包含（可以在JTW令牌中添加自定义的内容）的格式，用于在通信双方以JSON数据格式安全的传输信息，由于数字签名的存在，这些信息是可靠的
>
>* 组成：
>
> * 第一部分：Header（头），记录令牌类型、签名算法等。例如：{"alg":"HS256","type":"JWT"}
> * 第二部分：Payload（有效载荷），携带一些自定义信息、默认信息等。例如：{"id":"1","username":"Tom"}
> * 第三部分：Signature（签名），防止Token被篡改、确保安全性。会融入header、payload,并加入指定秘钥，通过指定签名算法计算而来。
> * 注：第一部分和第二部分都会经过Base64（基于64个可打印字符(A-Z a-z 0-9 + /)）编码方式编码到JWT令牌里面
>
>* 使用：
>
> * 前置：
>
>   ```java
>   // 令牌安全秘钥 (Base64编码后)
>   private static final String BASE64_SECRET = Base64.getEncoder().encodeToString("secretforjwtofweiqiang612togenerate".getBytes());
>   // 令牌签名KEY
>   private static final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(Base64.getDecoder().decode(BASE64_SECRET));
>   // 令牌有效期 一个小时
>   private static final long JWT_EXPIRATION_MS = 3600000l;
>   ```
>
> * JWT生成：
>
>   ```java
>   String jwtToken = Jwts.builder()
>           .claims(claims)
>           .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS))
>           .issuedAt(new Date())
>           .signWith(SECRET_KEY,SignatureAlgorithm.HS256)
>           .compact();
>   ```
>
> * JWT校验：
>
>   ```java
>   Claims claims = Jwts.parser()
>           .setSigningKey(SECRET_KEY)
>           .build()
>           .parseClaimsJws(jwtToken)
>           .getBody();
>   ```
>
>## 二、 请求拦截
>
>1. **Filter**：
>
>* 概念：Filter过滤器，是JavaWeb三大组件（Servlet、Filter、listener）之一
>
>* 过滤器可以把对资源的请求拦截下来，从而实现一些特殊的功能
>
>* 过滤器一般完成一些通用的操作，比如：登录校验、统一编码处理、敏感字符处理等
>
>* 使用：
>
>* 定义Filter：定义一个类，实现Filter接口，并重写其所有方法
>
> * 配置Filter：Filter类上加@WebFilter注解，配置拦截资源的路径，引导类上加@ServletComponentScan开启Servlet组件支持
>
>    ```java
>   @WebFilter(urlPatterns = "/*")
>    public class DemoFilter implements Filter {
>        // 初始化方法，web服务器启动，创建Filter时启动，只调用一次
>        @Override
>        public void init(FilterConfig filterConfig) throws ServletException {
>    //        Filter.super.init(filterConfig);
>            System.out.println("init 初始化方法被执行了");
>        }
> 
>        // 拦截到请求时，调用该方法，可调用多次
>       @Override
>        public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
>            // 相关拦截操作
>            System.out.println("Filter 拦截到了请求");
>            // 放行前逻辑
>            // 放行操作
>            filterChain.doFilter(servletRequest,servletResponse);
>            // 放行后逻辑
>            System.out.println("Filter 放行了请求");
>        }
> 
>        // 销毁方法，服务器关闭时调用，只调用一次
>       @Override
>        public void destroy() {
>    //        Filter.super.destroy();
>            System.out.println("destroy 销毁方法被执行了");
>        }
>    }
>    ```
> 
>   注意：启动类上需要加@ServletComponentScan //开启Servlet组件支持
>
> * Filter拦截路径:
>
>   | 拦截路径     | urlPatterns值 | 含义                              |
>  | :----------- | :------------ | :-------------------------------- |
>   | 拦截具体路径 | /login        | 只有访问/login路径时，才会被拦截  |
>   | 目录拦截     | /emps/*       | 访问/emps下的所有资源，都会被拦截 |
>   | 拦截所有     | /*            | 访问所有资源，都会被拦截          |
> 
> * 注意：放行后访问对应资源，资源访问完成后，还会回到Filter中执行放行后的逻辑
>
> * 过滤器链
>
>* 介绍：一个web应用中，可以配置多个过滤器，这多个过滤器就形成了一个过滤器链
>
> * 顺序：注解配置的Filter，默认优先级是按照过滤器类名（字符串）的自然排序，
> 
> * 注意：@webFilter注解的 urlPatten 的值只决定该过滤器是否被执行，不决定其执行的优先级
>
>2. **interceptor**
>
>  * 概念：是一种动态拦截方法调用的机制，类似于拦截器。Spring框架中提供的，用来动态拦截控制器方法的执行
>
>  * 作用：拦截请求，在指定的方法调用前后，根据业务需要执行预先设定的代码
>
>  * 使用：
>
>    拦截器类：
>
>    ```java
>    @Component 
>    public class LoginCheckInterceptor implements HandlerInterceptor {
>        @Override // 目标资源方法执行前执行，放行返回true，不放行返回false
>        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
>    //        return HandlerInterceptor.super.preHandle(request, response, handler);
>            System.out.println("preHandle ...");
>            return true;
>        }
>
>        @Override // 目标资源方法执行后执行
>        public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {
>    //        HandlerInterceptor.super.postHandle(request, response, handler, modelAndView);
>            System.out.println("postHandle ...");
>        }
>
>        @Override // 视图渲染完毕后执行，最后执行
>        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
>    //        HandlerInterceptor.super.afterCompletion(request, response, handler, ex);
>            System.out.println("afterCompletion ...");
>        }
>    }
>
>    ```
>
>    配置类：
>
>    ```java
>    @Configuration // 配置类
>    public class WebConfig implements WebMvcConfigurer {
>
>        @Autowired
>        private LoginCheckInterceptor loginCheckInterceptor;
>
>        @Override // 添加拦截器
>        public void addInterceptors(InterceptorRegistry registry) {
>            // 拦截所有路径 /**
>            registry.addInterceptor(loginCheckInterceptor).addPathPatterns("/**") // 拦截哪些资源
>                            .excludePathPatterns("/login"); // 不拦截哪些资源
>        }
>    }
>    ```
>
>* interceptor拦截路径：
>
>  | 拦截路径  | 含义                 | 举例                                              |
>  | :-------- | :------------------- | :------------------------------------------------ |
>  | /*        | 一级路径             | 能匹配/dept,/emps/login, 不能匹配/depts/1         |
>  | /**       | 任意级路径           | 能匹配/depts,/depts/1,depts/1/2                   |
>  | /depts/*  | /depts下的一级路经   | 能匹配/depts/1,不能匹配/depts/1/2,/depts          |
>  | /depts/** | /depts下的任意级路经 | 能匹配/depts/1,/depts/1/2,/depts，不能匹配/emps/1 |
>
>
>
>3. **拦截器执行流程**
>
><img src="https://cdn.jsdelivr.net/gh/weiqiang612/My-Tuchuang/img/SpringBoot/assets/拦截器执行流程.jpg" style="zoom:100%;" />
>
>4.  **Filter与Interceptor区别**
>
>* 接口规范不同：过滤器需要实现Filter接口，而拦截器需要实现HandlerInterceptor接口
>* 拦截范围不同：过滤器Filter会拦截所有的资源，而Interceptor只会拦截Spring环境中的资源
>
>

