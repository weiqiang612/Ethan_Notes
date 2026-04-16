# Maven高级

1. 分模块设计与开发

   * 什么是分模块设计：将项目按照功能拆分成若干个子模块
   * 为什么要分模块设计：方便项目的管理维护、扩展，也方便模块间的相互调用，资源共享
   * 注意事项：分模块设计需要先针对模块功能进行设计，再进行编码。不会先将工程开发完毕，然后进行拆分

2. 继承与聚合

   1. 继承

      * 概念：继承描述的是两个工程之间的关系，与Java中的继承相似，子工程可以继承父工程中的配置信息，常见于依赖关系的继承

      * 作用：简化依赖配置、统一管理依赖
      * Maven项目只支持单继承，但是可以通过 c 继承 b 、 b 继承 a 的方式实现 c 继承 a

      * 实现：

        * 创建maven模块 tlias-parent ，该工程为父工程，设置打包方式为 pom
        * 在子工程的pom.xml文件中，配置继承关系
        * 在父工程中配置各个工程公有的依赖（子工程会自动继承父工程的依赖），如果父工程和子工程都实现了某个依赖，版本以子工程的为准

      * 版本锁定

        * 在Maven中，可以在父工程的pom文件中通过&lt;dependencyManagement&gt;来统一管理依赖版本，在该标签下的依赖并不会被直接加入进来，如果要用到时直接引用即可，相应的，也不用写版本号了

        * 自定义属性，可以通过 &lt;properties&gt;标签，指定相应的依赖的版本号，之后直接通过${}引用即可

          ![](https://cdn.jsdelivr.net/gh/weiqiang612/My-Tuchuang/img/SpringBoot/assets/自定义属性.jpg)

   2. 聚合：将多个模块组织成一个整体，同时进行项目构建

      * 聚合工程：一个不具有业务功能的“空”工程（有且只有一个pom文件）

      * 作用：快速构建项目（无需根据依赖关系手动构建，直接在聚合工程上构建即可）

      * 实现：maven中可以通过&lt;modules&gt;设置当前聚合工程所包含的子模块名称，module里面填写的内容为当前项目与子模块项目的物理位置关系。聚合工程中所包含的模块，在构建时，会自动根据模块间的依赖关系设置构建顺序，与聚合工程中模块的配置书写顺序无关

        ```java
        <modules>
            <module>../tlias-pojo</module>
            <module>../tlias-utils</module>
            <module>../tlias-web-management</module>
        </modules>
        ```

   3. 继承与聚合

      * 作用：
        * 聚合用于快速构建项目
        * 继承用于简化依赖配置、统一管理依赖
      * 相同点：
        * 聚合与继承的pom.xml文件打包方式均为pom，可以将两种关系制作到同一个pom文件中
        * 聚合与继承均属于设计型模块，并无实际的模块内容
      * 不同点：
        * 聚合是在聚合工程中配置关系，聚合可以感知到参与聚合的模块有哪些
        * 继承是在子模块中配置关系，父模块无法感知哪些子模块继承了自己

3. 私服

   1. 介绍

      ![](https://cdn.jsdelivr.net/gh/weiqiang612/My-Tuchuang/img/SpringBoot/assets/私服.jpg)

      * 依赖查找顺序：本地仓库 -> 私服 -> 中央仓库
      * 注意：私服在企业项目开发中，一个项目/公司，只需要一台即可

   2. 资源上传与下载

      ![](https://cdn.jsdelivr.net/gh/weiqiang612/My-Tuchuang/img/SpringBoot/assets/私服资源上传与下载.jpg)

      * 步骤 （在Maven的conf配置文件中改）

        例如：

        访问私服：http://192.168.150.101:8081

        访问密码：admin/admin

        

        使用私服，需要在maven的settings.xml配置文件中，做如下配置：

        1. 需要在 **servers** 标签中，配置访问私服的个人凭证(访问的用户名和密码)

           ```xml
           <server>
               <id>maven-releases</id>
               <username>admin</username>
               <password>admin</password>
           </server>
               
           <server>
               <id>maven-snapshots</id>
               <username>admin</username>
               <password>admin</password>
           </server>
           ```

           

        2. 在 **mirrors** 中只配置我们自己私服的连接地址(如果之前配置过阿里云，需要直接替换掉)

           ```xml
           <mirror>
               <id>maven-public</id>
               <mirrorOf>*</mirrorOf>
               <url>http://192.168.150.101:8081/repository/maven-public/</url>
           </mirror>
           ```

           

        3. 需要在 **profiles** 中，增加如下配置，来指定snapshot快照版本的依赖，依然允许使用

           ```xml
           <profile>
               <id>allow-snapshots</id>
                   <activation>
                   	<activeByDefault>true</activeByDefault>
                   </activation>
               <repositories>
                   <repository>
                       <id>maven-public</id>
                       <url>http://192.168.150.101:8081/repository/maven-public/</url>
                       <releases>
                       	<enabled>true</enabled>
                       </releases>
                       <snapshots>
                       	<enabled>true</enabled>
                       </snapshots>
                   </repository>
               </repositories>
           </profile>
           ```

           

        4. 如果需要上传自己的项目到私服上，需要在项目的pom.xml文件中，增加如下配置，来配置项目发布的地址(也就是私服的地址)

           ```xml
           <distributionManagement>
               <!-- release版本的发布地址 -->
               <repository>
                   <id>maven-releases</id>
                   <url>http://192.168.150.101:8081/repository/maven-releases/</url>
               </repository>
               
               <!-- snapshot版本的发布地址 -->
               <snapshotRepository>
                   <id>maven-snapshots</id>
                   <url>http://192.168.150.101:8081/repository/maven-snapshots/</url>
               </snapshotRepository>
           </distributionManagement>
           ```

           

        5. 发布项目，直接运行 deploy 生命周期即可 (发布时，建议跳过单元测试)

4. Maven常见的打包方式：

   * jar：普通模块打包，SpringBoot项目基本都是jar包（内嵌tomcat运行）
   * war：普通web程序打包，需要部署在外部的tomcat服务器中运行
   * pom：父工程或聚合工程，该模块不写代码，仅进行依赖管理

   
