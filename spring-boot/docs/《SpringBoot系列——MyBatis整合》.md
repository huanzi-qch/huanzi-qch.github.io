
## 　　前言 <br/>

　　MyBatis官网：[http://www.mybatis.org/mybatis-3/zh/index.html](http://www.mybatis.org/mybatis-3/zh/index.html) <br/>

　　本文记录springboot与mybatis的整合实例；1、以注解方式；2、手写XML配置、逆向工程生成XML配置 <br/>



　　maven依赖 <br/>

```
        <!-- springboot -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- MVC -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!--Thymeleaf模板依赖-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>

        <!--热部署工具dev-tools-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!--添加MyBatis依赖 -->
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>1.3.1</version>
        </dependency>

        <!--添加MySQL驱动依赖 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
```

　　application.yml <br/>

```
#注意:在yml文件中添加value值时,value前面需要加一个空格
#2.0.0的配置切换为servlet.path而不是"-"
server:
  port: 10086 #端口号
  servlet:
    context-path: /springboot

spring:
    thymeleaf:
      cache: false  #关闭页面缓存
      prefix: classpath:/view/  #thymeleaf访问根路径
      mode: LEGACYHTML5

    datasource: #数据库相关
      url: jdbc:mysql://localhost:3306/test?characterEncoding=utf-8
      username: root
      password: 123456
      driver-class-name: com.mysql.jdbc.Driver
    mvc:
      date-format: yyyy-MM-dd HH:mm:ss #mvc接收参数时对日期进行格式化

    jackson:
      date-format: yyyy-MM-dd HH:mm:ss #jackson对响应回去的日期参数进行格式化
      time-zone: GMT+8

mybatis:
  configuration:
   map-underscore-to-camel-case: true #开启驼峰映射
```

 　　result，通用响应数据格式 <br/>

　　注：不想自己写set、get方法的用lombok插件 <br/>

```
public class Result {

    private String message;

    private Integer status;

    private Object data;

    public Result() {
    }

    public Result(String message, Integer status, Object data) {
        this.message = message;
        this.status = status;
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    @Override
    public String toString() {
        return "Result{" +
                "message='" + message + '\'' +
                ", status=" + status +
                ", data=" + data +
                '}';
    }

    public static Result build(Integer status,String message,Object data){
            return new Result(message,status,data);
    }
}
```

 　　user，实体类 <br/>

　　注：不想自己写set、get方法的用lombok插件 <br/>

```
public class User {

    private Integer id;

    private String username;

    private String password;

    private Date created;

    public User(){}

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", created=" + created +
                '}';
    }
}
```

　　表SQL <br/>

```
DROP TABLE IF EXISTS `tb_user`;
CREATE TABLE `tb_user`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '表id',
  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '密码',
  `created` datetime NULL DEFAULT NULL COMMENT '创建时间',PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 45 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户信息表' ROW_FORMAT = Compact;
```



　　controller <br/>

```
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @RequestMapping("/insert")
    public Result insert(User user) {
        return  userService.insert(user);
    }

    @RequestMapping("/delete")
    public Result delete(User user) {
        return  userService.delete(user);
    }

    @RequestMapping("/update")
    public Result update(User user) {
        return  userService.update(user);
    }

    @RequestMapping("/select")
    public Result select(User user) {
        return  userService.select(user);
    }
}
```

　　service <br/>

```
public interface UserService {

    /**
     * 增
     */
    Result insert(User user);

    /**
     * 删
     */
    Result delete(User user);

    /**
     * 改
     */
    Result update(User user);

    /**
     * 查
     */
    Result select(User user);
}
```

```
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public Result insert(User user) {
        int i = userMapper.insert(user);
        if (i > 0) {
            return Result.build(200, "操作成功！", user);
        } else {
            return Result.build(400, "操作失败！", null);
        }
    }

    @Override
    public Result delete(User user) {
        int i = userMapper.delete(user);
        if (i > 0) {
            return Result.build(200, "操作成功！", user);
        } else {
            return Result.build(400, "操作失败！", null);
        }
    }

    @Override
    public Result update(User user) {
        int i = userMapper.update(user);
        if (i > 0) {
            return select(user);
        } else {
            return Result.build(400, "操作失败！", null);
        }
    }

    @Override
    public Result select(User user) {
        User user1 = userMapper.select(user);
        if (user1 != null) {
            return Result.build(200, "操作成功！", user1);
        } else {
            return Result.build(400, "操作失败！", user1);
        }
    }
}
```



　　接下来不同就是mapper映射了 <br/>



## 　　注解方式 <br/>

　　工程结构 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181204142636570-1572185557.png)  <br/>

　　mapper.java <br/>

　　直接使用注解，@Insert、@Delete、@Update、@Select，前三个事务自动提交，不用我们管理；增、删、改返回的是影响的行数，当设置了主键自动递增，需要返回自增主键时添加@Options(useGeneratedKeys = true)，设置是否获取主键并设置到模型实体属性中；注意：insert接口返回的依旧是受影响的行数，但自增主键已经设置到了模型实体属性中。 <br/>

　　这里介绍以下占位符跟拼接符的区别： <br/>

　　占位符 #{param}
　　占位符在拼接sql的过程中，会给指定的占位符，加上引号
 　　简单类型传参：
 　　1、会忽略占位符的名字
 　　2、会忽略占位符的数据类型
 　　3、会忽略占位符的顺序，将传进去的参加，依次赋给所有的占位符
 　　适用场景：
 　　单一占位符传参查询 <br/>



　　拼接符 ${param}
 　　拼接符相当于连接符合，把左右两边、自己拼接在一起
 　　1、不接受简单类型传参，只接收对象类型或者Map集合类型传参
 　　2、动态指定表名，列名，排序的方式（升序or降序） <br/>

```
@Mapper
@Component(value = "UserMapper")
public interface UserMapper {

    /**
     * 增
     */
    @Insert(value = "insert into tb_user(username,password,created) value(#{username},#{password},#{created})")
    @Options(useGeneratedKeys = true)
    int insert(User user);

    /**
     * 删
     */
    @Delete("delete from tb_user where id = #{id}")
    int delete(User user);

    /**
     * 改
     */
    @Update(value = "update tb_user set username = #{username} where id = #{id}")
    int update(User user);

    /**
     * 查
     */
    @Select(value = "select * from tb_user where id = #{id}")
    User select(User user);

}
```



## 　　配置XML <br/>

　　工程目录 <br/>

　　加多了mybatis相关的XML配置文件 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181204155613196-682690846.png)  <br/>



　　其他部分都没有变，变的只有以下部分： <br/>

　　application.yml的mybatis部分改成， <br/>

```
mybatis:

  # 配置mapper的扫描，找到所有的mapper.xml映射文件
  mapperLocations: classpath:conf/mybatis/mapper/*.xml

  # 加载全局的配置文件
  configLocation: classpath:conf/mybatis/mybatis.cfg.xml
```

　　mapper.java <br/>

　　不再使用注解，将SQL写到XML里面 <br/>

```
@Mapper
@Component(value = "UserMapper")
public interface UserMapper {

    /**
     * 增
     */
    int insert(User user);

    /**
     * 删
     */
    int delete(User user);

    /**
     * 改
     */
    int update(User user);

    /**
     * 查
     */
    User select(User user);

}
```

 　　mybatis.cgf.xml <br/>

　　这里配置全局设置，但我这里没什么要配的 <br/>

```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<!-- 全局配置文件 -->
<configuration>

</configuration>
```

　　UserMapper.xml <br/>

　　因为我们的表主键是自动递增，insert标签使用useGeneratedKeys="true"  keyProperty="id"，模型实体属性就会设置递增后的值 <br/>

```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="cn.mapper.UserMapper">

    <insert id="insert" useGeneratedKeys="true" keyProperty="id" parameterType="cn.pojo.User">
        insert into tb_user(username,password,created) value(#{username},#{password},#{created})
    </insert>

    <delete id="delete" parameterType="cn.pojo.User">
        delete from tb_user where id = #{id}
    </delete>

    <update id="update" parameterType="cn.pojo.User">
        update tb_user set username = #{username} where id = #{id}
    </update>

    <select id="select" parameterType="cn.pojo.User" resultType="cn.pojo.User">
        select * from tb_user where id = #{id}
    </select>

</mapper>
```



## 　　逆向工程 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  注意：本逆向工程例子是我之前毕业设计的表为操作对象，为了方便介绍，我直接用之前的项目做介绍</span> <br/>

　　数据库单表逆向生成单表对应的pojo实体、mapper.java、mapper.xml，无需手写这几个文件，生成的接口方法已经足够满足大部分业务需求，实现快速开发，关于逆向工程的具体配置，请戳官网介绍：[https://www.cnblogs.com/nzbin/p/8117535.html](https://www.cnblogs.com/nzbin/p/8117535.html) 或这篇博客：[Mybatis(七) mybatis的逆向工程的配置详解](https://www.cnblogs.com/whgk/p/7140638.html) <br/>

　　逆向工程项目结构 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181208140030758-379782540.png)  <br/>

　　逆向工程配置文件genreatorConfig.xml,名字无所谓,只要在java程序中作为file传入就好  （存放生成文件的对应的包要提前建好，否则会找不到） <br/>

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE generatorConfiguration
  PUBLIC "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
  "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">

<generatorConfiguration>
    <context id="testTables" targetRuntime="MyBatis3">
        <commentGenerator>
            <!-- 是否去除自动生成的注释 true：是 ： false:否 -->
            <property name="suppressAllComments" value="true" />
        </commentGenerator>
        <!--数据库连接的信息：驱动类、连接地址、用户名、密码 -->
        <jdbcConnection driverClass="com.mysql.jdbc.Driver"
            connectionURL="jdbc:mysql://localhost:3306/cpsh" userId="root"
            password="123456">
        </jdbcConnection>
        <!-- 默认false，把JDBC DECIMAL 和 NUMERIC 类型解析为 Integer，为 true时把JDBC DECIMAL 和 
            NUMERIC 类型解析为java.math.BigDecimal -->
        <javaTypeResolver>
            <property name="forceBigDecimals" value="false" />
        </javaTypeResolver>

        <!-- targetProject:生成PO类的位置 -->
        <javaModelGenerator targetPackage="cn.gx.hzu.cpsh.common.pojo"
            targetProject=".\src">
            <!-- enableSubPackages:是否让schema作为包的后缀 -->
            <property name="enableSubPackages" value="false" />
            <!-- 从数据库返回的值被清理前后的空格 -->
            <property name="trimStrings" value="true" />
        </javaModelGenerator>
        <!-- targetProject:mapper映射文件.xml生成的位置 -->
        <sqlMapGenerator targetPackage="cn.gx.hzu.cpsh.common.mapper" 
            targetProject=".\src">
            <!-- enableSubPackages:是否让schema作为包的后缀 -->
            <property name="enableSubPackages" value="false" />
        </sqlMapGenerator>
        <!-- targetPackage：mapper接口.java生成的位置 -->
        <javaClientGenerator type="XMLMAPPER"
            targetPackage="cn.gx.hzu.cpsh.common.mapper" 
            targetProject=".\src">
            <!-- enableSubPackages:是否让schema作为包的后缀 -->
            <property name="enableSubPackages" value="false" />
        </javaClientGenerator>
        <!-- 指定数据库表 -->
        <table schema="" tableName="t_ad"></table>
        <table schema="" tableName="t_admin"></table>
        <table schema="" tableName="t_ad_position"></table>
        <table schema="" tableName="t_chat"></table>
        <table schema="" tableName="t_purchase"></table>
        <table schema="" tableName="t_recommend"></table>
        <table schema="" tableName="t_sell"></table>
        <table schema="" tableName="t_type"></table>
        <table schema="" tableName="t_user"></table>
        <table schema="" tableName="t_user_datum"></table>
        <table schema="" tableName="t_notice"></table>
        
    </context>
</generatorConfiguration>
```

　　GeneratorSqlmap.java 文件，配置好XML后，直接运行main函数就行 <br/>

```
public class GeneratorSqlmap {

    public void generator() throws Exception{

        List<String> warnings = new ArrayList<String>();
        boolean overwrite = true;
        //指定 逆向工程配置文件
        File configFile = new File("generatorConfig.xml"); 
        ConfigurationParser cp = new ConfigurationParser(warnings);
        Configuration config = cp.parseConfiguration(configFile);
        DefaultShellCallback callback = new DefaultShellCallback(overwrite);
        MyBatisGenerator myBatisGenerator = new MyBatisGenerator(config,
                callback, warnings);
        myBatisGenerator.generate(null);

    } 
    public static void main(String[] args) throws Exception {
        try {
            GeneratorSqlmap generatorSqlmap = new GeneratorSqlmap();
            generatorSqlmap.generator();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
    }

}
```

　　生成后总体的效果 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181208140502790-782402552.png)  <br/>



　　pojo.java <br/>

　　数据库字段如果是有大写字母，逆向工程生成的实体类中的属性全都是小写 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181208141219617-450021518.png)  <br/>

　　数据库字段如果有下划线，逆向工程生成的实体类中下划线后面的字母会以大写开头 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181208141446478-1810145546.png)  <br/>

```
public class TUser {
    private Integer id;

    private String username;

    private String password;

    private String phone;

    private String eamil;

    private Integer credit;

    private String registerTime;

    private String loginTime;

    private String loginCity;

    private String logoutTime;

    private String chatId;

    private Integer isAuthentication;

    private Integer status;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username == null ? null : username.trim();
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password == null ? null : password.trim();
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone == null ? null : phone.trim();
    }

    public String getEamil() {
        return eamil;
    }

    public void setEamil(String eamil) {
        this.eamil = eamil == null ? null : eamil.trim();
    }

    public Integer getCredit() {
        return credit;
    }

    public void setCredit(Integer credit) {
        this.credit = credit;
    }

    public String getRegisterTime() {
        return registerTime;
    }

    public void setRegisterTime(String registerTime) {
        this.registerTime = registerTime == null ? null : registerTime.trim();
    }

    public String getLoginTime() {
        return loginTime;
    }

    public void setLoginTime(String loginTime) {
        this.loginTime = loginTime == null ? null : loginTime.trim();
    }

    public String getLoginCity() {
        return loginCity;
    }

    public void setLoginCity(String loginCity) {
        this.loginCity = loginCity == null ? null : loginCity.trim();
    }

    public String getLogoutTime() {
        return logoutTime;
    }

    public void setLogoutTime(String logoutTime) {
        this.logoutTime = logoutTime == null ? null : logoutTime.trim();
    }

    public String getChatId() {
        return chatId;
    }

    public void setChatId(String chatId) {
        this.chatId = chatId == null ? null : chatId.trim();
    }

    public Integer getIsAuthentication() {
        return isAuthentication;
    }

    public void setIsAuthentication(Integer isAuthentication) {
        this.isAuthentication = isAuthentication;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
```

 　　*Example.java <br/>

　　example类的使用方法请戳：[http://www.cnblogs.com/liuzunli/articles/9257949.html](http://www.cnblogs.com/liuzunli/articles/9257949.html) <br/>

```
public class TUserExample {
    protected String orderByClause;

    protected boolean distinct;

    protected List<Criteria> oredCriteria;

    public TUserExample() {
        oredCriteria = new ArrayList<Criteria>();
    }

    public void setOrderByClause(String orderByClause) {
        this.orderByClause = orderByClause;
    }

    public String getOrderByClause() {
        return orderByClause;
    }

    public void setDistinct(boolean distinct) {
        this.distinct = distinct;
    }

    public boolean isDistinct() {
        return distinct;
    }

    public List<Criteria> getOredCriteria() {
        return oredCriteria;
    }

    public void or(Criteria criteria) {
        oredCriteria.add(criteria);
    }

    public Criteria or() {
        Criteria criteria = createCriteriaInternal();
        oredCriteria.add(criteria);
        return criteria;
    }

    public Criteria createCriteria() {
        Criteria criteria = createCriteriaInternal();
        if (oredCriteria.size() == 0) {
            oredCriteria.add(criteria);
        }
        return criteria;
    }

    protected Criteria createCriteriaInternal() {
        Criteria criteria = new Criteria();
        return criteria;
    }

    public void clear() {
        oredCriteria.clear();
        orderByClause = null;
        distinct = false;
    }

    protected abstract static class GeneratedCriteria {
        protected List<Criterion> criteria;

        protected GeneratedCriteria() {
            super();
            criteria = new ArrayList<Criterion>();
        }

        public boolean isValid() {
            return criteria.size() > 0;
        }

        public List<Criterion> getAllCriteria() {
            return criteria;
        }

        public List<Criterion> getCriteria() {
            return criteria;
        }

        protected void addCriterion(String condition) {
            if (condition == null) {
                throw new RuntimeException("Value for condition cannot be null");
            }
            criteria.add(new Criterion(condition));
        }

        protected void addCriterion(String condition, Object value, String property) {
            if (value == null) {
                throw new RuntimeException("Value for " + property + " cannot be null");
            }
            criteria.add(new Criterion(condition, value));
        }

        protected void addCriterion(String condition, Object value1, Object value2, String property) {
            if (value1 == null || value2 == null) {
                throw new RuntimeException("Between values for " + property + " cannot be null");
            }
            criteria.add(new Criterion(condition, value1, value2));
        }

        public Criteria andIdIsNull() {
            addCriterion("id is null");
            return (Criteria) this;
        }

        public Criteria andIdIsNotNull() {
            addCriterion("id is not null");
            return (Criteria) this;
        }

        public Criteria andIdEqualTo(Integer value) {
            addCriterion("id =", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdNotEqualTo(Integer value) {
            addCriterion("id <>", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdGreaterThan(Integer value) {
            addCriterion("id >", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdGreaterThanOrEqualTo(Integer value) {
            addCriterion("id >=", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdLessThan(Integer value) {
            addCriterion("id <", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdLessThanOrEqualTo(Integer value) {
            addCriterion("id <=", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdIn(List<Integer> values) {
            addCriterion("id in", values, "id");
            return (Criteria) this;
        }

        public Criteria andIdNotIn(List<Integer> values) {
            addCriterion("id not in", values, "id");
            return (Criteria) this;
        }

        public Criteria andIdBetween(Integer value1, Integer value2) {
            addCriterion("id between", value1, value2, "id");
            return (Criteria) this;
        }

        public Criteria andIdNotBetween(Integer value1, Integer value2) {
            addCriterion("id not between", value1, value2, "id");
            return (Criteria) this;
        }

        public Criteria andUsernameIsNull() {
            addCriterion("username is null");
            return (Criteria) this;
        }

        public Criteria andUsernameIsNotNull() {
            addCriterion("username is not null");
            return (Criteria) this;
        }

        public Criteria andUsernameEqualTo(String value) {
            addCriterion("username =", value, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameNotEqualTo(String value) {
            addCriterion("username <>", value, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameGreaterThan(String value) {
            addCriterion("username >", value, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameGreaterThanOrEqualTo(String value) {
            addCriterion("username >=", value, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameLessThan(String value) {
            addCriterion("username <", value, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameLessThanOrEqualTo(String value) {
            addCriterion("username <=", value, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameLike(String value) {
            addCriterion("username like", value, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameNotLike(String value) {
            addCriterion("username not like", value, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameIn(List<String> values) {
            addCriterion("username in", values, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameNotIn(List<String> values) {
            addCriterion("username not in", values, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameBetween(String value1, String value2) {
            addCriterion("username between", value1, value2, "username");
            return (Criteria) this;
        }

        public Criteria andUsernameNotBetween(String value1, String value2) {
            addCriterion("username not between", value1, value2, "username");
            return (Criteria) this;
        }

        public Criteria andPasswordIsNull() {
            addCriterion("password is null");
            return (Criteria) this;
        }

        public Criteria andPasswordIsNotNull() {
            addCriterion("password is not null");
            return (Criteria) this;
        }

        public Criteria andPasswordEqualTo(String value) {
            addCriterion("password =", value, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordNotEqualTo(String value) {
            addCriterion("password <>", value, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordGreaterThan(String value) {
            addCriterion("password >", value, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordGreaterThanOrEqualTo(String value) {
            addCriterion("password >=", value, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordLessThan(String value) {
            addCriterion("password <", value, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordLessThanOrEqualTo(String value) {
            addCriterion("password <=", value, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordLike(String value) {
            addCriterion("password like", value, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordNotLike(String value) {
            addCriterion("password not like", value, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordIn(List<String> values) {
            addCriterion("password in", values, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordNotIn(List<String> values) {
            addCriterion("password not in", values, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordBetween(String value1, String value2) {
            addCriterion("password between", value1, value2, "password");
            return (Criteria) this;
        }

        public Criteria andPasswordNotBetween(String value1, String value2) {
            addCriterion("password not between", value1, value2, "password");
            return (Criteria) this;
        }

        public Criteria andPhoneIsNull() {
            addCriterion("phone is null");
            return (Criteria) this;
        }

        public Criteria andPhoneIsNotNull() {
            addCriterion("phone is not null");
            return (Criteria) this;
        }

        public Criteria andPhoneEqualTo(String value) {
            addCriterion("phone =", value, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneNotEqualTo(String value) {
            addCriterion("phone <>", value, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneGreaterThan(String value) {
            addCriterion("phone >", value, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneGreaterThanOrEqualTo(String value) {
            addCriterion("phone >=", value, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneLessThan(String value) {
            addCriterion("phone <", value, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneLessThanOrEqualTo(String value) {
            addCriterion("phone <=", value, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneLike(String value) {
            addCriterion("phone like", value, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneNotLike(String value) {
            addCriterion("phone not like", value, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneIn(List<String> values) {
            addCriterion("phone in", values, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneNotIn(List<String> values) {
            addCriterion("phone not in", values, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneBetween(String value1, String value2) {
            addCriterion("phone between", value1, value2, "phone");
            return (Criteria) this;
        }

        public Criteria andPhoneNotBetween(String value1, String value2) {
            addCriterion("phone not between", value1, value2, "phone");
            return (Criteria) this;
        }

        public Criteria andEamilIsNull() {
            addCriterion("eamil is null");
            return (Criteria) this;
        }

        public Criteria andEamilIsNotNull() {
            addCriterion("eamil is not null");
            return (Criteria) this;
        }

        public Criteria andEamilEqualTo(String value) {
            addCriterion("eamil =", value, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilNotEqualTo(String value) {
            addCriterion("eamil <>", value, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilGreaterThan(String value) {
            addCriterion("eamil >", value, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilGreaterThanOrEqualTo(String value) {
            addCriterion("eamil >=", value, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilLessThan(String value) {
            addCriterion("eamil <", value, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilLessThanOrEqualTo(String value) {
            addCriterion("eamil <=", value, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilLike(String value) {
            addCriterion("eamil like", value, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilNotLike(String value) {
            addCriterion("eamil not like", value, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilIn(List<String> values) {
            addCriterion("eamil in", values, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilNotIn(List<String> values) {
            addCriterion("eamil not in", values, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilBetween(String value1, String value2) {
            addCriterion("eamil between", value1, value2, "eamil");
            return (Criteria) this;
        }

        public Criteria andEamilNotBetween(String value1, String value2) {
            addCriterion("eamil not between", value1, value2, "eamil");
            return (Criteria) this;
        }

        public Criteria andCreditIsNull() {
            addCriterion("credit is null");
            return (Criteria) this;
        }

        public Criteria andCreditIsNotNull() {
            addCriterion("credit is not null");
            return (Criteria) this;
        }

        public Criteria andCreditEqualTo(Integer value) {
            addCriterion("credit =", value, "credit");
            return (Criteria) this;
        }

        public Criteria andCreditNotEqualTo(Integer value) {
            addCriterion("credit <>", value, "credit");
            return (Criteria) this;
        }

        public Criteria andCreditGreaterThan(Integer value) {
            addCriterion("credit >", value, "credit");
            return (Criteria) this;
        }

        public Criteria andCreditGreaterThanOrEqualTo(Integer value) {
            addCriterion("credit >=", value, "credit");
            return (Criteria) this;
        }

        public Criteria andCreditLessThan(Integer value) {
            addCriterion("credit <", value, "credit");
            return (Criteria) this;
        }

        public Criteria andCreditLessThanOrEqualTo(Integer value) {
            addCriterion("credit <=", value, "credit");
            return (Criteria) this;
        }

        public Criteria andCreditIn(List<Integer> values) {
            addCriterion("credit in", values, "credit");
            return (Criteria) this;
        }

        public Criteria andCreditNotIn(List<Integer> values) {
            addCriterion("credit not in", values, "credit");
            return (Criteria) this;
        }

        public Criteria andCreditBetween(Integer value1, Integer value2) {
            addCriterion("credit between", value1, value2, "credit");
            return (Criteria) this;
        }

        public Criteria andCreditNotBetween(Integer value1, Integer value2) {
            addCriterion("credit not between", value1, value2, "credit");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeIsNull() {
            addCriterion("register_time is null");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeIsNotNull() {
            addCriterion("register_time is not null");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeEqualTo(String value) {
            addCriterion("register_time =", value, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeNotEqualTo(String value) {
            addCriterion("register_time <>", value, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeGreaterThan(String value) {
            addCriterion("register_time >", value, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeGreaterThanOrEqualTo(String value) {
            addCriterion("register_time >=", value, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeLessThan(String value) {
            addCriterion("register_time <", value, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeLessThanOrEqualTo(String value) {
            addCriterion("register_time <=", value, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeLike(String value) {
            addCriterion("register_time like", value, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeNotLike(String value) {
            addCriterion("register_time not like", value, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeIn(List<String> values) {
            addCriterion("register_time in", values, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeNotIn(List<String> values) {
            addCriterion("register_time not in", values, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeBetween(String value1, String value2) {
            addCriterion("register_time between", value1, value2, "registerTime");
            return (Criteria) this;
        }

        public Criteria andRegisterTimeNotBetween(String value1, String value2) {
            addCriterion("register_time not between", value1, value2, "registerTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeIsNull() {
            addCriterion("login_time is null");
            return (Criteria) this;
        }

        public Criteria andLoginTimeIsNotNull() {
            addCriterion("login_time is not null");
            return (Criteria) this;
        }

        public Criteria andLoginTimeEqualTo(String value) {
            addCriterion("login_time =", value, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeNotEqualTo(String value) {
            addCriterion("login_time <>", value, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeGreaterThan(String value) {
            addCriterion("login_time >", value, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeGreaterThanOrEqualTo(String value) {
            addCriterion("login_time >=", value, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeLessThan(String value) {
            addCriterion("login_time <", value, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeLessThanOrEqualTo(String value) {
            addCriterion("login_time <=", value, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeLike(String value) {
            addCriterion("login_time like", value, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeNotLike(String value) {
            addCriterion("login_time not like", value, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeIn(List<String> values) {
            addCriterion("login_time in", values, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeNotIn(List<String> values) {
            addCriterion("login_time not in", values, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeBetween(String value1, String value2) {
            addCriterion("login_time between", value1, value2, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginTimeNotBetween(String value1, String value2) {
            addCriterion("login_time not between", value1, value2, "loginTime");
            return (Criteria) this;
        }

        public Criteria andLoginCityIsNull() {
            addCriterion("login_city is null");
            return (Criteria) this;
        }

        public Criteria andLoginCityIsNotNull() {
            addCriterion("login_city is not null");
            return (Criteria) this;
        }

        public Criteria andLoginCityEqualTo(String value) {
            addCriterion("login_city =", value, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityNotEqualTo(String value) {
            addCriterion("login_city <>", value, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityGreaterThan(String value) {
            addCriterion("login_city >", value, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityGreaterThanOrEqualTo(String value) {
            addCriterion("login_city >=", value, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityLessThan(String value) {
            addCriterion("login_city <", value, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityLessThanOrEqualTo(String value) {
            addCriterion("login_city <=", value, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityLike(String value) {
            addCriterion("login_city like", value, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityNotLike(String value) {
            addCriterion("login_city not like", value, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityIn(List<String> values) {
            addCriterion("login_city in", values, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityNotIn(List<String> values) {
            addCriterion("login_city not in", values, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityBetween(String value1, String value2) {
            addCriterion("login_city between", value1, value2, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLoginCityNotBetween(String value1, String value2) {
            addCriterion("login_city not between", value1, value2, "loginCity");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeIsNull() {
            addCriterion("logout_time is null");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeIsNotNull() {
            addCriterion("logout_time is not null");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeEqualTo(String value) {
            addCriterion("logout_time =", value, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeNotEqualTo(String value) {
            addCriterion("logout_time <>", value, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeGreaterThan(String value) {
            addCriterion("logout_time >", value, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeGreaterThanOrEqualTo(String value) {
            addCriterion("logout_time >=", value, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeLessThan(String value) {
            addCriterion("logout_time <", value, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeLessThanOrEqualTo(String value) {
            addCriterion("logout_time <=", value, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeLike(String value) {
            addCriterion("logout_time like", value, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeNotLike(String value) {
            addCriterion("logout_time not like", value, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeIn(List<String> values) {
            addCriterion("logout_time in", values, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeNotIn(List<String> values) {
            addCriterion("logout_time not in", values, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeBetween(String value1, String value2) {
            addCriterion("logout_time between", value1, value2, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andLogoutTimeNotBetween(String value1, String value2) {
            addCriterion("logout_time not between", value1, value2, "logoutTime");
            return (Criteria) this;
        }

        public Criteria andChatIdIsNull() {
            addCriterion("chat_id is null");
            return (Criteria) this;
        }

        public Criteria andChatIdIsNotNull() {
            addCriterion("chat_id is not null");
            return (Criteria) this;
        }

        public Criteria andChatIdEqualTo(String value) {
            addCriterion("chat_id =", value, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdNotEqualTo(String value) {
            addCriterion("chat_id <>", value, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdGreaterThan(String value) {
            addCriterion("chat_id >", value, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdGreaterThanOrEqualTo(String value) {
            addCriterion("chat_id >=", value, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdLessThan(String value) {
            addCriterion("chat_id <", value, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdLessThanOrEqualTo(String value) {
            addCriterion("chat_id <=", value, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdLike(String value) {
            addCriterion("chat_id like", value, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdNotLike(String value) {
            addCriterion("chat_id not like", value, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdIn(List<String> values) {
            addCriterion("chat_id in", values, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdNotIn(List<String> values) {
            addCriterion("chat_id not in", values, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdBetween(String value1, String value2) {
            addCriterion("chat_id between", value1, value2, "chatId");
            return (Criteria) this;
        }

        public Criteria andChatIdNotBetween(String value1, String value2) {
            addCriterion("chat_id not between", value1, value2, "chatId");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationIsNull() {
            addCriterion("is_authentication is null");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationIsNotNull() {
            addCriterion("is_authentication is not null");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationEqualTo(Integer value) {
            addCriterion("is_authentication =", value, "isAuthentication");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationNotEqualTo(Integer value) {
            addCriterion("is_authentication <>", value, "isAuthentication");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationGreaterThan(Integer value) {
            addCriterion("is_authentication >", value, "isAuthentication");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationGreaterThanOrEqualTo(Integer value) {
            addCriterion("is_authentication >=", value, "isAuthentication");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationLessThan(Integer value) {
            addCriterion("is_authentication <", value, "isAuthentication");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationLessThanOrEqualTo(Integer value) {
            addCriterion("is_authentication <=", value, "isAuthentication");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationIn(List<Integer> values) {
            addCriterion("is_authentication in", values, "isAuthentication");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationNotIn(List<Integer> values) {
            addCriterion("is_authentication not in", values, "isAuthentication");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationBetween(Integer value1, Integer value2) {
            addCriterion("is_authentication between", value1, value2, "isAuthentication");
            return (Criteria) this;
        }

        public Criteria andIsAuthenticationNotBetween(Integer value1, Integer value2) {
            addCriterion("is_authentication not between", value1, value2, "isAuthentication");
            return (Criteria) this;
        }

        public Criteria andStatusIsNull() {
            addCriterion("status is null");
            return (Criteria) this;
        }

        public Criteria andStatusIsNotNull() {
            addCriterion("status is not null");
            return (Criteria) this;
        }

        public Criteria andStatusEqualTo(Integer value) {
            addCriterion("status =", value, "status");
            return (Criteria) this;
        }

        public Criteria andStatusNotEqualTo(Integer value) {
            addCriterion("status <>", value, "status");
            return (Criteria) this;
        }

        public Criteria andStatusGreaterThan(Integer value) {
            addCriterion("status >", value, "status");
            return (Criteria) this;
        }

        public Criteria andStatusGreaterThanOrEqualTo(Integer value) {
            addCriterion("status >=", value, "status");
            return (Criteria) this;
        }

        public Criteria andStatusLessThan(Integer value) {
            addCriterion("status <", value, "status");
            return (Criteria) this;
        }

        public Criteria andStatusLessThanOrEqualTo(Integer value) {
            addCriterion("status <=", value, "status");
            return (Criteria) this;
        }

        public Criteria andStatusIn(List<Integer> values) {
            addCriterion("status in", values, "status");
            return (Criteria) this;
        }

        public Criteria andStatusNotIn(List<Integer> values) {
            addCriterion("status not in", values, "status");
            return (Criteria) this;
        }

        public Criteria andStatusBetween(Integer value1, Integer value2) {
            addCriterion("status between", value1, value2, "status");
            return (Criteria) this;
        }

        public Criteria andStatusNotBetween(Integer value1, Integer value2) {
            addCriterion("status not between", value1, value2, "status");
            return (Criteria) this;
        }
    }

    public static class Criteria extends GeneratedCriteria {

        protected Criteria() {
            super();
        }
    }

    public static class Criterion {
        private String condition;

        private Object value;

        private Object secondValue;

        private boolean noValue;

        private boolean singleValue;

        private boolean betweenValue;

        private boolean listValue;

        private String typeHandler;

        public String getCondition() {
            return condition;
        }

        public Object getValue() {
            return value;
        }

        public Object getSecondValue() {
            return secondValue;
        }

        public boolean isNoValue() {
            return noValue;
        }

        public boolean isSingleValue() {
            return singleValue;
        }

        public boolean isBetweenValue() {
            return betweenValue;
        }

        public boolean isListValue() {
            return listValue;
        }

        public String getTypeHandler() {
            return typeHandler;
        }

        protected Criterion(String condition) {
            super();
            this.condition = condition;
            this.typeHandler = null;
            this.noValue = true;
        }

        protected Criterion(String condition, Object value, String typeHandler) {
            super();
            this.condition = condition;
            this.value = value;
            this.typeHandler = typeHandler;
            if (value instanceof List<?>) {
                this.listValue = true;
            } else {
                this.singleValue = true;
            }
        }

        protected Criterion(String condition, Object value) {
            this(condition, value, null);
        }

        protected Criterion(String condition, Object value, Object secondValue, String typeHandler) {
            super();
            this.condition = condition;
            this.value = value;
            this.secondValue = secondValue;
            this.typeHandler = typeHandler;
            this.betweenValue = true;
        }

        protected Criterion(String condition, Object value, Object secondValue) {
            this(condition, value, secondValue, null);
        }
    }
}
```



　　*mapper.java <br/>

```
public interface TUserMapper {
    int countByExample(TUserExample example);

    int deleteByExample(TUserExample example);

    int deleteByPrimaryKey(Integer id);

    int insert(TUser record);

    int insertSelective(TUser record);

    List<TUser> selectByExample(TUserExample example);

    TUser selectByPrimaryKey(Integer id);

    int updateByExampleSelective(@Param("record") TUser record, @Param("example") TUserExample example);

    int updateByExample(@Param("record") TUser record, @Param("example") TUserExample example);

    int updateByPrimaryKeySelective(TUser record);

    int updateByPrimaryKey(TUser record);
}
```

 　　*Mapper.xml <br/>

```
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd" >
<mapper namespace="cn.gx.hzu.cpsh.common.mapper.TUserMapper" >
  <resultMap id="BaseResultMap" type="cn.gx.hzu.cpsh.common.pojo.TUser" >
    <id column="id" property="id" jdbcType="INTEGER" />
    <result column="username" property="username" jdbcType="VARCHAR" />
    <result column="password" property="password" jdbcType="VARCHAR" />
    <result column="phone" property="phone" jdbcType="VARCHAR" />
    <result column="eamil" property="eamil" jdbcType="VARCHAR" />
    <result column="credit" property="credit" jdbcType="INTEGER" />
    <result column="register_time" property="registerTime" jdbcType="VARCHAR" />
    <result column="login_time" property="loginTime" jdbcType="VARCHAR" />
    <result column="login_city" property="loginCity" jdbcType="VARCHAR" />
    <result column="logout_time" property="logoutTime" jdbcType="VARCHAR" />
    <result column="chat_id" property="chatId" jdbcType="VARCHAR" />
    <result column="is_authentication" property="isAuthentication" jdbcType="INTEGER" />
    <result column="status" property="status" jdbcType="INTEGER" />
  </resultMap>
  <sql id="Example_Where_Clause" >
    <where >
      <foreach collection="oredCriteria" item="criteria" separator="or" >
        <if test="criteria.valid" >
          <trim prefix="(" suffix=")" prefixOverrides="and" >
            <foreach collection="criteria.criteria" item="criterion" >
              <choose >
                <when test="criterion.noValue" >
                  and ${criterion.condition}
                </when>
                <when test="criterion.singleValue" >
                  and ${criterion.condition} #{criterion.value}
                </when>
                <when test="criterion.betweenValue" >
                  and ${criterion.condition} #{criterion.value} and #{criterion.secondValue}
                </when>
                <when test="criterion.listValue" >
                  and ${criterion.condition}
                  <foreach collection="criterion.value" item="listItem" open="(" close=")" separator="," >
                    #{listItem}
                  </foreach>
                </when>
              </choose>
            </foreach>
          </trim>
        </if>
      </foreach>
    </where>
  </sql>
  <sql id="Update_By_Example_Where_Clause" >
    <where >
      <foreach collection="example.oredCriteria" item="criteria" separator="or" >
        <if test="criteria.valid" >
          <trim prefix="(" suffix=")" prefixOverrides="and" >
            <foreach collection="criteria.criteria" item="criterion" >
              <choose >
                <when test="criterion.noValue" >
                  and ${criterion.condition}
                </when>
                <when test="criterion.singleValue" >
                  and ${criterion.condition} #{criterion.value}
                </when>
                <when test="criterion.betweenValue" >
                  and ${criterion.condition} #{criterion.value} and #{criterion.secondValue}
                </when>
                <when test="criterion.listValue" >
                  and ${criterion.condition}
                  <foreach collection="criterion.value" item="listItem" open="(" close=")" separator="," >
                    #{listItem}
                  </foreach>
                </when>
              </choose>
            </foreach>
          </trim>
        </if>
      </foreach>
    </where>
  </sql>
  <sql id="Base_Column_List" >
    id, username, password, phone, eamil, credit, register_time, login_time, login_city, 
    logout_time, chat_id, is_authentication, status
  </sql>
  <select id="selectByExample" resultMap="BaseResultMap" parameterType="cn.gx.hzu.cpsh.common.pojo.TUserExample" >
    select
    <if test="distinct" >
      distinct
    </if>
    <include refid="Base_Column_List" />
    from t_user
    <if test="_parameter != null" >
      <include refid="Example_Where_Clause" />
    </if>
    <if test="orderByClause != null" >
      order by ${orderByClause}
    </if>
  </select>
  <select id="selectByPrimaryKey" resultMap="BaseResultMap" parameterType="java.lang.Integer" >
    select 
    <include refid="Base_Column_List" />
    from t_user
    where id = #{id,jdbcType=INTEGER}
  </select>
  <delete id="deleteByPrimaryKey" parameterType="java.lang.Integer" >
    delete from t_user
    where id = #{id,jdbcType=INTEGER}
  </delete>
  <delete id="deleteByExample" parameterType="cn.gx.hzu.cpsh.common.pojo.TUserExample" >
    delete from t_user
    <if test="_parameter != null" >
      <include refid="Example_Where_Clause" />
    </if>
  </delete>
  <insert id="insert" parameterType="cn.gx.hzu.cpsh.common.pojo.TUser" >
    insert into t_user (id, username, password, 
      phone, eamil, credit, 
      register_time, login_time, login_city, 
      logout_time, chat_id, is_authentication, 
      status)
    values (#{id,jdbcType=INTEGER}, #{username,jdbcType=VARCHAR}, #{password,jdbcType=VARCHAR}, 
      #{phone,jdbcType=VARCHAR}, #{eamil,jdbcType=VARCHAR}, #{credit,jdbcType=INTEGER}, 
      #{registerTime,jdbcType=VARCHAR}, #{loginTime,jdbcType=VARCHAR}, #{loginCity,jdbcType=VARCHAR}, 
      #{logoutTime,jdbcType=VARCHAR}, #{chatId,jdbcType=VARCHAR}, #{isAuthentication,jdbcType=INTEGER}, 
      #{status,jdbcType=INTEGER})
  </insert>
  <insert id="insertSelective" parameterType="cn.gx.hzu.cpsh.common.pojo.TUser" >
    insert into t_user
    <trim prefix="(" suffix=")" suffixOverrides="," >
      <if test="id != null" >
        id,
      </if>
      <if test="username != null" >
        username,
      </if>
      <if test="password != null" >
        password,
      </if>
      <if test="phone != null" >
        phone,
      </if>
      <if test="eamil != null" >
        eamil,
      </if>
      <if test="credit != null" >
        credit,
      </if>
      <if test="registerTime != null" >
        register_time,
      </if>
      <if test="loginTime != null" >
        login_time,
      </if>
      <if test="loginCity != null" >
        login_city,
      </if>
      <if test="logoutTime != null" >
        logout_time,
      </if>
      <if test="chatId != null" >
        chat_id,
      </if>
      <if test="isAuthentication != null" >
        is_authentication,
      </if>
      <if test="status != null" >
        status,
      </if>
    </trim>
    <trim prefix="values (" suffix=")" suffixOverrides="," >
      <if test="id != null" >
        #{id,jdbcType=INTEGER},
      </if>
      <if test="username != null" >
        #{username,jdbcType=VARCHAR},
      </if>
      <if test="password != null" >
        #{password,jdbcType=VARCHAR},
      </if>
      <if test="phone != null" >
        #{phone,jdbcType=VARCHAR},
      </if>
      <if test="eamil != null" >
        #{eamil,jdbcType=VARCHAR},
      </if>
      <if test="credit != null" >
        #{credit,jdbcType=INTEGER},
      </if>
      <if test="registerTime != null" >
        #{registerTime,jdbcType=VARCHAR},
      </if>
      <if test="loginTime != null" >
        #{loginTime,jdbcType=VARCHAR},
      </if>
      <if test="loginCity != null" >
        #{loginCity,jdbcType=VARCHAR},
      </if>
      <if test="logoutTime != null" >
        #{logoutTime,jdbcType=VARCHAR},
      </if>
      <if test="chatId != null" >
        #{chatId,jdbcType=VARCHAR},
      </if>
      <if test="isAuthentication != null" >
        #{isAuthentication,jdbcType=INTEGER},
      </if>
      <if test="status != null" >
        #{status,jdbcType=INTEGER},
      </if>
    </trim>
  </insert>
  <select id="countByExample" parameterType="cn.gx.hzu.cpsh.common.pojo.TUserExample" resultType="java.lang.Integer" >
    select count(*) from t_user
    <if test="_parameter != null" >
      <include refid="Example_Where_Clause" />
    </if>
  </select>
  <update id="updateByExampleSelective" parameterType="map" >
    update t_user
    <set >
      <if test="record.id != null" >
        id = #{record.id,jdbcType=INTEGER},
      </if>
      <if test="record.username != null" >
        username = #{record.username,jdbcType=VARCHAR},
      </if>
      <if test="record.password != null" >
        password = #{record.password,jdbcType=VARCHAR},
      </if>
      <if test="record.phone != null" >
        phone = #{record.phone,jdbcType=VARCHAR},
      </if>
      <if test="record.eamil != null" >
        eamil = #{record.eamil,jdbcType=VARCHAR},
      </if>
      <if test="record.credit != null" >
        credit = #{record.credit,jdbcType=INTEGER},
      </if>
      <if test="record.registerTime != null" >
        register_time = #{record.registerTime,jdbcType=VARCHAR},
      </if>
      <if test="record.loginTime != null" >
        login_time = #{record.loginTime,jdbcType=VARCHAR},
      </if>
      <if test="record.loginCity != null" >
        login_city = #{record.loginCity,jdbcType=VARCHAR},
      </if>
      <if test="record.logoutTime != null" >
        logout_time = #{record.logoutTime,jdbcType=VARCHAR},
      </if>
      <if test="record.chatId != null" >
        chat_id = #{record.chatId,jdbcType=VARCHAR},
      </if>
      <if test="record.isAuthentication != null" >
        is_authentication = #{record.isAuthentication,jdbcType=INTEGER},
      </if>
      <if test="record.status != null" >
        status = #{record.status,jdbcType=INTEGER},
      </if>
    </set>
    <if test="_parameter != null" >
      <include refid="Update_By_Example_Where_Clause" />
    </if>
  </update>
  <update id="updateByExample" parameterType="map" >
    update t_user
    set id = #{record.id,jdbcType=INTEGER},
      username = #{record.username,jdbcType=VARCHAR},
      password = #{record.password,jdbcType=VARCHAR},
      phone = #{record.phone,jdbcType=VARCHAR},
      eamil = #{record.eamil,jdbcType=VARCHAR},
      credit = #{record.credit,jdbcType=INTEGER},
      register_time = #{record.registerTime,jdbcType=VARCHAR},
      login_time = #{record.loginTime,jdbcType=VARCHAR},
      login_city = #{record.loginCity,jdbcType=VARCHAR},
      logout_time = #{record.logoutTime,jdbcType=VARCHAR},
      chat_id = #{record.chatId,jdbcType=VARCHAR},
      is_authentication = #{record.isAuthentication,jdbcType=INTEGER},
      status = #{record.status,jdbcType=INTEGER}
    <if test="_parameter != null" >
      <include refid="Update_By_Example_Where_Clause" />
    </if>
  </update>
  <update id="updateByPrimaryKeySelective" parameterType="cn.gx.hzu.cpsh.common.pojo.TUser" >
    update t_user
    <set >
      <if test="username != null" >
        username = #{username,jdbcType=VARCHAR},
      </if>
      <if test="password != null" >
        password = #{password,jdbcType=VARCHAR},
      </if>
      <if test="phone != null" >
        phone = #{phone,jdbcType=VARCHAR},
      </if>
      <if test="eamil != null" >
        eamil = #{eamil,jdbcType=VARCHAR},
      </if>
      <if test="credit != null" >
        credit = #{credit,jdbcType=INTEGER},
      </if>
      <if test="registerTime != null" >
        register_time = #{registerTime,jdbcType=VARCHAR},
      </if>
      <if test="loginTime != null" >
        login_time = #{loginTime,jdbcType=VARCHAR},
      </if>
      <if test="loginCity != null" >
        login_city = #{loginCity,jdbcType=VARCHAR},
      </if>
      <if test="logoutTime != null" >
        logout_time = #{logoutTime,jdbcType=VARCHAR},
      </if>
      <if test="chatId != null" >
        chat_id = #{chatId,jdbcType=VARCHAR},
      </if>
      <if test="isAuthentication != null" >
        is_authentication = #{isAuthentication,jdbcType=INTEGER},
      </if>
      <if test="status != null" >
        status = #{status,jdbcType=INTEGER},
      </if>
    </set>
    where id = #{id,jdbcType=INTEGER}
  </update>
  <update id="updateByPrimaryKey" parameterType="cn.gx.hzu.cpsh.common.pojo.TUser" >
    update t_user
    set username = #{username,jdbcType=VARCHAR},
      password = #{password,jdbcType=VARCHAR},
      phone = #{phone,jdbcType=VARCHAR},
      eamil = #{eamil,jdbcType=VARCHAR},
      credit = #{credit,jdbcType=INTEGER},
      register_time = #{registerTime,jdbcType=VARCHAR},
      login_time = #{loginTime,jdbcType=VARCHAR},
      login_city = #{loginCity,jdbcType=VARCHAR},
      logout_time = #{logoutTime,jdbcType=VARCHAR},
      chat_id = #{chatId,jdbcType=VARCHAR},
      is_authentication = #{isAuthentication,jdbcType=INTEGER},
      status = #{status,jdbcType=INTEGER}
    where id = #{id,jdbcType=INTEGER}
  </update>
</mapper>
```



　　生成好代码之后我们就可以掉mapper接口的方法愉快的进行开发了，配合上pagehelpr插件，轻松实现分页、排序 <br/>

　　如果你也在用Mybatis，建议尝试该分页插件，这个一定是最方便使用的分页插件。该插件目前支持Oracle,Mysql,MariaDB,SQLite,Hsqldb,PostgreSQL六种数据库分页。 <br/>

　　maven <br/>

```
    <dependency>
        <groupId>com.github.pagehelper</groupId>
        <artifactId>pagehelper</artifactId>
        <version>3.4.2-fix</version>
    </dependency>
```

　　第一步：在Mybatis配置xml中配置拦截器插件: <br/>

```
<!-- 配置分页插件 -->
<plugins>
    <plugin interceptor="com.github.pagehelper.PageHelper">
        <!-- 设置数据库类型 Oracle,Mysql,MariaDB,SQLite,Hsqldb,PostgreSQL六种数据库-->        
        <property name="dialect" value="mysql"/>
    </plugin>
</plugins>
```

　　第二步：在代码中使用 <br/>

```
//分页处理  page当前页   rows每页多少条记录
PageHelper.startPage(page, rows);
//紧跟着的第一个select就会被分页 查询回来的list大小为rows
List<TbItem> list = itemMapper.selectByExample(example);
//使用PageInfo对结果集进行包装 通过包装后的pageinfo对象取得相关数据
PageInfo<TbItem> pageInfo = new PageInfo<>(list);
```

　　PageInfo类  定义的属性： <br/>

```
    //当前页
    private int pageNum;
    //每页的数量
    private int pageSize;
    //当前页的数量
    private int size;
    //排序
    private String orderBy;
    //由于startRow和endRow不常用，这里说个具体的用法
    //可以在页面中"显示startRow到endRow 共size条数据"
    private int startRow;
    private int endRow;
    //当前页面第一个元素在数据库中的行号
    private int startRow;
    //当前页面最后一个元素在数据库中的行号
    private int endRow;
    //总记录数
    private long total;
    //总页数
    private int pages;
    //结果集
    private List<T> list;
    //第一页
    private int firstPage;
    //前一页
    private int prePage;
    //下一页
    private int nextPage;
    //最后一页
    private int lastPage;
    //是否为第一页
    private boolean isFirstPage = false;
    //是否为最后一页
    private boolean isLastPage = false;
    //是否有前一页
    private boolean hasPreviousPage = false;
    //是否有下一页
    private boolean hasNextPage = false;
    //导航页码数
    private int navigatePages;
    //所有导航页号
    private int[] navigatepageNums;
```



　　原理：分页插件会自动在你的查询语句后面添加 order by addtime DESC limit ?,? <br/>


　　使用原理：
　　pageHelper会使用ThreadLocal获取到同一线程中的变量信息，各个线程之间的Threadlocal不会相互干扰，也就是Thread1中的ThreadLocal1之后获取到Tread1中的变量的信息，不会获取到Thread2中的信息
　　所以在多线程环境下，各个Threadlocal之间相互隔离，可以实现，不同thread使用不同的数据源或不同的Thread中执行不同的SQL语句
　　所以，PageHelper利用这一点通过拦截器获取到同一线程中的预编译好的SQL语句之后将SQL语句包装成具有分页功能的SQL语句，并将其再次赋值给下一步操作，所以实际执行的SQL语句就是有了分页功能的SQL语句
　　 <br/>

　　注意：
　　1、只有紧跟在PageHelper.startPage方法后的第一个Mybatis的查询（Select方法）方法会被分页。
　　2、分页插件不支持带有for update语句的分页
　　3、分页插件不支持关联结果查询 <br/>





## 　　效果展示 <br/>

　　经测试，注解方式跟配置XML方式效果一致，传参、调用方式、返回结果都一致，接口均能正常调用。 <br/>

　　insert接口 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181204163242984-836187605.png)  <br/>

　　update接口 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181204163321514-1769867766.png)  <br/>

　　select接口 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181204163346493-2052764678.png)  <br/>

　　delete接口 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201812/1353055-20181204163415931-2120138640.png)  <br/>

## 　　后记 <br/>

　　MyBatis 是一款优秀的持久层框架，它支持定制化 SQL、存储过程以及高级映射。MyBatis 避免了几乎所有的 JDBC 代码和手动设置参数以及获取结果集。MyBatis 可以使用简单的 XML 或注解来配置和映射原生信息，将接口和 Java 的 POJOs(Plain Old Java Objects,普通的 Java对象)映射成数据库中的记录。 <br/>

　　当我们一说起mybatis就会默默滴跟hibernate进行对比： <br/>

　　Hibernate DAO层开发比较简单，sql语句都封装好了，mybatis需要维护sql，手动写
　　Hibernate可移植性高，更改数据库方言即可，mybatis可移植性差，不同的数据库sql不同
　　Mybatis可以进行更细致的sql优化，减少没必要的查询字段，而hibernate封装太过彻底 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


