# Linux实操篇

### 1.1 Linux磁盘分区、挂载

#### 1.1.1 Linux分区

1. 原理介绍
   * Linux来说无论有几个分区，分给哪一目录使用，它归根结底只有一个根目录，一个独立且唯一的文件结构，Linux中每个分区都是用来组成整个文件系统的一部分
   * Linux采用了一种叫“载入”的处理方法，它的整个文件系统中包含了一整套的文件和目录，且将一个分区和一个目录联系起来。这时要载入的一个分区将使它的存储空间在一个目录下获得
   
2. 硬盘说明
   * Linux硬盘分为IDE硬盘和SCSI硬盘，目前基本上是SCSI硬盘
   * 对于IDE硬盘，驱动器标识符为"`hdx\~`"，“hd”表明分区所在设备的类型，这里指IDE硬盘。“x”代表盘号(a为基本盘，b为从属盘，c为辅助主盘，d为辅助从属盘)，“\~”代表分区，前四个分区用数字1到4表示，他们是主分区或者扩展分区，从5开始是逻辑分区。
   * 对于SCSI硬盘，则标识为“`sdx\~`”，SCSI硬盘“sd”来表示分区所在设备的类型的，其余和IDE硬盘的表示方法一样。
   
3. 相关指令
   * 查看所有设备挂载情况
     * 命令：`lsblk` 或者 `lsblk -f`
   
4. 挂载的经典案例（增加一块硬盘）
   * 如何增加一块硬盘
     * 虚拟机添加硬盘
     
       在vmware右击该虚拟机，设置，添加新硬盘即可
       
     * 分区
     
       分区命令为 `fdisk /dev/所操作的硬盘` ，注意 `w` 保存修改后退出
       
     * 格式化
     
       建立文件系统。
     
       格式化命令为 `mkfs [选项] [-t 文件系统类型] 设备文件名` (make file system)，常用命令实例：
     
       * 格式化为 EXT4（最通用，在一开始就分配好固定数量的i节点）：`mkfs.ext4 /dev/sdb1`
       * 格式化为 XFS （高性能服务器常用，基于B+树动态创建管理i节点）：`mkfs.xfs /dev/sdb1`
       * 格式化为 FAT32 （用于U盘，跨平台兼容）：`mkfs.vfat /dev/sdb1`
     
     * 挂载
     
       用户可以直接读写该硬盘。
     
       命令：`mount 硬盘文件 目录` ，如将sdb1硬盘挂载到/newdisk/目录下，mount /dev/sdb1 /newdisk/
     
       卸载命令为：`umount 硬盘文件` 或  `umount 目录`
     
       注意：使用命令行挂载后，重启会失效
     
     * 设置可以自动挂载
     
       修改 /etc/fstab 文件即可完成该操作
     
       1. `vim /etc/fstab`
     
          ![image-20260209173137180](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260209173137180.png)
     
       2. 仿照前三个分区，将新分区挂载到指定目录即可，分区推荐使用标识符UUID（`blkid /dev/sdb1` 获取硬盘UUID）
     
       3. 修改完成后，使用 `mount -a` ，测试一下是否挂载成功

#### 1.1.2 磁盘使用情况查询

1. 查询整体磁盘使用情况
   * 基本语法：`df -h` (disk free)

![image-20260209174018232](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260209174018232.png)

2. 查询指定目录的磁盘占用情况

   * 基本语法：`du -h 目录` (disk usage)，若没有指明目录，默认查询当目录
   * 选项：
     * `-s`：指定目录占用大小汇总
     * `-h`：带计量单位
     * `-a`：将目录下的文件也列出来
     * `--max-depth=1`：子目录深度
     * `-c`：列出明细的同时，增加汇总值

   ![image-20260209181245866](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260209181245866.png)

#### 1.1.3 工作使用指令

1. 统计指定目录下文件的个数

   `ll /opt | grep "^-" | wc -l`，`wc -l` (word count)命令用来统计文本中换行符的个数，即行数。

2. 统计指定目录下目录的个数

   `ll /opt | grep "^d" | wc -l`

3. 统计指定目录下文件的个数，包括子文件夹的

   `ll -R /opt | grep "^-" | wc -l`

4. 统计指定目录下目录的个数，包括子文件夹的

   `ll -R /opt | grep "^d" | wc -l`

5. 以树状显示目录结构

   `tree`

### 1.2 网络配置

#### 1.2.1 NAT网络配置原理图

![image-20260211200929048](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260211200929048.png)

#### 1.2.2 网络配置指令

1. 查看ip地址：`ifconfig / ip addr`

2. ping测试主机之间的连通性
   * 基本语法：`ping 目的主机ip`

3. Linux网络环境设置
   * DHCP协议自动获取IP（默认），IP不会冲突，但是IP不固定，不适合做服务器

   * 指定IP，使用静态IP，通过修改配置文件的方法，自己指定IP

     * 配置静态IP

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

4. 设置主机名和hosts映射

   * 指令 `hostname`  ，查看主机名

   * 修改主机名

     * 在  `/etc/hostname` 指定

   * 设置hosts映射，使得主机可以通过主机名与其他主机通信

     * windows系统设置hosts映射关系：修改 `C:\Windows\System32\drivers\etc\hosts` 文件即可，加上ip及对应的主机名

       ![image-20260219180123150](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260219180123150.png)

     * Linux系统设置hosts映射关系：在 `/etc/hosts` 文件中指定

   * 主机名解析过程分析（Hosts、DNS）

     * Hosts是什么？

       一个文本文件，用来记录 IP 和 主机名的映射关系

     * DNS(Domain Name System的缩写)，域名系统，是互联网上作为域名和IP地址相互映射的一个分布式数据库。

       当对某一个域名发起请求时，计算机首先在**浏览器缓存**中寻找该域名对应的IP地址，如果没有，就在**操作系统DNS缓存**中寻找，再没有，会查看本机的**hosts文件**，寻找该域名的IP映射，最后再没有就会去**DNS服务器**中寻找。

### 1.3 进程管理

#### 1.3.1 进程基本介绍

1. 在Linux中，每个执行的程序都称为一个进程。每个进程都分配一个ID号（PID，进程号）
2. 每个进程都可能以两种方式存在的，前台进程和后台进程，所谓前台进程就是用户目前的屏幕上可以进行操作的。后台进程则是系统在后台操作，后台方式执行。
3. 一般系统的服务都是以后台进程的方式存在，而且都会常驻在系统中，直到关机才结束。

#### 1.3.2 显示系统执行的进程

1. 基本介绍：ps命令（process status）是用来查看目前系统中，有哪些进程正在执行，以及它们执行的状况，可以不加任何参数

2. 基本语法：`ps [选项]`

3. 常用选项：

   * `-a` : 显示当前终端所有进程信息，侧重"人"启动的进程
   * `-u` : 以用户的格式显示进程信息
   * `-x` : 显示后台进程运行的参数
   * `-e` : 显示所有进程，包含“系统”启动的进程
   * `-f` : 全格式显示，包含UID、PPID等详细信息

   注：平时使用ps命令时有两种风格，当需要看进程的父进程(PPID)时，使用`ps -ef`，其他时候使用`ps -aux`即可

4. ps命令显示的信息选项

   ![image-20260219185506846](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260219185506846.png)

   | **列名**    | **全称**          | **意义（通俗解释）**                                         |
   | ----------- | ----------------- | ------------------------------------------------------------ |
   | **USER**    | User              | 该进程属于哪个用户（谁运行的）。                             |
   | **PID**     | Process ID        | **进程 ID**。这是每个进程的唯一身份证号，结束进程（`kill`）时要用到它。 |
   | **%CPU**    | CPU Usage         | 进程占用的 CPU 百分比。                                      |
   | **%MEM**    | Memory Usage      | 进程占用的物理内存百分比。                                   |
   | **VSZ**     | Virtual Size      | 虚拟内存大小（KB），包含进程可以访问的所有内存，包括置换出去的。 |
   | **RSS**     | Resident Set Size | 实际占用的**物理内存**大小（KB）。                           |
   | **TTY**     | Terminal Type     | 进程在哪个终端运行。`?` 表示后台运行（与终端无关）。         |
   | **STAT**    | Status            | **进程状态**（非常关键，见下表）。                           |
   | **START**   | Start Time        | 进程启动的具体时间。                                         |
   | **TIME**    | CPU Time          | 进程自启动以来实际占用 CPU 的总时间。                        |
   | **COMMAND** | Command           | 启动该进程的完整命令行。                                     |

5. 详解进程状态（STAT）

   * **R (Running)**：正在运行，或者在运行队列中等待。

   * **S (Interruptible Sleep)**：可中断休眠。它在等某个事件发生（比如等用户输入）。

   * **D (Uninterruptible Sleep)**：不可中断休眠。通常在等硬盘 I/O，此时 `kill -9` 也杀不掉它。

   * **T (Stopped)**：已停止（可能被手动暂停了）。

   * **Z (Zombie)**：**僵尸进程**。进程已结束，但父进程还没回收它的“尸体”（信息）。

   * **<**：高优先级进程。

   * **N**：低优先级进程。

   * **+**：位于前台进程组。

     ![](https://cdn.jsdmirror.com/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260219192355196.png)

#### 1.3.3 终止进程kill和killall

1. 介绍：若是一个进程执行到一半需要停止或消耗过大资源时，可以考虑停止该进程，使用kill命令即可。

2. 基本语法

   * `kill [选项] 进程号`，通过进程号杀死进程
   * `killall 进程名称`，杀死所有该名称的进程，支持通配符

3. 常用选项

   * `-9` : 强制杀死进程
   * `-15` : 默认，请求进程正常关闭
   * `-1` : 挂起信号，通常用于让进程重新加载配置

4. 案例

   * 踢掉某个非法登录用户

     ![image-20260219195930527](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260219195930527.png)

     `ps -aux | grep sshd` , 找到管理远程连接的该进程，其中 `ethan [priv]` 即为目标进程，终止该进程，该远程连接以及其子进程也会断掉

   * 终止远程登录服务sshd：`root       7776      1  0 17:44 ?        00:00:00 /usr/sbin/sshd -D`，终止该进程即可，重启该服务命令为`/bin/systemctl start sshd.service`

   * 终止多个gedit:`killall gedit`

   * 强制杀掉一个终端

     ![image-20260219201242816](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260219201242816.png)

     `ps -aux | grep bash`，找到所有终端，pts/ 的即为目标，可以在要杀掉的终端内输入`tty`命令，获取终端号，再根据其对应的进程号杀死即可，需要-9强制杀掉

#### 1.3.4 查看进程树pstree

1. 基本语法：`pstree [选项]` ，可以更加直观的来查看进程的信息

2. 常用选项
   * `-p` : 显示进程PID
   
   ![image-20260228151104902](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260228151104902.png)
   
   * `-u` : 显示进程所属用户
   
   ![image-20260228151138687](https://jsd.cdn.zzko.cn/gh/weiqiang612/My-TuChuang@main/img/Linux/image-20260228151138687.png)

#### 1.3.5 服务管理

1. 介绍：服务（service）本质就是进程，但是是运行在后台的，通常都会监听某个端口，等待其他程序的请求，比如(mysqld,sshd,防火墙等)，因此也称为守护进程

2. service管理指令
   * 基本语法： `service 服务名 [start | stop | restart | reload | status]` 
   * 注意：在CentOS7.0后，很多服务不再使用 service，而是 systemctl
   * service指令管理的服务在 `/etc/init.d` 查看

3. 服务管理

   * chkconfig指令（check configuration）

     * 介绍
       * 管理开机自启的指令
       * 通过chkconfig指令可以给服务的各个运行级别设置自启动/关闭，即设置该服务在某个运行级别下是自启动还是关闭
       * 该指令管理的服务可以通过 `/etc/init.d` 查看
       * CentOS 7.0后，很多服务使用 systemctl 管理
     * chkconfig 基本语法
       * chkconfig --list [| grep xxx]  查看服务
       * chkconfig 服务名 --list 查看特定服务
       * chkconfig --level 5 服务名 on / off

   * `systemctl`管理指令

     | **分类**     | **操作** | **指令**                        | **说明**                      |
     | ------------ | -------- | ------------------------------- | ----------------------------- |
     | **服务控制** | 启动     | `systemctl start <服务名>`      | 立即开启服务                  |
     |              | 停止     | `systemctl stop <服务名>`       | 立即关闭服务                  |
     |              | 重启     | `systemctl restart <服务名>`    | 重启服务（先关后开）          |
     |              | 状态     | `systemctl status <服务名>`     | 🔍 查看运行详情、PID及最近日志 |
     | **开机自启** | 启用     | `systemctl enable <服务名>`     | 设置为开机后自动运行          |
     |              | 禁用     | `systemctl disable <服务名>`    | 取消开机自动运行              |
     |              | 检查     | `systemctl is-enabled <服务名>` | 查询该服务是否已设为自启      |
     | **系统查询** | 运行中   | `systemctl list-unit-files`     | 列出磁盘上安装的服务          |
     |              | 失败项   | `systemctl --failed`            | ⚠️ 快速找出启动失败的服务      |

     注意：systemctl管理的指令在 `/usr/lib/systemd/system` 查看



 
