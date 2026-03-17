
## 　　前言 <br/>

　　出于安全原因，浏览器禁止ajax调用当前源之外的资源（同源策略），我们之前也有写个几种跨域的简单实现（[还在问跨域？本文记录js跨域的多种实现实例](https://www.cnblogs.com/huanzi-qch/p/10497396.html)），本文主要详细介绍CORS，跨源资源共享，以及如何在SpringBoot的几种实现方式 <br/>

　　这里主要参考spring的这篇：[https://docs.spring.io/spring/docs/5.1.8.RELEASE/spring-framework-reference/web.html#mvc-cors](https://docs.spring.io/spring/docs/5.1.8.RELEASE/spring-framework-reference/web.html#mvc-cors) <br/>

　　以及：[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS) <br/>

## 　　CORS介绍 <br/>

　　跨源资源共享(Cross-Origin Resource Sharing, CORS)是由大多数浏览器实现的W3C规范，它允许指定授权了哪种跨域请求，而不是使用基于IFRAME（内嵌框架）或JSONP的不太安全且功能不太强大的方法。　　 <br/>

　　CORS分为简单请求、非简单请求两种跨域请求方式，Spring MVC HandlerMapping的实现提供了对CORS的内置支持。成功地将请求映射到处理程序之后，HandlerMapping的实现将检查CORS配置并不同的请求进行操作：预检请求直接处理，而简单请求和非简单请求被拦截、验证，并设置了所需的CORS响应头。为了启用跨源请求，您需要一些显式声明的CORS配置。如果没有找到匹配的CORS配置，预检请求将被拒绝。没有将CORS标头添加到简单、非简单CORS请求的响应中，浏览器会拒绝这个跨域请求。 <br/>

　　简单请求不会触发预检请求，而非简单请求在发起之前会先发起预检请求，以获知服务器是否允许该实际请求，"预检请求“的使用，可以避免跨域请求对服务器的用户数据产生未预期的影响。 <br/>



　　跨域响应字段含义：[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#HTTP_%E5%93%8D%E5%BA%94%E9%A6%96%E9%83%A8%E5%AD%97%E6%AE%B5](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#HTTP_%E5%93%8D%E5%BA%94%E9%A6%96%E9%83%A8%E5%AD%97%E6%AE%B5) <br/>

　　跨域请求字段含义：[https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#HTTP_%E8%AF%B7%E6%B1%82%E9%A6%96%E9%83%A8%E5%AD%97%E6%AE%B5](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS#HTTP_%E8%AF%B7%E6%B1%82%E9%A6%96%E9%83%A8%E5%AD%97%E6%AE%B5) <br/>



### 　　简单请求 <br/>

　　若请求满足所有下述条件，则该请求可视为“简单请求”： <br/>

使用下列方法之一：
GET
HEAD
POST
Fetch 规范定义了对 CORS 安全的首部字段集合，不得人为设置该集合之外的其他首部字段。该集合为：
Accept
Accept-Language
Content-Language
Content-Type （需要注意额外的限制）
DPR
Downlink
Save-Data
Viewport-Width
Width
Content-Type 的值仅限于下列三者之一：
text/plain
multipart/form-data
application/x-www-form-urlencoded
请求中的任意XMLHttpRequestUpload 对象均没有注册任何事件监听器；XMLHttpRequestUpload 对象可以使用 XMLHttpRequest.upload 属性访问。
请求中没有使用 ReadableStream 对象。 <br/>

 　　例如： <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190711170423684-1762462058.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190711170523807-937357555.png)  <br/>



### 　　非简单请求 <br/>

　　当请求满足下述任一条件时，即视为非简单请求，应首先发送预检请求： <br/>

使用了下面任一 HTTP 方法：
PUT
DELETE
CONNECT
OPTIONS
TRACE
PATCH
人为设置了对 CORS 安全的首部字段集合之外的其他首部字段。该集合为：
Accept
Accept-Language
Content-Language
Content-Type (需要注意额外的限制)
DPR
Downlink
Save-Data
Viewport-Width
Width
 Content-Type 的值不属于下列之一:
application/x-www-form-urlencoded
multipart/form-data
text/plain
请求中的XMLHttpRequestUpload 对象注册了任意多个事件监听器。
请求中使用了ReadableStream对象。 <br/>

　　例如：　　 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190711171150600-1106214232.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190711171228836-2048373928.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190711171310387-1132485847.png)  <br/>





　　PS：如果ajax的contentType:"application/json;charset=UTF-8"，设置成了json格式传输，那么你的data就要这样传JSON.stringify({id:1})，并且后端接参要加上@RequestBody，用对象去接MVC会帮我们自动注入参数，用字符串去接，会得到json字符串 <br/>



　　<span class="highlight-span">  　　附带身份凭证的请求</span> <br/>

　　CORS 的一个有趣的特性是，可以基于  HTTP cookies 和 HTTP 认证信息发送身份凭证。一般而言，对于跨域 XMLHttpRequest请求，浏览器不会发送身份凭证信息。如果要发送凭证信息，需要设置 XMLHttpRequest的某个特殊标志位 withCredentials=true，就可以向服务器发送Cookies，但是，如果服务器端的响应中未携带 Access-Control-Allow-Credentials: true，浏览器将不会把响应内容返回给请求的发送者。 <br/>

　　如果前端设置了true，后端为false，则会 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190711163335495-2008540721.png)  <br/>



## 　　实现方式 <br/>

　　PS：不管是哪种方法，一定要看仔细前端的请求头中Origins的值到底是什么，前端的值与后端配置的值对应不上则无法跨域，比如前端是http://localhost:8080，而后端配置成IP，则无法跨域 <br/>



###  　　@CrossOrigin <br/>

 　　TestController接口测试 <br/>

```
package cn.huanzi.qch.springbootcors.controller;

import org.springframework.web.bind.annotation.*;

@RequestMapping("cors/")
@RestController
public class TestController {
    /*
       通过注解配置CORS跨域测试
       $.ajax({
           type:"POST",
           url:"http://localhost:10095/cors/corsByAnnotation",
           data:{id:1},
           dataType:"text",//因为我们响应的是不是json，这里要改一下
           contentType:"application/x-www-form-urlencoded",
           //contentType:"application/json;charset=UTF-8",//如果用这个，则为非简单请求
           xhrFields:{ withCredentials:true },
           success:function(data){
               console.log(data);
           },
           error:function(data){
                console.log("报错啦");
           }
       })
    */
    @CrossOrigin(
            origins = "https://www.cnblogs.com",
            allowedHeaders = "*",
            methods = {RequestMethod.POST},
            allowCredentials = "true",
            maxAge = 3600
    )
    @PostMapping("corsByAnnotation")
    public String corsByAnnotation(String id) {
        return "corsByAnnotation，" + id;
    }
}
```

 　　如果@CrossOrigin注解在controller类上面声明，则整个controller类的接口都可以跨域调用 <br/>



### 　　配置Config <br/>

 　　Java Configuration <br/>

　　<span>  　　MyConfiguration配置类</span> <br/>

```
package cn.huanzi.qch.springbootcors.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MyConfiguration {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/cors/corsByConfig")
                        .allowedOrigins("https://www.cnblogs.com")
                        .allowedMethods("POST")
                        .allowedHeaders("*")
                        .allowCredentials(true).maxAge(3600);
            }
        };
    }
}
```

　　<span style="color: rgba(255, 0, 0, 1)">  　　2020-11-06更新</span> <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  所有方法</span> <br/>

```
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(true).maxAge(3600);
            }
        };
    }
```



　　TestController接口测试 <br/>

```
package cn.huanzi.qch.springbootcors.controller;

import org.springframework.web.bind.annotation.*;

@RequestMapping("cors/")
@RestController
public class TestController {
    /*
       通过Config配置CORS跨域测试
       $.ajax({
           type:"POST",
           url:"http://localhost:10095/cors/corsByConfig",
           data:{id:2},
           dataType:"text",//因为我们响应的是不是json，这里要改一下
           contentType:"application/x-www-form-urlencoded",
           //contentType:"application/json;charset=UTF-8",//如果用这个，则为非简单请求
           xhrFields:{ withCredentials:true },
           success:function(data){
               console.log(data);
           },
           error:function(data){
                console.log("报错啦");
           }
       })
    */
    @PostMapping("corsByConfig")
    public String corsByConfig(String id) {
        return "corsByConfig，" + id;
    }
}
```

 　　XML Configuration <br/>

　　xml格式我就不试了，大家看文档就好了：[https://docs.spring.io/spring/docs/5.1.8.RELEASE/spring-framework-reference/web.html#mvc-cors-global-xml](https://docs.spring.io/spring/docs/5.1.8.RELEASE/spring-framework-reference/web.html#mvc-cors-global-xml) <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190711172008533-1980235546.png)  <br/>



### 　　CORS Filter <br/>

　　配置拦截器在启动项目的时候会报一个bean已存在，叫我们改名或启用覆盖默认bean <br/>

```
Description:

The bean 'myCorsFilter', defined in null, could not be registered. A bean with that name has already been defined in file [C:\Users\Administrator\Desktop\杂七杂八\springBoot\springboot-cors\target\classes\cn\huanzi\qch\springbootcors\filter\MyCorsFilter.class] and overriding is disabled.

Action:

Consider renaming one of the beans or enabling overriding by setting spring.main.allow-bean-definition-overriding=true
```

　　配置覆盖 <br/>

```
#启用覆盖默认bean
spring.main.allow-bean-definition-overriding=true
```



　　MyCorsFilter <br/>

```
package cn.huanzi.qch.springbootcors.filter;

import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@ServletComponentScan
@WebFilter(filterName = "myCorsFilter", //过滤器名称
        urlPatterns = "/cors/corsByMyCorsFilter",//url路径
        initParams = {
                @WebInitParam(name = "allowOrigin", value = "https://www.cnblogs.com"),//允许的请求源，可用,分隔，*表示所有
                @WebInitParam(name = "allowMethods", value = "POST"),//允许的请求方法，可用,分隔，*表示所有
                @WebInitParam(name = "allowCredentials", value = "true"),
                @WebInitParam(name = "allowHeaders", value = "*"),
                @WebInitParam(name = "maxAge", value = "3600"),//60秒 * 60，相当于一个小时
        })
public class MyCorsFilter implements Filter {

    private String allowOrigin;
    private String allowMethods;
    private String allowCredentials;
    private String allowHeaders;
    private String maxAge;

    @Override
    public void init(FilterConfig filterConfig) {
        //读取@WebFilter的initParams
        allowOrigin = filterConfig.getInitParameter("allowOrigin");
        allowMethods = filterConfig.getInitParameter("allowMethods");
        allowCredentials = filterConfig.getInitParameter("allowCredentials");
        allowHeaders = filterConfig.getInitParameter("allowHeaders");
        maxAge = filterConfig.getInitParameter("maxAge");
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        if (!StringUtils.isEmpty(allowOrigin)) {
            if (allowOrigin.equals("*")) {
                response.setHeader("Access-Control-Allow-Origin", allowOrigin);
            } else {
                List<String> allowOriginList = Arrays.asList(allowOrigin.split(","));
                if (allowOriginList.size() > 0) {
                    //如果来源在允许来源内
                    String currentOrigin = request.getHeader("Origin");
                    if (allowOriginList.contains(currentOrigin)) {
                        response.setHeader("Access-Control-Allow-Origin", currentOrigin);
                    }
                }
            }
        }
        if (!StringUtils.isEmpty(allowMethods)) {
            response.setHeader("Access-Control-Allow-Methods", allowMethods);
        }
        if (!StringUtils.isEmpty(allowCredentials)) {
            response.setHeader("Access-Control-Allow-Credentials", allowCredentials);
        }
        if (!StringUtils.isEmpty(allowHeaders)) {
            response.setHeader("Access-Control-Allow-Headers", allowHeaders);
        }
        if (!StringUtils.isEmpty(maxAge)) {
            response.setHeader("Access-Control-Max-Age", maxAge);
        }

        //执行
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
```

　　TestController接口测试 <br/>

```
package cn.huanzi.qch.springbootcors.controller;

import org.springframework.web.bind.annotation.*;

@RequestMapping("cors/")
@RestController
public class TestController {/*
       通过拦截器配置CORS跨域测试
       $.ajax({
           type:"POST",
           url:"http://localhost:10095/cors/corsByMyCorsFilter",
           data:{id:3},
           dataType:"text",//因为我们响应的是不是json，这里要改一下
           contentType:"application/x-www-form-urlencoded",
           //contentType:"application/json;charset=UTF-8",//如果用这个，则为非简单请求
           xhrFields:{ withCredentials:true },
           success:function(data){
               console.log(data);
           },
           error:function(data){
                console.log("报错啦");
           }
        })
    */
    @PostMapping("corsByMyCorsFilter")
    public String corsByMyCorsFilter(String id) {
        return "corsByMyCorsFilter，" + id;
    }
}
```



## 　　测试 <br/>

　　打开博客园，F12打开控制台，开始测试 <br/>



　　注解 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190711172342258-1057202043.png)  <br/>



　　java配置 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190711172411710-981943080.png)  <br/>



　　corsFilter <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201907/1353055-20190711172437309-1902126132.png)  <br/>



## 　　后记 <br/>

　　暂时记录到这里  <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


