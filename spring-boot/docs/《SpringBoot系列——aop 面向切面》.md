
## 　　前言 <br/>

　　项目中我们经常会用到aop切面，比如日志记录；这里简单记录一下springboot是如何使用aop <br/>

 　　spring对aop的配置，来自springboot参考手册，Common application properties：[https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#common-application-properties](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#common-application-properties) <br/>

```
# AOP
spring.aop.auto=true # Add @EnableAspectJAutoProxy.
spring.aop.proxy-target-class=true # Whether subclass-based (CGLIB) proxies are to be created (true), as opposed to standard Java interface-based proxies (false).
```



## 　　maven引包 <br/>

```
        <!--aop 面向切面-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>
        <!--slf4j-log4j12 日志管理-->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
        </dependency>
```


## 　　Aspect 切面 <br/>

```
/**
 * Aspect 切面
 * 日志切面
 */
@Aspect
@Component
public class LogAspect {

    /**
     * slf4j日志
     */
    private final static Logger logger = LoggerFactory.getLogger(LogAspect.class);

    /**
     * Pointcut 切入点
     * 匹配cn.controller包下面的所有方法
     */
    @Pointcut("execution(public * cn.controller.*.*(..))")
    public void webLog(){}

    /**
     * 环绕通知
     */
    @Around(value = "webLog()")
    public Object arround(ProceedingJoinPoint pjp) {
        try {
            logger.info("1、Around：方法环绕开始.....");
            Object o =  pjp.proceed();
            logger.info("3、Around：方法环绕结束，结果是 :" + o);
            return o;
        } catch (Throwable e) {
            logger.error(pjp.getSignature() + " 出现异常： ", e);
            return Result.of(null, false, "出现异常：" + e.getMessage());
        }
    }

    /**
     * 方法执行前
     */
    @Before(value = "webLog()")
    public void before(JoinPoint joinPoint){
        logger.info("2、Before：方法执行开始...");
        // 接收到请求，记录请求内容
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        assert attributes != null;
        HttpServletRequest request = attributes.getRequest();
        // 记录下请求内容
        logger.info("URL : " + request.getRequestURL().toString());
        logger.info("HTTP_METHOD : " + request.getMethod());
        logger.info("IP : " + request.getRemoteAddr());
        logger.info("CLASS_METHOD : " + joinPoint.getSignature().getDeclaringTypeName() + "." + joinPoint.getSignature().getName());
        logger.info("ARGS : " + Arrays.toString(joinPoint.getArgs()));

    }

    /**
     * 方法执行结束，不管是抛出异常或者正常退出都会执行
     */
    @After(value = "webLog()")
    public void after(JoinPoint joinPoint){
        logger.info("4、After：方法最后执行.....");
    }

    /**
     * 方法执行结束，增强处理
     */
    @AfterReturning(returning = "ret", pointcut = "webLog()")
    public void doAfterReturning(Object ret){
        // 处理完请求，返回内容
        logger.info("5、AfterReturning：方法的返回值 : " + ret);
    }

    /**
     * 后置异常通知
     */
    @AfterThrowing(value = "webLog()")
    public void throwss(JoinPoint joinPoint){
        logger.error("AfterThrowing：方法异常时执行.....");
    }
}
```



##  　　效果 <br/>

　　访问获取所有用户接口 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181106170723663-1362762645.png)  <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


