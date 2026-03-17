
## 　　前言 <br/>

　　日常开发中，我们经常会碰到这样的业务场景：用户注册，注册成功后需要发送邮箱、短信提示用户，通常我们都是这样写： <br/>

```
    /**
     * 用户注册
     */
    @GetMapping("/userRegister")
    public String userRegister(UserVo userVo) {
        //校验参数

        //存库

        //发送邮件

        //发送短信
        
        //API返回结果
        return "操作成功！";
    }
```

　　可以发现，用户注册与信息推送强耦合，用户注册其实到存库成功，就已经算是完成了，后面的信息推送都是额外的操作，甚至信息推送失败报错，还会影响API接口的结果，如果在同一事务，报错信息不捕获，还会导致事务回滚，存库失败。 <br/>

　　官方文档相关介绍：https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-application-events-and-listeners <br/>



　　本文记录springboot使用@EventListener监听事件、ApplicationEventPublisher.publishEvent发布事件实现业务解耦。 <br/>



## 　　代码 <br/>

　　项目结构 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202105/1353055-20210521105013343-1344301506.png)  <br/>



　　默认情况下，事件的发布和监听操作是同步执行的，我们先配置一下async，优雅多线程异步任务，详情请戳：[SpringBoot系列——@Async优雅的异步调用](https://www.cnblogs.com/huanzi-qch/p/11231041.html) <br/>

　　启动类添加@EnableAsync注解 <br/>

```
/**
 * 异步任务线程池的配置
 */
@Configuration
public class AsyncConfig {

    private static final int MAX_POOL_SIZE = 50;

    private static final int CORE_POOL_SIZE = 20;

    @Bean("asyncTaskExecutor")
    public AsyncTaskExecutor asyncTaskExecutor() {
        ThreadPoolTaskExecutor asyncTaskExecutor = new ThreadPoolTaskExecutor();
        asyncTaskExecutor.setMaxPoolSize(MAX_POOL_SIZE);
        asyncTaskExecutor.setCorePoolSize(CORE_POOL_SIZE);
        asyncTaskExecutor.setThreadNamePrefix("async-task-");
        asyncTaskExecutor.initialize();
        return asyncTaskExecutor;
    }
}
```

　　多数情况下的业务操作都会涉及数据库事务，可以使用@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)注解开启事务监听，确保数据入库后再进行异步任务操作。 <br/>



###  　　定义事件源 <br/>

　　先定义两个事件源，继承ApplicationEvent <br/>

```
/**
 * 用户Vo
 */
@Data
public class UserVo {

    private Integer id;

    private String username;
}

/**
 * 用户事件源
 */
@Getter
@Setter
public class UserEventSource extends ApplicationEvent {
    private UserVo userVo;

    UserEventSource(UserVo userVo) {
        super(userVo);
        this.userVo = userVo;
    }
}
```

```
/**
 * 业务工单Vo
 */
@Data
public class WorkOrderVo {

    private Integer id;

    private String WorkOrderName;
}


/**
 * 业务工单事件源
 */
@Getter
@Setter
public class WorkOrderEventSource extends ApplicationEvent {
    private cn.huanzi.qch.springbooteventsandlisteners.pojo.WorkOrderVo WorkOrderVo;

    WorkOrderEventSource(WorkOrderVo WorkOrderVo) {
        super(WorkOrderVo);
        this.WorkOrderVo = WorkOrderVo;
    }
}
```



### 　　监听事件 <br/>

　　监听用户注册事件、监听业务工单发起事件 <br/>

```
/**
 * 事件监听
 */
@Slf4j
@Component
public class EventListenerList {

    /**
     * 用户注册事件监听
     */
    @Async("asyncTaskExecutor")
    @EventListener
    @Order(1)//一个事件多个事监听，在同步的情况下，使用@order值越小，执行顺序优先
    public void userRegisterListener(UserEventSource eventSourceEvent){
        log.info("用户注册事件监听1："+eventSourceEvent.getUserVo());

        //开展其他业务，例如发送邮件、短信等
    }
    /**
     * 用户注册事件监听
     */
    @Async("asyncTaskExecutor")
    @EventListener
    @Order(2)//一个事件多个事监听，在同步的情况下，使用@order值越小，执行顺序优先
    public void userRegisterListener2(UserEventSource eventSourceEvent){
        log.info("用户注册事件监听2："+eventSourceEvent.getUserVo());

        //开展其他业务，例如发送邮件、短信等
    }

    /**
     * 业务工单发起事件监听
     */
    @Async("asyncTaskExecutor")
    @EventListener
    public void workOrderStartListener(WorkOrderEventSource eventSourceEvent){
        log.info("业务工单发起事件："+eventSourceEvent.getWorkOrderVo());

        //开展其他业务，例如发送邮件、短信等
    }
}
```



### 　　发布事件 <br/>

　　创建一个controller，新增两个测试接口 <br/>

```
/**
 * 事件发布
 */
@Slf4j
@RestController
@RequestMapping("/eventPublish/")
public class EventPublish {

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    /**
     * 用户注册
     */
    @GetMapping("userRegister")
    public String userRegister(UserVo userVo) {
        log.info("用户注册!");

        //发布 用户注册事件
        applicationEventPublisher.publishEvent(new UserEventSource(userVo));

        return "操作成功！";
    }

    /**
     * 业务工单发起
     */
    @GetMapping("workOrderStart")
    public String workOrderStart(WorkOrderVo workOrderVo) {
        log.info("业务工单发起!");

        //发布 业务工单发起事件
        applicationEventPublisher.publishEvent(new WorkOrderEventSource(workOrderVo));

        return "操作成功！";
    }
}
```



## 　　效果 <br/>

### 　　用户注册 <br/>

　　http://localhost:10010/eventPublish/userRegister?id=1&username=张三 <br/>

　　API返回 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202105/1353055-20210521110457106-515671488.png)  <br/>



　　后台异步任务执行 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202105/1353055-20210521110533688-889789735.png)  <br/>



###  　　工单发起 <br/>

　　http://localhost:10010/eventPublish/workOrderStart?id=1&workOrderName=设备出入申请单 <br/>

　　API返回 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202105/1353055-20210521110732850-522246108.png)  <br/>



 　　后台异步任务执行 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202105/1353055-20210521110751049-66832589.png)  <br/>





## 　　后记 <br/>

　　springboot使用事件发布与监听就暂时记录到这，后续再进行补充。 <br/>



## 　　更新 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  2021-08-12更新</span> <br/>

　　有同学反馈说，都SpringBoot了，不需要继承ApplicationEvent，直接发布Vo就行，今天一试果然如此！ <br/>



　　监听 <br/>

　　直接监听Vo <br/>

```
/**
 * 事件监听
 */
@Slf4j
@Component
public class EventListenerList {

    /**
     * 用户注册事件监听
     */
    @Async("asyncTaskExecutor")
    @EventListener
    @Order(1)//一个事件多个事监听，同步的情况下，使用@order值越小，执行顺序优先
    public void userRegisterListener(UserVo userVo){
        log.info("用户注册事件监听1："+userVo);

        //开展其他业务，例如发送邮件、短信等
    }
    /**
     * 用户注册事件监听
     */
    @Async("asyncTaskExecutor")
    @EventListener
    @Order(2)//一个事件多个事监听，同步的情况下，使用@order值越小，执行顺序优先
    public void userRegisterListener2(UserVo userVo){
        log.info("用户注册事件监听2："+userVo);

        //开展其他业务，例如发送邮件、短信等
    }

    /**
     * 业务工单发起事件监听
     */
    @Async("asyncTaskExecutor")
    @EventListener
    public void workOrderStartListener(WorkOrderVo workOrderVo){
        log.info("业务工单发起事件："+workOrderVo);

        //开展其他业务，例如发送邮件、短信等
    }
}
```



　　发布 <br/>

　　直接发布Vo <br/>

```
/**
 * 事件发布
 */
@Slf4j
@RestController
@RequestMapping("/eventPublish/")
public class EventPublish {

    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    /**
     * 用户注册
     */
    @GetMapping("userRegister")
    public String userRegister(UserVo userVo) {
        log.info("用户注册!");

        //发布 用户注册事件
        applicationEventPublisher.publishEvent(userVo);

        return "操作成功！";
    }

    /**
     * 业务工单发起
     */
    @GetMapping("workOrderStart")
    public String workOrderStart(WorkOrderVo workOrderVo) {
        log.info("业务工单发起!");

        //发布 业务工单发起事件
        applicationEventPublisher.publishEvent(workOrderVo);

        return "操作成功！";
    }
}
```



　　效果 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202108/1353055-20210812113324761-1200685007.png)  <br/>







## 　　代码开源 <br/>



　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>




