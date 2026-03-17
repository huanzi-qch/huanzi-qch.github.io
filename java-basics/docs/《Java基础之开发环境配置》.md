
## 　　前言 <br/>

　　好记性不如烂笔头，本文记录Java开发环境搭建 <br/>



## 　　jdk <br/>

　　安装 <br/>

　　首先打开openjdk官网（[http://openjdk.java.net](http://openjdk.java.net/)），点击installing，然后再跳转到下载页面（[http://jdk.java.net](http://jdk.java.net/)） <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507153959097-619630076.png)  <br/>



 　　点击最新idk，跳转到详情页，点击zip下载压缩包，不用安装，解压即可使用，不想下载最新版，也可以点击左边最下方的Archive下载其他版本jdk <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507154530483-316016895.png)  <br/>



 　　解压后效果大概如下 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507154714998-1905186240.png)  <br/>



 　　配置 <br/>

　　新增一个系统变量JAVA_HOME <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507154859953-1590035951.png)  <br/>



　　在Path变量里面添加 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507154954609-465745733.png)  <br/>





 　　打开cmd验证 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507155132516-1452525359.png)  <br/>



　　除了添加到环境变量的jdk，idea也能检测到本地解压出来的jdk <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507164948312-624382849.png)  <br/>







##  　　idea <br/>

　　打开JetBrains官网（[https://www.jetbrains.com/zh-cn/idea/download/#section=windows](https://www.jetbrains.com/zh-cn/idea/download/#section=windows)）下载旗舰版 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507155627077-242834873.png)  <br/>



　　安装后可以使用开源项目申请激活码，或者百度破解教程进行破解  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507155812857-1257262502.png)  <br/>





　　推荐几个插件 <br/>

　　1、Background Image Plus，设置背景图，实现“面向对象编程” <br/>

　　2、Chinese ​(Simplified)​ Language Pack / 中文语言包，官方汉化包 <br/>

　　3、Rainbow Brackets，彩虹括号 <br/>



![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507160458206-1590822331.png)  <br/>







## 　　maven <br/>

　　安装 <br/>

　　打开官网，点击左边download（[https://maven.apache.org/download.cgi#](https://maven.apache.org/download.cgi#)），下载最新版本，或者点击下方archives下载历史版本 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507160906201-1386158256.png)  <br/>



 　　解压后大概如下 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507161109687-287127238.png)  <br/>







　　配置 <br/>

　　新增一个MAVEN_HOME <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507161208491-2110848147.png)  <br/>



 　　Path新增 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507161259593-211413334.png)  <br/>





　　cmd验证 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507161354616-1191048849.png)  <br/>





　　修改settings.xml <br/>

```
  <!-- 仓库路径 -->
  <localRepository>D:/maven/maven_repository</localRepository>
  
  <mirrors>
  <!-- 配置阿里下载 -->
     <mirror>
      <id>alimaven</id>
      <name>aliyun maven</name>
      <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
      <mirrorOf>central</mirrorOf>      
    </mirror>
  </mirrors> 
```



　　修改idea默认maven配置 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507161627838-1968785188.png)  <br/>





## 　　web容器 <br/>

### 　　tomcat <br/>

　　官网：[https://tomcat.apache.org](https://tomcat.apache.org/)，点击想要下载的版本 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507162400042-1749153673.png)  <br/>

　　点击下载压缩包 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507162445352-457983375.png)  <br/>



 　　解压即用，解压后大致如下 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507162532992-1524390285.png)  <br/>



 　　快速上手使用：把项目丢到webapps目录中，运行bin目录下的startup.bat脚本 <br/>



### 　　nginx <br/>

　　官网下载地址：[http://nginx.org/en/download.html](http://nginx.org/en/download.html)，下载压缩包 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507162756968-1896368675.png)  <br/>



　　解压后 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507162837334-999117805.png)  <br/>



 　　快速上手使用：把前端项目丢到html目录中，双击运行start.bat脚本 <br/>



## 　　git客户端 <br/>

　　官网下载安装包：[https://git-scm.com](https://git-scm.com/)，运行按默认配置安装即可 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507163329433-2139736238.png)  <br/>



 　　cmd验证 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507163526757-785631019.png)  <br/>



 　　idea进行git配置 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507163638892-862486120.png)  <br/>







## 　　svn客户端 <br/>

　　官网下载地址：[https://tortoisesvn.net/downloads.html](https://tortoisesvn.net/downloads.html)（往下拉还可以下载对应语言包），一步步安装即可 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507163943646-810875919.png)  <br/>





![](http://huanzi.qzz.io/file-server/blog-image/202205/1353055-20220507164226246-389987544.png)  <br/>




