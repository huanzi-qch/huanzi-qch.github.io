
## 　　前言 <br/>

　　分布式环境下，服务直接相互调用，一个复杂的业务可能要调用多个服务，例如A -> B -> C -> D，当某个服务出现异常（调用超时、调用失败等）将导致整个流程阻塞崩溃，严重的整个系统都会崩掉，为了实现高可用，必要的保护机制必不可少 <br/>

　　本文记录限流、熔断、降级的实现处理 <br/>



## 　　限流 <br/>

　　我们采用令牌桶限流法，并自己实现一个简单令牌桶限流 <br/>

　　有个任务线程以恒定速率向令牌桶添加令牌 <br/>

　　一个请求会消耗一个令牌，令牌桶里的令牌大于0，才会放行，反正不允许通过 <br/>

```
/**
 * 简单的令牌桶限流
 */
public class RateLimiter {

    /**
     * 桶的大小
     */
    private Integer limit;

    /**
     * 桶当前的token
     */
    private static Integer tokens = 0;

    /**
     * 构造参数
     */
    public RateLimiter(Integer limit, Integer speed){
        //初始化桶的大小，且桶一开始是满的
        this.limit = limit;
        tokens = this.limit;

        //任务线程：每秒新增speed个令牌
        new Thread(() ->{
            while (true){
                try {
                    Thread.sleep(1000L);

                    int newTokens = tokens + speed;
                    if(newTokens > limit){
                        tokens = limit;
                        System.out.println("令牌桶满了！！！");
                    }else{
                        tokens = newTokens;
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    /**
     * 根据令牌数判断是否允许执行，需要加锁
     */
    public synchronized boolean execute() {
        if (tokens > 0) {
            tokens = tokens - 1;
            return true;
        }
        return false;
    }
}
```

　　main简单测试 <br/>

```
    public static void main(String[] args) {
        //令牌桶限流：峰值每秒可以处理10个请求，正常每秒可以处理3个请求
        RateLimiter rateLimiter = new RateLimiter(10, 3);

        //模拟请求
        while (true){
            //在控制台输入一个值按回车，相对于发起一次请求
            Scanner scanner = new Scanner(System.in);
            scanner.next();

            //令牌桶返回true或者false
            if(rateLimiter.execute()){
                System.out.println("允许访问");
            }else{
                System.err.println("禁止访问");
            }
        }
    }
```

![](https://huanzi-qch.github.io/file-server/blog-image/201906/1353055-20190619172647484-1924740585.gif)  <br/>

　　在SpringCloud分布式下实现限流，需要把令牌桶的维护放到一个公共的地方，比如Zuul路由，当然也可以同时针对具体的每个服务进行单独限流 <br/>

　　另外，guava里有现成的基于令牌桶的限流实现，引入 <br/>

```
        <dependency>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
            <version>26.0-jre</version>
        </dependency>
```

　　具体用法这里就不阐述了 <br/>



　　我们找出之前的springcloud项目，在zuul-server中的AccessFilter过滤器进行限流，其他的都不变，只需要做如下修改 <br/>

　　PS：我这里为了方便测试，调小了令牌桶的大小，跟速率，正常情况下要服务器的承受能力来定 <br/>

```
/**
 * Zuul过滤器，实现了路由检查
 */
public class AccessFilter extends ZuulFilter {
    //令牌桶限流：峰值每秒可以处理10个请求，正常每秒可以处理3个请求    //PS：我这里为了方便测试，调小了令牌桶的大小，跟速率，正常情况下按服务器的承受能力来定
    private RateLimiter rateLimiter = new RateLimiter(2, 1);

    //业务不变，省略其他代码...

    /**
     * 过滤器的具体逻辑
     */
    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        HttpServletResponse response = ctx.getResponse();

        //限流
        if(!rateLimiter.execute()){
            try {
                ctx.setSendZuulResponse(false);
                ctx.setResponseStatusCode(200);

                //直接写入浏览器
                response.setContentType("text/html;charset=UTF-8");
                PrintWriter writer = response.getWriter();
                writer.println("系统繁忙，请稍后在试！<br/>System busy, please try again later!");
                writer.flush();return null;
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

      //业务不变，省略其他代码..
   }
}
```

　　按照我们设置的值，一秒能处理一个请求，峰值一秒能处理两个请求，下面疯狂刷新进行测试 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201906/1353055-20190619173518415-1711267696.gif)  <br/>



## 　　熔断 <br/>

　　yml配置开启Hystrix熔断功能，进行容错处理 <br/>

```
feign:
  hystrix:
    enabled: true
```

　　设置Hystrix的time-out时间 <br/>

```
hystrix:
  command:
    default:
      execution:
        isolation:
          thread:
            timeoutInMilliseconds: 5000 #毫秒
      #或者设置从不超时
      #timeout:
      #  enabled: false
```

　　在使用Feign调用服务提供者时配置@FeignClient的 fallback，进行容错处理（服务提供者发生异常），如果需要获取到异常信息，则要配置fallbackFactory<T> <br/>

```
@FeignClient(name = "sso-server", path = "/",/*fallback = SsoFeign.SsoFeignFallback.class,*/fallbackFactory = SsoFeign.SsoFeignFallbackFactory.class)
```



```
    /**
     * 容错处理（服务提供者发生异常，将会进入这里）
     */
    @Component
    public class SsoFeignFallback implements SsoFeign {

        @Override
        public Boolean hasKey(String key) {
            System.out.println("调用sso-server失败，进行SsoFeignFallback.hasKey处理：return false;");
            return false;
        }
    }
```



```
    /**
     * 只打印异常，容错处理仍交给 SsoFeignFallback
     */
    @Component
    public class SsoFeignFallbackFactory implements FallbackFactory<SsoFeign> {
        private final SsoFeignFallback ssoFeignFallback;

        public SsoFeignFallbackFactory(SsoFeignFallback ssoFeignFallback) {
            this.ssoFeignFallback = ssoFeignFallback;
        }

        @Override
        public SsoFeign create(Throwable cause) {
            cause.printStackTrace();
            return ssoFeignFallback;
        }
    }
```



　　FallbackFactory也可以这样写 <br/>

```
    /**
     * 容错处理
     */     @Component     public class SsoFeignFallbackFactory implements FallbackFactory<SsoFeign> {

        @Override
        public SsoFeign create(Throwable cause) {
            //打印异常
            cause.printStackTrace();

            return new SsoFeign() {
                @Override
                public Boolean hasKey(String key) {
                    System.out.println("调用sso-server失败：return false;");
                    return false;
                }
            };
        }
    }
```



　　因为我们没有启动Redis，报错，但我们进行容错处理，所以还是返回了false <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201906/1353055-20190619180840034-1612756355.png)  <br/>





## 　　降级 <br/>

 　　当调用服务发送异常，容错处理的方式有多种，我们可以： <br/>

　　1、重连，比如服务进行了限流，本次连接被限制，重连一次或N次就可以得到数据 <br/>

　　2、直接返回一个友好提示 <br/>

　　3、降级调用备用服务、返回缓存的数据等 <br/>



## 　　后记 <br/>

　　降级也可以叫做“备胎计划”... <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springCloud](https://github.com/huanzi-qch/springCloud) <br/>

　　码云：[https://gitee.com/huanzi-qch/springCloud](https://gitee.com/huanzi-qch/springCloud) <br/>


