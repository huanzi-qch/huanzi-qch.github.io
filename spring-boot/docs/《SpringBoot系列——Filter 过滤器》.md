
## 　　前言 <br/>

　　本文记录一下在SpringBoot项目中是如何使用Filter过滤器 <br/>



## 　　代码、测试 <br/>

　　Filter过滤器是servlet包下面的东西，因此我们不需要再额外引包 <br/>

### 　　方法一 <br/>

　　直接实现Filter接口，并使用@Component注解标注为组件自动注入bean <br/>

```
package cn.huanzi.qch.springbootfilter.filter;

import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class TestFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        System.out.println("TestFilter,"+request.getRequestURI());

        //执行
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
```

　　查看日志可以发现，SpringBoot已经帮我们注入了一个filter，拦截路径是/*，拦截所有，如果我们需要进一步拦截具体的则需要我们自己在代码里控制 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190724160708938-936726348.png)  <br/>





### 　　方法二 <br/>

　　实现Filter接口，用@WebFilter注解，指定拦截路径以及一些参数，同时需要在启动类使用@ServletComponentScan扫描带@WebFilter、@WebServlet、@WebListener并将帮我们注入bean <br/>

　　请看官网介绍：[https://docs.spring.io/spring-boot/docs/2.1.5.RELEASE/reference/htmlsingle/#boot-features-embedded-container-servlets-filters-listeners-scanning](https://docs.spring.io/spring-boot/docs/2.1.5.RELEASE/reference/htmlsingle/#boot-features-embedded-container-servlets-filters-listeners-scanning) <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190724161410617-105739235.png)  <br/>



```
package cn.huanzi.qch.springbootfilter.filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

//配置拦截路径
@WebFilter(filterName = "testFilter",urlPatterns = {"/test"})
public class TestFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        System.out.println("TestFilter,"+request.getRequestURI());

        //执行
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
```

```
package cn.huanzi.qch.springbootfilter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

//自动扫描与当前类的同包以及子包
@ServletComponentScan
@SpringBootApplication
public class SpringbootFilterApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootFilterApplication.class, args);
    }

}
```

 　　查看日志发现，以及帮我们注入了testFilter，拦截路径是/test <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190724161654961-357254305.png)  <br/>

　　只指定拦截路径，不设置filterName一样可以注入 <br/>

```
//配置拦截路径
@WebFilter({"/test"})
```

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190724162011592-100950614.png)  <br/>



### 　　方法三 <br/>

 　　当然了，我们也可以既使用@Component同时也使用@WebFilter <br/>

```
package cn.huanzi.qch.springbootfilter.filter;

import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


//配置拦截路径
@WebFilter(filterName = "testFilter",urlPatterns = {"/test"})
@Component
public class TestFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        System.out.println("TestFilter,"+request.getRequestURI());

        //执行
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
```

```
package cn.huanzi.qch.springbootfilter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.ServletComponentScan;

//自动扫描与当前类的同包以及子包
@ServletComponentScan
@SpringBootApplication
public class SpringbootFilterApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootFilterApplication.class, args);
    }

}
```

　　但是做会注入两个bean，如果你的@WebFilter没有指定filterName或者指定的名称与类名相同，由于注入两个相同名称的bean，程序启动报错，叫我们修改其中一个的名字，或者启用覆盖bean <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190724162834758-1834221605.png)  <br/>

　　这里建议如果你硬要采用第三种方法，最好启用覆盖，因为改名将会注入两个bean，处理逻辑一样但拦截路径不一样，这并不是我们想要的，例如： <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190724163237065-758155391.png)  <br/>

　　启用覆盖 <br/>

```
#启用覆盖同名bean
spring.main.allow-bean-definition-overriding=true
```

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190724163414928-2089008365.png)  <br/>

　　PS：这里额外说一点，如果我们采用第三种方法，@ServletComponentScan放在TestFilter类上@WebFilter也会被扫描到，不需要放在启动类，第二种方法如果也这样做就不行，估计是受到了@Component注解的影响 <br/>

```
//配置拦截路径
@WebFilter(filterName = "testFilter",urlPatterns = {"/test"})
@ServletComponentScan
@Component
public class TestFilter implements Filter
```





## 　　后记 <br/>

　　Filter过滤器暂时先记录到这，以后再进行补充 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


