
## 　　前言 <br/>

　　Spring Boot支持传统部署和更现代的部署形式。jar跟war都支持，这里参考[springboot参考手册](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/)学习记录 <br/>

　　传统部署：[https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/howto-traditional-deployment.html](https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/howto-traditional-deployment.html) <br/>

　　更现代的部署：[https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#getting-started-first-application-executable-jar](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#getting-started-first-application-executable-jar) <br/>



## 　　两种方式 <br/>

### 　　jar <br/>

　　springboot项目支持创建可执行Jar，参考手册第[11.5. Creating an Executable Jar](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#getting-started-first-application-executable-jar)就有对这样的介绍，我这里充当一回搬运工（大家好，我是大自然勤劳的搬运工~~）： <br/>

　　我们通过创建一个完全自包含的可执行jar文件来完成我们的示例，该文件可以在生产环境中运行。可执行jar(有时称为“胖jar”)是包含编译类和代码需要运行的所有jar依赖项的归档文件 <br/>

　　要创建一个可执行jar，我们需要将spring-boot-maven-plugin添加到我们的pom.xml中。为此，在dependencies部分下面插入以下几行： <br/>

```
    <!--构建工具-->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
```

　　如果需要制定jar包名称、生成路径，以及跳过测试 <br/>

```
    <!--构建工具-->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <!-- 文件名以及输出路径-->
                <configuration>
                    <finalName>${project.artifactId}</finalName>
                    <outputDirectory>../package</outputDirectory>
                </configuration>
            </plugin>

            <!-- 跳过启动测试 -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <configuration>
                    <skipTests>true</skipTests>
                </configuration>
            </plugin>
        </plugins>
    </build>
```

　　如果是在父类的pom文件进行统一管理，然后子类引入父类，这需要加pluginManagement标签 <br/>

```
    <!--构建工具-->
    <build>
        <pluginManagement>             ... 
        </pluginManagement>
    </build>
```



　　2019-08-23补充：之前打包都是一个多个工程管理，在父类的pom文件配置这个，打包会在目录下面生成，因为用的是../package <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201908/1353055-20190823154406636-460929894.png)  <br/>

　　最近打包一个单独的项目，路径我改成package，没有../了，打包后并没有在项目下面生成package目录，jar不知道打去哪了。。。我全局搜也搜不出来 <br/>

　　后面改成绝对路径F:/package，终于有jar包了，但文件名不对，我们明明设置读取的是${project.artifactId}，但打出来还是带上了版本号。。。，原因暂时未知 <br/>

　　PS：实在不行可以直接指定一个文件夹，例如：F:\package <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201908/1353055-20190823155010485-2075348393.png)  <br/>





　　可以使用命令行来打包，或者使用Maven Projects来打包 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112152728243-1802118865.png)  <br/>



　　同时也可以直接使用下面命令进行打包 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202009/1353055-20200929182121202-598467685.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112152807487-1259312079.png)  <br/>

　　打包成功，在target目录下就会看到jar包 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112152928693-1269222481.png)  <br/>

　　要运行该应用程序，cmd命令，进入到jar所在路径文件，使用 java -jar 命令；win下直接双击用java方式打开即可运行（Ctrl+C退出） <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112160016771-2100466780.png)  <br/>

 　　那么Linux下面如何部署运行呢？ <br/>

```
=====Linux部署命令======
0、查看运行的项目
    pgrep java | xargs ps

1、先kill掉旧服务
    pkill -f myspringboot-0.0.1-SNAPSHOT
    
2、后台启动新服务（nohup后台运行，&后台运行的区别：
    使用nohup运行程序：
        结果默认会输出到nohup.out
        使用Ctrl + C发送SIGINT信号，程序关闭
        关闭session发送SIGHUP信号，程序免疫
    使用&后台运行程序：
        结果会输出到终端
        使用Ctrl + C发送SIGINT信号，程序免疫
        关闭session发送SIGHUP信号，程序关闭
）
    nohup java -jar /home/myspringboot/myspringboot-0.0.1-SNAPSHOT.jar &
    
    如需输出日志
    nohup java -jar /home/myspringboot/myspringboot-0.0.1-SNAPSHOT.jar > /home/myspringboot/myspringboot-0.0.1-SNAPSHOT.log &
    
3、查看日志
    tail -f /home/myspringboot/myspringboot-0.0.1-SNAPSHOT.log
```



　　2019-07-08补充： <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  直接修改jar包内容</span> <br/>

　　　　1、先cd进到jar位置，然后使用 vim 命令进入jar包　　 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190708113931798-1734302917.png)  <br/>

　　　　2、使用 / 命令模糊搜索定位文件，例如main.js　　 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190708114051991-1353726755.png)  <br/>

　　　　3、按回车进入文件，修改完成后使用 :wq 保存退出文件，回到jar包目录，使用 :q 退出jar包，即可成功修改文件内容 <br/>

　　　　PS：修改jar，重启生效 <br/>



　　<span style="color: rgba(255, 0, 0, 1)">  把对应的java、class文件都替换到jar包</span> <br/>



　　2025-07-02更新：以往我们都是在win环境更新class文件或者前端文件，只需要用压缩工具比如7-Zip打开jar，直接把文件拖进去就可以了，但是更新依赖jar包就不能这样，启动会报错 <br/>

　　正确姿势：使用jdk命令进行解压，替换文件后再重新压缩 <br/>

```
新建一个同名文件夹，把jar包放进去，地址栏输入cmd，打开cmd窗口

#解压
jar xf base-admin.jar

#重新压缩 m 指定清单，0不压缩依赖包jar cvfm0 base-admin.jar META-INF/MANIFEST.MF *
```





　　2022-03-11更新：java命令：cmd运行jar包里的class <br/>

　　例如：xxx.jar中有个cn.huanzi.qch.Test.class文件，现在想要运行Test的main函数（yyy.jar、zzz.jar是相关依赖jar包） <br/>

　　PS：java -cp 和 -classpath 一样，是指定类运行所依赖其他类的路径，通常是类库和jar包，需要全路径到jar包，多个jar包之间连接符：window上分号“;”，Linux下使用“:” <br/>

```
java -classpath xxx.jar;yyy.jar;zzz.jar cn.huanzi.qch.Test
```



###  　　war <br/>

　　springboot项目支持创建一个可部署的War文件，参考手册第[92.1 Create a Deployable War File](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#howto-create-a-deployable-war-file)就有对这样的介绍，我这里充当一回搬运工（大家好，我是大自然勤劳的搬运工~~）： <br/>

　　由于Spring WebFlux并不严格依赖于Servlet API，并且应用程序默认部署在嵌入式反应器Netty服务器上，所以WebFlux应用程序不支持War部署。 <br/>

　　生成可部署war文件的第一步是提供SpringBootServletInitializer子类并覆盖其配置方法。这样做可以利用Spring Framework的Servlet 3.0支持，让您在Servlet容器启动应用程序时配置它。通常，您应该更新应用程序的主类以扩展SpringBootServletInitializer，同时，要将Spring应用程序部署到外部服务器，必须确保servlet初始化器直接实现WebApplicationInitializer(即使是从已经实现它的基类扩展而来)。如下例所示: <br/>

```
@SpringBootApplication
public class MyspringbootApplication  extends SpringBootServletInitializer implements WebApplicationInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(MyspringbootApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(MyspringbootApplication.class, args);
    }
}
```



　　在创建springboot项目时，默认是jar包，如果是想要打成war包，需要修改pom.xml，打包方式跟生成路径跟jar的一样，过程的最后一步是确保嵌入的servlet容器不会干扰部署war文件的servlet容器。为此，需要将嵌入式servlet容器依赖项标记为所提供的。 <br/>

```
<!--默认jar-->
<packaging>war</packaging>

<!-- 如需打成war包 确保嵌入的servlet容器不会干扰部署war文件的servlet容器 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <scope>provided</scope>
</dependency>

<!--构建工具-->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
    </plugins>
</build>
```



![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112161348349-1705427619.png)  <br/>

　　得到war包后把它丢到服务容器里（放在webapps文件夹下）run起来就行了，要注意的是使用了外部容器，要记得改Tomcat的端口，在server.xml的Connector节点 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201906/1353055-20190614102442590-2033197629.png)  <br/>

　　友情翻译：如果使用Spring引导构建工具，将嵌入的servlet容器依赖项标记为提供，将生成一个可执行的war文件，并将提供的依赖项打包在lib提供的目录中。这意味着，除了可以部署到servlet容器之外，还可以在命令行上使用java -jar运行应用程序。 <br/>



## 　　后记 <br/>

　　打成war包丢到服务器里面运行启动报错，还不知道是什么问题，都是照着参考手册来的...，先记录到这里；推荐直接使用jar的方式运行，war报错的原因，有空再去研究。 <br/>



## 　　补充 <br/>

　　2019-06-24补充：我将我们前面写的IM系统按照步骤打成war包，但启动Tomcat报错 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201906/1353055-20190624141928659-943774186.png)  <br/>



　　2019-07-12补充，后面看文档后发现，我们漏了一下东西，如果使用Logback，还需要告诉WebLogic选择打包版本，而不是预先安装在服务器上的版本。而SpringBoot默认使用Logback，同时，之前我们也漏了 implements WebApplicationInitializer <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190712112917660-289836960.png)  <br/>



　　将所有的东西都补全后还是报错...　 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190712112828121-917252355.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190712114338619-1443673773.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190712114442519-1953767157.png)  <br/>



　　上网查了一下，说两种问题：1、Tomcat问题，2、jar包问题 <br/>

　　我们之前的Tomcat版本是apache-tomcat-7.0.53，去官网看来下，支持6 and later(7 and later for WebSocket) <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190712121324165-2085872775.png)  <br/>

　　发现9.0.x版的Tomcat也支持1.8及1.8以上，我们项目用的jdk版本是1.8.0_131，我们直接下载最新版Tomcat试一下 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190712123513783-592908568.png)  <br/>

　　成功启动 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190712125244478-488629899.png)  <br/>



　　同时我们也注意到，springboot 2.x的内置Tomcat使用的是9.x <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202011/1353055-20201120152047404-1215207261.png)  <br/>





　　PS： <br/>

　　1、由于使用外部服务器，我们在项目的配置文件配置的server.port=10081已经没有用了，端口信息需要咋Tomcat的server.xml进行配置 <br/>

```
    <Connector port="10081" protocol="HTTP/1.1"
               connectionTimeout="20000"
               redirectPort="8443"
               URIEncoding="UTF-8"/>
```



　　2、解决Tomcat中文乱码，修改conf/logging.properties <br/>

```
java.util.logging.ConsoleHandler.encoding = GBK
```

　　3、为了安全，webapps只保留项目文件 <br/>

　　4、Tomcat的本质是文件夹，默认配置下访问项目要加war包名称，例如： :端口/war包名/路径 <br/>

　　　　这是因为我们server.xml的host节点的默认appBase="webapps" <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190712125810232-51175002.png)  <br/>

　　　　新增一个默认访问路径就可以不用加war包名称了，例如： <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190712130541132-1001929162.png)  <br/>

 　　　　然后就可以这样访问了 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190712131233274-1685082599.png)  <br/>

　　到这里war包启动报错的问题终于解决！ <br/>



　　2019-08-26补充：补充一下如何云安装java的jdk，以及mysql数据库，这里主要参考以下博客文章（亲测可用）： <br/>

　　linux在线安装JDK（1.8版本）：[https://blog.csdn.net/zxb730916/article/details/80899429?tdsourcetag=s_pctim_aiomsg](https://blog.csdn.net/zxb730916/article/details/80899429?tdsourcetag=s_pctim_aiomsg) <br/>

　　Linux之yum安装MySQL：[https://www.jianshu.com/p/136003ffce41](https://www.jianshu.com/p/136003ffce41) <br/>



　　jdk <br/>

```
//查看是否已安装JDK,卸载
yum list installed |grep java  

//卸载CentOS系统Java环境
//         *表时卸载所有openjdk相关文件输入  
yum -y remove java-1.8.0-openjdk*
//         卸载tzdata-java  
yum -y remove tzdata-java.noarch

//列出java环境安装包
yum -y list java*    

// 安装JDK,如果没有java-1.8.0-openjdk-devel就没有javac命令 
yum  install  java-1.8.0-openjdk   java-1.8.0-openjdk-devel
```

　　使用 java -version 查看版本号确认是否安装成功 <br/>



　　mysql <br/>

　　下载、安装 <br/>

```
//下载
wget -i -c http://dev.mysql.com/get/mysql57-community-release-el7-10.noarch.rpm

//安装
yum -y install mysql57-community-release-el7-10.noarch.rpm

yum -y install mysql-community-server
```

　　启动、配置 <br/>

```
//启动
systemctl start  mysqld.service

//查看root初始密码
grep "password" /var/log/mysqld.log

//使用root登录mysql
mysql -uroot -p  

//设置安全级别
set global validate_password_policy=0

//默认密码长度为8，可以设置为其它值，最小4位
set global validate_password_length=4

//修改root密码
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';

//可视化工具的登录授权：(如果授权不成功，请查看防火墙)
grant all on *.* to root@'%' identified by 'root';
```

　　配置到这里就可以使用数据库工具去连接操作数据库了 <br/>



## 　　jar包瘦身 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  2021-08-09更新</span> <br/>

　　我们正常打的jar包，是会把依赖的相关jar也打进去，一般情况下，项目正常运行后我们极少会去修改相关依赖的版本 <br/>

　　因此，我们可以把相关依赖jar包从我们的jar包中剔除出来，运行项目时再指定相关依赖包的路径，减少jar包的大小，方便进行传输 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202108/1353055-20210809170707399-798693628.png)  <br/>





 　　pom文件修改 <br/>

```
<!-- 原打包配置 -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <!-- 文件名以及输出路径 -->
    <configuration>
        <finalName>${project.artifactId}-thin</finalName>
        <outputDirectory>../package</outputDirectory>
    </configuration>
</plugin>
```

```
<!-- jar包瘦身，移除相关依赖jar-打包配置 -->
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <!-- 文件名以及输出路径 -->
    <configuration>
        <finalName>${project.artifactId}-thin</finalName>
        <outputDirectory>../package</outputDirectory>

        <!--
            ${project.artifactId}-thin
            jar包瘦身，不把依赖包打进jar中，可减少jar包大小，
            需要在启动命令指定依赖包路径：-Dloader.path="D:develop/shared/fjar"
         -->
        <!-- 指定该Main Class为全局的唯一入口 -->
        <mainClass>cn.huanzi.qch.springbootjarwar.SpringbootJarWarApplication</mainClass>
        <layout>ZIP</layout>
        <includes>
            <include>
                <groupId>nothing</groupId>
                <artifactId>nothing</artifactId>
            </include>
        </includes>
    </configuration>
</plugin>
```

　　我们分别打包测试，看下到底能瘦身多少，直接运行package <br/>







 　　震惊！一个17M，一个90K <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202108/1353055-20210809171613985-1326244099.png)  <br/>







 　　我们分别运行测试，看一下是否能正常运行 <br/>

　　正常jar包启动：java -jar springboot-jar-war.jar <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202108/1353055-20210809171840760-37143483.png)  <br/>







 　　首先，需要先将正常jar包里的相关依赖jar包lib先解压到外面，然后在启动命令指定依赖jar包路径 <br/>

　　瘦身后的jar包启动：java -jar -Dloader.path="D:\github-code\springBoot\package\lib" springboot-jar-war-thin.jar <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202108/1353055-20210809172304914-1705721516.png) ![](https://huanzi-qch.github.io/file-server/blog-image/202108/1353055-20210809172114733-1409313078.png)  <br/>



　　将相关依赖jar包从我们的jar包移除，大大减少了我们jar包的体积大小，如果再配合上我们之前的《[WebJar的打包和使用](https://www.cnblogs.com/huanzi-qch/p/10881437.html)》，将静态资源打成WebJar，然后再在pom文件中引用，将静态资源变成相关依赖jar包，这样又可以减少不少jar包体积大小，真正做到瘦成一道闪电！ <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


