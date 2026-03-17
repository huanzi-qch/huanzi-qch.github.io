
## 　　前言 <br/>

　　分布式环境下，服务直接相互调用，一个复杂的业务可能要调用多个服务，例如A -> B -> C -> D，如何追踪http请求的轨迹？ <br/>

　　本文记录Spring Cloud Sleuth + Zipkin实现分布式链路追踪 <br/>



## 　　代码编写 <br/>

### 　　zipkin-server <br/>



　　一个普通SpringBoot项目，继承我们的SpringCloud工程的父类pom，引入zipkin服务依赖，为了方便管理，也将它作为客户端注册到eureka <br/>



　　pom文件 <br/>

```
<dependencies>
        <!-- eureka-client -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>

        <!-- zipkin -->
        <!--
            从 2.12.6 版本开始有个较大的更新，迁移使用 Armeria HTTP 引擎。从此版本开始，若直接添加依赖的 Spring Boot 应用启动会存在冲突
            2.12.5，会使用默认8080
        -->
        <dependency>
            <groupId>io.zipkin.java</groupId>
            <artifactId>zipkin-server</artifactId>
            <version>2.12.3</version>
            <!-- 引入zipkin-server包时idea报错Exception in thread "main" java.lang.StackOverflowError -->
            <exclusions>
                <exclusion>
                    <artifactId>log4j-slf4j-impl</artifactId>
                    <groupId>org.apache.logging.log4j</groupId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>io.zipkin.java</groupId>
            <artifactId>zipkin-autoconfigure-ui</artifactId>
            <version>2.12.3</version>
        </dependency>
    </dependencies>
```

　　配置文件 <br/>

```
server.port=10000
spring.application.name=zipkin-server

management.metrics.web.server.auto-time-requests=false
#logging.level.root=debug

eureka.client.serviceUrl.defaultZone=http://127.0.0.1:1111/eureka/
#健康检查（需要spring-boot-starter-actuator依赖）
eureka.client.healthcheck.enabled=true
# 续约更新时间间隔（默认30秒）
eureka.instance.lease-renewal-interval-in-seconds=10
# 续约到期时间（默认90秒）
eureka.instance.lease-expiration-duration-in-seconds=10
#eureka服务列表显示ip+端口
eureka.instance.prefer-ip-address=true
eureka.instance.instance-id=http://${spring.cloud.client.ip-address}:${server.port}
eureka.instance.hostname= ${spring.cloud.client.ip-address}
```

　　启动类 <br/>

```
@EnableZipkinServer
@EnableEurekaClient
@SpringBootApplication
public class ZipkinServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZipkinServerApplication.class, args);
    }

}
```



![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223151016809-170387676.png)  <br/>







### 　　zipkin-client <br/>

　　每个业务模块都应属于客户端，在我们的demo例子中，service-a、service-b1/service-b2、service-c模块pom都引入 <br/>

```
        <!-- 分布式链路追踪 -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zipkin</artifactId>
        </dependency>
```

　　新增配置文件zipkin.properties <br/>

```
spring.zipkin.base-url=http://127.0.0.1:10000
spring.sleuth.sampler.probability=1.0
```

　　然后在自定义MyEnvironmentPostProcessor中，将配置文件加载到Environment环境中 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223152041501-200057113.png)  <br/>



 　　这样便完成一个zipkin-client的配置 <br/>



## 　　效果演示 <br/>

　　不必启动所以服务，将测试涉及到的服务启动即可（记得启动redis、mysql服务） <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223152303907-34472231.png)  <br/>



 　　通过zuul网关调用service-a的ribbon接口，进行测试 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223152348106-1018106403.png)  <br/>



 　　访问zipkin-server服务：http://localhost:10000，跳转可视化页面，点击查询查看追踪日志 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223152525045-1151702817.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223152726814-377546663.png)  <br/>



 　　如果我们关闭service-b服务 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223152919683-775856220.png)  <br/>







![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223152822622-1624026473.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223152839145-935134838.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223152844531-1513293307.png)  <br/>



 　　还可以查看请求中的服务依赖关系 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211223153013128-1711109074.png)  <br/>



## 　　后记 <br/>

　　分布式链路追踪暂时先记录到这，后续再进行补充 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springCloud](https://github.com/huanzi-qch/springCloud) <br/>

　　码云：[https://gitee.com/huanzi-qch/springCloud](https://gitee.com/huanzi-qch/springCloud) <br/>




