# Bean的管理

1. 获取bean

   * 默认情况下，Spring项目启动时，会把bean都创建好放在IOC容器中，如果想要主动获取这些bean，可以通过如下方式：
     * 注入IOC容器对象ApplicationContext
     * 调用该对象的getBean方法，有三种参数：bean名（默认是类名首字母小写），对应Bean对象的Class对象，bean名和类型

2. bean作用域

   | 作用域      | 说明                                             |
   | ----------- | ------------------------------------------------ |
   | singleton   | 容器内同名称的 bean 只有一个实例（单例）（默认） |
   | prototype   | 每次使用该 bean 时会创建新的实例（非单例）       |
   | request     | 每个请求范围内会创建新的实例（web环境中，了解）  |
   | session     | 每个会话范围内会创建新的实例（web环境中，了解）  |
   | application | 每个应用范围内会创建新的实例（web环境中，了解）  |

   * 当Bean作用域为 singleton 单例模式时，默认使用的是饿汉式（类内部持有一个静态的本类对象），即在容器启动时就初始化了；如果想延迟初始化时机，可以使用懒汉式，在Bean类上加上@Lazy注解，即可在Bean对象第一次使用时再初始化

3. 第三方bean

   * 如果要管理的bean对象来自于第三方（不是自定义的），是无法用@Component及衍生注解声明bean的，就需要使用@Bean注解

   * 若要管理第三方bean对象，建议对这些bean进行集中分类配置，可以通过@Configuration注解声明一个配置类，使用@Bean注解，将当前方法的返回值对象交给IOC容器管理，可以通过@Bean注解的 name/value 属性指定bean名称，默认Bean为方法名

     ```java
     @Bean
     public SAXReader saxReader(){
         return new SAXReader();
     }
     ```

   * 如果在声明第三方 Bean 的时候，又需要依赖其他的 bean 对象，直接在方法形参中声明这个类型的参数即可，Spring容器会自动根据类型完成自动装配