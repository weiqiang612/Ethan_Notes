# 自定义Starter

1. 场景：在实际开发中，经常会定义一些公共组件，提供给各个项目团队使用，而在SpringBoot的项目中，一般会将这些公共组件封装为SpringBoot的Starter
2. 规范：如果是SpringBoot官方提供的SpringBoot起步依赖，命名通常为 spring-boot-starter-功能，如果是第三方提供的SpringBoot起步依赖，命名通常为 功能-spring-boot-starter 
3. 组成：由两部分组成，如：
   * mybatis-spring-boot-autoconfigure 负责自动配置功能，将一些配置类写好后，放在SpringBoot自动配置时扫描的两个文件中去，最终会被@Import注解根据条件注册到 IOC 容器中
   * mybatis-spring-boot-starter 负责依赖管理功能，将该组件开发所需要的依赖配置在了配置文件中