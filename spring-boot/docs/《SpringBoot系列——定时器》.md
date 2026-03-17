
## 　　前言 <br/>

　　定时器功能在项目里面往往会用到，比如定时发送邮件、定时释放数据库资源；这里记录一下springboot对定时器的支持的简单实例 <br/>

## 　　cron表达式 <br/>

　　开始之前要先介绍一下cron表达式，这里当一下百度百科搬运工： <br/>

　　Cron表达式是一个字符串，字符串以5或6个空格隔开，分为6或7个域，每一个域代表一个含义，Cron有如下两种语法格式： <br/>

　　Seconds Minutes Hours DayofMonth Month DayofWeek Year或 <br/>

　　Seconds Minutes Hours DayofMonth Month DayofWeek <br/>



　　每一个域可出现的字符如下： <br/>

　　Seconds　　可出现", - * /"四个字符，有效范围为0-59的整数 <br/>

　　Minutes　　可出现", - * /"四个字符，有效范围为0-59的整数 <br/>

　　Hours　　可出现", - * /"四个字符，有效范围为0-23的整数 <br/>

　　DayofMonth　　可出现", - * / ? L W C"八个字符，有效范围为0-31的整数 <br/>

　　Month　　可出现", - * /"四个字符，有效范围为1-12的整数或JAN-DEc <br/>

　　DayofWeek　　可出现", - * / ? L C #"八个字符，有效范围为1-7的整数或SUN-SAT两个范围。1表示星期天，2表示星期一， 依次类推 <br/>

　　Year　　可出现", - * /"四个字符，有效范围为1970-2099年 <br/>



　　每一个域都使用数字，但还可以出现如下特殊字符，它们的含义是： <br/>

　　(1)*　　表示匹配该域的任意值，假如在Minutes域使用*, 即表示每分钟都会触发事件。 <br/>

　　(2)?　　只能用在DayofMonth和DayofWeek两个域。它也匹配域的任意值，但实际不会。因为DayofMonth和DayofWeek会相互影响。例如想在每月的20日触发调度，不管20日到底是星期几，则只能使用如下写法： 13 13 15 20 * ?, 其中最后一位只能用？，而不能使用*，如果使用*表示不管星期几都会触发，实际上并不是这样。 <br/>

　　(3)-　　表示范围，例如在Minutes域使用5-20，表示从5分到20分钟每分钟触发一次 <br/>

　　(4)/　　表示起始时间开始触发，然后每隔固定时间触发一次，例如在Minutes域使用5/20,则意味着5分钟触发一次，而25，45等分别触发一次. <br/>

　　(5),　　表示列出枚举值值。例如：在Minutes域使用5,20，则意味着在5和20分每分钟触发一次。 <br/>

　　(6)L　　表示最后，只能出现在DayofWeek和DayofMonth域，如果在DayofWeek域使用5L,意味着在最后的一个星期四触发。 <br/>

　　(7)W　　表示有效工作日(周一到周五),只能出现在DayofMonth域，系统将在离指定日期的最近的有效工作日触发事件。例如：在 DayofMonth使用5W，如果5日是星期六，则将在最近的工作日：星期五，即4日触发。如果5日是星期天，则在6日(周一)触发；如果5日在星期一到星期五中的一天，则就在5日触发。另外一点，W的最近寻找不会跨过月份 <br/>

　　(8)LW　　这两个字符可以连用，表示在某个月最后一个工作日，即最后一个星期五。 <br/>

　　(9)#　　用于确定每个月第几个星期几，只能出现在DayofMonth域。例如在4#2，表示某月的第二个星期三。 <br/>



　　举几个例子: <br/>

　　"0 0 2 1 * ? * "　　表示在每月的1日的凌晨2点调度任务 <br/>

　　"0 15 10 ? * MON-FRI" 　　表示周一到周五每天上午10：15执行作业 <br/>

　　"0 15 10 ? 6L 2002-2006" 　　表示2002-2006年的每个月的最后一个星期五上午10:15执行作 <br/>

　　"0 0 10,14,16 * * ?" 　　每天上午10点，下午2点，4点 <br/>

　　"0 0/30 9-17 * * ?" 　　朝九晚五工作时间内每半小时 <br/>

　　"0 0 12 ? * WED" 　　表示每个星期三中午12点 <br/>

　　"0 0 12 * * ?" 　　每天中午12点触发 <br/>

　　"0 15 10 ? * *" 　　每天上午10:15触发 <br/>

　　"0 15 10 * * ?" 　　每天上午10:15触发 <br/>

　　"0 15 10 * * ? *" 　　每天上午10:15触发 <br/>

　　"0 15 10 * * ? 　　2005" 2005年的每天上午10:15触发 <br/>

　　"0 * 14 * * ?" 　　在每天下午2点到下午2:59期间的每1分钟触发 <br/>

　　"0 0/5 14 * * ?" 　　在每天下午2点到下午2:55期间的每5分钟触发 <br/>

　　"0 0/5 14,18 * * ?" 　　在每天下午2点到2:55期间和下午6点到6:55期间的每5分钟触发 <br/>

　　"0 0-5 14 * * ?" 　　在每天下午2点到下午2:05期间的每1分钟触发 <br/>

　　"0 10,44 14 ? 3 WED" 　　每年三月的星期三的下午2:10和2:44触发 <br/>

　　"0 15 10 ? * MON-FRI" 　　周一至周五的上午10:15触发 <br/>

　　"0 15 10 15 * ?"　　 每月15日上午10:15触发 <br/>

　　"0 15 10 L * ?" 　　每月最后一日的上午10:15触发 <br/>

　　"0 15 10 ? * 6L" 　　每月的最后一个星期五上午10:15触发 <br/>

　　"0 15 10 ? * 6L 2002-2005" 　　2002年至2005年的每月的最后一个星期五上午10:15触发 <br/>

　　"0 15 10 ? * 6#3" 　　每月的第三个星期五上午10:15触发 <br/>


　　0 0 * * * ?　　 每隔一个小时执行一次
　　0 0/10 * * * ?      每隔十分钟执行一次
　　0 * * * * ?     每隔一分钟执行一次 <br/>




　　上面的例子我没有测试过，如果要用大家最好自己先进行测试。 <br/>



## 　　SpringBoot的支持 <br/>

　　在启动类加注解： @EnableScheduling //允许支持定时器了 <br/>


```
/**
 * 启动主类，springboot的入口
 * springboot 默认扫描的类是在启动类的当前包和下级包
 */
@SpringBootApplication
@EnableScheduling //允许支持定时器了
public class SpringbootWebsocketSpringdataJpaApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootWebsocketSpringdataJpaApplication.class, args);
    }
}
```



　　编写定时器类 <br/>

```
/**
 * 测试定时器
 */
@Component
public class TestScheduler {

    @Scheduled(cron="0/30 * * * * ?")
    private void test(){
        System.err.println("这句话每30秒打印一次  "+ new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
    }
}
```




　　效果 <br/>



![](https://img2018.cnblogs.com/blog/1353055/201811/1353055-20181106162551924-1387367671.png)  <br/>



## 　　更新 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  2021-03-09更新</span> <br/>

　　当有多个方法使用@Scheduled注解时，就会创建多个定时任务到任务列表中，当其中一个任务没执行完时，其它任务在阻塞队列当中等待，因此，所有的任务都是按照顺序执行的 <br/>

```
/**
 * 测试定时器
 */
@Component
@Slf4j
public class TestScheduler {

    @Scheduled(cron = "0/1 * * * * ?")
    public void taskA() {
        log.info("taskA方法（这句话每1秒打印一次）"+ new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
    }

    @Scheduled(cron = "0/2 * * * * ?")
    public void taskB() {
        try {
            log.info("taskB方法（这句话每2秒打印一次）"+ new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

![](https://img2020.cnblogs.com/blog/1353055/202103/1353055-20210309095348825-438830636.png)  <br/>

 　　那么要如何实现定时器多线程去执行呢？ <br/>



　　<span style="color: rgba(255, 0, 0, 1)">  配置定时任务线程池</span> <br/>

```
/**
 * 定时器线程池配置
 */
@Configuration
public class ScheduleConfig implements SchedulingConfigurer {

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        taskRegistrar.setScheduler(getExecutor());
    }

    @Bean
    public Executor getExecutor(){
        return new ScheduledThreadPoolExecutor(5);
    }
}
```

![](https://img2020.cnblogs.com/blog/1353055/202103/1353055-20210309095844001-1670868177.png)  <br/>



 　　或者使用@Async优雅异步调用 <br/>

```
/**
 * 测试定时器
 */
@Component
@Slf4j
public class TestScheduler {

    @Async("asyncTaskExecutor")
    @Scheduled(cron = "0/1 * * * * ?")
    public void taskA() {
        log.info("taskA方法（这句话每1秒打印一次）"+ new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
    }

    @Async("asyncTaskExecutor")
    @Scheduled(cron = "0/2 * * * * ?")
    public void taskB() {
        try {
            log.info("taskB方法（这句话每2秒打印一次）"+ new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

![](https://img2020.cnblogs.com/blog/1353055/202103/1353055-20210309100730152-785135936.png)  <br/>








##  　　结束语 <br/>

 　　两三个注解就可以轻松实现定时器，很强很简单 <br/>




## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>



