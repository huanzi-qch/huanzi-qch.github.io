
## 　　前言 <br/>

　　<span class="site-name">  MyBatis-Plus是一款MyBatis的增强工具（简称MP），为简化开发、提高效率，但我们并没有直接使用MP的CRUD接口，而是在原来的基础上封装一层通用代码，单表继承我们的通用代码，实现了单表的基础get、save（插入/更新）、list、page、delete接口，使用Vo去接收、传输数据，实体负责与数据库表映射。</span> <br/>

　　<span class="site-name">  　　这样做的目的是与我们之前的那套jpa保持编码风格上的一致，当我们的通用接口不能满足要求时，应当先考虑使用MP的Service层CRUD接口，然后是Mapper的接口，最后才是自定义查询，本文将记录实现过程</span> <br/>

　　<span class="site-name">  　　MyBatis-Plus官网：  <a href="https://baomidou.com/" rel="noopener nofollow">    https://baomidou.com/  </a></span> <br/>



## 　　创建项目 <br/>

　　在我们的工程里新建子工程springboot-mybatis-plus，pom继承父工程，引入Mybatis-Plus相关jar包 <br/>

```
        <!--添加MyBatis-Plus依赖 -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.4.0</version>
        </dependency>

        <!--添加代码生成器依赖 -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-generator</artifactId>
            <version>3.4.0</version>
        </dependency>
        <!-- 模板引擎 -->
        <dependency>
            <groupId>org.apache.velocity</groupId>
            <artifactId>velocity-engine-core</artifactId>
            <version>2.0</version>
        </dependency>
```



　　启动类中配置mapper扫描路径 <br/>

```
@SpringBootApplication
@MapperScan("cn.huanzi.qch.springbootmybatisplus.*.mapper")
public class SpringbootMybatisPlusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootMybatisPlusApplication.class, args);
    }

}
```



　　创建MybatisPlusConfig配置类 <br/>

```
/**
 * MybatisPlusConfig配置类
 */
@Configuration
@ConditionalOnClass(value = {PaginationInterceptor.class})
public class MybatisPlusConfig {

    /**
     * 分页插件相关
     */
    @Bean
    public PaginationInterceptor paginationInterceptor() {
        PaginationInterceptor paginationInterceptor = new PaginationInterceptor();
        return paginationInterceptor;
    }

    /**
     * 主键策略相关
     */
    @Bean
    public IKeyGenerator keyGenerator() {
        return new H2KeyGenerator();
    }
}
```



　　配置文件配置数据库连接，与项目信息 <br/>

```
server.port=10102
spring.application.name=springboot-mybatis-plus

#修改thymeleaf访问根路径
spring.thymeleaf.prefix=classpath:/view/
```

　　yml <br/>

```
spring:
    datasource: #数据库相关
      url: jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2B8&characterEncoding=utf-8
      username: root
      password: 123456
      driver-class-name: com.mysql.cj.jdbc.Driver
    mvc:
      date-format: yyyy-MM-dd HH:mm:ss #mvc接收参数时对日期进行格式化

    jackson:
      date-format: yyyy-MM-dd HH:mm:ss #jackson对响应回去的日期参数进行格式化
      time-zone: GMT+8
```

　　到这里项目简单搭建完成 <br/>



## 　　通用代码 <br/>

　　接下来就是通用代码的编写，我们参考之前jpa的代码，结合Mybatis-Plus的Mapper接口进行封装通用get、save（插入/更新）、list、page、delete接口 <br/>



　　代码布局与jpa的风格一致 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825174328532-461550145.png)  <br/>

　　接口也一样 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825174509503-1325408373.png)  <br/>







## 　　代码生成器 <br/>

　　MP原生的并不适合我们，我们要新建自定义模板，编写代码生成器 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825174735798-885140931.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825182848738-321924940.png)  <br/>





 　　运行代码生成器即可生成后端代码，代码风格与我们之前的jpa高度一致，同样是封装一套通用CRUD、page分页接口，单表继承实现快速开发 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825174957267-1408569490.png)  <br/>



　　<span style="color: rgba(255, 0, 0, 1)">  2020-10-30更新</span> <br/>

　　问题场景：最近，用Mac苹果电脑的同学反映，提示运行成功，但没生成文件夹已经文件，经调试，原来是 Mac不能识别路径的"\"字符，导致路径有问题 <br/>

　　解决：“\”字符换成 File.separator 即可 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202010/1353055-20201030150210150-1381392793.png)  <br/>









## 　　接口效果演示 <br/>



　　get接口：http://localhost:10102/tbUser/get/2 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825175123190-2134764015.png)  <br/>





 list接口：http://localhost:10102/tbUser/list、http://localhost:10102/tbUser/list?id=2 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825175255737-1767524206.png)  <br/>







![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825175233545-606234831.png)  <br/>



 page接口分页、排序：http://localhost:10102/tbUser/page?page=1&rows=3&sidx=id&sord=desc <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825175337536-648178679.png)  <br/>



save有id，更新：http://localhost:10102/tbUser/save?id=2&username=huanzixxxx <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825181007651-2094593676.png)  <br/>

 save无id，新增：http://localhost:10102/tbUser/save?username=huanziyyy&password=000000&created=2020-08-16%2019:56:04 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825180813991-1404566556.png)  <br/>





　　delete删除：http://localhost:10102/tbUser/delete/14 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202008/1353055-20200825181110361-460176227.png)  <br/>



## 　　后记 <br/>

　　至此，我们便拥有了两个编码风格高度统一的ORM框架的自定义封装，都有一套基础通用的代码、代码自动生成工具，我们的开发效率大大提高，不管后续项目需要用到那个ORM框架，我们都有了技术储备，实现快速开发！MyBatis相关可看回我们之前的系列博客：[SpringBoot系列——MyBatis整合](https://www.cnblogs.com/huanzi-qch/p/10065136.html) <br/>

　　MP：[SpringBoot系列——MyBatis-Plus整合封装](https://www.cnblogs.com/huanzi-qch/p/13561164.html) <br/>

　　JPA：[SpringBoot系列——Spring-Data-JPA（究极进化版） 自动生成单表基础增、删、改、查接口](https://www.cnblogs.com/huanzi-qch/p/10281773.html) <br/>



## 　　投机取巧 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  2021-12-01更新</span> <br/>

　　不想写QueryWrapper条件拼来拼去，利用注解@Select + 拼接符$，直接执行原生SQL <br/>



　　通用mapper映射 <br/>

```
/**
 * 通用mapper映射
 */
public interface CommonMapper<T> extends BaseMapper<T> {

    /*
        投机取巧
        复杂SQL直接执行，不想写QueryWrapper条件拼来拼去...
     */

    @Update(value = "${sql}")
    int executeNativeSqlOfUpdate(String sql);

    @Select(value = "${sql}")
    Map<String,Object> executeNativeSqlOfOne(String sql);

    @Select(value = "${sql}")
    List<Map<String,Object>> executeNativeSqlOfList(String sql);

    @Select(value = "${sql}")
    T executeNativeSqlFindOne(String sql);

    @Select(value = "${sql}")
    List<T> executeNativeSqlFindList(String sql);
}
```

　　用户信息表 服务实现类 <br/>

```
@Service
public class TbUserServiceImpl  extends CommonServiceImpl<TbUserVo,TbUser>  implements TbUserService {

    @Autowired
    private TbUserMapper tbuserMapper;

    @Override
    public Result<TbUserVo> get(String id) {
        Map<String,Object> select = tbuserMapper.executeNativeSqlOfOne("select u.id,u.username,d.description from tb_user u join tb_description d on u.description_id = d.id where u.id = '" + id + "'");
        List<Map<String,Object>> select1 = tbuserMapper.executeNativeSqlOfList("select * from tb_user");

        TbUser tbUser = tbuserMapper.executeNativeSqlFindOne("select * from tb_user where id = '"+id+"'");
        return Result.build(CopyUtil.copy(tbUser,TbUserVo.class));
    }
}
```

　　效果 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202112/1353055-20211201113427412-862885204.png)  <br/>







## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


