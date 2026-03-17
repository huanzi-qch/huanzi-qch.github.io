
## 　　前言 <br/>

　　作为分布式项目，单点登录是必不可少的，文本基于之前的的博客（猛戳：[SpringCloud系列——Zuul 动态路由](https://www.cnblogs.com/huanzi-qch/p/10142395.html)，[SpringBoot系列——Redis](https://www.cnblogs.com/huanzi-qch/p/10239888.html)）记录Zuul配合Redis实现一个简单的sso单点登录实例 <br/>

　　sso单点登录思路： <br/>

　　1、访问分布式系统的任意请求，被Zuul的Filter拦截过滤 <br/>

　　2、在run方法里实现过滤规则：cookie有令牌accessToken且作为key存在于Redis，或者访问的是登录页面、登录请求则放行 <br/>

　　3、否则，将重定向到sso-server的登录页面且原先的请求路径作为一个参数；response.sendRedirect("http://localhost:10010/sso-server/sso/loginPage?url=" + url); <br/>

　　4、登录成功，sso-server生成accessToken，并作为key（用户名+时间戳，这里只是demo，正常项目的令牌应该要更为复杂）存到Redis，value值存用户id作为value（或者直接存储可暴露的部分用户信息也行）设置过期时间（我这里设置3分钟）；设置cookie：new Cookie("accessToken",accessToken);，设置maxAge(60*3);、path("/"); <br/>

　　5、sso-server单点登录服务负责校验用户信息、获取用户信息、操作Redis缓存，提供接口，在eureka上注册 <br/>



## 　　代码编写 <br/>

### 　　sso-server <br/>

　　首先我们创建一个单点登录服务sso-server，并在eureka上注册（创建项目请参考之前的SpringCloud系列博客跟 [SpringBoot系列——Redis](https://www.cnblogs.com/huanzi-qch/p/10239888.html)） <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190110111418596-1142289189.png)  <br/>

　　login.html <br/>

　　我们这里需要用到页面，要先maven引入thymeleaf <br/>

```
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
```

```
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>登录页面</title>
</head>
<body>
    <form action="/sso-server/sso/login" method="post">
        <input name="url" type="hidden" th:value="${url}"/>
        用户名：<input name="username" type="text"/>
        密码：<input name="password" type="password"/>
        <input value="登录" type="submit"/>
    </form>
</body>
</html>
```

　　提供如下接口 <br/>

```
@RestController
@EnableEurekaClient
@SpringBootApplication
public class SsoServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(SsoServerApplication.class, args);
    }

    @Autowired
    private StringRedisTemplate template;

    /**
     * 判断key是否存在
     */
    @RequestMapping("/redis/hasKey/{key}")
    public Boolean hasKey(@PathVariable("key") String key) {
        try {
            return template.hasKey(key);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 校验用户名密码，成功则返回通行令牌（这里写死huanzi/123456）
     */
    @RequestMapping("/sso/checkUsernameAndPassword")
    private String checkUsernameAndPassword(String username, String password) {
        //通行令牌
        String flag = null;
        if ("huanzi".equals(username) && "123456".equals(password)) {
            //用户名+时间戳（这里只是demo，正常项目的令牌应该要更为复杂）
            flag = username + System.currentTimeMillis();
            //令牌作为key，存用户id作为value（或者直接存储可暴露的部分用户信息也行）设置过期时间（我这里设置3分钟）
            template.opsForValue().set(flag, "1", (long) (3 * 60), TimeUnit.SECONDS);
        }
        return flag;
    }

    /**
     * 跳转登录页面
     */
    @RequestMapping("/sso/loginPage")
    private ModelAndView loginPage(String url) {
        ModelAndView modelAndView = new ModelAndView("login");
        modelAndView.addObject("url", url);
        return modelAndView;
    }

    /**
     * 页面登录
     */
    @RequestMapping("/sso/login")
    private String login(HttpServletResponse response, String username, String password, String url) {
        String check = checkUsernameAndPassword(username, password);
        if (!StringUtils.isEmpty(check)) {
            try {
                Cookie cookie = new Cookie("accessToken", check);
                cookie.setMaxAge(60 * 3);
                //设置域
//                cookie.setDomain("huanzi.cn");
                //设置访问路径
                cookie.setPath("/");
                response.addCookie(cookie);
                //重定向到原先访问的页面
                response.sendRedirect(url);
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }
        return "登录失败";
    }
}
```



### 　　zuul-server <br/>

　　引入feign，用于调用sso-server服务 <br/>

```
        <!-- feign -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
```

　　创建SsoFeign.java接口 <br/>

```
@FeignClient(name = "sso-server", path = "/")
public interface SsoFeign {
    /**
     * 判断key是否存在
     */
    @RequestMapping("redis/hasKey/{key}")
    public Boolean hasKey(@PathVariable("key") String key);

}
```

　　启动类加入@EnableFeignClients注解，否则启动会报错，无法注入SsoFeign对象 <br/>

```
@EnableZuulProxy
@EnableEurekaClient
@EnableFeignClients
@SpringBootApplication
public class ZuulServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZuulServerApplication.class, args);
    }

    @Bean
    public AccessFilter accessFilter() {
        return new AccessFilter();
    }
}
```

　　修改AccessFilter过滤逻辑，注入feign接口，用于调用sso-server检查Redis，修改run方法的过滤逻辑 <br/>

```
/**
 * Zuul过滤器，实现了路由检查
 */
public class AccessFilter extends ZuulFilter {

    @Autowired
    private SsoFeign ssoFeign;

    /**
     * 通过int值来定义过滤器的执行顺序
     */
    @Override
    public int filterOrder() {
        // PreDecoration之前运行
        return PRE_DECORATION_FILTER_ORDER - 1;
    }

    /**
     * 过滤器的类型，在zuul中定义了四种不同生命周期的过滤器类型：
     * public static final String ERROR_TYPE = "error";
     * public static final String POST_TYPE = "post";
     * public static final String PRE_TYPE = "pre";
     * public static final String ROUTE_TYPE = "route";
     */
    @Override
    public String filterType() {
        return PRE_TYPE;
    }

    /**
     * 过滤器的具体逻辑
     */
    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        HttpServletResponse response = ctx.getResponse();

        //访问路径
        String url = request.getRequestURL().toString();

        //从cookie里面取值（Zuul丢失Cookie的解决方案：https://blog.csdn.net/lindan1984/article/details/79308396）
        String accessToken = request.getParameter("accessToken");
        Cookie[] cookies = request.getCookies();
        if(null != cookies){
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                }
            }
        }
        //过滤规则：cookie有令牌且存在于Redis，或者访问的是登录页面、登录请求则放行
        if (url.contains("sso-server/sso/loginPage") || url.contains("sso-server/sso/login") || (!StringUtils.isEmpty(accessToken) && ssoFeign.hasKey(accessToken))) {
            ctx.setSendZuulResponse(true);
            ctx.setResponseStatusCode(200);
            return null;
        } else {
            ctx.setSendZuulResponse(false);
            ctx.setResponseStatusCode(401);
            //重定向到登录页面
            try {
                response.sendRedirect("http://localhost:10010/sso-server/sso/loginPage?url=" + url);
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }
    }

    /**
     * 返回一个boolean类型来判断该过滤器是否要执行
     */
    @Override
    public boolean shouldFilter() {
        return true;
    }
}
```

　　修改配置文件，映射sso-server代理路径，超时时间与丢失cookie的解决 <br/>

```
zuul.routes.sso-server.path=/sso-server/**
zuul.routes.sso-server.service-id=sso-server


zuul.host.socket-timeout-millis=60000
zuul.host.connect-timeout-millis=10000
#Zuul丢失Cookie的解决方案：https://blog.csdn.net/lindan1984/article/details/79308396
zuul.sensitive-headers=
```



## 　　测试效果 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  记得启动我们的RabbitMQ服务和Redis服务！</span> <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190110114826142-1122186552.png)  <br/>

　　刚开始，没有cookie且无Redis的情况下，浏览器访问 http://localhost:10010/myspringboot/feign/ribbon，被zuul-server拦截重定向到sso-server登录页面 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190110115042268-801569546.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190110115501878-1495911057.gif)  <br/>

　　开始登录校验，为了方便演示，我将密码的type改成text <br/>

　　登录失败，返回提示语 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190110120052977-1768462849.gif)  <br/>

　　登录成功，重定向到之前的请求 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190110120201029-1145102004.gif)  <br/>

 　　cookie的值，以及过期时间 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190110120315739-777209532.png)  <br/>

　　3分钟后我们再次访问 http://localhost:10010/myspringboot/feign/ribbon，cookie、Redis失效，需要从新登录 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190110120459318-1283913206.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190110120558640-1752946098.png)  <br/>





![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190110120443863-625026707.png)  <br/>

## 　　扩展 <br/>

　　我们还缺了重要的一种情况，那就是静态文件的处理，我们先把feign/ribbon接口改一下，并且新增ribbon.html文件 <br/>

```
    @RequestMapping("/ribbon")
    public ModelAndView ribbon() {
        return new ModelAndView("ribbon","text","springdatejpa -- 我的端口是：10086") ;
    }

    @RequestMapping("/ribbon")
    public ModelAndView ribbon() {
        return new ModelAndView("ribbon","text","springdatejpa -- 我的端口是：10088") ;
    }
```

```
<!DOCTYPE html>
<!--解决idea thymeleaf 表达式模板报红波浪线-->
<!--suppress ALL -->
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Ribbon测试</title>
</head>
<body>
    <h3 th:text="${text}"></h3>
</body>
<!-- 引入静态资源 -->
<script th:src="@{/js/jquery-1.9.1.min.js}" type="application/javascript"></script>
</html>
```



### 　　处理静态资源 <br/>

　　如果我们按照常规去引入项目的静态资源文件，thymeleaf的@{取到的值是http://localhost:10010/，因此会报404   注：这两个工程的静态文件目录如下： <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190115172043553-844650900.png)  <br/>

```
<!-- 引入静态资源 -->
<script th:src="@{/js/jquery-1.9.1.min.js}" type="application/javascript"></script>
```

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190115103152001-2108428256.png)  <br/>

　　本来想通过Zuul去转发请求，结果还是不行，上网一查发现有人说：zuul我们只用来做服务的转发，不用做页面的转发。页面中包含的静态资源没办法直接通过zuul获取对应的静态资源。 <br/>

```
<!-- 引入静态资源 -->
<script th:src="@{/myspringboot/js/jquery-1.9.1.min.js}" type="application/javascript"></script>
```

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190115105941741-42813343.png)  <br/>

 　　经过考虑，我这里采用读取当前页面文件所在的工程的静态文件，就不经过Zuul了，先在当前工程里声明好baseUrl，通过使用thymeleaf取国际化文件的方法，取到当前页面文件所在工程的baseUrl路径（需要先实现springboot国际化，具体配置请戳之前的博客：[SpringBoot系列——i18n国际化](https://www.cnblogs.com/huanzi-qch/p/10000324.html)），并且各自在自己工程的国际化文件新增： <br/>

```
baseUrl=http://localhost:10086
```

```
baseUrl=http://localhost:10088
```

　　ribbon.html做如下修改（两个工程都一样） <br/>

```
<!DOCTYPE html>
<!--解决idea thymeleaf 表达式模板报红波浪线-->
<!--suppress ALL -->
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Ribbon测试</title>
</head>
<body>
<h3 th:text="${text}"></h3>
<button onclick="getData()">获取后台数据</button>
<span id="spanTest"></span>
</body>
<!-- 引入静态资源 -->
<script th:src="#{baseUrl}+'/js/jquery-1.9.1.min.js'" type="application/javascript"></script>
<script th:inline="javascript">
    ctx = [[${#request.getContextPath()}]];//应用路径，这里取到的是Zuul的路径
    function getData() {
        $.post(ctx + "/myspringboot/feign/getData",null,function (data) {
           $("#spanTest").text(data);
        });
    }
</script>
</html>
```

 　　引入成功 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190115172318552-76863272.png)  <br/>



### 　　处理API接口  <br/>

 　　后台API接口是必须要走Zuul的，接上面的页面，我们有一个简单的测试按钮，请求getDataAPI接口 <br/>

　　我们先给实现了Ribbon负载均衡的springdatajpa（由两个工程组成）新增连个测试接口 <br/>

```
    @PostMapping("/getData")
    public String getData() {
        return "springdatejpa -- 我的端口是：10086" ;
    }
```

```
    @PostMapping("/getData")
    public String getData() {
        return "springdatejpa -- 我的端口是：10088" ;
    }
```

　　然后给myspringboot工程新增一个Feign接口、以及一个controller接口 <br/>

```
@FeignClient(name = "springdatejpa", path = "/user/")
public interface MyspringbootFeign {
    //此处省略之前的接口

    @PostMapping("/getData")
    String getData();
}
```

```
    /**
     * feign调用
     */
    @PostMapping("feign/getData")
    String getData(){
        return myspringbootFeign.getData();
    }
```

　　整体效果如下 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190115173320643-928296753.gif)  <br/>

　　如果accessToken失效了，这接口将无法访问，需要刷新重新登录 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190115173624368-1425452721.png)  <br/>



##  　　后记 <br/>

　　sso单点登录就记录到这里，这里只是实现了单机版的sso，以后在进行升级吧。 <br/>

　　问题报错：我们在sso-server设置cookie后，在zuul-server的run方法里获取不到设置的cookie，去浏览器查看，cookie没有设置成功，Zuul丢失Cookie <br/>

　　解决方案：Zuul丢失Cookie的解决方案：[https://blog.csdn.net/lindan1984/article/details/79308396](https://blog.csdn.net/lindan1984/article/details/79308396) <br/>



## 　　补充 <br/>

　　2019-06-25补充：不知道大家发现没有，我们之前在Zuul过滤器获取访问路径用的是String url = request.getRequestURL().toString()；，这样获取有一个问题，那就是如果url后面有参数（?username=aaa&password=123），这样获取就会丢失这些参数，先给大家演示一下 <br/>

　　访问：http://localhost:10010/sso-server/sso/redis/hasKey?username=aaa&pasword=123 <br/>

　　跳转登录页面，参数url已经丢失了原先的参数?username=aaa&password=123：http://localhost:10010/sso-server/sso/loginPage?url=http://localhost:10010/sso-server/sso/redis/hasKey <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201906/1353055-20190625105833360-1187341492.gif)  <br/>



　　因此我们需要在重定向之前对get请求的参数进行处理，run方法获取url后还需要设置参数，其他的请求则直接跳转首页或者固定页面即可 <br/>

```
    /**
     * 过滤器的具体逻辑
     */
    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        HttpServletResponse response = ctx.getResponse();

        //访问路径
        StringBuilder url = new StringBuilder(request.getRequestURL().toString());

        //从cookie里面取值（Zuul丢失Cookie的解决方案：https://blog.csdn.net/lindan1984/article/details/79308396）
        String accessToken = request.getParameter("accessToken");
        Cookie[] cookies = request.getCookies();
        if (null != cookies) {
            for (Cookie cookie : cookies) {
                if ("accessToken".equals(cookie.getName())) {
                    accessToken = cookie.getValue();
                }
            }
        }
        //过滤规则：
        //访问的是登录页面、登录请求则放行
        if (url.toString().contains("sso-server/sso/loginPage") ||
                url.toString().contains("sso-server/sso/login") ||
                //cookie有令牌且存在于Redis
                (!StringUtils.isEmpty(accessToken) && ssoFeign.hasKey(accessToken))
        ) {
            ctx.setSendZuulResponse(true);
            ctx.setResponseStatusCode(200);
            return null;
        } else {
            ctx.setSendZuulResponse(false);
            ctx.setResponseStatusCode(401);

            //如果是get请求处理参数，其他请求统统跳转到首页
            String method = request.getMethod();
            if("GET".equals(method)){
                url.append("?");
                Map<String, String[]> parameterMap = request.getParameterMap();
                Object[] keys = parameterMap.keySet().toArray();
                for (int i = 0; i < keys.length; i++) {
                    String key = (String) keys[i];
                    String value = parameterMap.get(key)[0];
                    url.append(key).append("=").append(value).append("&");
                }
                //处理末尾的&符合
                url.delete(url.length() -1,url.length());
            }else{
                //首页链接，或者其他固定页面
                url =  new StringBuilder("XXX");
            }

            //重定向到登录页面
            try {
                response.sendRedirect("http://localhost:10010/sso-server/sso/loginPage?url=" + url);
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }
    }
```



　　给大家看一下改动后的效果 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201906/1353055-20190625110735716-428509483.gif)  <br/>



　　如果是其他请求 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201906/1353055-20190625112027902-1199523674.gif)  <br/>

　　PS：其实这样响应处理一点都不友好，应该做如下约定：后端响应特定状态码（例如：301）时，同时会响应对应的url链接（例如系统首页链接），前端发起post、delete请求等需要进行判断，然后在js进行页面跳转，这样的话用户的体验会更好，系统更加健全 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springCloud](https://github.com/huanzi-qch/springCloud) <br/>

　　码云：[https://gitee.com/huanzi-qch/springCloud](https://gitee.com/huanzi-qch/springCloud) <br/>


