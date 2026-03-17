
## 　　前言 <br/>

　　定时器是我们项目中经常会用到的，SpringBoot使用@Scheduled注解可以快速启用一个简单的定时器（详情请看我们之前的博客《[SpringBoot系列——定时器](https://www.cnblogs.com/huanzi-qch/p/9916079.html)》），然而这种方式的定时器缺乏灵活性，如果需要对定时器进行调整，需要重启项目才生效，本文记录SpringBoot如何灵活配置动态定时任务 <br/>



## 　　代码编写 <br/>

　　首先先建表，重要字段：唯一表id、Runnable任务类、Cron表达式，其他的都是一些额外补充字段 <br/>

```
DROP TABLE IF EXISTS `tb_task`;
CREATE TABLE `tb_task`  (
  `task_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '定时任务id',
  `task_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '定时任务名称',
  `task_desc` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '定时任务描述',
  `task_exp` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '定时任务Cron表达式',
  `task_status` int(1) NULL DEFAULT NULL COMMENT '定时任务状态，0停用 1启用',
  `task_class` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '定时任务的Runnable任务类完整路径',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`task_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '动态定时任务表' ROW_FORMAT = Compact;


INSERT INTO `tb_task` VALUES ('1', 'task1', '测试动态定时任务1', '0/5 * * * * ?', 0, 'cn.huanzi.qch.springboottimer.task.MyRunnable1', '2021-08-06 17:39:23', '2021-08-06 17:39:25');
INSERT INTO `tb_task` VALUES ('2', 'task2', '测试动态定时任务2', '0/5 * * * * ?', 0, 'cn.huanzi.qch.springboottimer.task.MyRunnable2', '2021-08-06 17:39:23', '2021-08-06 17:39:25');
```

　　项目引入jpa、数据库驱动，用于数据库操作 <br/>

```
        <!--添加springdata-jpa依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!--添加MySQL驱动依赖 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
```

 　　数据库相关配置文件 <br/>

```
spring:
    datasource: #数据库相关
      url: jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2B8&characterEncoding=utf-8
      username: root
      password: 123456
      driver-class-name: com.mysql.jdbc.Driver
    mvc:
      date-format: yyyy-MM-dd HH:mm:ss #mvc接收参数时对日期进行格式化

    jackson:
      date-format: yyyy-MM-dd HH:mm:ss #jackson对响应回去的日期参数进行格式化
      time-zone: GMT+8
    jpa:
      show-sql: true
```



　　entity实体与数据表映射，以及与之对应的repository <br/>

```
/**
 * 动态定时任务表
 * 重要属性：唯一表id、Runnable任务类、Cron表达式，
 * 其他的都是一些额外补充说明属性
 */
@Entity
@Table(name = "tb_task")
@Data
public class TbTask {
    @Id
    private String taskId;//定时任务id
    private String taskName;//定时任务名称
    private String taskDesc;//定时任务描述
    private String taskExp;//定时任务Cron表达式
    private Integer taskStatus;//定时任务状态，0停用 1启用
    private String taskClass;//定时任务的Runnable任务类完整路径
    private Date updateTime;//更新时间
    private Date createTime;//创建时间
}
```

```
/**
 * TbTask动态定时任务Repository
 */
@Repository
public interface TbTaskRepository extends JpaRepository<TbTask,String>, JpaSpecificationExecutor<TbTask> {
}
```



　　测试动态定时器的配置类，主要作用：初始化线程池任务调度、读取/更新数据库任务、启动/停止定时器等 <br/>

```
/**
 * 测试定时器2-动态定时器
 */
@Slf4j
@Component
public class TestScheduler2 {

    //数据库的任务
    public static ConcurrentHashMap<String, TbTask> tasks = new ConcurrentHashMap<>(10);

    //正在运行的任务
    public static ConcurrentHashMap<String,ScheduledFuture> runTasks = new ConcurrentHashMap<>(10);

    //线程池任务调度
    private ThreadPoolTaskScheduler threadPoolTaskScheduler = new ThreadPoolTaskScheduler();

    @Autowired
    private TbTaskRepository tbTaskRepository;

    /**
     * 初始化线程池任务调度
     */
    @Autowired
    public TestScheduler2(){
        this.threadPoolTaskScheduler.setPoolSize(10);
        this.threadPoolTaskScheduler.setThreadNamePrefix("task-thread-");
        this.threadPoolTaskScheduler.setWaitForTasksToCompleteOnShutdown(true);
        this.threadPoolTaskScheduler.initialize();
    }

    /**
     * 获取所有数据库里的定时任务
     */
    private void getAllTbTask(){
        //查询所有，并put到tasks
        TestScheduler2.tasks.clear();
        List<TbTask> list = tbTaskRepository.findAll();
        list.forEach((task)-> TestScheduler2.tasks.put(task.getTaskId(),task));
    }

    /**
     * 根据定时任务id，启动定时任务
     */
    void start(String taskId){
        try {
            //如果为空，重新获取
            if(TestScheduler2.tasks.size() <= 0){
                this.getAllTbTask();
            }
            TbTask tbTask = TestScheduler2.tasks.get(taskId);

            //获取并实例化Runnable任务类
            Class<?> clazz = Class.forName(tbTask.getTaskClass());
            Runnable runnable = (Runnable)clazz.newInstance();

            //Cron表达式
            CronTrigger cron = new CronTrigger(tbTask.getTaskExp());

            //执行，并put到runTasks
            TestScheduler2.runTasks.put(taskId, Objects.requireNonNull(this.threadPoolTaskScheduler.schedule(runnable, cron)));

            this.updateTaskStatus(taskId,1);

            log.info("{}，任务启动！",taskId);
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException e) {
            log.error("{}，任务启动失败...",taskId);
            e.printStackTrace();
        }

    }

    /**
     * 根据定时任务id，停止定时任务
     */
    void stop(String taskId){
        TestScheduler2.runTasks.get(taskId).cancel(true);

        TestScheduler2.runTasks.remove(taskId);

        this.updateTaskStatus(taskId,0);

        log.info("{}，任务停止...",taskId);
    }

    /**
     * 更新数据库动态定时任务状态
     */
    private void updateTaskStatus(String taskId,int status){
        TbTask task = tbTaskRepository.getOne(taskId);
        task.setTaskStatus(status);
        task.setUpdateTime(new Date());
        tbTaskRepository.save(task);
    }
}
```



　　接下来就是编写测试接口、测试Runnable类（3个Runnable类，这里就不贴那么多了，就贴个MyRunnable1） <br/>

```
/**
 * Runnable任务类1
 */
@Slf4j
public class MyRunnable1 implements Runnable {
    @Override
    public void run() {
        log.info("MyRunnable1  {}",new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
    }
}
```

　　Controller接口 <br/>

```
/**
 * 动态定时任务Controller测试
 */
@RestController
@RequestMapping("/tbTask/")
public class TbTaskController {

    @Autowired
    private TestScheduler2 testScheduler2;

    @Autowired
    private TbTaskRepository tbTaskRepository;

    /**
     * 启动一个动态定时任务
     * http://localhost:10085/tbTask/start/2
     */
    @RequestMapping("start/{taskId}")
    public String start(@PathVariable("taskId") String taskId){
        testScheduler2.start(taskId);
        return "操作成功";
    }

    /**
     * 停止一个动态定时任务
     * http://localhost:10085/tbTask/stop/2
     */
    @RequestMapping("stop/{taskId}")
    public String stop(@PathVariable("taskId") String taskId){
        testScheduler2.stop(taskId);
        return "操作成功";
    }

    /**
     * 更新一个动态定时任务
     * http://localhost:10085/tbTask/save?taskId=2&taskExp=0/2 * * * * ?&taskClass=cn.huanzi.qch.springboottimer.task.MyRunnable3
     */
    @RequestMapping("save")
    public String save(TbTask task) throws IllegalAccessException {
        //先更新表数据
        TbTask tbTask = tbTaskRepository.getOne(task.getTaskId());

        //null值忽略
        List<String> ignoreProperties = new ArrayList<>(7);

        //反射获取Class的属性（Field表示类中的成员变量）
        for (Field field : task.getClass().getDeclaredFields()) {
            //获取授权
            field.setAccessible(true);
            //属性名称
            String fieldName = field.getName();
            //属性的值
            Object fieldValue = field.get(task);

            //找出值为空的属性，我们复制的时候不进行赋值
            if(null == fieldValue){
                ignoreProperties.add(fieldName);
            }
        }

        //org.springframework.beans BeanUtils.copyProperties(A,B)：A中的值付给B
        BeanUtils.copyProperties(task, tbTask,ignoreProperties.toArray(new String[0]));
        tbTaskRepository.save(tbTask);
        TestScheduler2.tasks.clear();

        //停止旧任务
        testScheduler2.stop(tbTask.getTaskId());

        //重新启动
        testScheduler2.start(tbTask.getTaskId());
        return "操作成功";
    }
}
```



## 　　效果演示 <br/>

### 　　启动 <br/>

　　启动一个定时任务，http://localhost:10085/tbTask/start/2 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202108/1353055-20210809100532219-1137833276.gif)  <br/>

　　可以看到，id为2的定时任务已经被启动，corn表达式为5秒执行一次，runnable任务为MyRunnable2 <br/>



### 　　修改 <br/>

　　修改一个定时任务，http://localhost:10085/tbTask/save?taskId=2&taskExp=0/2 * * * * ?&taskClass=cn.huanzi.qch.springboottimer.task.MyRunnable3 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202108/1353055-20210809100701333-519311941.gif)  <br/>

　　调用修改后，数据库信息被修改，id为2的旧任务被停止重新启用新任务，corn表达式为2秒执行一次，runnable任务类为MyRunnable3 <br/>



### 　　停止 <br/>

　　停止一个定时任务，http://localhost:10085/tbTask/stop/2 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202108/1353055-20210809100729785-338782080.gif)  <br/>

　　id为2的定时任务被停止 <br/>



## 　　后记 <br/>

　　可以看到，配置动态定时任务后，可以方便、实时的对定时任务进行修改、调整，再也不用重启项目啦 <br/>

　　SpringBoot配置动态定时任务暂时先记录到这，后续再进行补充 <br/>



## 　　代码开源 <br/>



　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


