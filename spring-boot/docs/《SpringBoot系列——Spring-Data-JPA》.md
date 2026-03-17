
## 　　前言 <br/>

　　jpa是ORM映射框架，更多详情，请戳：apring-data-jpa官网：[http://spring.io/projects/spring-data-jpa](http://spring.io/projects/spring-data-jpa)，以及一篇优秀的博客：[https://www.cnblogs.com/cmfwm/p/8109433.html](https://www.cnblogs.com/cmfwm/p/8109433.html)，这里只是记录项目实现。 <br/>



## 　　查询方式 <br/>

　　jpa常用查询方法大致可分为JPA命名查询，@Query查询，EntityManager对象查询，@OneToOne关联查询 <br/>



　　<span style="color: rgba(46, 48, 51, 1); font-family: Arial, &quot;Microsoft YaHei&quot;, 微软雅黑, 宋体, &quot;Malgun Gothic&quot;, Meiryo, sans-serif">  JPA命名查询</span> <br/>

```
interface PersonRepositoryextendsRepository<User, Long>{
    List<Person> findByEmailAddressAndLastname(EmailAddress emailAddress,String lastname);
    // 去重查询
    List<Person> findDistinctPeopleByLastnameOrFirstname(String lastname,String firstname);
    List<Person> findPeopleDistinctByLastnameOrFirstname(String lastname,String firstname)
    // 忽略大小写
    List<Person> findByLastnameIgnoreCase(String lastname);
    List<Person> findByLastnameAndFirstnameAllIgnoreCase(String lastname,String firstname);
    // 排序查询
    List<Person> findByLastnameOrderByFirstnameAsc(String lastname);
    List<Person> findByLastnameOrderByFirstnameDesc(String lastname);}
}
```

　　<span style="color: rgba(46, 48, 51, 1); font-family: Arial, &quot;Microsoft YaHei&quot;, 微软雅黑, 宋体, &quot;Malgun Gothic&quot;, Meiryo, sans-serif">      使用Top和First限制查询的结果大小  <br/></span> <br/>

```
User findFirstByOrderByLastnameAsc();
User findTopByOrderByAgeDesc();
Page<User> queryFirst10ByLastname(String lastname,Pageable pageable);
Slice<User> findTop3ByLastname(String lastname,Pageable pageable);
List<User> findFirst10ByLastname(String lastname,Sort sort);
List<User> findTop10ByLastname(String lastname,Pageable pageable);
```

　　<span style="color: rgba(46, 48, 51, 1); font-family: Arial, &quot;Microsoft YaHei&quot;, 微软雅黑, 宋体, &quot;Malgun Gothic&quot;, Meiryo, sans-serif">  　　统计查询</span> <br/>

```
interface UserRepositoryextendsCrudRepository<User,Long>{
    long countByLastname(String lastname);
}
```

　　<span style="color: rgba(46, 48, 51, 1); font-family: Arial, &quot;Microsoft YaHei&quot;, 微软雅黑, 宋体, &quot;Malgun Gothic&quot;, Meiryo, sans-serif; font-size: 14px">  　　分页查询  <br/></span> <br/>

```
Page<User>findAll(PageRequest.of(1,20));
```



　　下表描述了JPA支持的关键字以及包含该关键字的JPA命名查询方法： <br/>

　　注意：使用Like、NotLike时，jpa是不会帮我们去拼%，所以需要我们自己传值时带上% <br/>


|关键字|示例|SQL|
|:----:|:----:|:----:|
|And|findByLastnameAndFirstname|… where x.lastname = ?1 and x.firstname = ?2|
|Or|findByLastnameOrFirstname|… where x.lastname = ?1 or x.firstname = ?2|
|Is,Equals|findByFirstname,findByFirstnameIs,findByFirstnameEquals|… where x.firstname = ?1|
|Between|findByStartDateBetween|… where x.startDate between ?1 and ?2|
|LessThan|findByAgeLessThan|… where x.age < ?1|
|LessThanEqual|findByAgeLessThanEqual|… where x.age <= ?1|
|GreaterThan|findByAgeGreaterThan|… where x.age > ?1|
|GreaterThanEqual|findByAgeGreaterThanEqual|… where x.age >= ?1|
|After|findByStartDateAfter|… where x.startDate > ?1|
|Before|findByStartDateBefore|… where x.startDate < ?1|
|IsNull|findByAgeIsNull|… where x.age is null|
|IsNotNull,NotNull|findByAge(Is)NotNull|… where x.age not null|
|Like|findByFirstnameLike|… where x.firstname like ?1|
|NotLike|findByFirstnameNotLike|… where x.firstname not like ?1|
|StartingWith|findByFirstnameStartingWith|… where x.firstname like ?1(parameter bound with appended %)|
|EndingWith|findByFirstnameEndingWith|… where x.firstname like ?1(parameter bound with prepended %)|
|Containing|findByFirstnameContaining|… where x.firstname like ?1(parameter bound wrapped in %)|
|OrderBy|findByAgeOrderByLastnameDesc|… where x.age = ?1 order by x.lastname desc|
|Not|findByLastnameNot|… where x.lastname <> ?1|
|In|findByAgeIn(Collection<Age> ages)|… where x.age in ?1|
|NotIn|findByAgeNotIn(Collection<Age> ages)|… where x.age not in ?1|
|True|findByActiveTrue()|… where x.active = true|
|False|findByActiveFalse()|… where x.active = false|
|IgnoreCase|findByFirstnameIgnoreCase|… where UPPER(x.firstame) = UPPER(?1)|
 <br/>



　　<span style="color: rgba(46, 48, 51, 1); font-family: Arial, &quot;Microsoft YaHei&quot;, 微软雅黑, 宋体, &quot;Malgun Gothic&quot;, Meiryo, sans-serif">  @Query查询</span> <br/>

　　<span style="color: rgba(46, 48, 51, 1); font-family: Arial, &quot;Microsoft YaHei&quot;, 微软雅黑, 宋体, &quot;Malgun Gothic&quot;, Meiryo, sans-serif">  　　普通查询</span> <br/>

```
public interface UserRepositoryextendsJpaRepository<User,Long>{
    @Query(value ="SELECT * FROM USERS WHERE EMAIL_ADDRESS = ?1", nativeQuery =true)
    User findByEmailAddress(String emailAddress);
}
```

　　<span style="font-family: &quot;PingFang SC&quot;, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 14px">  　　排序查询</span> <br/>

```
public interface UserRepositoryextendsJpaRepository<User, Long>{
    @Query("select u from User u where u.lastname like ?1%")
    List<User> findByAndSort(String lastname,Sort sort);
}
```

　　<span style="font-family: &quot;PingFang SC&quot;, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 14px">  　　分页查询</span> <br/>

```
public interface UserRepositoryextendsJpaRepository<User,Long>{
    @Query(value ="SELECT * FROM USERS WHERE LASTNAME = ?1",
        countQuery ="SELECT count(*) FROM USERS WHERE LASTNAME = ?1",
        nativeQuery =true)
    Page<User> findByLastname(String lastname,Pageable pageable);
}
```



　　<span style="color: rgba(46, 48, 51, 1); font-family: Arial, &quot;Microsoft YaHei&quot;, 微软雅黑, 宋体, &quot;Malgun Gothic&quot;, Meiryo, sans-serif">  使用命名参数</span> <br/>

```
public interface UserRepositoryextendsJpaRepository<User,Long>{
    @Query("select u from User u where u.firstname = :firstname or u.lastname = :lastname")
    User findByLastnameOrFirstname(@Param("lastname")String lastname,@Param("firstname")String firstname);
}
```

　　<span style="color: rgba(46, 48, 51, 1); font-family: Arial, &quot;Microsoft YaHei&quot;, 微软雅黑, 宋体, &quot;Malgun Gothic&quot;, Meiryo, sans-serif">  如果希望自动清除EntityManager，可以将@Modifying注释的clearautomatic属性设置为true。</span> <br/>

```
interface UserRepositoryextendsRepository<User, Long> {
    @Modifying
    @Transactional
    @Query("delete from User u where user.role.id = ?1")
    void deleteInBulkByRoleId(long roleId);
}
```



　　EntityManager对象查询　　 <br/>

　　2020-09-28更新：我们下面的这种写法，排序不生效...，Query对象只能设置分页信息，不能设置排序信息，排序需要我们直接来拼接 <br/>

　　首先我们需要一个实体属性转表字段的方法，即驼峰标识转下划线，可以封装在我们的SQL工具类 <br/>

```
    /**
     * 实体属性转表字段，驼峰属性转下划线，并全部转小写
     */
    public static String translate(String fieldName){
        return new PropertyNamingStrategy.SnakeCaseStrategy().translate(fieldName).toLowerCase();
    }
```

　　然后再em.createNativeQuery之前进行拼接排序 <br/>

```
        //拼接排序
        if(!StringUtils.isEmpty(entityVo.getSidx())){
            sql.append(" order by " + translate(entityVo.getSidx()));

            if(StringUtils.isEmpty(entityVo.getSord())){
                sql.append(" ASC");
            }else{
                sql.append(" "+entityVo.getSord());
            }
        }else{
            //默认按id字段排序
            sql.append(" order by id ASC");
        }
```

　　下面的内容我就不修改了，自行添加 <br/>

```
    @PersistenceContext
    private EntityManager em;


    private void pageTest() {
        //SQL
        String sql = "select * from tb_user t where t.username like :name";

        //设置SQL、映射实体，以及设置值，返回一个Query对象
        Query query = em.createNativeQuery(sql, TbUser.class).setParameter("name", "huanzi%");

        //分页、排序信息，并设置，page从0开始
        PageRequest pageRequest = PageRequest.of(0, 10, new Sort(Sort.Direction.ASC, "id"));
        query.setFirstResult((int) pageRequest.getOffset());
        query.setMaxResults(pageRequest.getPageSize());

        //获取分页结果
        Page page = PageableExecutionUtils.getPage(query.getResultList(), pageRequest, () -> {
            //设置countQuerySQL语句
            Query countQuery = em.createNativeQuery("select count(1) from ( " + ((NativeQueryImpl) query).getQueryString() + " ) count_table");
            //设置countQuerySQL参数
            query.getParameters().forEach(parameter -> countQuery.setParameter(parameter.getName(), query.getParameterValue(parameter.getName())));
            //返回一个总数
            return Long.valueOf(countQuery.getResultList().get(0).toString());
        });

        //组装返回值

        //总数
        long total = page.getTotalElements();
        System.out.println(total);
        //分页信息
        Pageable pageable = page.getPageable();
        System.out.println(pageable);
        //数据集合
        List<TbUser> content = page.getContent();
        System.out.println(content.size());
        System.out.println(content);
    }
```



　　@OneToOne关联查询，属性使用@Column标注，设置关联字段时可以使用Column的值，也可以使用属性名称，但不能两种都用，会报错 <br/>

　　@OneToOne默认使用主键去联查，当不想使用主键去联查，使用referencedColumnName标注联查字段 <br/>

　　注：经实测、PostgreSQL数据库，配置referencedColumnName属性，但jpa还是用关联表的主键去联查，不知道为什么 <br/>

```
//用户表
@Data
@Entity
@Table (name ="tb_user")
public class User{

    @Id
    @Column(name = "id" )
    private String id;//用户id

    @Column(name = "user_name" )
    private String userName;//用户名

    @Column(name = "user_info_id" )
    private String userInfoId;//用户信息id

    @OneToOne
    @JoinColumn(name = "user_info_id",referencedColumnName = "id", insertable = false, updatable = false)
    @NotFound(action= NotFoundAction.IGNORE)
    private UserInfo userInfo; //用户信息

}
```

```
//用户信息表
@Data
@Entity
@Table (name ="tb_user_info")
public class UserInfo{

    @Id
    @Column(name = "id" )
    private String id;//用户信息id

    @Column(name = "user_info_phone" )
    private String userInfoPhone;//手机

    @Column(name = "user_info_mail" )
    private String userInfoMail;//邮箱
}
```

 　　实际上，jpa会自动根据驼峰标识转下划线去识别实体属性跟表字段的映射，所以默认是不需要@Column去显式的标注，设置关联字段直接使用实体属性值即可 <br/>

　　至于@OneToMany、@ManyToMany，需要一端负责维护“一端”、一端负责维护“多端”，两边维护好规则，比较复杂，不太建议使用 <br/>



　　<span style="color: rgba(255, 0, 0, 1)">  自定义字段查询</span> <br/>

　　可以使用Map接，也可以定义一个Model对象来接 <br/>

　　<span style="color: rgba(0, 0, 0, 1)">  注意：使用Map来接，key值与数据表字段一致，没有驼峰映射；使用Model对象，需要使用HQL；</span> <br/>

```
/**
 * 自定义字段查询 Model
 */
@Data
public class Model {
    String username;
    Integer descriptionId;
    String description;

    public Model() {
    }

    public Model(String username, Integer descriptionId, String description) {
        this.username = username;
        this.descriptionId = descriptionId;
        this.description = description;
    }
}
```



```
    //自定义字段查询 HQL
    @Query("select new cn.huanzi.qch.springbootjpa.tbuser.pojo.Model(u.username,u.descriptionId,d.description) from TbUser u join TbDescription d on u.descriptionId = d.id where u.id = :id ")
    List<Model> findByModel(@Param("id")int id);

    //自定义字段查询 原生SQL
    @Query(value = "select u.username,u.description_id,d.description from tb_User u join tb_Description d on u.description_id = d.id where u.id = :id",nativeQuery = true)
    List<Map<String, Object>> findByMap(@Param("id")int id);
```



```
        //自定义字段查询 方法调用
        List<Model> modelList = tbUserRepository.findByModel(id);
        List<Map<String, Object>> mapList = tbUserRepository.findByMap(id);
```



![](https://huanzi-qch.github.io/file-server/blog-image/202201/1353055-20220113113852949-547943.png)  <br/>







## 　　工程结构 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116153623716-1963358306.png)  <br/>



## 　　代码编写 <br/>

　　maven引包 <br/>

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
            <scope>runtime</scope>
        </dependency>

        <!--lombok插件 -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
```



　　applicaction.yml <br/>

```
#注意:在yml文件中添加value值时,value前面需要加一个空格
#2.0.0的配置切换为servlet.path而不是"-"
server:
  port: 10086 #端口号
  servlet:
    context-path: /springboot #访问根路径

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

    jpa:
      show-sql: true

    mvc:
      date-format: yyyy-MM-dd HH:mm:ss #mvc接收参数时对日期进行格式化

    jackson:
      date-format: yyyy-MM-dd HH:mm:ss #jackson对响应回去的日期参数进行格式化
      time-zone: GMT+8
```



　　实体类与表数据 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116162551168-702870148.png)  <br/>

　　tb_user <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116162608418-1072033459.png)  <br/>

　　tb_description <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116162623785-424778719.png)  <br/>



```
/**
 * 用户类
 */
@Entity
@Table(name = "tb_user")
@Data
public class User implements Serializable {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY) //IDENTITY 自增
    private Integer id;

    @Column(name = "username")//命名相同或驼峰标识（与数据库下划线映射）可以不用写
    private String username;

    private String password;

    private Date created;

    private String descriptionId;

    @OneToOne
    @JoinColumn(name = "descriptionId",referencedColumnName = "id", insertable = false, updatable = false)
    @NotFound(action= NotFoundAction.IGNORE)
    //用户描述信息
    private Description description;
}
```

```
/**
 * 用户描述类
 */
@Entity
@Table(name = "tb_description")
@Data
public class Description implements Serializable {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY) //IDENTITY 自增
    private Integer id;

    private String userId;

    private String description;
}
```



　　通讯对象 <br/>

```
/**
 * 统一返回对象
 */

@Data
public class Result<T> implements Serializable {
    /**
     * 通信数据
     */
    private T data;
    /**
     * 通信状态
     */
    private boolean flag = true;
    /**
     * 通信描述
     */
    private String msg = "";

    /**
     * 通过静态方法获取实例
     */
    public static <T> Result<T> of(T data) {
        return new Result<>(data);
    }

    public static <T> Result<T> of(T data, boolean flag) {
        return new Result<>(data, flag);
    }

    public static <T> Result<T> of(T data, boolean flag, String msg) {
        return new Result<>(data, flag, msg);
    }

    @Deprecated
    public Result() {

    }

    private Result(T data) {
        this.data = data;
    }

    private Result(T data, boolean flag) {
        this.data = data;
        this.flag = flag;
    }

    private Result(T data, boolean flag, String msg) {
        this.data = data;
        this.flag = flag;
        this.msg = msg;
    }

}
```





　　分页对象 <br/>

```
/**
 * 分页对象（参考JqGrid插件）
 */
@Data
public class PageInfo<M> {
    private int page;//当前页码
    private int pageSize;//页面大小
    private String sidx;//排序字段
    private String sord;//排序方式

    private List<M> rows;//分页结果
    private int records;//总记录数
    private int total;//总页数

    /**
     * 获取统一分页对象
     */
    public static <M> PageInfo<M> of(Page page, Class<M> entityModelClass) {
        int records = (int) page.getTotalElements();
        int pageSize = page.getSize();
        int total = records % pageSize == 0 ? records / pageSize : records / pageSize + 1;

        PageInfo<M> pageInfo = new PageInfo<>();
        pageInfo.setPage(page.getNumber() + 1);//页码
        pageInfo.setPageSize(pageSize);//页面大小
        pageInfo.setRows(CopyUtil.copyList(page.getContent(), entityModelClass));//分页结果
        pageInfo.setRecords(records);//总记录数
        pageInfo.setTotal(total);//总页数
        return pageInfo;
    }

    /**
     * 获取JPA的分页对象
     */
    public static Page readPage(Query query, Pageable pageable, Query countQuery) {
        if (pageable.isPaged()) {
            query.setFirstResult((int) pageable.getOffset());
            query.setMaxResults(pageable.getPageSize());
        }
        return PageableExecutionUtils.getPage(query.getResultList(), pageable, () -> executeCountQuery(countQuery));
    }

    private static Long executeCountQuery(Query countQuery) {
        Assert.notNull(countQuery, "TypedQuery must not be null!");

        List<Number> totals = countQuery.getResultList();
        Long total = 0L;
        for (Number number : totals) {
            if (number != null) {
                total += number.longValue();
            }
        }
        return total;
    }
}
```

```
/**
 * 分页条件（参考JqGrid插件）
 */
@Data
public class PageCondition {
    private int page = 1;//当前页码
    private int rows = 10;//页面大小
    private String sidx;//排序字段
    private String sord;//排序方式

    /**
     * 获取JPA的分页查询对象
     */
    public Pageable getPageable() {
        //处理非法页码
        if (page < 0) {
            page = 1;
        }
        //处理非法页面大小
        if (rows < 0) {
            rows = 10;
        }
        return PageRequest.of(page - 1, rows);
    }
}
```

 　　2019-09-27补充：之前的这个分页信息对象不是很好，现在更新一下 <br/>

　　1、int改成Integer <br/>

　　2、非法参数处理加强 <br/>

　　3、使用@JsonInclude注解，减少数据传输，例如： <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201909/1353055-20190927153020300-346590013.png) ![](https://huanzi-qch.github.io/file-server/blog-image/201909/1353055-20190927153032041-2114869398.png)  <br/>







```
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;

/**
 * 分页条件（参考JqGrid插件）
 */
@Data
//当属性的值为空（null或者""）时，不进行序列化，可以减少数据传输
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class PageCondition {
    private Integer page;//当前页码
    private Integer rows;//页面大小
    private String sidx;//排序字段
    private String sord;//排序方式

    /**
     * 获取JPA的分页查询对象
     */
    @JsonIgnore
    public Pageable getPageable() {
        //处理非法页码
        if (StringUtils.isEmpty(page) || page < 0) {
            page = 1;
        }
        //处理非法页面大小
        if (StringUtils.isEmpty(rows) || rows < 0) {
            rows = 10;
        }
        return PageRequest.of(page - 1, rows);
    }
}
```







 　　UserController <br/>

```
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @RequestMapping("/getAllUser")
    public ModelAndView getAllUser(){
        Result result=userService.getAllUser();
        ModelAndView mv=new ModelAndView();
        mv.addObject("userList",result.getData());
        mv.setViewName("index.html");
        return mv;
    }

    @RequestMapping("page")
    public Result<PageInfo<User>> page(User entity, PageCondition pageCondition) {
        return userService.page(entity,pageCondition);
    }

    @RequestMapping("list")
    public Result<List<User>> list(User entity) {
        return userService.list(entity);
    }

    @RequestMapping("get/{id}")
    public Result<User> get(@PathVariable("id") Integer id) {
        return userService.get(id);
    }

    @RequestMapping("save")
    public Result<User> save(User entity) {
        return userService.save(entity);
    }

    @RequestMapping("delete/{id}")
    public Result<Integer> delete(@PathVariable("id") Integer id){
        return userService.delete(id);
    }
}
```



　　UserService <br/>

```
public interface UserService{

    Result<PageInfo<User>> page(User entity, PageCondition pageCondition);

    Result<List<User>> list(User entity);

    Result<User> get(Integer id);

    Result<User> save(User entity);

    Result<Integer> delete(Integer id);

    Result getAllUser();
}
```

```
@Service@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public Result<PageInfo<User>> page(User entity ,PageCondition pageCondition) {
        Page<User> page = userRepository.findAll(Example.of(CopyUtil.copy(entity, User.class)), pageCondition.getPageable());
        int records = (int) page.getTotalElements();
        int pageSize = page.getSize();
        int total = records % pageSize == 0 ? records / pageSize : records / pageSize + 1;
        PageInfo<User> pageInfo = new PageInfo<>();
        pageInfo.setPage(page.getNumber() + 1);//页码
        pageInfo.setPageSize(pageSize);//页面大小
        pageInfo.setRows(page.getContent());//分页结果
        pageInfo.setRecords(records);//总记录数
        pageInfo.setTotal(total);//总页数
        return Result.of(pageInfo);
    }

    @Override
    public Result<List<User>> list(User entity) {
        List<User> entityList = userRepository.findAll(Example.of(entity));
        return Result.of(entityList);
    }

    @Override
    public Result<User> get(Integer id) {
        Optional<User> optionalE = userRepository.findById(id);
        if (!optionalE.isPresent()) {
            throw new RuntimeException("ID不存在！");
        }
        return Result.of(optionalE.get());
    }

    @Override
    public Result<User> save(User entity) {
        User user = userRepository.save(entity);
        return Result.of(user);
    }

    @Override
    public Result<Integer> delete(Integer id) {
        userRepository.deleteById(id);
        return Result.of(id);
    }

    @Override
    public Result getAllUser() {
        List<User> userList = userRepository.getAllUser();
        if(userList != null && userList.size()>0){
            return Result.of(userList);
        }else {
            return Result.of(userList,false,"获取失败！");
        }
    }
}
```



　　UserRepository <br/>

```
public interface UserRepository extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {

    @Query(value = "from User") //HQL
//    @Query(value = "select * from tb_user",nativeQuery = true)//原生SQL
    List<User> getAllUser();

}
```



## 　　效果 <br/>

　　get接口 <br/>

　　http://localhost:10086/springboot/user/get/1 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116170633099-2058663520.png)  <br/>



　　list接口 <br/>

　　http://localhost:10086/springboot/user/list <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116170346125-735079235.png)  <br/>

 　　http://localhost:10086/springboot/user/list?username=张三 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116170451698-974129138.png)  <br/>



　　page接口 <br/>

　　http://localhost:10086/springboot/user/page?page=1&rows=10 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116170804913-752893624.png)  <br/>

　　 http://localhost:10086/springboot/user/page?page=1&rows=10&username=张三 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116170853682-2083223409.png)  <br/>



　　save接口（插入跟更新） <br/>

　　没有id或id不存在，为插入，http://localhost:10086/springboot/user/save?username=张麻子&password=123 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116171205890-2140993789.png)  <br/>

　　id已存在，则为更新，注意：这里的更新是你的字段是什么jpa就帮你存什么，如果想要实现只更新接参对象有值的字段，应该先用id去同步数据，再更新，http://localhost:10086/springboot/user/save?id=1&username=张三1&password=666 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116171350049-1564110899.png)  <br/>

　　delete接口 <br/>

　　http://localhost:10086/springboot/user/delete/6 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116171518025-2022708503.png)  <br/>



　　自定义Dao层方法 <br/>

　　http://localhost:10086/springboot/user/getAllUser <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201811/1353055-20181116171652206-355791996.png)  <br/>

## 　　后记 <br/>

 　　JPA牛逼！ <br/>

　　注意： <br/>

```
<!--继承信息-->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.0.2.RELEASE</version>
    <relativePath/>
</parent>
```

```
<!--继承信息-->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>1.5.9.RELEASE</version>
    <relativePath/>
</parent>
```

　　2.0之后是大版本升级，使用了1.8JDK，许多方法API都发生了改变，其中就碰到了一个坑，之前写得不规范，Service中已经@Transactional了一次，Repository的自定义SQL又@Transactional一次，当我们service直接调公用JPA方法，后面又调我们自定义的Dao层方法时，由于事务传播，后面的事务不进行提交，而且也不报错 <br/>



## 　　补充 <br/>

　　有同学发现我们少贴了部分代码，在这里补充一下，CopyUtil类是我们自定义的一个实体类型转换的工具类，用于将实体模型与实体的转换，在 [SpringBoot系列——Spring-Data-JPA（升级版）](https://www.cnblogs.com/huanzi-qch/p/9984261.html)中，我们已经对该工具类进行了升级，升级之后支持复杂对象的转换 <br/>

```
/**
 * 实体类型转换的工具类
 */

public class CopyUtil {

    /**
     * 类型转换：实体模型<->实体
     * <p>
     * 例如：List<DataModel> <--> List<Data>
     */

    public static <T> List<T> copyList(List list, Class<T> target) {
        List<T> newList = new ArrayList<>();
        for (Object entity : list) {
            newList.add(copy(entity, target));
        }
        return newList;
    }

    /**
     * 类型转换：实体模型 <->实体
     * <p>
     * 例如：DataModel <--> Data
     */
    public static <T> T copy(Object origin, Class<T> target) {
        T t = null;
        try {
            t = target.newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            e.printStackTrace();
        }
        BeanUtils.copyProperties(origin, t);
        return t;
    }
}
```



　　2019-06-21补充：jpa有个坑，默认情况下（数据库是oracle），调用super.方法，事务会排在最后提交，因此造成我update的数据后面又被super的事务update回来 <br/>

　　（PS：如果你看到这里，就要注意正确使用super.方法，super.方法应该要放在最后调用，避免入坑，事实上，关于jpa的事务管理还有很多坑，这个我们以后再好好聊） <br/>

　　例如： <br/>

```
    //先调用父类的保存方法    
　　super.save();

   //执行自定义update语句
　　my.update();
```



　　虽然代码先执行super.save()，但这个保存事务会在最后执行提交 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201906/1353055-20190621163322372-1170815898.png)  <br/>

　　我们期待的事务顺序应该是这样 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201906/1353055-20190621163413612-2080497104.png)  <br/>

　　最后我是直接使用在service层注入dao层，直接调用dao.save()，事务处理就与我们期待的一样了 <br/>

　　可能有些同学看到会有些疑问，看到我两个操作都有操作同一个表，为什么不合并成一次操作呢，直接修改对象值，调用super.save()方法进行保存不就行了吗，还要直接写update？？  这是因为save方法我们进行了特殊处理，jpa原生save方法是传入的对象的属性值是什么就帮我们保存什么，这并不符合我们的常规保存操作，我传入一个对象，里面哪些属性有值就帮我们保存哪些值，而我们的自定义update刚好就是有设置某个字段的值为空，调用父类的save方法不会帮我们设置，所以才需要单独写一个update <br/>



## 　　我被SQL注入了 <br/>

　　2019-10-24补充：客户突然反馈，网站访问出现访问响应时间太久、进而崩溃的情况，查看日志发现是数据库连接超时，仔细一看执行的SQL不对劲 <br/>

```
java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30014ms.
```



```
select * from super_search_ucid  where 1 = 1  and game_id = '6' AND 7645=IF((ORD(MID((SELECT DISTINCT(IFNULL(CAST(grantee AS CHAR),CHAR(32))) FROM information_schema.USER_PRIVILEGES LIMIT 0,1),2,1)) > 3008),SLEEP(5),7645) AND 'HhsP'='HhsP' and role_list like '%SP琉%' and props_list like '%MR琉璃%' and ( division like '%官服安卓IOS通用%' )
```



![](https://huanzi-qch.github.io/file-server/blog-image/201910/1353055-20191024153125621-577870860.png)  <br/>





 　　这个SQL被SQL注入攻击，这个就是对方注入进来的字符串 <br/>

```
6' AND 7645=IF((ORD(MID((SELECT DISTINCT(IFNULL(CAST(grantee AS CHAR),CHAR(32))) FROM information_schema.USER_PRIVILEGES LIMIT 0,1),2,1)) > 3008),SLEEP(5),7645) AND 'HhsP'='HhsP
```

　　他在疯狂的查询信息库的用户权限表，企图搞事情 <br/>



　　经实测，这个SQL在生产上执行耗时一百多秒都没响应，导致数据库连接池的连接线程一直被占用，没有空闲的可以被调用导致连接超时 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201910/1353055-20191024153525688-164952005.png)  <br/>



　　这个接口是查询接口，我们在Security的配置中配置的是无需登录就可以访问，而且由于需要分页，同时还需要等值查询等各种操作，所以我采用的是文章前面提到的 EntityManager对象查询 方法，动态拼接SQL，而且当时并没有想到需要防范SQL注入，这才落下了那么大的一个坑，所幸并没有造成重大影响 <br/>



　　防范、解决： <br/>

　　1、动态拼接的SQL一定要记得做转义 <br/>

```
    /**
     * sql转义
     */
    public static String escapeSql(String str) {
        if (str == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < str.length(); i++) {
            char src = str.charAt(i);
            switch (src) {
                case '\'':
                    sb.append("''");// hibernate转义多个单引号必须用两个单引号
                    break;
                case '\"':
                case '\\':
                    sb.append('\\');
                default:
                    sb.append(src);
                    break;
            }
        }
        return sb.toString();
    }
```



　　2、切记不要再使用select * 了，一个是查询耗时久，一个是如果不小心被SQL注入还容易泄露数据，可以参考之前写的博客《[利用反射跟自定义注解拼接实体对象的查询SQL](https://www.cnblogs.com/huanzi-qch/p/9754846.html)》，拼接全字段查询语句 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>




