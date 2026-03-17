
## 　　前言 <br/>

　　日常开发中，缓存是解决数据库压力的一种方案，通常用于频繁查询的数据，例如新闻中的热点新闻，本文记录springboot中使用cache缓存。 <br/>



　　官方文档介绍：https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-caching-provider-generic <br/>



## 　　工程结构 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610105538330-2038419040.png)  <br/>







## 　　代码编写 <br/>

　　pom引入依赖，引入cache缓存，数据库使用mysql，ORM框架用jpa <br/>

```
        <!--添加springdata-cache依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-cache</artifactId>
        </dependency>

        <!-- 引入ehcache支持 -->
        <dependency>
            <groupId>net.sf.ehcache</groupId>
            <artifactId>ehcache</artifactId>
        </dependency>

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

　　配置文件 <br/>

```
server.port=10010
spring.application.name=springboot-cache

spring.cache.type=ehcache
spring.cache.ehcache.config=classpath:/ehcache.xml
```

　　ehcache.xml <br/>

```
<?xml version="1.0" encoding="UTF-8"?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://ehcache.org/ehcache.xsd" updateCheck="false">

    <!-- 磁盘缓存位置 -->
    <diskStore path="java.io.tmpdir"/>

    <!-- maxEntriesLocalHeap:堆内存中最大缓存对象数，0没有限制 -->
    <!-- maxElementsInMemory： 在内存中缓存的element的最大数目。-->
    <!-- eternal:elements是否永久有效，如果为true，timeouts将被忽略，element将永不过期 -->
    <!-- timeToIdleSeconds:发呆秒数，发呆期间未访问缓存立即过期，当eternal为false时，这个属性才有效，0为不限制 -->
    <!-- timeToLiveSeconds:总存活秒数，当eternal为false时，这个属性才有效，0为不限制 -->
    <!-- overflowToDisk： 如果内存中数据超过内存限制，是否要缓存到磁盘上 -->
    <!-- statistics：是否收集统计信息。如果需要监控缓存使用情况，应该打开这个选项。默认为关闭（统计会影响性能）。设置statistics="true"开启统计 -->

    <!--
        默认缓存
        无过期时间，但 600 秒内无人访问缓存立即过期
    -->
    <defaultCache
            maxElementsInMemory="1000"
            eternal="false"
            timeToIdleSeconds="600"
            timeToLiveSeconds="0"
            overflowToDisk="false">
    </defaultCache>

    <!--
        xx业务缓存
        在有效的 120 秒内，如果连续 60 秒未访问缓存，则缓存失效。
        就算有访问，也只会存活 120 秒。
    -->
    <cache name="myCache"
           maxElementsInMemory="1000"
           eternal="false"
           timeToIdleSeconds="120"
           timeToLiveSeconds="0"
           overflowToDisk="false">
    </cache>
</ehcache>
```

　　先写一个套tb_user表的CRUD代码 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610105640706-1929832599.png)  <br/>

```
@RestController
@RequestMapping("/tbUser/")
public class TbUserController {
    @Autowired
    private TbUserService tbUserService;

    //方便测试暂时改成GetMapping
    @GetMapping("list")
//    @PostMapping("list")
    public List<TbUser> list(TbUser entityVo) {
        return tbUserService.list(entityVo);
    }

    @GetMapping("get/{id}")
    public TbUser get(@PathVariable("id")Integer id) {
        return tbUserService.get(id);
    }

    //方便测试暂时改成GetMapping
    @GetMapping("save")
//    @PostMapping("save")
    public TbUser save(TbUser entityVo) {
        return tbUserService.save(entityVo);
    }

    @GetMapping("delete/{id}")
    public Integer delete( @PathVariable("id") Integer id) {
        return tbUserService.delete(id);
    }
}
```

　　opjo实体类要实现序列化 <br/>

```
@Entity
@Table(name = "tb_user")
@Data
public class TbUser implements Serializable {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;//表id

    private String username;//用户名

    private String password;//密码

    private Date created;//创建时间

    private Integer descriptionId;//关联详情id
}
```

　　serviceImpl中，使用注解来开启缓存 <br/>

```
@Service
@Transactional
@CacheConfig(cacheNames = {"myCache"})
public class TbUserServiceImpl implements TbUserService{

    @PersistenceContext
    private EntityManager em;

    @Autowired
    private TbUserRepository tbUserRepository;

    //@Cacheable缓存数据：key为userList，value为返回值List<TbUser>
    @Cacheable(key = "'userList'")
    @Override
    public List<TbUser> list(TbUser entityVo) {
        System.out.println("获取list用户列表缓存数据,"+new Date());
        return tbUserRepository.findAll(Example.of(entityVo));
    }

    //@Cacheable缓存数据：key为参数id，value为返回值TbUser
    @Cacheable(key = "#id")
    @Override
    public TbUser get(Integer id) {
        System.out.println("获取数据缓存，key:"+id);
        Optional<TbUser> optionalE = tbUserRepository.findById(id);
        if (!optionalE.isPresent()) {
            throw new RuntimeException("ID不存在！");
        }
        return optionalE.get();
    }

    //@CachePut缓存新增的或更新的数据到缓存，其中缓存的名称为people，数据的key是person的id
    @CachePut(key = "#entityVo.id")
    // @CacheEvict从缓存中删除key为参数userList的数据
    @CacheEvict(key = "'userList'")
    @Override
    public TbUser save(TbUser entityVo) {
        System.out.println("新增/更新缓存，key:"+entityVo.getId());
        //entityVo传啥存啥，会全部更新
        return tbUserRepository.save(entityVo);
    }

    //清空所有缓存
    @CacheEvict(allEntries=true)
    @Override
    public Integer delete(Integer id) {
        System.out.println("清空所有缓存");
        tbUserRepository.deleteById(id);
        return id;
    }
}
```



## 　　效果演示 <br/>

　　http://localhost:10010/tbUser/save?id=2&username=李四 <br/>

　　调用save方法，key为2，value为当前tbUser对象的数据被缓存下来 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112152413-51371087.png)  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112200532-1643838613.png)  <br/>





　　http://localhost:10010/tbUser/get/2 <br/>

　　当我们调用get方法时，直接获取缓存数据，控制台啥也不打印，连serviceImpl的get方法都不进去（可以打断点调试） <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112241777-126488047.png)  <br/>





![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112254163-66004519.png)  <br/>









　　http://localhost:10010/tbUser/save?id=2&username=王五 <br/>

　　当我们再次调用save方法更新username时，缓存数据也被更新 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112357355-2076677085.png)  <br/>





![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112410629-420420578.png)  <br/>









　　http://localhost:10010/tbUser/get/2 <br/>

　　再次调用get接口，直接返回缓存数据，后台也是方法都不进去，啥也不打印 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112447468-1800644512.png)  <br/>



![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112454334-1032938027.png)  <br/>







　　http://localhost:10010/tbUser/delete/2 <br/>

　　调用delete接口，删除数据，同时删除缓存 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112731910-70468409.png)  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112742587-1680383706.png)  <br/>



　　再次调用get接口，发现缓存数据被清除，查询数据库 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112843605-1341240015.png)  <br/>



 　　http://localhost:10010/tbUser/list <br/>

　　首次调用list接口，key为userList的，value为用户集合数据被缓存下来，再次调用直接返回缓存数据 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112613069-1833905380.png)  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112619117-847027139.png)  <br/>





 　　当调用save接口，数据更新，删除key为userList的缓存，再次调用list时，重新查库并设置缓存 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610112638828-667460145.png)  <br/>







　　我们配置了缓存发呆时间，当120秒内未使用该缓存，立即过期，一直用就会一直存在 <br/>

　　我们先同时访问两个接口list、get，list接口2分钟后再次访问，get接口不能超过2分钟是不是访问一下，结果如预期 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202106/1353055-20210610153811048-1393976653.png)  <br/>



 　　PS：原先使用了这个jar包，有报错 <br/>

```
    <dependency>
      <groupId>org.ehcache</groupId>
      <artifactId>ehcache</artifactId>
      <version>3.8.1</version>
    </dependency> 
```

　　后面改成用上面“代码编写”里pom中引的jnet.sf.ehcache下面的ar <br/>



## 　　后记 <br/>

　　缓存除了能缓解数据库压力，还能做用户登录状态控制，例如：用户登录成功后cookie中保存颁发的token令牌设置永不过期，缓存存活时间也设置永不过期，发呆时间设置1天，这样只有用户在1天内有访问缓存接口，那他就可以一直保留登录状态，直至有其他业务将token或者缓存清掉。 <br/>

　　springboot使用cache缓存暂时先记录到这，后续有空再进行补充。 <br/>



## 　　代码开源 <br/>



　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>




