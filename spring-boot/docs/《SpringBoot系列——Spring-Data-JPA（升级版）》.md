
## 　　前言 <br/>

　　在上篇博客中：SpringBoot系列——Spring-Data-JPA：[https://www.cnblogs.com/huanzi-qch/p/9970545.html](https://www.cnblogs.com/huanzi-qch/p/9970545.html)，我们实现了单表的基础get、save（插入/更新）、list、page、delete接口，但是这样每个单表都要写着一套代码，重复而繁杂，那能不能写成一套通用common代码，每个单表去继承从而实现这套基础接口呢？同时，我们应该用Vo去接收、传输数据，实体负责与数据库表映射。 <br/>



## 　　common代码 <br/>

　　Vo与实体转换，逻辑更清晰，注释健全，类名不重要（因为后面我们进行了改名，之前叫FastCopy，现在改成了CopyUtil），重点关注copy方法 <br/>

```
package cn.huanzi.qch.springbootjpa.util;

import org.apache.commons.beanutils.BeanMap;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import java.util.ArrayList;
import java.util.List;

/**
 * 实体转换工具
 */
public class CopyUtil {

    /**
     * 类型转换：实体Vo <->实体  例如：UserVo <-> User
     * 支持一级复杂对象复制
     */
    public static <T> T copy(Object src, Class<T> targetType) {
        T target = null;
        try {
            //创建一个空目标对象，并获取一个BeanWrapper代理器，用于属性填充，BeanWrapperImpl在内部使用Spring的BeanUtils工具类对Bean进行反射操作，设置属性。
            target = targetType.newInstance();
            BeanWrapper targetBean = new BeanWrapperImpl(target);

            //获取源对象的BeanMap，属性和属性值直接转换为Map的key-value 形式
            BeanMap srcBean = new BeanMap(src);
            for (Object key : srcBean.keySet()) {
                //源对象属性名称
                String srcPropertyName = key + "";
                //源对象属性值
                Object srcPropertyVal = srcBean.get(key);
                //源对象属性类型
                Class srcPropertyType = srcBean.getType(srcPropertyName);
                //目标对象属性类型
                Class targetPropertyType = targetBean.getPropertyType(srcPropertyName);

                //源对象属性值非空判断、目标对象属性类型非空判断，如果为空跳出，继续操作下一个属性
                if ("class".equals(srcPropertyName) || targetPropertyType == null) {
                    continue;
                }

                //类型相等，可直接设置值，比如：String与String 或者 User与User
                if (srcPropertyType == targetPropertyType) {
                    targetBean.setPropertyValue(srcPropertyName, srcPropertyVal);
                }
                //类型不相等，比如：User与UserVo
                else {
                    /*     下面的步骤与上面的步骤基本一致      */

                    //如果源复杂对象为null，直接跳过，不需要复制
                    if(srcPropertyVal == null){
                        continue;
                    }

                    Object targetPropertyVal = targetPropertyType.newInstance();
                    BeanWrapper targetPropertyBean = new BeanWrapperImpl(targetPropertyVal);

                    BeanMap srcPropertyBean = new BeanMap(srcPropertyVal);
                    for (Object srcPropertyBeanKey : srcPropertyBean.keySet()) {
                        String srcPropertyBeanPropertyName = srcPropertyBeanKey + "";
                        Object srcPropertyBeanPropertyVal = srcPropertyBean.get(srcPropertyBeanKey);
                        Class srcPropertyBeanPropertyType = srcPropertyBean.getType(srcPropertyBeanPropertyName);
                        Class targetPropertyBeanPropertyType = targetPropertyBean.getPropertyType(srcPropertyBeanPropertyName);

                        if ("class".equals(srcPropertyBeanPropertyName) || targetPropertyBeanPropertyType == null) {
                            continue;
                        }

                        if (srcPropertyBeanPropertyType == targetPropertyBeanPropertyType) {
                            targetPropertyBean.setPropertyValue(srcPropertyBeanPropertyName, srcPropertyBeanPropertyVal);
                        } else {
                            //复杂对象里面的复杂对象不再进行处理
                        }
                    }
                    //设置目标对象属性值
                    targetBean.setPropertyValue(srcPropertyName, targetPropertyBean.getWrappedInstance());
                }
            }
        } catch (Exception e) {
            //输出到日志文件中
            log.error(ErrorUtil.errorInfoToString(e));
        }
        return target;
    }

    /**
     * 类型转换：实体Vo <->实体  例如：List<UserVo> <-> List<User>
     */

    public static <T> List<T> copyList(List srcList, Class<T> targetType) {
        List<T> newList = new ArrayList<>();
        for (Object entity : srcList) {
            newList.add(copy(entity, targetType));
        }
        return newList;
    }

}
```



　　注：BeanMap类引入的是：org.apache.commons.beanutils.BeanMap; <br/>

　　引入这两个jar <br/>

```
        <!-- Vo与实体的转换工具类需要用到 -->
        <dependency>
            <groupId>commons-beanutils</groupId>
            <artifactId>commons-beanutils</artifactId>
            <version>1.8.0</version>
        </dependency>
        <dependency>
            <groupId>commons-collections</groupId>
            <artifactId>commons-collections</artifactId>
            <version>3.2.2</version>
        </dependency>
```



　　<span style="color: rgba(255, 0, 0, 1)">  　　2020-10-16更新</span> <br/>

　　优化了copy方法，支持多层复杂对象复制，同时新增 Object[]转Vo方法 <br/>

```
package cn.huanzi.qch.baseadmin.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.beanutils.BeanMap;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * 实体转换工具
 */
@Slf4j
public class CopyUtil {

    /**
     * 类型转换：实体Vo <->实体  例如：UserVo <-> User
     * 默认支持1层复杂对象复制
     */
    public static <T> T copy(Object src, Class<T> targetType) {
        return CopyUtil.copy(src,targetType,1);
    }

    /**
     * 同上，支持count多层复杂对象复制
     */
    public static <T> T copy(Object src, Class<T> targetType,Integer count) {
        //执行一层，自减1
        count--;

        T target = null;
        try {
            //创建一个空目标对象，并获取一个BeanWrapper代理器，用于属性填充，BeanWrapperImpl在内部使用Spring的BeanUtils工具类对Bean进行反射操作，设置属性。
            target = targetType.newInstance();
            BeanWrapper targetBean = new BeanWrapperImpl(target);

            //获取源对象的BeanMap，属性和属性值直接转换为Map的key-value 形式
            BeanMap srcBean = new BeanMap(src);
            for (Object key : srcBean.keySet()) {
                //源对象属性名称
                String srcPropertyName = key + "";
                //源对象属性值
                Object srcPropertyVal = srcBean.get(key);
                //源对象属性类型
                Class srcPropertyType = srcBean.getType(srcPropertyName);
                //目标对象属性类型
                Class targetPropertyType = targetBean.getPropertyType(srcPropertyName);

                //源对象属性值非空判断、目标对象属性类型非空判断，如果为空跳出，继续操作下一个属性
                if ("class".equals(srcPropertyName) || targetPropertyType == null) {
                    continue;
                }

                //类型相等，可直接设置值，比如：String与String 或者 User与User
                if (srcPropertyType == targetPropertyType) {
                    targetBean.setPropertyValue(srcPropertyName, srcPropertyVal);
                }
                //类型不相等，比如：User与UserVo
                else {
                    //满足条件，跳出递归
                    if(count <= -1){
                        return target;
                    }

                    //如果源复杂对象为null，直接跳过，不需要复制
                    if(srcPropertyVal == null){
                        continue;
                    }

                    //设置目标对象属性值
                    targetBean.setPropertyValue(srcPropertyName, CopyUtil.copy(srcPropertyVal, targetPropertyType, count));
                }
            }
        } catch (Exception e) {
            //输出到日志文件中
            log.error(ErrorUtil.errorInfoToString(e));
        }
        return target;
    }

    /**
     * 类型转换：实体Vo <->实体  例如：List<UserVo> <-> List<User>
     */
    public static <T> List<T> copyList(List srcList, Class<T> targetType) {
        List<T> newList = new ArrayList<>();
        for (Object src : srcList) {
            newList.add(CopyUtil.copy(src, targetType));
        }
        return newList;
    }

    /**
     * 类型转换：Object[]转Vo
     * 当使用自定义SQL查询，查询字段跟实体对应不上时，可以使用Object[]接值
     * em.createNativeQuery(sql.toString())，第二个参数不传时，默认就是用Object[]来接值
     * 因为是Object[]转Vo，是按顺序来取值、设置，所有要求两边的字段、属性顺序要一一对应
     */
    public static <T> T copyByObject(Object[] src, Class<T> targetType){
        T targetVo = null;
        try {
            //遍历Object[]转换为Field[]
            targetVo  = targetType.newInstance();
            Field[] fields = targetType.getDeclaredFields();
            int length = src.length < fields.length ? src.length : fields.length;
            for (int i = 0; i < length; i++) {
                Field field = fields[i];
                Object fieldVal = src[i];
                if (fieldVal instanceof Character || fieldVal instanceof BigDecimal) {
                    fieldVal = String.valueOf(fieldVal);
                }

                field.setAccessible(true);//获取授权
                field.set(targetVo, fieldVal);//赋值
            }
        } catch (InstantiationException | IllegalAccessException e) {
            ErrorUtil.errorInfoToString(e);
        }
        return targetVo;
    }

    /**
     * 类型转换：List<Object[]>转List<Vo>
     */
    public static <T> List<T> copyListByObject(List<Object[]> srcList, Class<T> targetType) {
        List<T> newList = new ArrayList<>();
        if (srcList != null) {
            for (Object[] src : srcList) {
                newList.add(CopyUtil.copyByObject(src,targetType));
            }
        }
        return newList;
    }
}
```





　　通用service、repository <br/>

```
/**
 * 通用Service
 *
 * @param <V> 实体类Vo
 * @param <E> 实体类
 * @param <T> id主键类型
 */
public interface CommonService<V, E,T> {

    Result<PageInfo<V>> page(V entityVo);

    Result<List<V>> list(V entityVo);

    Result<V> get(T id);

    Result<V> save(V entityVo);

    Result<T> delete(T id);
}
```

```
/**
 * 通用Service实现类
 *
 * @param <V> 实体类Vo
 * @param <E> 实体类
 * @param <T> id主键类型
 */
public class CommonServiceImpl<V, E, T> implements CommonService<V, E, T> {

    private Class<V> entityVoClass;//实体类Vo

    private Class<E> entityClass;//实体类

    @Autowired
    private CommonRepository<E, T> commonRepository;//注入实体类仓库

    public CommonServiceImpl() {
        Type[] types = ((ParameterizedType) this.getClass().getGenericSuperclass()).getActualTypeArguments();
        this.entityVoClass = (Class<V>) types[0];
        this.entityClass = (Class<E>) types[1];
    }

    @Override
    public Result<PageInfo<V>> page(V entityVo) {
        //实体类缺失分页信息
        if (!(entityVo instanceof PageCondition)) {
            throw new RuntimeException("实体类" + entityVoClass.getName() + "未继承PageCondition。");
        }
        PageCondition pageCondition = (PageCondition) entityVo;
        Page<E> page = commonRepository.findAll(Example.of(FastCopy.copy(entityVo, entityClass)), pageCondition.getPageable());
        return Result.of(PageInfo.of(page, entityVoClass));
    }

    @Override
    public Result<List<V>> list(V entityVo) {
        List<E> entityList = commonRepository.findAll(Example.of(FastCopy.copy(entityVo, entityClass)));
        List<V> entityModelList = FastCopy.copyList(entityList, entityVoClass);
        return Result.of(entityModelList);
    }

    @Override
    public Result<V> get(T id) {
        Optional<E> optionalE = commonRepository.findById(id);
        if (!optionalE.isPresent()) {
            throw new RuntimeException("ID不存在！");
        }
        return Result.of(FastCopy.copy(optionalE.get(), entityVoClass));
    }

    @Override
    public Result<V> save(V entityVo) {
        E e = commonRepository.save(FastCopy.copy(entityVo, entityClass));
        return Result.of(FastCopy.copy(e, entityVoClass));
    }

    @Override
    public Result<T> delete(T id) {
        commonRepository.deleteById(id);
        return Result.of(id);
    }
}
```

```
/**
 * 通用Repository
 *
 * @param <E> 实体类
 * @param <T> id主键类型
 */
@NoRepositoryBean
public interface CommonRepository<E,T> extends JpaRepository<E,T>, JpaSpecificationExecutor<E> {
}
```

 　　2019-05-13更新 <br/>

　　  jpa实现局部更新 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  注意：  <span style="color: rgba(0, 0, 0, 1)">    jpa原生的save方法，更新的时候是全属性进行updata，如果实体类的属性没有值它会帮你更新成null，如果你想更新部分字段请在通用CommonServiceImpl使用这个save方法，我这里是在调用save之前先查询数据库获取完整对象，将要更新的值复制到最终传入save方法的对象中，从而实现局部更新    <br/>  </span></span> <br/>

 　　另外，直接调用EntityManager的merge，也是传什么就保存什么 <br/>

```
@PersistenceContext
private EntityManager em;

//注意：直接调用EntityManager的merge，传进去的实体字段是什么就保存什么
E e = em.merge(entity);
em.flush();
```



```
    @Override
    public Result<V> save(V entityVo) {
        //传进来的对象（属性可能残缺）
        E entity = CopyUtil.copy(entityVo, entityClass);

        //最终要保存的对象
        E entityFull = entity;

        //为空的属性值，忽略属性，BeanUtils复制的时候用到
        List<String> ignoreProperties = new ArrayList<String>();

        //获取最新数据，解决部分更新时jpa其他字段设置null问题
        try {
            //反射获取Class的属性（Field表示类中的成员变量）
            for (Field field : entity.getClass().getDeclaredFields()) {
                //获取授权
                field.setAccessible(true);
                //属性名称
                String fieldName = field.getName();
                //属性的值
                Object fieldValue = field.get(entity);

                //找出Id主键
                if (field.isAnnotationPresent(Id.class) && !StringUtils.isEmpty(fieldValue)) {
                    Optional<E> one = commonRepository.findById((T) fieldValue);
                    if (one.isPresent()) {
                        entityFull = one.get();
                    }
                }

                //找出值为空的属性，值为空则为忽略属性，或者被NotFound标注，我们复制的时候不进行赋值
                if(null == fieldValue || field.isAnnotationPresent(NotFound.class)){
                    ignoreProperties.add(fieldName);
                }
            }
            /*
                org.springframework.beans BeanUtils.copyProperties(A,B); 是A中的值付给B
                org.apache.commons.beanutils; BeanUtils.copyProperties(A,B);是B中的值付给A
                把entity的值赋给entityFull，第三个参数是忽略属性，表示不进行赋值
             */
            BeanUtils.copyProperties(entity, entityFull, ignoreProperties.toArray(new String[0]));
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }

        E e = commonRepository.save(entityFull);
        return Result.of(CopyUtil.copy(e, entityVoClass));
    }
```



 　　2019-09-18补充：上面的save方法实现了局部更新，也就是每次调用save之前先用id去查库，然后替换传进来的值；本次实现的是，如果是新增，自动添加UUID为主键，同时自动判断createTime，updateTime，也就是说如果前端不传这两个值，后台来维护创建时间、更新时间，当然，这种便利是有前提的，要求实体类的Id属性排在第一位 <br/>

```
    @Override
    public Result<V> save(V entityVo) {
        //传进来的对象（属性可能残缺）
        E entity = CopyUtil.copy(entityVo, entityClass);

        //最终要保存的对象
        E entityFull = entity;

        //为空的属性值，忽略属性，BeanUtils复制的时候用到
        List<String> ignoreProperties = new ArrayList<String>();

        //获取最新数据，解决部分更新时jpa其他字段设置null问题
        try {
            //新增 true，更新 false，要求实体类的Id属性排在第一位，因为for循环读取是按照顺序的
            boolean isInsert = false;

            //反射获取Class的属性（Field表示类中的成员变量）
            for (Field field : entity.getClass().getDeclaredFields()) {
                //获取授权
                field.setAccessible(true);
                //属性名称
                String fieldName = field.getName();
                //属性的值
                Object fieldValue = field.get(entity);

                //找出Id主键
                if (field.isAnnotationPresent(Id.class)) {
                    if(!StringUtils.isEmpty(fieldValue)){
                        //如果Id主键不为空，则为更新
                        Optional<E> one = commonRepository.findById((T) fieldValue);
                        if (one.isPresent()) {
                            entityFull = one.get();
                        }
                    }else{
                        //如果Id主键为空，则为新增
                        fieldValue = UUIDUtil.getUUID();
                        //set方法，第一个参数是对象
                        field.set(entity, fieldValue);
                        isInsert = true;
                    }
                }
                //如果前端不传这两个值，后台来维护创建时间、更新时间
                if(isInsert && "createTime".equals(fieldName) && StringUtils.isEmpty(fieldValue)){
                    //先赋值给fieldValue，以免后续进行copy对象判断属性是否为忽略属性是出错
                    fieldValue = new Date();

                    //set方法，第一个参数是对象
                    field.set(entity, fieldValue);
                }
                if("updateTime".equals(fieldName) && StringUtils.isEmpty(fieldValue)){
                    //先赋值给fieldValue，以免后续进行copy对象判断属性是否为忽略属性是出错
                    fieldValue = new Date();

                    //set方法，第一个参数是对象
                    field.set(entity, fieldValue);
                }

                //找出值为空的属性，值为空则为忽略属性，或者被NotFound标注，我们复制的时候不进行赋值
                if(null == fieldValue || field.isAnnotationPresent(NotFound.class)){
                    ignoreProperties.add(fieldName);
                }
            }
            /*
                org.springframework.beans BeanUtils.copyProperties(A,B); 是A中的值付给B
                org.apache.commons.beanutils; BeanUtils.copyProperties(A,B);是B中的值付给A
                把entity的值赋给entityFull，第三个参数是忽略属性，表示不进行赋值
             */
            BeanUtils.copyProperties(entity, entityFull, ignoreProperties.toArray(new String[0]));
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }

        E e = commonRepository.save(entityFull);
        return Result.of(CopyUtil.copy(e, entityVoClass));
    }
```



 　　需要用到UUID工具类 <br/>

```
import java.util.UUID;

/**
 * UUID工具类
 */
public class UUIDUtil {

    /** 
     * 生成32位UUID编码
     */
    public static String getUUID(){
        return UUID.randomUUID().toString().trim().replaceAll("-", "");
    }
}
```





## 　　单表使用 <br/>

　　单表继承通用代码，实现get、save（插入/更新）、list、page、delete接口 <br/>

　　Vo <br/>

```
/**
 * 用户类Vo
 */
@Data
public class UserVo extends PageCondition implements Serializable {

    private Integer id;

    private String username;

    private String password;

    private Date created;

    private String descriptionId;

    //机架类型信息
    private DescriptionVo description;
}
```

```
/**
 * 用户描述类Vo
 */
@Data
public class DescriptionVo implements Serializable {
    private Integer id;

    private String userId;

    private String description;
}
```



　　controller、service、repository <br/>

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

    /*
        CRUD、分页、排序
     */

    @RequestMapping("page")
    public Result<PageInfo<UserVo>> page(UserVo entityVo) {
        return userService.page(entityVo);
    }

    @RequestMapping("list")
    public Result<List<UserVo>> list(UserVo entityVo) {
        return userService.list(entityVo);
    }

    @RequestMapping("get/{id}")
    public Result<UserVo> get(@PathVariable("id") Integer id) {
        return userService.get(id);
    }

    @RequestMapping("save")
    public Result<UserVo> save(UserVo entityVo) {
        return userService.save(entityVo);
    }

    @RequestMapping("delete/{id}")
    public Result<Integer> delete(@PathVariable("id") Integer id) {
        return userService.delete(id);
    }
}
```

```
public interface UserService extends CommonService<UserVo, User,Integer>{

    Result getAllUser();
}
```

```
@Service@Transactional
public class UserServiceImpl extends CommonServiceImpl<UserVo, User,Integer> implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public Result getAllUser() {
        List<User> userList = userRepository.getAllUser();
        if(userList != null && userList.size()>0){
            ArrayList<UserVo> userVos = new ArrayList<>();
            for(User user : userList){
                userVos.add(FastCopy.copy(user, UserVo.class));
            }
            return Result.of(userVos);
        }else {
            return Result.of(userList,false,"获取失败！");
        }
    }
}
```

```
@Repository
public interface UserRepository extends CommonRepository<User, Integer> {

    @Query(value = "from User") //HQL
//    @Query(value = "select * from tb_user",nativeQuery = true)//原生SQL
    List<User> getAllUser();

}
```



　　经测试，所有的接口都可以使用，数据传输正常，因为传输的Vo，分页信息跟杂七杂八的字段、数据都在Vo，所有看起来会比较杂。更新接口依旧跟上一篇的一样，接收到的是什么就保存什么。 <br/>



## 　　后记 <br/>

　　单表的增删改查接口，直接继承这一套通用代码即可实现，无需再重复编写，大大提升开发效率。 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


