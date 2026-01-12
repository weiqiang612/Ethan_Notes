# Linux

### Linux 文件系统

#### Linux目录结构

* /bin (Binary)：存放计算机能直接运行的常用的二进制命令
* /sbin：存放系统管理原命令，普通用户通常没有执行权限
* /etc：存放所有的系统配置文件
* /root：系统管理员的家目录
* /home：普通用户的家目录
* /opt(Optional)：可选软件安装目录，通常用于安装第三方大型软件，放安装包的
* /usr/local：给主机额外安装软件的目标目录，放实际软件的，一般是通过编译源码的方式安装的程序
* /tmp：临时文件目录，系统重启或定期会清理
* /var：存放经常变化的文件，/usr目录通常是只读的，系统运行需要很多长度变化的文件，该目录最重要的是/var/log 系统日志
* /dev(device)：设备文件目录，所有的硬件设备被抽象为文件，Linux“一切皆文件”，类似于设备管理器
* /proc(process)：虚拟目录，是系统内存的映射，访问这个目录来获取系统信息
* /sys(system)：系统内核相关
* /srv(service)：系统内核相关
* /media：Linux自动识别设备，当识别后，Linux会把识别的设备挂载到该目录下
* /mnt(mount)：临时挂载目录，手动挂载
* /lib：动态连接库，作用类似于Windows里的DLL文件，几乎所有的应用程序都需要用到这些共享库
* /lost+found：一般是空的，存放在系统崩溃、非正常关机或磁盘故障后，被修复程序找回但“无家可归”的文件碎片
* /boot：存放的是启动Linux时使用的一些核心文件，包括一些连接文件以及镜像文件
* /selinux(security-enhanced linux)：是一种安全子系统，它能控制程序只能访问特定文件，有三种工作模式，可以自行设置



### 远程登录Linux

1. XShell介绍
   * XShell是目前最好的远程登录到Linux系统的软件，流畅的速度并且完美解决了中文乱码的问题
   * XShell是一个强大的安全终端模拟软件，它支持SSH1，SSH2，以及Microsoft Windows平台的TELNET协议
   * XShell可以在Windows界面下用来访问远端不同系统下的服务器，从而比较好的达到远程控制终端的目的
2. Xftp介绍
   * 是一个基于 Windows 平台的强大的SFTP、FTP文件传输文件
3. 一般生产环境将服务器配置成静态IP

### 配置静态IP

1. 到`/etc/sysconfig/network-scripts/`，修改`ifcfg-ens33[具体文件看自己的虚拟网卡是哪个]`该文件

```
TYPE="Ethernet"
PROXY_METHOD="none"
BROWSER_ONLY="no"
BOOTPROTO="static"
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="ens33"
UUID="cc535551-4caa-4bef-9498-6f138559d326"
DEVICE="ens33"
ONBOOT="yes"
IPADDR=192.168.134.128
NETMASK=255.255.255.0
GATEWAY=192.168.134.2
DNS1=114.114.114.114
DNS2=8.8.8.8
```

将BOOTPROTO[引导协议]值设置为 static ，添加手动配置的IPADDR[静态IP地址]、NETMASK[子网掩码]、GATEWAY[网关]、DNS服务器等配置

2. 重启网络服务：`sudo systemctl restart network`

3. 查看IP地址是否正确

   `ip addr`

   测试DNS服务是否正常

   `ping www.baidu.com`

   测试网关

   `ping 192.168.134.2`

### 用户管理

#### 基本用户管理

1. 基本介绍：Linux系统是一个多用户多任务的操作系统，任何一个要使用系统资源的用户，都必须首先向系统管理员申请一个账号，然后以这个账号的身份进入系统

2. 添加用户：

   * 基本语法：`useradd [用户名]`
   * 细节说明：创建用户成功后，会自动的创建和用户同名的Home目录，也可以通过`useradd -d [指定目录] [新的用户名]`，给新创建的用户指定Home目录

3. 指定/修改密码：

   * 基本语法：`passwd [用户名]`
   * 细节说明：如果不指定用户名就会修改当前用户的密码，一定要指定用户名！

4. 删除用户

   * 基本语法：`userdel [用户名]`
   * 删除用户及家目录：`userdel -r [用户名]`
   * 细节说明：有两种删法，一种是只删除用户，保留家目录；另一种是用户和家目录都删除。一般情况下，建议保留家目录


5. 查询用户信息
   * 基本语法：`id [用户名]`
   * 细节说明：当用户不存在时，返回无此用户
6. 切换用户
   * 基本语法：`su - [用户名]`
   * 细节说明：
     * 从权限高的用户切换到权限低的用户，不需要输入密码，反之需要；当需要切换回原来的用户时，使用exit/logout命令
     * 关于`-`是否省略的问题，强烈不建议省略该符号。`-`的作用是：在切换用户的同时，初始化该用户的环境变量
7. 查看当前登录用户的信息
   * 基本语法：`whoami / who am i`
   * 细节说明：`who am i`显示的是第一次登录该系统的用户，`whoami`显示的是当前的使用的用户

#### 用户组管理

1. 基本介绍：类似于角色，系统可以对有共性的多个用户进行统一管理
2. 新增组
   * 基本语法：`groupadd [组名]`
3. 删除组
   * 基本语法：`groupdel [组名]`
4. 增加用户时直接加上组
   * 基本语法：`useradd -g [用户组] [用户名]`
   * 细节说明：如果在创建用户时没有指定组，则会创建一个和用户名同名的组，并将用户加入该组
5. 修改用户所在组
   * 基本语法：`usermod -g [用户组] [用户名]` （modify）

#### 用户和组相关文件

* /etc/passwd 文件

  * 用户(user)的配置文件，记录用户的各种信息
  * 每行的含义：用户名:口令:用户标识号:组标识号:注释性描述:主目录:登录Shell

  ![image-20260111185326513](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260111185326513.png)

* /etc/shadow 文件

  * 存放加密后的口令(密码)

  * 每行的含义：登录名:加密口令:最后一次修改时间:最小时间间隔:最大时间间隔:警告时间:不活动时间:失效时间:标志

    ![image-20260111190245756](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260111190245756.png)

* /etc/group 文件

  * 组(group)的配置文件，记录Linux包含的组的信息

  * 每行含义：组名:口令:组标识号:组内用户列表

    ![image-20260111190545701](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260111190545701.png)

### 运行级别

1. 介绍：运行级别决定了系统启动后处于什么状态，开启哪些服务

2. 传统的7个运行级别：

   | 级别 | 名称            | 功能描述                                             |
   | ---- | --------------- | ---------------------------------------------------- |
   | 0    | Halt            | 关机                                                 |
   | 1    | Single-user     | 单用户模式，只有root权限，不加载网络，常用于找回密码 |
   | 2    | Multi-user      | 多用户模式，无网络                                   |
   | 3    | Full Multi-user | 完全多用户模式，命令行模式，有网络                   |
   | 4    | Unused          | 保留                                                 |
   | 5    | X11             | 图形界面模式                                         |
   | 6    | Reboot          | 重启                                                 |

   常用的运行级别是3(多用户模式，有网络，但节省资源)和5(GUI)

3. 运行级别命令

   * 切换运行级别：`init [运行级别]`
   * 查看当前运行级别：`runlevel`
   * 查看默认运行级别：`systemctl get-default`
   * 改变默认运行级别：`systemctl set-default [.target]`
     * 注意：CentOS 7之前，运行级别的文件在 /etc/inittab 中，CentOS 7之后，运行级别的文件变为 `multi-user.target`（级别3），`graphical.target`（级别5） 

### 重置root密码

1. 进入之前按 e 进入编辑模式
2. 在Linux行尾加上`init=/bin/sh`，按`Ctrl + x`执行，进入单用户模式（提示系统这次启动不要按照正常流程运行init进程，拿到一个简单的sh（命令窗口））
3. 输入 `mount -o remount,rw /` （重新挂载根目录，并赋予读写权限）
4. 输入`passwd`，之后输入两次密码
5. 接着输入`touch /.autorelabel`（在根目录下创建一个名为.autorelabel）的隐藏文件，应对SELinux的安全机制，防止因为修改/etc/shadow文件后，安全标签发生变化而被禁止登录
6. 最后输入`exec /sbin/init`，等待即可（结束当前的sh进程，正式加载系统的各个服务）