
## 　　前言 <br/>

　　Ribbon是一个客户端负载均衡器，它提供了对HTTP和TCP客户端的行为的大量控制。我们在上篇（猛戳：[SpringCloud系列——Feign 服务调用](https://www.cnblogs.com/huanzi-qch/p/10135946.html)）已经实现了多个服务之间的Feign调用，服务消费者调用服务提供者，本文记录Feign调用Ribbon负载均衡的服务提供者 <br/>

　　GitHub地址：[https://github.com/Netflix/ribbon](https://github.com/Netflix/ribbon) <br/>

　　官方文档：[https://cloud.spring.io/spring-cloud-static/spring-cloud-netflix/2.1.0.RC2/single/spring-cloud-netflix.html#spring-cloud-ribbon](https://cloud.spring.io/spring-cloud-static/spring-cloud-netflix/2.1.0.RC2/single/spring-cloud-netflix.html#spring-cloud-ribbon) <br/>



## 　　服务提供者 <br/>

　　服务提供者有两个，实际上可以看做只有一个，因为这两个只有端口不同 <br/>

　　maven引入Ribbon <br/>

```
        <!-- Ribbon -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-ribbon</artifactId>
        </dependency>
```

　　创建RibbonConfig文件，主类添加@RibbonClient(name = "RibbonConfig", configuration = RibbonConfig.class)，我这里偷懒，直接在主类中创建内部类 <br/>

```
@EnableEurekaClient
@RibbonClient(name = "RibbonConfig", configuration = RibbonConfig.class)
@SpringBootApplication
public class SpringbootSpringdataJpaApplication{

    public static void main(String[] args) {
        SpringApplication.run(SpringbootSpringdataJpaApplication.class, args);
    }
}

@Configuration
class RibbonConfig {

    @Bean
    public IRule ribbonRule(){
        return new RandomRule(); //分配策略：随机选择一个server
//        return new BestAvailableRule(); //分配策略：选择一个最小的并发请求的server，逐个考察Server，如果Server被tripped了，则忽略
//        return new RoundRobinRule(); //分配策略：轮询选择，轮询index，选择index对应位置的server
//        return new WeightedResponseTimeRule(); //分配策略：根据响应时间分配一个weight(权重)，响应时间越长，weight越小，被选中的可能性越低
//        return new ZoneAvoidanceRule(); //分配策略：复合判断server所在区域的性能和server的可用性选择server
//        return new RetryRule(); //分配策略：对选定的负载均衡策略机上重试机制，在一个配置时间段内当选择server不成功，则一直尝试使用subRule的方式选择一个可用的server
    }

    @Bean
    public IPing ribbonPing() {
        return new PingUrl();
    }

    @Bean
    public ServerListSubsetFilter serverListFilter() {
        ServerListSubsetFilter filter = new ServerListSubsetFilter();
        return filter;
    }

}
```

　　下表显示了Spring Cloud Netflix默认为Ribbon提供的bean： <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181218164758547-167992797.png)  <br/>

　　官网例子： <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181218164924623-1974755089.png)  <br/>

　　PS：我们启动的时候有可能会碰到这个问题或类似的问题，说我们注入的某个bean对象有重名，叫我们改名或启用覆盖 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190701170857894-460650895.png)  <br/>

　　这个是ribbonRule跟txlcn框架的重名了，我们这里进行改名就能解决问题 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190701171100271-1039139187.png)  <br/>







　　我们添加一个测试接口 <br/>

```
@RestController
@RequestMapping("/user")
public class UserController {

    @RequestMapping("/ribbon")
    public String ribbon() {
        return  "springdatejpa -- 我的端口是：10088";
    }

}
```

　　第二个服务提供者也是这样配置，注意：应用名要相同（spring.application.name=springdatejpa）；端口不同； <br/>



## 　　服务消费者 <br/>

 　　服务消费者使用Feign调用，无需做任何修改，Feign已经使用Ribbon。具体配置请戳：[SpringCloud系列——Feign 服务调用](https://www.cnblogs.com/huanzi-qch/p/10135946.html) <br/>

```
@FeignClient(name = "springdatejpa", path = "/user/")
public interface MyspringbootFeign {

    @RequestMapping("/ribbon")
    String ribbon();
}
```

```
    /**
     * feign调用
     */
    @GetMapping("feign/ribbon")
    String ribbon(){
        return myspringbootFeign.ribbon();
    }
```



## 　　效果 <br/>

　　启动所有项目，我们注册了三个服务，其中： <br/>

　　有两个服务名称相同、处理的业务相同、端口不同，这两台作为服务提供者（可看做是一个“小集群”）； <br/>

　　另一个是服务消费者（Feign调用）； <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181218153739033-1956758107.png)  <br/>



　　消费者不断调用，Ribbon会从注册中心的服务列表拉取实例集合进行负载均衡调用背后的服务提供者 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181218153920533-1766338450.gif)  <br/>



## 　　后记 <br/>

　　Ribbon负载均衡已经可以实现，更多配置请看官方文档 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springCloud](https://github.com/huanzi-qch/springCloud) <br/>

　　码云：[https://gitee.com/huanzi-qch/springCloud](https://gitee.com/huanzi-qch/springCloud) <br/>


