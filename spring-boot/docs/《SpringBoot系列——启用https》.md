
## 　　前言 <br/>

　　有时候我们需要使用https安全协议，本文记录在SpringBoot项目启用https <br/>



## 　　生成证书 <br/>

### 　　自签名证书 <br/>

　　使用java jdk自带的生成SSL证书的工具keytool生成自己的证书 <br/>

　　1、打开cmd <br/>

　　2、输入命令生成证书 <br/>

```
keytool -genkeypair -alias tomcat_https -keypass 123456 -keyalg RSA -keysize 1024 -validity 365 -keystore d:/tomcat_https.keystore -storepass 123456
```

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102160552339-137858900.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102160225900-1202288024.png)  <br/>

　　　　-alias 别名
 　　　　-keypass 指定生成密钥的密码
 　　　　-keyalg 指定密钥使用的加密算法（如 RSA）
 　　　　-keysize 密钥大小
 　　　　-validity 过期时间，单位天
 　　　　-keystore 指定存储密钥的密钥库的生成路径、名称
 　　　　-storepass 指定访问密钥库的密码 <br/>





### 　　域名型证书 <br/>

　　腾讯云域名型证书申请流程
　　[https://cloud.tencent.com/document/product/400/6814](https://cloud.tencent.com/document/product/400/6814) <br/>



　　2020-01-10更新：今天使用内网穿透工具分给我们的二级域名去腾讯云申请证书，并记录一下 <br/>

　　1、登录腾讯云  -> 证书管理 -> 申请免费证书 <br/>

　　2、按照表单要求正确填写内容（填写的域名不需要www开头） <br/>

　　3、使用“文件验证”的方式进行域名验证 （[https://cloud.tencent.com/document/product/400/4142](https://cloud.tencent.com/document/product/400/4142)） <br/>

　　首先看文档说明： <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200110153022977-1067002652.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200110152844262-1851165424.png)  <br/>

　　在springBoot项目中的static文件夹新建，然后把文件内容复制进去 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200110152938893-434798317.png)  <br/>

　　 启动项目，访问 http://XXXX/.well-known/pki-validation/fileauth.txt，返回文件内容 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200110153253194-518531434.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200110153347746-567860241.png)  <br/>



　　另外，内网穿透隧道协议类型要改成https，本地端口改成443，其他的不用变 <br/>



　　效果 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200110154901132-1451878650.png)  <br/>



## 　　项目配置 <br/>

### 　　导入证书 <br/>

　　把生成的tomcat_https.keystore放在resources里（任意安全目录都可以） <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102161153484-496122920.png)  <br/>





### 　　配置文件 <br/>

```
#https默认端口：443，http默认端口：80
server.port=443
server.http-port=80

#开启https，配置跟证书一一对应
server.ssl.enabled=true
#指定证书
server.ssl.key-store=classpath:tomcat_https.keystore
server.ssl.key-store-type=JKS
#别名
server.ssl.key-alias=tomcat_https
#密码
server.ssl.key-password=123456
server.ssl.key-store-password=123456

spring.application.name=springboot-https
```

 　　2021-12-21更新：启动总是报端口被占用，注释别名，另外server.ssl.key-password也不是必要的，可以注释起来 <br/>

```
#别名
#server.ssl.key-alias=tomcat_https

#密码
#server.ssl.key-password=123456
```





### 　　测试与效果 <br/>

　　新增测试controller <br/>

```
package cn.huanzi.qch.springboothttps.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HttpsController {

    @GetMapping("/hello")
    public String hello() {
        return "SpringBoot系列——启用https";
    }

}
```



　　由于是自签名证书，浏览器不认可 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102161641784-534486042.png)  <br/>



 　　选择“高级”，选择继续访问即可 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102161719512-1272732856.png)  <br/>



 　　成功访问 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102161743123-191122462.png)  <br/>





## 　　客户端信任证书 <br/>

　　每次打开浏览器都阻止访问，很烦，因此需要导出.car文件证书，给客户端安装 <br/>

```
keytool -keystore d:/tomcat_https.keystore -export -alias tomcat_https -file d:/server.cer
```

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102160148187-527397622.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102160203427-1034815806.png)  <br/>

　　双击安装，选择导入到受信任的跟证书颁发机构 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102161929389-20970096.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102164752752-1306786989.png)  <br/>





 　　这样访问就不会再阻止了，但还是显示证书无效 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102162518248-1044649358.png)  <br/>





## 　　http强制跳转https <br/>

　　注入TomcatServletWebServerFactory，监听http重定向到https <br/>

```
package cn.huanzi.qch.springboothttps.config;

import org.apache.catalina.Context;
import org.apache.catalina.connector.Connector;
import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * http强制跳转https
 */
@Configuration
public class Http2Https {

    @Value("${server.port}")
    private int sslPort;//https的端口

    @Value("${server.http-port}")
    private int httpPort;//http的端口

    @Bean
    public TomcatServletWebServerFactory servletContainerFactory() {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
            @Override
            protected void postProcessContext(Context context) {
                //设置安全性约束
                SecurityConstraint securityConstraint = new SecurityConstraint();
                securityConstraint.setUserConstraint("CONFIDENTIAL");
                //设置约束条件
                SecurityCollection collection = new SecurityCollection();
                //拦截所有请求
                collection.addPattern("/*");
                securityConstraint.addCollection(collection);
                context.addConstraint(securityConstraint);
            }
        };
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        //设置将分配给通过此连接器接收到的请求的方案
        connector.setScheme("http");

        //true： http使用http, https使用https;
        //false： http重定向到https;
        connector.setSecure(false);

        //设置监听请求的端口号，这个端口不能其他已经在使用的端口重复，否则会报错
        connector.setPort(httpPort);

        //重定向端口号(非SSL到SSL)
        connector.setRedirectPort(sslPort);

        tomcat.addAdditionalTomcatConnectors(connector);
        return tomcat;
    }
}
```



### 　　效果 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202001/1353055-20200102163247367-867579538.gif)  <br/>

## 　　后记 <br/>

　　部分代码参考：https://www.cnblogs.com/niumoo/p/11717657.html <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


