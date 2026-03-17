
## 　　前言 <br/>

　　前面我们已经实现了服务的注册与发现（请戳：[SpringCloud系列——Eureka 服务注册与发现](https://www.cnblogs.com/huanzi-qch/p/10131985.html)），并且在注册中心注册了一个服务myspringboot，本文记录多个服务之间使用Feign调用。 <br/>

　　Feign是一个声明性web服务客户端。它使编写web服务客户机变得更容易，本质上就是一个http，内部进行了封装而已。 <br/>

　　GitHub地址：[https://github.com/OpenFeign/feign](https://github.com/OpenFeign/feign) <br/>

　　官方文档：[https://cloud.spring.io/spring-cloud-static/spring-cloud-openfeign/2.1.0.RC2/single/spring-cloud-openfeign.html](https://cloud.spring.io/spring-cloud-static/spring-cloud-openfeign/2.1.0.RC2/single/spring-cloud-openfeign.html) <br/>



## 　　服务提供者 <br/>

　　提供者除了要在注册中心注册之外，不需要引入其他东西，注意一下几点即可： <br/>

　　1、经测试，默认情况下，feign只能通过@RequestBody传对象参数 <br/>

　　2、接参只能出现一个复杂对象，例：public Result<List<UserVo>> list(@RequestBody UserVo entityVo) { ... } <br/>

　　3、提供者如果又要向其他消费者提供服务，又要向浏览器提供服务，建议保持原先的Controller，新建一个专门给消费者的Controller <br/>



　　测试Controller接口 <br/>

```
@RestController
@RequestMapping("/user/")
public class UserController {

    @Autowired
    private UserService userService;
    @RequestMapping("list")
    public Result<List<UserVo>> list(@RequestBody UserVo entityVo) {
        return userService.list(entityVo);
    }

    @RequestMapping("get/{id}")
    public Result<UserVo> get(@PathVariable("id") Integer id) {
        return userService.get(id);
    }
}
```



## 　　服务消费者 <br/>

　　消费者maven引入jar <br/>

```
        <!-- feign -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
```



　　配置文件 <br/>

　　对日期的解析，消费者要跟提供者一致，不然会报json解析错误 <br/>

```
#超时时间
feign.httpclient.connection-timeout=30000

#mvc接收参数时对日期进行格式化
spring.mvc.date-format=yyyy-MM-dd HH:mm:ss
#jackson对响应回去的日期参数进行格式化
spring.jackson.date-format=yyyy-MM-dd HH:mm:ss
spring.jackson.time-zone=GMT+8
```



　　服务调用 <br/>

　　1、springdatejpa 应用名称，是服务提供者在eureka注册的名字，Feign会从注册中心获取实例 <br/>

　　2、如果不想启动eureka服务，直连本地开发：@FeignClient(name = "springdatejpa", path = "/user/",url = "http://localhost:10086")，或者无eureka，调用第三方服务，关闭eureka客户端　　　　　　（eureka.client.enabled=false）,url直接指定第三方服务地址，path指定路径，接口的方法指定接口 <br/>

　　3、如果使用@RequestMapping，最好指定调用方式 <br/>

　　4、消费者的返回值必须与提供者的返回值一致，参数对象也要一致 <br/>

　　5、2019-05-21补充：如需进行容错处理（服务提供者发生异常），则需要配置fallback，如果需要获取到报错信息，则要配置fallbackFactory<T>，例： <br/>

```
fallback = MyspringbootFeignFallback.class,fallbackFactory = MyspringbootFeignFallbackFactory.class
```

```
/**
 * 容错处理（服务提供者发生异常，将会进入这里）
 */
@Component
public class MyspringbootFeignFallback implements MyspringbootFeign {
    @Override
    public Result<UserVo> get(Integer id) {
        return Result.of(null,false,"糟糕，系统出现了点小状况，请稍后再试");
    }

    @Override
    public Result<List<UserVo>> list(UserVo entityVo) {
        return Result.of(null,false,"糟糕，系统出现了点小状况，请稍后再试");
    }
}
```

```
/**
 * 只打印异常，容错处理仍交给MyspringbootFeignFallback
 */
@Component
public class MyspringbootFeignFallbackFactory implements FallbackFactory<MyspringbootFeign> {
    private final MyspringbootFeignFallback myspringbootFeignFallback;

    public MyspringbootFeignFallbackFactory(MyspringbootFeignFallback myspringbootFeignFallback) {
        this.myspringbootFeignFallback = myspringbootFeignFallback;
    }

    @Override
    public MyspringbootFeign create(Throwable cause) {
        cause.printStackTrace();
        return myspringbootFeignFallback;
    }
}
```



　　Feign接口 <br/>

　　更多@FeignClient注解参数配置，请参阅官方文档 <br/>

```
@FeignClient(name = "springdatejpa", path = "/user/")
public interface MyspringbootFeign {

    @RequestMapping(value = "get/{id}")
    Result<UserVo> get(@PathVariable("id") Integer id);

    @RequestMapping(value = "list", method = RequestMethod.GET)
    Result<List<UserVo>> list(@RequestBody UserVo entityVo);
}
```

 　　Controller层 <br/>

```
    /**
     * feign调用
     */
    @GetMapping("feign/get/{id}")
    Result<UserVo> get(@PathVariable("id") Integer id){
        return myspringbootFeign.get(id);
    }


    /**
     * feign调用
     */
    @GetMapping("feign/list")
    Result<List<UserVo>> list(UserVo userVo){
        return myspringbootFeign.list(userVo);
    }
```

　　启动类 <br/>

　　启动类加入注解：@EnableFeignClients <br/>

```
@EnableEurekaClient
@EnableFeignClients
@SpringBootApplication
public class MyspringbootApplication{

    public static void main(String[] args) {
        SpringApplication.run(MyspringbootApplication.class, args);
    }

}
```



## 　　效果 <br/>

　　成功注册两个服务 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181217174438960-85592075.png)  <br/>



　　成功调用 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181218163750980-56676922.png)  <br/>



![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181218104611467-2135591967.png)  <br/>


## 　　报错记录 <br/>

　　1、启动时报了个SQL错误 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181218164020273-713670614.png)  <br/>

　　解决：配置文件连接数据时指定serverTimezone=GMT%2B8 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181218164249732-623176683.png)  <br/>



　　2、当我将之前搭好的一个springboot-springdata-jpa整合项目在eureka注册时出现了一个报错 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181218105848199-393952351.png)  <br/>

　　然后在网上查了下说是因为springboot版本问题（请戳：[http://www.cnblogs.com/hbbbs/articles/8444013.html](http://www.cnblogs.com/hbbbs/articles/8444013.html)），之前这个项目用的是2.0.1.RELEASE，现在要在eureka注册，pom引入了就出现了上面的报错 <br/>

```
        <!-- eureka-client -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>

        <!-- actuator -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
```

```
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>Greenwich.RC1</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    <repositories>
        <repository>
            <id>spring-milestones</id>
            <name>Spring Milestones</name>
            <url>https://repo.spring.io/milestone</url>
        </repository>
    </repositories>
```

　　解决：升级了springboot版本，2.1.0，项目正常启动 <br/>

```
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.0.RELEASE</version>
        <!--<version>2.0.1.RELEASE</version>-->
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
```



## 　　补充 <br/>

　　2019-10-17补充：Feign设置header请求头 <br/>

　　方法1，mapping的headers属性，单一设置 <br/>

```
@FeignClient(name = "svc", path = "/modules/user/", url = "${feign.url}")
public interface UserFeign extends BaseFeign<UserVo> {
    @PostMapping(value = "xxx",headers = {"Cookie", "JSESSIONID=xxx"})
     ResultModel<List<UserVo>> xxx(UserVo entity);
}
```



　　方法2，自定义FeignInterceptor，全局设置 <br/>

```
/**
 * feign请求设置header参数
 * 这里比如浏览器调用A服务，A服务Feign调用B服务，为了传递一致的sessionId
 */
@Component
public class FeignInterceptor implements RequestInterceptor{

    public void apply(RequestTemplate requestTemplate){
        String sessionId = RequestContextHolder.currentRequestAttributes().getSessionId();
        requestTemplate.header("Cookie", "JSESSIONID="+sessionId);
    }
} 
```

　　这样就可以设置cookie，传递token等自定义值 <br/>



　　常见场景1 <br/>

　　通常我们一个服务web层、svc层、dao层，但有时候也会将拆分成两个服务： <br/>

　　web服务提供静态资源、页面以及controller控制器控制跳转，数据通过java调用svc服务获取； <br/>

　　svc服务，进行操作数据库以及业务逻辑处理，同时提供接口给web服务调用； <br/>



　　特殊情况下我们想svc服务的接口也做登录校验，所有接口（除了登录请求接口）都有做登录校验判断，未登录的无权访问，这时候就需要做sessionId传递，将web服务的sessionId通过Feign调用时传递到svc服务 <br/>



　　web服务 <br/>

　　注：登录成功后用sessionId作为key，登录用户的id作为value，保存到redis缓存中 <br/>



　　登录拦截器 <br/>

```
/**
 * web登录拦截器
 */
@Component
public class LoginFilter implements Filter {

    @Autowired
    private StringRedisTemplate template;

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String requestURI = request.getRequestURI();

        //除了访问首页、登录页面、登录请求，其他的都要查看Redis缓存
        String sessionId = request.getSession().getId();
        String redis = template.opsForValue().get(sessionId);
        if (!
                //无需登录即可访问的接口
                (requestURI.contains("/index/") || requestURI.contains("/login/index") || requestURI.contains("/login/login")
                //静态资源
                || requestURI.contains(".js") || requestURI.contains(".css") || requestURI.contains(".json")
                || requestURI.contains(".ico")|| requestURI.contains(".png")|| requestURI.contains(".jpg"))
                && StringUtils.isEmpty(redis)) {//重定向登录页面
            response.sendRedirect("/login/index?url=" + requestURI);
        } else {
            //正常处理请求
            filterChain.doFilter(servletRequest, servletResponse);
        }
    }

    @Override
    public void destroy() {
    }
}
```



　　自定义FeignInterceptor <br/>

```
/**
 * feign请求设置header参数
 * 这里比如浏览器调用A服务，A服务Feign调用B服务，为了传递一致的sessionId
 */
@Component
public class FeignInterceptor implements RequestInterceptor{

    public void apply(RequestTemplate requestTemplate){
        String sessionId = RequestContextHolder.currentRequestAttributes().getSessionId();
        requestTemplate.header("Cookie", "JSESSIONID="+sessionId);
    }
}
```



　　svc服务 <br/>

```
/**
 * svc登录拦截器
 */
@Component
public class LoginFilter implements Filter {

    @Autowired
    private StringRedisTemplate template;

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String requestURI = request.getRequestURI();

        //service服务，查看Redis缓存，登录后才允许访问（除了checkByAccountNameAndPassword）
        String sessionId = request.getRequestedSessionId();
        if (!(requestURI.contains("/modules/user/checkByAccountNameAndPassword")) && StringUtils.isEmpty(template.opsForValue().get(sessionId))) {
            //提示无权访问
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json; charset=utf-8");
            PrintWriter out = response.getWriter();
            out.print("对不起，你无权访问！");
            out.flush();
            out.close();
        } else {
            //正常处理请求
            filterChain.doFilter(servletRequest, servletResponse);
        }
    }

    @Override
    public void destroy() {
    }
}
```



　　七天免登陆 <br/>

　　会话期的sessionId，关闭浏览器后就失效了，所以就会退出浏览器后就需要重新登陆，有些情况我们并不想这样，我们想实现七天免登陆，这时候就需要自定义token，并且存放在cookie <br/>

　　登陆拦截器 <br/>

```
/**
 * web登录拦截器
 */
@Component
public class LoginFilter implements Filter {
    /** 静态资源 为防止缓存，加上时间戳标志 */
    private static final String STATIC_TAIL = "_time_=";

    @Autowired
    private StringRedisTemplate template;

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String requestURI = request.getRequestURI();

        //无需登录即可访问的接口，登陆页面、登陆请求
        if(requestURI.contains("/login/index") || requestURI.contains("/login/login")){
            //正常处理请求
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        //静态资源
        if(requestURI.contains(".js") || requestURI.contains(".css") || requestURI.contains(".json")
                || requestURI.contains(".woff2") || requestURI.contains(".ttf")|| requestURI.contains(".ico")
                || requestURI.contains(".png")|| requestURI.contains(".jpg")|| requestURI.contains(".gif")){

            //检查是否有防缓存时间戳
            String queryStr = request.getQueryString();
            if(StringUtils.isEmpty(queryStr) || !queryStr.trim().contains(STATIC_TAIL)){
                response.sendRedirect(requestURI + "?" + STATIC_TAIL + System.currentTimeMillis());
                return;
            }

            //正常处理请求
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        //剩下的要检查redis缓存
        String token = null;
        for (Cookie cookie : request.getCookies()) {
            if("TOKEN".equals(cookie.getName())){
                token = cookie.getValue();
            }
        }
        String redis = template.opsForValue().get(token);
        if(StringUtils.isEmpty(redis)){
            //重定向登录页面
            response.sendRedirect("/login/index?url=" + requestURI);
            return;
        }

        //如果都不符合，正常处理请求
        filterChain.doFilter(servletRequest, servletResponse);

    }

    @Override
    public void destroy() {
    }
}
```



　　登陆成功，设置cookie <br/>

```
    public ResultModel<UserVo> login(UserVo userVo) {
        此处省略查询操作...if (true) {
            HttpServletResponse response = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getResponse();

            //设置Redis，有效时长：7天
            String uuid = UUID.randomUUID().toString();
            template.opsForValue().set(uuid, userVo.getAccountNo());
            template.expire(uuid, 7 * 60 * 60, TimeUnit.SECONDS);

            //设置cookie，有效时长：7天
            Cookie cookie = new Cookie("TOKEN", uuid);
            cookie.setPath("/");
            cookie.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(cookie);
            return ResultModel.of(userVo, true, "登录成功");
        }
        return ResultModel.of(null, false, "用户名或密码错误");
    }
```



　　推出登陆，销毁cookie <br/>

```
    public ResultModel<UserVo> logout() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        HttpServletResponse response = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getResponse();
        String token = "";
        for (Cookie cookie : request.getCookies()) {
            if("TOKEN".equals(cookie.getName())){
                token = cookie.getValue();
                cookie.setValue(null);
                cookie.setPath("/");
                cookie.setMaxAge(0);// 立即销毁cookie
                response.addCookie(cookie);
                break;
            }
        }
        template.delete(token);
        return ResultModel.of(null, true, "操作成功！");
    }
```



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springCloud](https://github.com/huanzi-qch/springCloud) <br/>

　　码云：[https://gitee.com/huanzi-qch/springCloud](https://gitee.com/huanzi-qch/springCloud) <br/>


