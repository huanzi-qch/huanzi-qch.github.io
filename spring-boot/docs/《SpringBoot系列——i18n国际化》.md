
## 　　前言 <br/>

　　国际化是项目中不可或缺的功能，本文将实现springboot + thymeleaf的HTML页面、js代码、java代码国际化过程记录下来。 <br/>



## 　　代码编写 <br/>

　　工程结构 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181122115205742-413596179.png)  <br/>

　　每个文件里面的值（按工程结构循序从上往下） <br/>

```
##################默认值#############################
welcome=Welcome
```

```
##################英文#############################
welcome=Welcome
```

```
##################简体中文#############################
welcome=欢迎
```

```
##################簡體中文#############################
welcome=歡迎
```



　　yml配置文件 <br/>

```
#注意:在yml文件中添加value值时,value前面需要加一个空格
#2.0.0的配置切换为servlet.path而不是"-"
server:
  port: 10086 #端口号
  servlet:
    context-path: /springboot #访问根路径

spring:
    thymeleaf:
      cache: false  #关闭页面缓存
      prefix: classpath:/view/  #thymeleaf访问根路径
      mode: LEGACYHTML5

    messages:
      basename: static/i18n/messages #指定国际化文件路径
```



　　LocaleConfig.java， <br/>

```
@Configuration
@EnableAutoConfiguration
@ComponentScan
public class LocaleConfig extends WebMvcConfigurerAdapter {

    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver slr = new SessionLocaleResolver();
        // 默认语言
        slr.setDefaultLocale(Locale.US);
        return slr;
    }

    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor lci = new LocaleChangeInterceptor();
        // 参数名
        lci.setParamName("lang");
        return lci;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }

}
```



　　controller <br/>

　　单纯的跳转页面即可 <br/>

```
    @RequestMapping("/i18nTest")
    public ModelAndView i18nTest(){
        ModelAndView mv=new ModelAndView();
        mv.setViewName("i18nTest.html");
        return mv;
    }
```



　　<span style="color: rgba(255, 0, 0, 1)">  注意要用 #{} 来取值</span> <br/>

```
<!DOCTYPE html>
<!--解决idea thymeleaf 表达式模板报红波浪线-->
<!--suppress ALL -->
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title></title>
</head>
<body>
    <h3 th:text="#{welcome}"></h3>
    <a href="?lang=en_US">English(US)</a>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <a href="?lang=zh_CN">简体中文</a>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <a href="?lang=zh_TW">繁体中文</a>
</body>
</html>
```



　　js代码使用 <br/>

　　需要先引入jquery插件，自行百度下载或者使用webjar去拉取，可以封装成一个全局方法，用到时直接调用 <br/>

```
    <script th:src="@{/js/jquery-1.9.1.min.js}"></script>
    <script th:src="@{/js/jquery.i18n.properties.js}"></script>
```

```
<script th:inline="javascript">
    //项目路径
    ctx = [[${#request.getContextPath()}]];

    //初始化i18n插件
    try {
        $.i18n.properties({
            path: ctx + '/i18n/',
            name: 'messages',
            language: [[${#locale.language+'_'+#locale.country}]],
            mode: "both"
        });
    } catch (e) {
        console.error(e);
    }

    //初始化i18n方法
    function i18n(labelKey) {
        try {
            return $.i18n.prop(labelKey);
        } catch (e) {
            console.error(e);
            return labelKey;
        }
    }

    console.log(i18n("welcome"));
</script>
```



　　java代码使用 <br/>

　　先封装个工具类，直接静态调用 <br/>

```
@Component
public class I18nUtil {

    private static MessageSource messageSource;

    public I18nUtil(MessageSource messageSource) {
        I18nUtil.messageSource = messageSource;
    }

    /**
     * 获取单个国际化翻译值
     */
    public static String get(String msgKey) {
        try {
            return messageSource.getMessage(msgKey, null, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            return msgKey;
        }
    }
}
```

　　调用 <br/>

```
        System.out.println(I18nUtil.get("welcome"));
```



## 　　效果展示 <br/>

　　默认 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181122120908208-356777818.png)  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181122120932039-1093827669.png)  <br/>



　　英文 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181122120955964-307469292.png)  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181122121010935-1796870258.png)  <br/>



　　中文 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181122121032187-660620594.png)  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181122121042787-93161835.png)  <br/>



　　繁体 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181122121059461-1900973506.png)  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181122121113102-1418807228.png)  <br/>



##  　　结束语 <br/>

[](https://www.cnblogs.com/GoodHelper/p/6824492.html)　[](https://www.cnblogs.com/GoodHelper/p/6824492.html)　[](https://www.cnblogs.com/GoodHelper/p/6824492.html)文[](https://www.cnblogs.com/GoodHelper/p/6824492.html)章[](https://www.cnblogs.com/GoodHelper/p/6824492.html)部[](https://www.cnblogs.com/GoodHelper/p/6824492.html)分[](https://www.cnblogs.com/GoodHelper/p/6824492.html)参[](https://www.cnblogs.com/GoodHelper/p/6824492.html)考[](https://www.cnblogs.com/GoodHelper/p/6824492.html)：[](https://www.cnblogs.com/GoodHelper/p/6824492.html)玩[](https://www.cnblogs.com/GoodHelper/p/6824492.html)转[](https://www.cnblogs.com/GoodHelper/p/6824492.html)s[](https://www.cnblogs.com/GoodHelper/p/6824492.html)p[](https://www.cnblogs.com/GoodHelper/p/6824492.html)r[](https://www.cnblogs.com/GoodHelper/p/6824492.html)i[](https://www.cnblogs.com/GoodHelper/p/6824492.html)n[](https://www.cnblogs.com/GoodHelper/p/6824492.html)g[](https://www.cnblogs.com/GoodHelper/p/6824492.html) [](https://www.cnblogs.com/GoodHelper/p/6824492.html)b[](https://www.cnblogs.com/GoodHelper/p/6824492.html)o[](https://www.cnblogs.com/GoodHelper/p/6824492.html)o[](https://www.cnblogs.com/GoodHelper/p/6824492.html)t[](https://www.cnblogs.com/GoodHelper/p/6824492.html)—[](https://www.cnblogs.com/GoodHelper/p/6824492.html)—[](https://www.cnblogs.com/GoodHelper/p/6824492.html)国[](https://www.cnblogs.com/GoodHelper/p/6824492.html)际[](https://www.cnblogs.com/GoodHelper/p/6824492.html)化[](https://www.cnblogs.com/GoodHelper/p/6824492.html)：[](https://www.cnblogs.com/GoodHelper/p/6824492.html)h[](https://www.cnblogs.com/GoodHelper/p/6824492.html)t[](https://www.cnblogs.com/GoodHelper/p/6824492.html)t[](https://www.cnblogs.com/GoodHelper/p/6824492.html)p[](https://www.cnblogs.com/GoodHelper/p/6824492.html)s[](https://www.cnblogs.com/GoodHelper/p/6824492.html):[](https://www.cnblogs.com/GoodHelper/p/6824492.html)/[](https://www.cnblogs.com/GoodHelper/p/6824492.html)/[](https://www.cnblogs.com/GoodHelper/p/6824492.html)w[](https://www.cnblogs.com/GoodHelper/p/6824492.html)w[](https://www.cnblogs.com/GoodHelper/p/6824492.html)w[](https://www.cnblogs.com/GoodHelper/p/6824492.html).[](https://www.cnblogs.com/GoodHelper/p/6824492.html)c[](https://www.cnblogs.com/GoodHelper/p/6824492.html)n[](https://www.cnblogs.com/GoodHelper/p/6824492.html)b[](https://www.cnblogs.com/GoodHelper/p/6824492.html)l[](https://www.cnblogs.com/GoodHelper/p/6824492.html)o[](https://www.cnblogs.com/GoodHelper/p/6824492.html)g[](https://www.cnblogs.com/GoodHelper/p/6824492.html)s[](https://www.cnblogs.com/GoodHelper/p/6824492.html).[](https://www.cnblogs.com/GoodHelper/p/6824492.html)c[](https://www.cnblogs.com/GoodHelper/p/6824492.html)o[](https://www.cnblogs.com/GoodHelper/p/6824492.html)m[](https://www.cnblogs.com/GoodHelper/p/6824492.html)/[](https://www.cnblogs.com/GoodHelper/p/6824492.html)G[](https://www.cnblogs.com/GoodHelper/p/6824492.html)o[](https://www.cnblogs.com/GoodHelper/p/6824492.html)o[](https://www.cnblogs.com/GoodHelper/p/6824492.html)d[](https://www.cnblogs.com/GoodHelper/p/6824492.html)H[](https://www.cnblogs.com/GoodHelper/p/6824492.html)e[](https://www.cnblogs.com/GoodHelper/p/6824492.html)l[](https://www.cnblogs.com/GoodHelper/p/6824492.html)p[](https://www.cnblogs.com/GoodHelper/p/6824492.html)e[](https://www.cnblogs.com/GoodHelper/p/6824492.html)r[](https://www.cnblogs.com/GoodHelper/p/6824492.html)/[](https://www.cnblogs.com/GoodHelper/p/6824492.html)p[](https://www.cnblogs.com/GoodHelper/p/6824492.html)/[](https://www.cnblogs.com/GoodHelper/p/6824492.html)6[](https://www.cnblogs.com/GoodHelper/p/6824492.html)8[](https://www.cnblogs.com/GoodHelper/p/6824492.html)2[](https://www.cnblogs.com/GoodHelper/p/6824492.html)4[](https://www.cnblogs.com/GoodHelper/p/6824492.html)4[](https://www.cnblogs.com/GoodHelper/p/6824492.html)9[](https://www.cnblogs.com/GoodHelper/p/6824492.html)2[](https://www.cnblogs.com/GoodHelper/p/6824492.html).[](https://www.cnblogs.com/GoodHelper/p/6824492.html)h[](https://www.cnblogs.com/GoodHelper/p/6824492.html)t[](https://www.cnblogs.com/GoodHelper/p/6824492.html)m[](https://www.cnblogs.com/GoodHelper/p/6824492.html)l[](https://www.cnblogs.com/GoodHelper/p/6824492.html) <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


