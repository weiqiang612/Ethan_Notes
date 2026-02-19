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
   * DHCP协议自动获取IP
