
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

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102160552339-137858900.png)  <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102160225900-1202288024.png)  <br/>

　　　　-alias 别名
 　　　　-keypass 指定生成密钥的密码
 　　　　-keyalg 指定密钥使用的加密算法（如 RSA）
 　　　　-keysize 密钥大小
 　　　　-validity 过期时间，单位天
 　　　　-keystore 指定存储密钥的密钥库的生成路径、名称
 　　　　-storepass 指定访问密钥库的密码 <br/>



　　<span style="color: rgba(255, 0, 0, 1)">  2025-07-16更新</span> <br/>

　　使用openssl生成.key、.pem <br/>

　　安装openssl <br/>

　　下载地址：https://slproweb.com/products/Win32OpenSSL.html，下载最新版 <br/>

![](https://img2024.cnblogs.com/blog/1353055/202507/1353055-20250716110316789-1673627079.png)  <br/>

 　　双击运行，一步步安装，根据安装路径，新增环境变量：C:\Program Files\OpenSSL-Win64\bin <br/>

![](https://img2024.cnblogs.com/blog/1353055/202507/1353055-20250716110515257-1422207910.png)  <br/>

　　　生成.key私钥 <br/>

```
openssl genpkey -algorithm RSA -out mydomain.key -pkeyopt rsa_keygen_bits:2048
```

　　生成.pem <br/>

```
openssl req -new -x509 -key mydomain.key -out mydomain.pem -days 3650 -subj "/CN=huanzi.qzz.io"
```

　　查看证书 <br/>

```
openssl x509 -in mydomain.pem -text -noout
```

![](https://img2024.cnblogs.com/blog/1353055/202507/1353055-20250716110553112-815410025.png)  <br/>

　　nginx使用 <br/>

```
在Nginx的配置文件中（通常是/etc/nginx/nginx.conf或/etc/nginx/sites-available/default），配置SSL部分如下：

server {
    listen 443 ssl;
    server_name your_domain.com;
 
    ssl_certificate /path/to/mydomain.pem;
    ssl_certificate_key /path/to/mydomain.key;
 
    location / {
        # 其他配置...
    }
}
```

　　宝塔 <br/>

![](https://img2024.cnblogs.com/blog/1353055/202507/1353055-20250716110118159-554822555.png)  <br/>





### 　　域名型证书 <br/>

　　腾讯云域名型证书申请流程
　　[https://cloud.tencent.com/document/product/400/6814](https://cloud.tencent.com/document/product/400/6814) <br/>



　　2020-01-10更新：今天使用内网穿透工具分给我们的二级域名去腾讯云申请证书，并记录一下 <br/>

　　1、登录腾讯云  -> 证书管理 -> 申请免费证书 <br/>

　　2、按照表单要求正确填写内容（填写的域名不需要www开头） <br/>

　　3、使用“文件验证”的方式进行域名验证 （[https://cloud.tencent.com/document/product/400/4142](https://cloud.tencent.com/document/product/400/4142)） <br/>

　　首先看文档说明： <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200110153022977-1067002652.png)  <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200110152844262-1851165424.png)  <br/>

　　在springBoot项目中的static文件夹新建，然后把文件内容复制进去 <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200110152938893-434798317.png)  <br/>

　　 启动项目，访问 http://XXXX/.well-known/pki-validation/fileauth.txt，返回文件内容 <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200110153253194-518531434.png)  <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200110153347746-567860241.png)  <br/>



　　另外，内网穿透隧道协议类型要改成https，本地端口改成443，其他的不用变 <br/>



　　效果 <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200110154901132-1451878650.png)  <br/>



## 　　项目配置 <br/>

### 　　导入证书 <br/>

　　把生成的tomcat_https.keystore放在resources里（任意安全目录都可以） <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102161153484-496122920.png)  <br/>





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

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102161641784-534486042.png)  <br/>



 　　选择“高级”，选择继续访问即可 <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102161719512-1272732856.png)  <br/>



 　　成功访问 <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102161743123-191122462.png)  <br/>





## 　　客户端信任证书 <br/>

　　每次打开浏览器都阻止访问，很烦，因此需要导出.car文件证书，给客户端安装 <br/>

```
keytool -keystore d:/tomcat_https.keystore -export -alias tomcat_https -file d:/server.cer
```

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102160148187-527397622.png)  <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102160203427-1034815806.png)  <br/>

　　双击安装，选择导入到受信任的跟证书颁发机构 <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102161929389-20970096.png)  <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102164752752-1306786989.png)  <br/>





 　　这样访问就不会再阻止了，但还是显示证书无效 <br/>

![](https://img2018.cnblogs.com/i-beta/1353055/202001/1353055-20200102162518248-1044649358.png)  <br/>





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

![](https://img2018.cnblogs.com/common/1353055/202001/1353055-20200102163247367-867579538.gif)  <br/>

## 　　后记 <br/>

　　部分代码参考：https://www.cnblogs.com/niumoo/p/11717657.html <br/>



## 　　更新 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  2025-12-16更新</span> <br/>

　　实际应用中，有时候我们会需要支持https支持绑定多个域名，但Springboot默认只能在配置文件对一个域名证书进行绑定，这时候我们可以使用手动编码配置 Tomcat connector，使Springboot支持https多个域名证书！ <br/>

　　1、首先下载好对应的域名jks文件、记录以及对应的密码 <br/>

![](https://img2024.cnblogs.com/blog/1353055/202512/1353055-20251216145414585-970392008.png)  <br/>

 　　2、配置文件里面Springboot关于ssl的配置项全部注释起来或者删掉 <br/>

　　 3、配置文件新增自定义ssl配置项，方便我们的HttpsConfig类调用 <br/>

```
# 自定义ssl配置，供HttpsConfig类使用
huanzi:
  ssl:
    port: 443
    jks-path: E:/huanzi/ssl
    main-xxx-xxx-jks-path: ${huanzi.ssl.jks-path}/main.xxx.xxx.jks
    main-xxx-xxx-jks-pwd: 123456

    app-xxx-xxx-jks-path: ${huanzi.ssl.jks-path}/app.xxx.xxx.jks
    app-xxx-xxx-jks-pwd: 234567

    erp-xxx-xxx-jks-path: ${huanzi.ssl.jks-path}/erp.xxx.xxx.jks
    erp-xxx-xxx-jks-pwd: 345678

    test-xxx-xxx-jks-path: ${huanzi.ssl.jks-path}/test.xxx.xxx.jks
    test-xxx-xxx-jks-pwd: 456789
```

　　 4、编写HttpsConfig.java <br/>

```
import org.apache.catalina.connector.Connector;
import org.apache.coyote.http11.Http11NioProtocol;
import org.apache.tomcat.util.net.SSLHostConfig;
import org.apache.tomcat.util.net.SSLHostConfigCertificate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

/**
 * 手动编码配置 Tomcat connector，使Springboot支持https多个域名证书
 */
@Configuration
public class HttpsConfig {

    @Value("${server.port}")
    private int httpPort;//http的端口

    @Value("${huanzi.ssl.port}")
    private int sslPort;//https的端口

    @Value("${huanzi.ssl.main-xxx-xxx-jks-path}")
    private String mainXxxXxxJksPath;//jks证书位置
    @Value("${huanzi.ssl.main-xxx-xxx-jks-pwd}")
    private String mainXxxXxxJksPwd;//jks证书密码

    @Value("${huanzi.ssl.app-xxx-xxx-jks-path}")
    private String appXxxXxxJksPath;//jks证书位置
    @Value("${huanzi.ssl.app-xxx-xxx-jks-pwd}")
    private String appXxxXxxJksPwd;//jks证书密码

    @Value("${huanzi.ssl.erp-xxx-xxx-jks-path}")
    private String erpXxxXxxJksPath;//jks证书位置
    @Value("${huanzi.ssl.erp-xxx-xxx-jks-pwd}")
    private String erpXxxXxxJksPwd;//jks证书密码

    @Value("${huanzi.ssl.test-xxx-xxx-jks-path}")
    private String testXxxXxxJksPath;//jks证书位置
    @Value("${huanzi.ssl.test-xxx-xxx-jks-pwd}")
    private String testXxxXxxJksPwd;//jks证书密码

    @Bean
    public ServletWebServerFactory servletContainer() throws IOException {
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory();

        // 创建 HTTPS Connector
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        connector.setPort(sslPort);

        //true： http使用http, https使用https;
        connector.setScheme("http");
        connector.setSecure(true);

        //false： http重定向到https;
//        connector.setScheme("https");
//        connector.setSecure(false);
//        connector.setPort(httpPort);//设置监听请求的端口号，这个端口不能其他已经在使用的端口重复，否则会报错
//        connector.setRedirectPort(sslPort);//重定向端口号(非SSL到SSL)

        // 启用 SSL
        connector.setProperty("SSLEnabled", "true");
        Http11NioProtocol protocol = (Http11NioProtocol) connector.getProtocolHandler();
        protocol.setSSLEnabled(true);
        //设置默认
        protocol.setDefaultSSLHostConfigName("main.xxx.xxx");

        //配置第一个域名ssl
        SSLHostConfig sslHostConfig = new SSLHostConfig();
        sslHostConfig.setHostName("main.xxx.xxx");
        SSLHostConfigCertificate sslHostConfigCertificate = new SSLHostConfigCertificate(sslHostConfig, SSLHostConfigCertificate.Type.RSA);
        //证书可以放在固定的证书文件夹里也可以放在项目中,如果放项目中，则将证书放在resources目录下，sslHostConfigCertificate.setCertificateKeystoreFile("cloud.xxx.com.jks");
        sslHostConfigCertificate.setCertificateKeystoreFile(mainXxxXxxJksPath);
        //下载jks格式时，里面会带有密码文件
        sslHostConfigCertificate.setCertificateKeystorePassword(mainXxxXxxJksPwd);
        sslHostConfigCertificate.setCertificateKeystoreType("JKS");
        sslHostConfig.addCertificate(sslHostConfigCertificate);
        connector.addSslHostConfig(sslHostConfig);

        //配置第二个域名ssl
        SSLHostConfig sslHostConfig1 = new SSLHostConfig();
        sslHostConfig1.setHostName("app.xxx.xxx");
        SSLHostConfigCertificate sslHostConfigCertificate1 = new SSLHostConfigCertificate(sslHostConfig1, SSLHostConfigCertificate.Type.RSA);
        sslHostConfigCertificate1.setCertificateKeystoreFile(appXxxXxxJksPath);
        sslHostConfigCertificate1.setCertificateKeystorePassword(appXxxXxxJksPwd);
        sslHostConfigCertificate1.setCertificateKeystoreType("JKS");
        sslHostConfig1.addCertificate(sslHostConfigCertificate1);
        connector.addSslHostConfig(sslHostConfig1);

        //配置第三个域名ssl
        SSLHostConfig sslHostConfig2 = new SSLHostConfig();
        sslHostConfig2.setHostName("erp.xxx.xxx");
        SSLHostConfigCertificate sslHostConfigCertificate2 = new SSLHostConfigCertificate(sslHostConfig2, SSLHostConfigCertificate.Type.RSA);
        sslHostConfigCertificate2.setCertificateKeystoreFile(erpXxxXxxJksPath);
        sslHostConfigCertificate2.setCertificateKeystorePassword(erpXxxXxxJksPwd);
        sslHostConfigCertificate2.setCertificateKeystoreType("JKS");
        sslHostConfig2.addCertificate(sslHostConfigCertificate2);
        connector.addSslHostConfig(sslHostConfig2);

        //配置第四个域名ssl
        SSLHostConfig sslHostConfig3 = new SSLHostConfig();
        sslHostConfig3.setHostName("test.xxx.xxx");
        SSLHostConfigCertificate sslHostConfigCertificate3 = new SSLHostConfigCertificate(sslHostConfig3, SSLHostConfigCertificate.Type.RSA);
        sslHostConfigCertificate3.setCertificateKeystoreFile(testXxxXxxJksPath);
        sslHostConfigCertificate3.setCertificateKeystorePassword(testXxxXxxJksPwd);
        sslHostConfigCertificate3.setCertificateKeystoreType("JKS");
        sslHostConfig3.addCertificate(sslHostConfigCertificate3);
        connector.addSslHostConfig(sslHostConfig3);

        tomcat.addAdditionalTomcatConnectors(connector);
        return tomcat;
    }
}
```

　　以上便完成了对多个域名证书的绑定，在不方便生成泛域名证书的情况下，可使用此方法 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


