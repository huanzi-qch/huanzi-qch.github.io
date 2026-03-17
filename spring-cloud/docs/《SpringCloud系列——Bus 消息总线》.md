
## 　　前言 <br/>

　　SpringCloud Bus使用轻量级消息代理将分布式系统的节点连接起来。然后可以使用此代理广播状态更改(例如配置更改)或其他管理指令。本文结合RabbitMQ+GitHub的Webhook实现上篇博客Config配置中心（[SpringCloud系列——Config 配置中心](https://www.cnblogs.com/huanzi-qch/p/10149547.html)）的自动刷新 <br/>

　　官方文档：[https://cloud.spring.io/spring-cloud-static/spring-cloud-bus/2.1.0.RC3/single/spring-cloud-bus.html](https://cloud.spring.io/spring-cloud-static/spring-cloud-bus/2.1.0.RC3/single/spring-cloud-bus.html) <br/>



## 　　RabbitMQ安装 <br/>

　　参考：[https://www.cnblogs.com/zhangweizhong/p/5689209.html](https://www.cnblogs.com/zhangweizhong/p/5689209.html) <br/>

　　大概步骤： <br/>

　　1、先去下载Erlang、RabbitMQ <br/>

　　2、先安装Erlang环境、配置ERLANG_HOME环境变量、安装RabbitMQ <br/>

　　3、激活RabbitMQ 管理插件，登录http://localhost:15672，使用默认账号登录，用户名、密码都是：guest <br/>



## 　　代码编写 <br/>

　　确保RabbitMQ中间件可用之后我们开始对上一篇的项目进行调整，我这里直接使用默认账号连接RabbitMQ，5672是RabbitMQ的监听端口 <br/>



### 　　Config Server <br/>

　　maven引入bus-amqp <br/>

```
        <!-- bus-RabbitMQ -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bus-amqp</artifactId>
        </dependency>
```

　　配置文件添加对RabbitMQ的相关配置 <br/>

```
#bus-rabbitMQ
spring.cloud.bus.trace.enabled=true
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```

　　同时，配置中心担任调用/bus-refresh的任务 <br/>

```
#暴露端点
management.endpoints.web.exposure.include=bus-refresh
```



### 　　Config Client <br/>

　　客户端同时也要连接到消息总线 <br/>

　　maven引jar <br/>

```
        <!-- bus-RabbitMQ -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-bus-amqp</artifactId>
        </dependency>
```

　　配置文件添加 <br/>

```
#bus-rabbitMQ
spring.cloud.bus.trace.enabled=true
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
```



## 　　效果演示 <br/>

　　启动所有项目 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221120425232-1045269360.png)  <br/>

　　Config Server访问 http://localhost:1112/myspringboot-dev.properties/ <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221120533487-63525170.png)  <br/>

　　Config Server访问 http://localhost:10087/index <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221120615691-484773950.png)  <br/>

　　前往GitHub修改 huanzi.qch.config.server.username: 张三2 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221120725253-1861299848.png)  <br/>

　　修改完之后回去刷新Config Server跟Config Client，server能实时更新获取最新数据，client不能实时获取最新数据，读的是缓存 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221120946077-474719687.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221120956743-303980534.png)  <br/>

　　Config Server post调用 http://localhost:1112/actuator/bus-refresh <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221121045921-1220306363.png)  <br/>

　　打印空？没关系，刷新Config Client的http://localhost:10087/index，已经获取到了最新数据 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221121156123-1549845117.png)  <br/>



## 　　WebHook <br/>

　　GitHub的webhook允许在某些事件发生时通知外部服务。当指定的事件发生时，我们将向您提供的每个url发送POST请求。 <br/>

　　登录GitHub，前往创建一个WebHook <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221121546136-1194304638.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221122232086-272770268.png)  <br/>

　　需要能被外网访问，所以这里演示不了... <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201812/1353055-20181221140831501-810724714.png)  <br/>

　　这样，在每次push之后都会触发webhook事件，从而实现Config配置中心的自动刷新 <br/>



## 　　总结 <br/>

 　　更多springcloud bus配置请查阅官方文档 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springCloud](https://github.com/huanzi-qch/springCloud) <br/>

　　码云：[https://gitee.com/huanzi-qch/springCloud](https://gitee.com/huanzi-qch/springCloud) <br/>


