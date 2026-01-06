# SpringBoot 配置优先级

1. 对于同一目录下的 properties yml yaml 文件，properties > yml > yaml

2. SpringBoot 除了支持配置文件属性配置，还支持Java系统属性和命令行参数的方式进行属性配置

   * Java 系统属性 -Dkey=value ，如： -Dserver.port=9000 

   * 命令行参数 --key=value，如：--server.port=10010

     命令行参数的优先级更高一些

     ![](https://cdn.jsdelivr.net/gh/weiqiang612/My-Tuchuang/img/SpringBoot/assets/系统变量、命令行参数.jpg)

3. 总体优先级为 命令行参数 > 系统变量 > yml 配置文件 > properties 配置文件