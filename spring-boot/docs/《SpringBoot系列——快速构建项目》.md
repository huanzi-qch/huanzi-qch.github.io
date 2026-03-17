
## 　　前言 <br/>

　　springboot官方参考指南：[https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/) <br/>

　　Spring Boot是由spring家族提供的全新框架，其设计目的是用来简化新Spring应用的初始搭建以及开发过程。该框架使用“约定大于配置”思想进行了许多默认配置，从而使开发人员简化配置、快速构建项目、愉快开发。 <br/>



　　特性 <br/>

 　　1、创建独立的Spring应用程序 <br/>

 　　　2、直接嵌入Tomcat、Jetty或Undertow(无需部署WAR文件) <br/>

 　　3、提供自以为是的“初学者”依赖，以简化您的构建配置 <br/>

 　　　4、尽可能自动配置Spring和第三方库 <br/>

 　　5、提供生产就绪的特性，例如度量、健康检查和外部化配置 <br/>

 　　6、绝对不需要生成代码，也不需要XML配置 <br/>



## 　　快速构建项目 <br/>

### 　　下载demo <br/>

　　访问官网：https://start.spring.io/，下载demo，解压后就是一个完整的项目了 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112145620155-1982090784.png)  <br/>



### 　　idea创建 <br/>

　　　　1、new Project <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112101622000-190518130.png)  <br/>

　　　　2、填写group、artifact（注意：只能输入小写，否则提示非法字符），选择jar包就可以了 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112102326660-239057544.png)  <br/>

　　　　3、选择依赖，这里记得选择Web --> Web，支持MVC，其他的依赖支持自行选择，也可以创建之后手动添加，我这里多选择了Lombok插件，官网：https://www.projectlombok.org/ <br/>

　　　　lombok是在编译时帮我们生成set、get等方法，记得给idea安装lombok插件，不然编写代码时会报错，找不到set、get等方法 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112144956927-1406245114.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112103033023-1973109159.png)  <br/>

　　　　4、填写项目名称、路径 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112103411010-331879836.png)  <br/>

　　项目构建成功 <br/>

　　static 放静态资源，如js、css等；templates 放html页面，springboot默认从这两个路径读取；springboot项目注解默认扫描路径：启动类的同级包以及子包，如果有一些包没有在这些目录下面，则需要手动添加扫描注解，注意：如果加了这些注解，说明默认扫描路径已经被覆盖，所有的扫描路径都有定义到注解里 <br/>

```
@EnableJpaRepositories(basePackages = "xxx.xxx.xxx")//扫描@Repository注解；
@EntityScan(basePackages = "xxx.xxx.xxx")//扫描@Entity注解；
@ComponentScan(basePackages = {"xxx.xxx.xxx"})//扫描 带@Component的注解，如：@Controller、@Service 注解
```



![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112145243833-1509308170.png)  <br/>



 　　创建一个请求路径： <br/>

```
    @GetMapping("/index")
    public String index(){
        return "hello springboot！";
    }
```

　　我这里8080端口被占用，在配置文件修改一下： <br/>

```
#设置服务端口
server.port=10010
```

　　访问成功 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181112143940759-1146304765.png)  <br/>

##  　　结束语 <br/>

 　　springboot项目使用内嵌Tomcat，不需要将项目添加的idea的Tomcat插件中或者打成war包丢到Tomcat中就能启动运行，后面我们在记录如何部署springboot项目，这里先简单记录如何构建一个springboot项目； <br/>


