# SpringBoot 原理

1. 起步依赖：Maven的依赖传递原理，当引入某个依赖后，如果该依赖依赖了其他依赖，那么其他依赖也会被引入进来

2. 自动配置：SpringBoot的自动配置就是当spring容器启动后，一些配置类、bean对象就自动存入到了IOC容器中，不需要我们手动去声明，从而简化了开发，省去了繁琐的配置操作

   ​	在启动类上方加如下注解实现自动配置

   * 方案一：@ComponentScan 组件扫描 使用繁琐、性能低

     ```java
     @ComponentScan({"com.example","com.itheima"})
     ```

   * 方案二：@Import 导入，使用@Import导入的类会被Spring加载到 IOC 容器中，导入形式主要有以下几种：

     * 导入 普通类

       ```java
       @Import({TokenParser.class})
       ```

     * 导入 配置类 会将配置类中的 @Bean 的对象全部导入

       ```java
       @Import({HeaderConfig.class})
       ```

     * 导入 ImportSelector 接口实现类，该实现类会实现接口的selectImports方法，将需要导入的Bean以字符串数组的形式返回

       ```java
       @Import({MyImportSelector.class})
       ```

       ```java
       public class MyImportSelector implements ImportSelector {
           public String[] selectImports(AnnotationMetadata importingClassMetadata) {
               return new String[]{"com.example.HeaderConfig"};
           }
       }
       ```

   * 方案三：@EnableXxxx 注解，封装了 @Import 注解，Import 什么 bean ，由第三方依赖提供方决定，我们只需要加上该@EnableXxxx 注解即可

3. @Conditional 注解

   * 作用：按照一定的条件进行判断，在满足给定条件后才会注册相应的bean对象到Spring IOC容器中

   * 位置 ：方法、类

   * @Conditional 本身是一个父注解，派生出大量的子注解：

     * @ConditionalOnClass：判断环境中是否有指定的字节码文件，才注册bean到 IOC 容器，即引入指定的jar包才会注册
     * @ConditionalOnMissingBean：判断环境中有无对应的bean（类型 或 名称），才注册 bean 到 IOC 容器
     * @ConditionalOnProperty：判断配置文件中有无对应的属性和值，才注册 bean 到 IOC 容器

     ![](https://cdn.jsdelivr.net/gh/weiqiang612/My-Tuchuang/img/SpringBoot/assets/Conditional.jpg)

4. 自动配置源码跟踪

   对 @SpringBootApplication 注解的源码查看，发现有该注解上有以下注解

   ```java
   @SpringBootConfiguration
   @EnableAutoConfiguration
   @ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
          @Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
   ```

   * @SpringBootConfiguration ，该注解与@Configuration注解作用相同，用来声明当前也是个配置类
   * @ComponentScan：组件扫描，默认扫描当前引导类所在包及其子包
   * @EnableAutoConfiguration：SpringBoot实现自动化配置的核心注解

   所以对 @EnableAutoConfiguration 进行源码跟踪，发现其使用了@Import注解，会导入该类中实现ImportSelector接口的 selectImports方法返回的字符串中的所有类

   ```java
   @Import(AutoConfigurationImportSelector.class)
   ```

   查看该AutoConfigurationImportSelector类如何实现的 selectImports 方法

   ```java
   @Override
   public String[] selectImports(AnnotationMetadata annotationMetadata) {
       if (!isEnabled(annotationMetadata)) {
          return NO_IMPORTS;
       }
       AutoConfigurationEntry autoConfigurationEntry = getAutoConfigurationEntry(annotationMetadata);
       return StringUtils.toStringArray(autoConfigurationEntry.getConfigurations());
   }
   ```

   重点关注该方法返回值的内容，追踪 getAutoConfigurationEntry 方法，查看注释和源码，大概了解到 configuration 变量包括了需要导入的类，exclusions包括了需要排除的类

   ```java
   /**
    * Return the {@link AutoConfigurationEntry} based on the {@link AnnotationMetadata}
    * of the importing {@link Configuration @Configuration} class.
    * @param annotationMetadata the annotation metadata of the configuration class
    * @return the auto-configurations that should be imported
    */
   protected AutoConfigurationEntry getAutoConfigurationEntry(AnnotationMetadata annotationMetadata) {
       if (!isEnabled(annotationMetadata)) {
          return EMPTY_ENTRY;
       }
       AnnotationAttributes attributes = getAttributes(annotationMetadata);
       List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes);
       configurations = removeDuplicates(configurations);
       Set<String> exclusions = getExclusions(annotationMetadata, attributes);
       checkExcludedClasses(configurations, exclusions);
       configurations.removeAll(exclusions);
       configurations = getConfigurationClassFilter().filter(configurations);
       fireAutoConfigurationImportEvents(configurations, exclusions);
       return new AutoConfigurationEntry(configurations, exclusions);
   }
   ```

   我们再查看获得 configuration 的方法 getCandidateConfigurations，其中有个断言式 Assert ，提到配置类在 META-INF/spring.factories 和 META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports 两个文件中，

   spring.factories 是旧版本的配置文件，在SpringBoot 3.x 版本移除，使用后者配置文件

   ```java
   /**
    * Return the auto-configuration class names that should be considered. By default
    * this method will load candidates using {@link ImportCandidates} with
    * {@link #getSpringFactoriesLoaderFactoryClass()}. For backward compatible reasons it
    * will also consider {@link SpringFactoriesLoader} with
    * {@link #getSpringFactoriesLoaderFactoryClass()}.
    * @param metadata the source metadata
    * @param attributes the {@link #getAttributes(AnnotationMetadata) annotation
    * attributes}
    * @return a list of candidate configurations
    */
   protected List<String> getCandidateConfigurations(AnnotationMetadata metadata, AnnotationAttributes attributes) {
       List<String> configurations = new ArrayList<>(
             SpringFactoriesLoader.loadFactoryNames(getSpringFactoriesLoaderFactoryClass(), getBeanClassLoader()));
       ImportCandidates.load(AutoConfiguration.class, getBeanClassLoader()).forEach(configurations::add);
       Assert.notEmpty(configurations,
             "No auto configuration classes found in META-INF/spring.factories nor in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports. If you "
                   + "are using a custom packaging, make sure that file is correct.");
       return configurations;
   }
   ```

​	我们看一眼提到的两个文件

​	![](https://cdn.jsdelivr.net/gh/weiqiang612/My-Tuchuang/img/SpringBoot/assets/SpringBoot配置类.jpg)	

​	发现该文件下都是以 AutoConfiguration 结尾的，其实这些都是配置类，我们可以查看其中一个配置类

![](https://cdn.jsdelivr.net/gh/weiqiang612/My-Tuchuang/img/SpringBoot/assets/配置文件.jpg)

​	如 CacheAutoConfiguration 类， 点进去 @AutoConfiguration 注解，发现其被 @Configuration 注解修饰，该类是配置类，所以导入时，会将其所有的 @Bean 导入，这就解释了整个 SpringBoot 自动配置的流程

```java
@AutoConfiguration(after = { CouchbaseDataAutoConfiguration.class, HazelcastAutoConfiguration.class,
       HibernateJpaAutoConfiguration.class, RedisAutoConfiguration.class })
@ConditionalOnClass(CacheManager.class)
@ConditionalOnBean(CacheAspectSupport.class)
@ConditionalOnMissingBean(value = CacheManager.class, name = "cacheResolver")
@EnableConfigurationProperties(CacheProperties.class)
@Import({ CacheConfigurationImportSelector.class, CacheManagerEntityManagerFactoryDependsOnPostProcessor.class })
public class CacheAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public CacheManagerCustomizers cacheManagerCustomizers(ObjectProvider<CacheManagerCustomizer<?>> customizers) {
       return new CacheManagerCustomizers(customizers.orderedStream().collect(Collectors.toList()));
    }

    @Bean
    public CacheManagerValidator cacheAutoConfigurationValidator(CacheProperties cacheProperties,
          ObjectProvider<CacheManager> cacheManager) {
       return new CacheManagerValidator(cacheProperties, cacheManager);
    }
```

​	总结一下，SpringBoot自动配置的原理，大致是通过 @SpringBootApplication 注解的 @EnableAutoConfiguraion 注解，该注解被@Import注解修饰，@Import注解的参数为一个实现了 ImportSelector 接口的类，通过其重写的 selectImports 方法，规定导入那些配置类，通过 @Conditional 注解进行条件匹配，从而这些配置类的所有满足条件的 @Bean 都会被 IOC 接管，我们在程序中也可以直接注入了。顺带一提，这些配置类是从依赖的Spring jar包的两个文件中写好的，以下为流程图

​	![](https://cdn.jsdelivr.net/gh/weiqiang612/My-Tuchuang/img/SpringBoot/assets/自动配置流程图.jpg)

