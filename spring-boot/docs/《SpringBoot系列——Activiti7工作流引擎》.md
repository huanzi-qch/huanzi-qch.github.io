
## 　　前言 <br/>

　　工作流程是我们日常开发项目中常见的功能，本文记录springboot整合activiti7。 <br/>



## 　　Activiti介绍 <br/>

　　官网：[https://www.activiti.org](https://www.activiti.org) <br/>



　　数据库表 <br/>

　　act_hi_*：'hi’表示 history，此前缀的表包含历史数据，如历史(结束)流程实例，变量，任务等等。 <br/>

　　act_ge_*：'ge’表示 general，此前缀的表为通用数据，用于不同场景中。 <br/>

　　act_evt_*：'evt’表示 event，此前缀的表为事件日志。 <br/>

　　act_procdef_*：'procdef’表示 processdefine，此前缀的表为记录流程定义信息。 <br/>

　　act_re_*：'re’表示 repository，此前缀的表包含了流程定义和流程静态资源(图片，规则等等)。 <br/>

　　act_ru_*：'ru’表示 runtime，此前缀的表是记录运行时的数据，包含流程实例，任务，变量，异步任务等运行中的数据。Activiti只在流程实例执行过程中保存这些数据，在流程结束时就会删除这些记录。 <br/>


|表名|表注释|
|:----:|:----:|
|act_ge_bytearray|二进制数据表，存储通用的流程定义和流程资源。|
|act_ge_property|系统相关属性，属性数据表存储整个流程引擎级别的数据，初始化表结构时，会默认插入三条记录。|
|act_re_deployment|部署信息表|
|act_re_model|流程设计模型部署表|
|act_re_procdef|流程定义数据表|
|act_ru_deadletter_job|作业死亡信息表，作业失败超过重试次数|
|act_ru_event_subscr|运行时事件表|
|act_ru_execution|运行时流程执行实例表|
|act_ru_identitylink|运行时用户信息表|
|act_ru_integration|运行时积分表|
|act_ru_job|运行时作业信息表|
|act_ru_suspended_job|运行时作业暂停表|
|act_ru_task|运行时任务信息表|
|act_ru_timer_job|运行时定时器作业表|
|act_ru_variable|运行时变量信息表|
|act_hi_actinst|历史节点表|
|act_hi_attachment|历史附件表|
|act_hi_comment|历史意见表|
|act_hi_detail|历史详情表，提供历史变量的查询|
|act_hi_identitylink|历史流程用户信息表|
|act_hi_procinst|历史流程实例表|
|act_hi_taskinst|历史任务实例表|
|act_hi_varinst|历史变量表|
|act_evt_log|流程引擎的通用事件日志记录表|
|act_procdef_info|流程定义的动态变更信息|
 <br/>



## 　　BPM节点介绍 <br/>

　　根据BPMN2.0规范的分类划分为以下部分：
　　1.启动与结束事件(event)
　　2.顺序流(Sequence Flow)
　　3.任务(Task)
　　4.网关(Gateway)
　　5.子流程(Subprocess)
　　6.边界事件(Boundary Event)
　　7.中间事件(Intermediate Event)
　　8.监听器(Listener) <br/>



### 　　Event <br/>

　　StartEvent，开始事件。 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210519094504173-278897241.png)  <br/>



　　EndEvent，结束事件。 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210519095641522-1463990212.png)  <br/>



### 　　Task <br/>

　　UserTask，用户任务，用户任务用来设置必须由人员完成的工作。 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210519105032055-1460235589.png)  <br/>

属性名称	属性说明
Assignee	指定用户任务的处理人
Cadidate Users	指定用户任务的候选人，多个用逗号隔开
Cadidate Groups	指定多个候选组，多个用逗号隔开
Due Date	设置任务的到期日，通常用变量代替而不是设定一个具体的日期
Priority	设定任务的优先级，取值区间[0,100]
 <br/>










　　ScriptTask，脚本任务，脚本任务是一个自动节点，当流程到达脚本任务。 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210519105651231-1130815096.png)  <br/>



　　ServiceTask，服务任务 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210519111051499-272418634.png)  <br/>



### 　　Gateway <br/>

　　ParallelGateway，并行网关，顺序流没有条件解析，且分支执行不分先后。例如下面流程，需要科任老师批准、班主任批准，请假流程才能结束。 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210519100852070-1740867701.png)  <br/>



 　　ExclusiveGateway，排他网关，条件解析为true的顺序流会被选中，流程往前走。例如下面流程，请假天数小于等于1天，科任老师老师批准，请假流程结束；请假天数大于1天，就需要班主任批准。 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210519101947841-1157428449.png)  <br/>



 　　InclusiveGateway，包含网关，并行与排他的结合体，所有顺序流的条件都会被解析，结果为true的顺序会以并行方式继续执行。例如下面流程，请假天数小于等于1天，科任老师老师批准，请假流程结束；请假天数大于1天，班主任批准，请假流程结束；请假天数大于三天，就需要班主任批准、校长批准，请假流程才能结束。 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210519103234222-757954501.png)  <br/>







## 　　开发前准备 <br/>

　　<span style="font-family: 宋体">  插件，用于绘制流程图</span> <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210512100752917-169865643.png)  <br/>



## 　　画流程图  <br/>

　　创建bpmn文件，画一个简单的请假流程 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517171150963-1201147992.png)  <br/>



## 　　代码编写 <br/>

　　项目结构 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517172710723-1079938759.png)  <br/>



　　引入依赖包 <br/>

```
<!-- activiti -->
        <dependency>
            <groupId>org.activiti</groupId>
            <artifactId>activiti-spring-boot-starter</artifactId>
            <version>7.1.0.M5</version>
        </dependency>
        <dependency>
            <groupId>org.activiti</groupId>
            <artifactId>activiti-image-generator</artifactId>
            <version>7.1.0.M5</version>
        </dependency>

        <!--添加MySQL驱动依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>

        <!-- thymeleaf模板 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
```



　　springboot整合的activiti，默认自带security框架，为了方便测试，我们直接用官方提供的config类 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517174751295-1947603409.png)  <br/>

　　几个默认账号，选一个来登录即可，可以选 admin/password <br/>

![](https://img2020.cnblogs.com/blog/1353055/202108/1353055-20210813100609247-1311264288.png)  <br/>





　　传统项目分层：controller层、service层 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517174910673-719735585.png)  <br/>



　　为了扩展、丰富原生的流程图生成器，创建自定义ProcessDiagramGenerator与ProcessDiagramCanvas <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517175123218-1186307474.png)  <br/>



　　三个简单页面 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517173956176-1561423430.png)  <br/>

　　１、流程发起，填写业务表单，发起一个请假流程 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517173717547-1065981447.png)  <br/>

　　２、任务待办，查询指定用户的流程任务列表，并完成任务 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517173759755-1250460707.png)  <br/>

　　３、查看流程，查询指定用户发起的流程列表，并查看实时流程图 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517173927353-1250268810.png)  <br/>







## 　　效果演示 <br/>

### 　　自动建表 <br/>

　　数据库无相关表，启动程序，就会自动创建相关的表，共25张 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517172158143-1549528536.png)  <br/>

 　　注：自动创建的表中，act_re_deployment少两个字段，部署流程时报错，补全即可（VERSION_、PROJECT_RELEASE_VERSION_） <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517172352469-1366023338.png)  <br/>

### 　　流程部署　 <br/>

　　单元测试，部署刚才的请假流程 <br/>

```
import org.activiti.engine.*;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest
public class  SpringbootActiviti7ApplicationTests {

    @Autowired
    private RepositoryService repositoryService;


    /**
     * 流程部署
     */
    @Test
    public void test() {
        repositoryService.createDeployment()
                .addClasspathResource("bpm/askForLeaveBpm.bpmn")
                .name("请假流程")
                .key("ASK_FOR_LEAVE_ACT")
                .deploy();

        System.out.println("流程部署成功！");
    }
}
```

### 　　流程发起 <br/>

　　http://localhost:10010/activiti/index
　　发起两个请假流程，一个1天、一个5天 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517171602071-934916429.png) ![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517171608350-1762622465.png)  <br/>



###  　　查看流程 <br/>

　　http://localhost:10010/activiti/getHistoricProcessInstanceByUserName?username=zhangsan <br/>

　　查看指定用户发起的流程 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517171726685-1700747111.png)  <br/>





### 　　任务待办 <br/>

　　http://localhost:10010/activiti/queryUserTaskByUserName?username=wangwu
　　查看任务待办，项目经理：lisi、部门经理：wangwu，并完当前成流程节点，流程会自动推进直至流程结束 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517171819794-1989005634.png)  <br/>



###  　　流程结束 <br/>

　　key1，请假小于3天，项目经理李四审批后流程直接结束
　　key2，请假大于3天，项目经理审批后，到部门经理审批，然后流程才结束 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517172017720-442387050.png) ![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210517172023095-1264367722.png)  <br/>



## 　　代码开源 <br/>



　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>



## 　　后记 <br/>

　　简单的整合实例暂时先记录到这，后续有空再补充。 <br/>



## 　　更新 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  2021-08-13更新</span> <br/>

　　整合Activti官方编辑器插件 <br/>



　　pom文件引入 <br/>

```
<activiti.modeler.version>5.23.0</activiti.modeler.version>

<dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-modeler</artifactId>
    <version>${activiti.modeler.version}</version>
</dependency>
<dependency>
    <groupId>org.activiti</groupId>
    <artifactId>activiti-diagram-rest</artifactId>
    <version>${activiti.modeler.version}</version>
</dependency>
```



　　插件GitHub地址：https://github.com/Activiti/Activiti/tree/5.x/modules/activiti-webapp-explorer2 <br/>

　　首先把开源项目下载成压缩包，方便拷贝东西： <br/>

　　1、这几个静态资源拷贝到我们项目里 <br/>

　　　　Activiti-5.x\modules\activiti-webapp-explorer2\src\main\webapp <br/>

![](https://img2020.cnblogs.com/blog/1353055/202108/1353055-20210813094935500-633659861.png)  <br/>

　　2、拷贝这三个Controller到我们的项目里 <br/>

　　　　Activiti-5.x\modules\activiti-modeler\src\main\java\org\activiti\rest\editor\main\StencilsetRestResource.java <br/>

　　　　Activiti-5.x\modules\activiti-modeler\src\main\java\org\activiti\rest\editor\model\ModelEditorJsonRestResource.java <br/>

　　　　Activiti-5.x\modules\activiti-modeler\src\main\java\org\activiti\rest\editor\model\ModelSaveRestResource.java <br/>

　　3、拷贝这个json文件到我们项目的resources文件夹 <br/>

　　　　Activiti-5.x\modules\activiti-webapp-explorer2\src\main\resources\stencilset.json <br/>





　　中文汉化：stencilset.json、en.json，这些文件默认都是英文的，找一个中文的替换即可  <br/>



　　代码修改  <br/>

　　editor-app/app-cfg.js <br/>

![](https://img2020.cnblogs.com/blog/1353055/202108/1353055-20210813095047961-1398158625.png)  <br/>



 　　三个Controller，同时都加上：@RequestMapping(value = "/service") <br/>

　　另外，保存方法的接参要改一改 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202108/1353055-20210813172626914-707667185.png)  <br/>





　　为了方便，我们配置一下Security框架配置，所有请求都不需要登录了（前端调用保存方法总是403没权限，很烦） <br/>

```
/**
 * Security框架配置
 */
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                // 关闭csrf防护
                .csrf().disable()
                .headers().frameOptions().disable()
                .and()

                //定制url访问权限
                .authorizeRequests()

                //无限登录即可访问
                .antMatchers("/**").permitAll()

                //需要特定权限
//                .antMatchers("/sysUser/**","/sysAuthority/**").hasAnyAuthority("ROLE_ADMIN","ROLE_SA")

                //其他接口登录才能访问
//                .anyRequest().authenticated()
                .and()
        ;
    }
}
```



　　http://localhost:10010/modeler/index <br/>

　　写个流程管理页面，可以进行CRUD、发布流程模型，同时还可以删除流程部署 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202108/1353055-20210813172119235-89337819.png)  <br/>



 　　一个简单的请假流程 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202108/1353055-20210813172313099-1065217028.png)  <br/>







　　将之前的请假流程发起的流程部署小调整一下，改成发起我们刚刚画的流程（修改key值） <br/>

![](https://img2020.cnblogs.com/blog/1353055/202108/1353055-20210813172409119-1386304486.png)  <br/>







　　流程图效果（其他的步骤跟之前的一样，就没什么好说的了，主要是看生成的流程图效果） <br/>

![](https://img2020.cnblogs.com/blog/1353055/202108/1353055-20210813172035771-1636487818.png)  <br/>

　　可以看到，使用在线编辑器不仅方便、流程图还比之前的好看，nice！ <br/>



　　注意项：activiti7强依赖security框架，如果使用默认配置，可能导致有些有些API调用报403，建议还是使用自己的Security配置 <br/>

　　参考：https://www.jianshu.com/p/cf766a713a86 <br/>



## 　　参考 <br/>

　　<span style="font-family: Calibri">  　　https://www.cnblogs.com/xuweiweiwoaini/p/13660394.html</span> <br/>

　　<span style="font-family: Calibri">  　　https://www.jianshu.com/nb/41785678</span> <br/>

　　<span style="font-family: Calibri">  　　https://blog.csdn.net/zhouchenjun001/article/details/103629559</span> <br/>


