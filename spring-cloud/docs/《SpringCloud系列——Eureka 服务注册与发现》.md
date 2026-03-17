
## 　　前言 <br/>

　　Eureka是一种基于REST(具像状态传输)的服务，主要用于AWS云中定位服务，以实现中间层服务器的负载平衡和故障转移。本文记录一个简单的服务注册与发现实例。 <br/>

　　GitHub地址：[https://github.com/Netflix/eureka](https://github.com/Netflix/eureka) <br/>

　　官网文档：[https://cloud.spring.io/spring-cloud-static/spring-cloud-netflix/2.1.0.RC2/single/spring-cloud-netflix.html](https://cloud.spring.io/spring-cloud-static/spring-cloud-netflix/2.1.0.RC2/single/spring-cloud-netflix.html) <br/>



## 　　Eureka-Server <br/>

　　服务注册中心 <br/>

　　新建一个Maven项目，并删除src文件夹，保留pom.xml ，作为parent，当然也可以不用 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181217142458121-201163155.png)  <br/>

 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181217142752784-2142137010.png)  <br/>



　　项目结构 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181217142936544-732148995.png)  <br/>



　　maven引入jar <br/>

　　parent的 pom.xml <br/>

　　是为了统一版本 <br/>

```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>cn.huanzi.qch</groupId>
    <artifactId>parent</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.1.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <!-- 保留parent的pom.xml，统一jar的版本 -->
    <properties>
        <source.encoding>UTF-8</source.encoding>
        <java.version>1.8</java.version>

        <!-- 文件拷贝时的编码 -->
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>

        <!-- 编译时的编码 -->
        <maven.compiler.encoding>UTF-8</maven.compiler.encoding>
        <mysql-connector-java.version>5.1.34</mysql-connector-java.version>

        <!-- activiti -->
        <activiti.version>5.22</activiti.version>
        <spring-boot.version>1.4.7.RELEASE</spring-boot.version>

        <!-- jasig cas -->
        <cas.server.version>3.4.3.1</cas.server.version>
        <cas.client.version>3.1.12</cas.client.version>

        <!-- Maven plugin -->
        <maven-source-plugin.version>2.0.3</maven-source-plugin.version>
        <maven-compiler-plugin.version>2.3.2</maven-compiler-plugin.version>
        <maven-assembly-plugin.version>2.2.1</maven-assembly-plugin.version>
        <maven-deploy-plugin.version>2.4</maven-deploy-plugin.version>
        <maven-war-plugin.version>2.1.1</maven-war-plugin.version>
        <maven-jar-plugin.version>2.3.2</maven-jar-plugin.version>

        <spring-cloud.version>Greenwich.RC1</spring-cloud.version>

    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <repositories>
        <repository>
            <id>spring-milestones</id>
            <name>Spring Milestones</name>
            <url>https://repo.spring.io/milestone</url>
        </repository>
    </repositories>
</project>
```

　　eureka-server的 pom.xml <br/>

　　继承parent <br/>

```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>cn.huanzi.qch.eureka</groupId>
    <artifactId>eureka-server</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>eureka-server</name>
    <description>eureka 注册中心</description>

    <!--继承信息-->
    <parent>
        <groupId>cn.huanzi.qch</groupId>
        <artifactId>parent</artifactId>
        <version>1.0.0</version>
    </parent>

    <dependencies>
        <!-- eureka-server -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>

        <!-- spring boot -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <!-- 构建工具 -->
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>

</project>
```



　　配置文件 <br/>

```
server.port=1111
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
eureka.client.serviceUrl.defaultZone=http://localhost:${server.port}/eureka/
```



　　启动类 <br/>

```
@EnableEurekaServer
@SpringBootApplication
public class EurekaServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);

    }

}
```



 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181217143915919-976199670.png)  <br/>





## 　　　Eureka-Client <br/>

　　服务发现，可以新建一个springboot项目，我们直接使用之前写的一个myspringboot项目 <br/>



　　maven中引入相关jar <br/>

```
        <!-- eureka-client -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
```



　　如果没有repositories还需要加入 <br/>

```
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    <repositories>
        <repository>
            <id>spring-milestones</id>
            <name>Spring Milestones</name>
            <url>https://repo.spring.io/milestone</url>
        </repository>
    </repositories>
```



　　配置文件加入注册中心的地址，也就是Eureka-Server的配置文件里面 eureka.client.serviceUrl.defaultZone <br/>

```
#eureka
eureka.client.serviceUrl.defaultZone=http://localhost:1111/eureka/
```



　　启动类添加注解 <br/>

```
@EnableEurekaClient
@SpringBootApplication
@RestController
public class MyspringbootApplication{

    public static void main(String[] args) {
        SpringApplication.run(MyspringbootApplication.class, args);
    }

    /**
     * 访问首页
     */
    @GetMapping("/index")
    public String index(){
        return "hello springboot！";
    }

}
```



　　启动客户端服务 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181217145114373-1594109770.png)  <br/>



　　成功在注册中心注册成功，可以对外提供服务 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181217145217190-1755833915.png)  <br/>



## 　　健康检查 <br/>

　　默认情况下，Eureka使用客户端心跳来确定客户端是否启动。除非另有说明，否则发现客户机不会根据Spring引导执行器传播应用程序的当前健康检查状态。因此，在成功注册后，Eureka总是宣布应用程序处于“UP”状态。可以通过启用Eureka健康检查来更改此行为，比如我现在将myspringboot服务停掉，但注册中心依旧显示为UP，这样就会造成我服务已经挂掉了，但注册中心依然会认为这个实例还活着。 <br/>



　　Eureka-Client <br/>

```
#健康检查（需要spring-boot-starter-actuator依赖）
eureka.client.healthcheck.enabled=true
# 续约更新时间间隔（单位秒，默认30秒）
eureka.instance.lease-renewal-interval-in-seconds=10
# 续约到期时间（单位秒，默认90秒）
eureka.instance.lease-expiration-duration-in-seconds=10
```

```
        <!-- actuator -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
```



　　Eureka-Server <br/>

```
#设为false，关闭自我保护
eureka.server.enable-self-preservation=false
#清理间隔（单位毫秒，默认是60*1000）
eureka.server.eviction-interval-timer-in-ms=10000
```



![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181217153708202-1318778607.png)  <br/>



　　健康检查，注册中心将死去的服务剔除 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181217153735819-1338294018.png)  <br/>



##  　　总结 <br/>

　　Eureka-Server <br/>

　　1、引入的是spring-cloud-starter-netflix-eureka-server，使用的是@EnableEurekaServer <br/>

　　Eureka-Client <br/>

　　1、引入的是spring-cloud-starter-netflix-eureka-client，使用的是@EnableEurekaClient <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springCloud](https://github.com/huanzi-qch/springCloud) <br/>

　　码云：[https://gitee.com/huanzi-qch/springCloud](https://gitee.com/huanzi-qch/springCloud) <br/>


