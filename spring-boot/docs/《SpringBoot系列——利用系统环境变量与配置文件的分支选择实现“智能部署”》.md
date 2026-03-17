
## 　　前言 <br/>

　　通过之前的博客：[SpringBoot系列——jar包与war包的部署](https://www.cnblogs.com/huanzi-qch/p/9948060.html)，我们已经知道了如果实现项目的简单部署，但项目部署的时候最烦的是什么？修改成发布环境对应的配置！数据库连接地址、Eureka注册中心地址、Redis服务地址等，部署环境不一样，打包的时候就要改成对应的配置；常用的环境有本地开发环境dev，本地测试环境dev-test，生产测试环境prod-test，生产环境prod； <br/>

　　开发的时候我们用dev，项目直接运行，不用改配置；发布本地测试环境的时候，打包之前我们要先改成对应配置；上线前发布生产测试环境的时候要改成对应配置；正式上线发布生产环境的时候要改成对应配置；每次这样改很麻烦，要是不小心漏改了部分地方，还会造成报错，当换一个人来部署时，还得先告诉他需要修改的地方，麻烦； <br/>

　　那么有什么好办法能解决这个问题呢？我就是不想每次在打包之前改配置，我就直接打包、发布。下面记录一下利用系统环境变量与.yml配置文件的活跃分支实现“智能部署”； <br/>

　　想了解springboot的配置优先级可以参考这篇大佬的博客：[Spring Boot 配置优先级顺序](https://www.cnblogs.com/softidea/p/5759180.html)，我这里简单总结一下： <br/>

1. 命令行参数。
2. 通过 System.getProperties() 获取的 Java 系统参数。
3. 操作系统环境变量。
4. 从 java:comp/env 得到的 JNDI 属性。
5. 通过 RandomValuePropertySource 生成的“random.*”属性。
6. 应用 Jar 文件之外的属性文件。(通过spring.config.location参数)
7. 应用 Jar 文件内部的属性文件。
8. 在应用配置 Java 类（包含“@Configuration”注解的 Java 类）中通过“@PropertySource”注解声明的属性文件。
9. 通过“SpringApplication.setDefaultProperties”声明的默认属性。 <br/>

## 　　代码编写 <br/>

### 　　配置选择分支 <br/>

　　首先我们利用bootstrap.yml先于application.yml加载的顺序，在bootstrap.yml进行分支选择 <br/>

```
spring:
  config:
    name: application #配置文件名
  profiles:
    active: ${HUANZI_PROFILES:dev} #选择配置分支，先读取系统环境变量，如果没有则默认值为 dev
```


　　在application.yml里进行写各个分支的配置，分支之间用注释 ---- 隔开 <br/>

　　请看官网截图介绍：你可以在一个yml里面指定多个具体的profile配置，通过配置spring.profiles，判断使用哪个配置 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190702145305709-1077660449.png)  <br/>



```
##### 公共 配置 #######
server:
  port: 10086 #端口号
  servlet:
    context-path: / #访问根路径

spring:
  application:
    name: springdatejpa #应用名

---

##### dev 配置 #######
spring:
  profiles: dev

  datasource: #连接数据库
    url: jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2B8&characterEncoding=utf-8
    username: root
    password: 123456
    driver-class-name: com.mysql.jdbc.Driver
msg: 正在使用 dev 配置
---
##### dev-test 配置 #######
spring:
  profiles: dev-test

  datasource: #连接数据库（暂时也先用同一个库，否则项目报错起不来）
    url: jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2B8&characterEncoding=utf-8
    username: root
    password: 123456
    driver-class-name: com.mysql.jdbc.Driver
msg: 正在使用 dev-test 配置
---
##### prod-test 配置 #######
spring:
  profiles: prod-test

msg: 正在使用 prod-test 配置
---
##### prod 配置 #######
spring:
  profiles: prod

msg: 正在使用 prod 配置
---
```

 　　当然也可以用后缀.properties的配置文件，来进行根据活跃的profiles分支选择 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190702150659073-1578504880.png)  <br/>

　　创建application-dev.properties，application-dev-test.properties...文件，将具体配置放在具体文件里，同样与yml效果一致 <br/>

　　PS：默认情况下yml没有中文乱码问题，而properties有 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190702151827348-992489653.png)  <br/>



　　另外，官网给出了一个yml的缺点，就是不能使用@PropertySource注释加载yml文件 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190702152055303-77018092.png)  <br/>

　　更多yml介绍请看官网：24.7 Using YAML Instead of Properties [https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-external-config-yaml](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-external-config-yaml) <br/>

　　更多配置文件介绍请看官网：24. Externalized Configuration [https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-external-config](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-external-config) <br/>

　　　　　　　　　　　　　　　25. Profiles [https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-profiles](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-profiles) <br/>



### 　　配置环境变量 <br/>

　　Windows配置系统环境变量，例如：dev-test <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201902/1353055-20190221110255752-1832065232.png)  <br/>



 　　Linux配置系统环境变量，请看这篇文章：[Linux环境变量总结](https://www.jianshu.com/p/ac2bc0ad3d74)，总结下代码、步骤： <br/>

　　<span class="author-p-24555265 font-size:10.5pt">  vim ~/.bash_profile</span> <br/>

　　<span class="author-p-24555265 font-size:10.5pt">  =dev-test ，esc :wq保存退出</span> <br/>

　　<span class="author-p-24555265 font-size:10.5pt">  　　3、  <span class="author-p-24555265 font-size:10.5pt">    source ~/.bash_profile  </span></span> <br/>

　　<span class="author-p-24555265 font-size:10.5pt">  <span class="author-p-24555265 font-size:10.5pt">    　　4、查看环境变量  echo $HUANZI_PROFILES ，如果输出dev-test设置成功  </span></span> <br/>



## 　　效果 <br/>

　　<span class="author-p-24555265 font-size:10.5pt">  <span class="author-p-24555265 font-size:10.5pt">    　　添加一个checkProfiles测试接口，方便检查分支使用情况：  </span></span> <br/>

```
    @Value("${msg}")
    private String msg;

    /**
     * 检查配置分支
     */
    @RequestMapping("checkProfiles")
    public String checkProfiles() {
        return msg;
    }
```



　　<span class="author-p-24555265 font-size:10.5pt">  <span class="author-p-24555265 font-size:10.5pt">    　　没有设置系统环境变量：默认使用dev  </span></span> <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201902/1353055-20190221113904234-416350496.png) ![](http://huanzi.qzz.io/file-server/blog-image/201902/1353055-20190221113917137-1882071913.png)  <br/>





　　<span class="author-p-24555265 font-size:10.5pt">  <span class="author-p-24555265 font-size:10.5pt">    　　设置系统环境变量后：使用环境变量的值dev-test  </span></span> <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201902/1353055-20190221113758989-755583161.png) ![](http://huanzi.qzz.io/file-server/blog-image/201902/1353055-20190221113828811-1486197903.png)  <br/>





## 　　后记 <br/>

　　有了“智能部署”功能，我们将所有的分支配置好之后，不管是部署在那个环境，只要在对应的环境设置好对应的系统环境变量，每次都可以直接打包发布，非常方便！当你没空发版，想叫其他同事帮忙发布，但又怕他不太熟悉时，你就告诉他： <br/>

　　1、更新最新代码 <br/>

　　2、打包、上传 <br/>

　　3、启动项目（先kill掉旧项目、备份旧项目、启动新项目、查看启动日志确保启动过程有无报错） <br/>

　　妈妈再也不用担心我不会发版了！ <br/>


