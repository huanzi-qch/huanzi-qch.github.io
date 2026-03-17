
## 　　前言 <br/>

　　项目中虽然有ORM映射框架来帮我们拼写SQL，简化开发过程，降低开发难度。但难免会出现需要自己拼写SQL的情况，这里分享一个利用反射跟自定义注解拼接实体对象的查询SQL的方法。 <br/>



## 　　代码 <br/>

　　自定义注解： <br/>

```
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Like {

}

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Between {

    /**
     * 最小值的实体属性名
     */
    String min();

    /**
     * 最大值的实体属性名
     */
    String max();
}

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface In {

    /**
     * in的具体集合的属性名
     */
    String values();
}
```



　　实体对象： <br/>

```
@Data
@Entity
@Table(name = "RES_LOG")
public class ResLog {
    @Id
    private String logId;
    private String resourceType;
    private String resourceId;
    @Like //开启模糊查询
    private String resourceName;
    private String resourceCode;
    @In(values = "operationTypeList")//in查询
    private String operationType;
    @Between(min = "operationTimeStart", max = "operationTimeEnd")//开启区间查询
    private Date operationTime;
    private String operatorId;
    private String operator;

    @Transient
    private Date operationTimeStart;
    @Transient
    private Date operationTimeEnd;
    @Transient
    private List<String> operationTypeList;

}
```



　　拼接SQL方法： <br/>

```
/**
 * 自动拼接原生SQL的“and”查询条件,支持自定义注解：@Like @Between @In
 *
 * @param entity           实体对象
 * @param sql              待拼接SQL
 * @param ignoreProperties 忽略属性
 */
public static void appendQueryColumns(Object entity, StringBuilder sql, String... ignoreProperties) {

    try {
        //忽略属性
        List<String> ignoreList1 = Arrays.asList(ignoreProperties);
        //默认忽略分页参数
        List<String> ignoreList2 = Arrays.asList("class", "pageable", "page", "rows", "sidx", "sord");
   
        //反射获取Class的属性（Field表示类中的成员变量）
        for (Field field : entity.getClass().getDeclaredFields()) {
            //获取授权
            field.setAccessible(true);
            //属性名称
            String fieldName = field.getName();
            //属性的值
            Object fieldValue = field.get(entity);
            //检查Transient注解，是否忽略拼接
            if (!field.isAnnotationPresent(Transient.class)) {
                String column = new PropertyNamingStrategy.SnakeCaseStrategy().translate(fieldName).toLowerCase();
                //值是否为空
                if (!StringUtils.isEmpty(fieldValue)) {
                    //映射关系：对象属性(驼峰)->数据库字段(下划线)
                    if (!ignoreList1.contains(fieldName) && !ignoreList2.contains(fieldName)) {
                        //开启模糊查询
                        if (field.isAnnotationPresent(Like.class)) {
                            sql.append(" and " + column + " like '%" + escapeSql(fieldValue) + "%'");
                        }
                        //开启等值查询
                        else {
                            sql.append(" and " + column + " = '" + escapeSql(fieldValue) + "'");
                        }
                    }
                } else {
                    //开启区间查询
                    if (field.isAnnotationPresent(Between.class)) {
                        //获取最小值
                        Field minField = entity.getClass().getDeclaredField(field.getAnnotation(Between.class).min());
                        minField.setAccessible(true);
                        Object minVal = minField.get(entity);
                        //获取最大值
                        Field maxField = entity.getClass().getDeclaredField(field.getAnnotation(Between.class).max());
                        maxField.setAccessible(true);
                        Object maxVal = maxField.get(entity);
                        //开启区间查询
                        if (field.getType().getName().equals("java.util.Date")) {
                            if (!StringUtils.isEmpty(minVal)) {
                                sql.append(" and " + column + " > to_date( '" + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format((Date) minVal) + "','yyyy-mm-dd hh24:mi:ss')");
                            }
                            if (!StringUtils.isEmpty(maxVal)) {
                                sql.append(" and " + column + " < to_date( '" + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format((Date) maxVal) + "','yyyy-mm-dd hh24:mi:ss')");
                            }
                        }
                    }
                    
                    //开启in查询
                    if (field.isAnnotationPresent(In.class)) {
                        //获取要in的值
                        Field values = entity.getClass().getDeclaredField(field.getAnnotation(In.class).values());
                        values.setAccessible(true);
                        List<String> valuesList = (List<String>) values.get(entity);
                        if (valuesList != null && valuesList.size() > 0) {
                            String inValues = "";
                            for (String value : valuesList) {
                                inValues = inValues + "'" + value + "'";
                            }
                            sql.append(" and " + column + " in (" + escapeSql(inValues) + ")");
                        }
                    }
                }
            }
        }
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```



　　2019-10-24补充：注意！我们这属于动态拼写SQL，需要进行转义防范SQL注入！ <br/>

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



## 　　测试与效果 <br/>

```
public static void main(String[] args) {
    ResLog resLog = new ResLog();
    resLog.setLogId("id1");//等值查询
    resLog.setResourceName("name1");//like查询
    resLog.setOperationTimeStart(new Date());//日期区间查询
    resLog.setOperationTimeEnd(new Date());
    ArrayList<String> list = new ArrayList<>();
    list.add("type1");
    list.add("type2");
    resLog.setOperationTypeList(list);//in查询
    //在外面拼写select * from 是为了多表联查时的情况
    StringBuilder sql = new StringBuilder("select * from res_log where '1' = '1'");
    appendQueryColumns(resLog,sql);
    System.out.println(sql.toString());
}
```



　　拼接结果： <br/>

```
select *
  from res_log
 where '1' = '1'
   and log_id = 'id1'
   and resource_name like '%name1%'
   and operation_type in ('type1''type2')
   and operation_time >
       to_date('2018-10-08 15:00:40', 'yyyy-mm-dd hh24:mi:ss')
   and operation_time <
       to_date('2018-10-08 15:00:40', 'yyyy-mm-dd hh24:mi:ss')
```



## 　　后记 <br/>

　　甚至我们可以直接获取实体对象对应的表名，直接在方法里面拼出 select * from ，这样就不需要在外面拼接这一句 <br/>

```
//获取实体对象对应的表名
String TableName = entity.getClass().getAnnotation(Table.class).name();
System.out.println(TableName);
```

 　　为了优化SQL，一般我们不建议select * from，而是需要查询那些字段就拼出那些字段，例如：select log_id from <br/>

　　但是如果数据表有一百个字段呢？一个个手动拼接就太傻了，因此写了一个自动拼接字段的方法，支持配置忽略拼接的字段 <br/>

```
    /**
     *
     * @param entity 实体对象
     * @param ignoreProperties 动态参数  忽略拼接的字段
     * @return sql
     */
    public static StringBuilder appendFields(Object entity, String... ignoreProperties) {
        StringBuilder sql = new StringBuilder();
        List<String> ignoreList = Arrays.asList(ignoreProperties);
        try {
            sql.append("select ");

            for (Field field : entity.getClass().getDeclaredFields()) {
                //获取授权
                field.setAccessible(true);
                String fieldName = field.getName();//属性名称
                Object fieldValue = field.get(entity);//属性的值
                //非临时字段、非忽略字段
                if (!field.isAnnotationPresent(Transient.class) && !ignoreList.contains(fieldName)) {
                    //拼接查询字段  驼峰属性转下划线
                    sql.append(new PropertyNamingStrategy.SnakeCaseStrategy().translate(fieldName).toLowerCase()).append(" ").append(",");
                }
            }
            //处理逗号（删除最后一个字符）
            sql.deleteCharAt(sql.length() - 1);

            String tableName = entity.getClass().getAnnotation(Table.class).name();
            sql.append("from ").append(tableName).append(" where '1' = '1' ");
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
        return sql;
    }
```

　　接着上面的main测试 <br/>

```
public static void main(String[] args) {
    ResLog resLog = new ResLog();
    resLog.setLogId("id1");//等值查询
    resLog.setResourceName("name1");//like查询
    resLog.setOperationTimeStart(new Date());//日期区间查询
    resLog.setOperationTimeEnd(new Date());
    ArrayList<String> list = new ArrayList<>();
    list.add("type1");
    list.add("type2");
    resLog.setOperationTypeList(list);//in查询
    //动态拼接查询字段
    StringBuilder sql = appendFields(resLog,"remark","operator");
    appendQueryColumns(resLog,sql);
    System.out.println(sql.toString());
}
```

　　结果 <br/>

```
select log_id,
       resource_type,
       resource_id,
       resource_name,
       resource_code,
       operation_type,
       operation_time,
       operator_id
  from RES_LOG
 where '1' = '1'
   and log_id = 'id1'
   and resource_name like '%name1%'
   and operation_type in ('type1''type2')
   and operation_time >
       to_date('2018-12-13 10:34:33', 'yyyy-MM-dd hh24:mi:ss')
   and operation_time <
       to_date('2018-12-13 10:34:33', 'yyyy-MM-dd hh24:mi:ss')
```





## 　　更新 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  　　2020-10-10更新</span> <br/>

　　在之前的操作中，我们直接在与数据表映射的entity实体类中使用自定义注解，实体类负责与数据表进行映射，具有共有属性，不应该被业务污染，而实体类对应Vo类负责接参、传参等传输数据的责任，不同的业务冲突时可以创建多个Vo类来解决，正合适我们使用自定义注解来拼接SQL，因此，改成在Vo类中使用我们的自定义注解 <br/>



　　首先，SqlUtil类需要进行一些调整，主要是对appendQueryColumns方法的调整，同时新增了一个拼写全部SQL的聚合方法joinSqlByEntityAndVo <br/>

```
package cn.huanzi.qch.baseadmin.util;

import cn.huanzi.qch.baseadmin.annotation.Between;
import cn.huanzi.qch.baseadmin.annotation.In;
import cn.huanzi.qch.baseadmin.annotation.Like;
import cn.huanzi.qch.baseadmin.common.pojo.PageCondition;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.annotation.Transient;
import org.springframework.util.StringUtils;

import javax.persistence.Table;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Field;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * 拼接SQL工具类
 * 详情请阅读博客：https://www.cnblogs.com/huanzi-qch/p/9754846.html
 */
@Slf4j
public class SqlUtil {

    /**
     * 日期转换格式
     */
    private static SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    /**
     * 数据库驱动类，用于判断数据库类型
     * MySQL：com.mysql.cj.jdbc.driver（默认）
     * postgresql：org.postgresql.driver
     * Oracle：oracle.jdbc.oracledriver
     */
    @Value("${string.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private static String sqlType;

    /**
     * 根据实体、Vo直接拼接全部SQL
     * @param entityClass 实体类
     * @param entityVo    继承了PageCondition分页条件的Vo类
     * @return sql
     */
    public static StringBuilder joinSqlByEntityAndVo(Class<?> entityClass,Object entityVo){
        //select 所有字段 from table
        StringBuilder sql = SqlUtil.appendFields(entityClass);

        //拼接查询字段
        SqlUtil.appendQueryColumns(entityClass,entityVo,sql);

        //拼接排序字段
        SqlUtil.orderByColumn((PageCondition)entityVo,sql);

        return sql;
    }

    /**
     * 自动拼接原生SQL的“and”查询条件,
     * 支持自定义注解，注解改成打在vo类中，不应该破坏公用的entity实体映射类：@Like @Between @In
     *
     * @param entityClass      实体类
     * @param entityVo         继承了PageCondition分页条件的Vo类
     * @param sql              待拼接SQL
     * @param ignoreProperties 忽略属性
     */
    public static void appendQueryColumns(Class<?> entityClass, Object entityVo, StringBuilder sql, String... ignoreProperties) {
        try {

            List<String> ignoreList1 = Arrays.asList(ignoreProperties);
            //默认忽略分页参数
            List<String> ignoreList2 = Arrays.asList("class", "pageable", "page", "rows", "sidx", "sord");

            //反射获取Class的属性（Field表示类中的成员变量）
            Class<?> entityVoClass = entityVo.getClass();

            //可以直接传进来，也可以根据entityVoClass来创建entityClass，如果选择动态拼接，对命名规则有一定要求
//            Class<?> entityClass = Class.forName(entityVoClass.getName().replaceFirst("Vo",""));

            for (Field field : entityVoClass.getDeclaredFields()) {
                //获取授权
                field.setAccessible(true);
                //属性名称
                String fieldName = field.getName();
                //属性的值
                Object fieldValue = field.get(entityVo);

                //检查entity中是否也存在该字段，如果没有，直接跳过
                try {
                    entityClass.getDeclaredField(fieldName);
                }catch (NoSuchFieldException e){
                    log.debug("entity中没有这个字段，拼接查询SQL直接跳过：" + e.getMessage());
                    continue;
                }

                String column = SqlUtil.translate(fieldName);

                //值是否为空
                if (!StringUtils.isEmpty(fieldValue)) {
                    //映射关系：对象属性(驼峰)->数据库字段(下划线)
                    if (!ignoreList1.contains(fieldName) && !ignoreList2.contains(fieldName)) {
                        //开启模糊查询
                        if (field.isAnnotationPresent(Like.class)) {
                            sql.append(" and ").append(column).append(" like '%").append(SqlUtil.escapeSql((String) fieldValue)).append("%'");
                        }
                        //开启等值查询
                        else {
                            sql.append(" and ").append(column).append(" = '").append(SqlUtil.escapeSql((String) fieldValue)).append("'");
                        }
                    }
                } else {
                    //开启区间查询
                    if (field.isAnnotationPresent(Between.class)) {
                        //获取最小值
                        Field minField = entityVoClass.getDeclaredField(field.getAnnotation(Between.class).min());
                        minField.setAccessible(true);
                        Object minVal = minField.get(entityVo);
                        //获取最大值
                        Field maxField = entityVoClass.getDeclaredField(field.getAnnotation(Between.class).max());
                        maxField.setAccessible(true);
                        Object maxVal = maxField.get(entityVo);
                        //开启区间查询，需要使用对应的函数
                        if (field.getType().getName().equals("java.util.Date")) {
                            //MySQL
                            if(sqlType.toLowerCase().contains("com.mysql.cj.jdbc.driver")){
                                if (!StringUtils.isEmpty(minVal)) {
                                    sql.append(" and ").append(column).append(" > str_to_date( '").append(simpleDateFormat.format((Date) minVal)).append("','%Y-%m-%d %H:%i:%s')");
                                }
                                if (!StringUtils.isEmpty(maxVal)) {
                                    sql.append(" and ").append(column).append(" < str_to_date( '").append(simpleDateFormat.format((Date) maxVal)).append("','%Y-%m-%d %H:%i:%s')");
                                }
                            }
                            //postgresql
                            if(sqlType.toLowerCase().contains("org.postgresql.driver")){
                                if (!StringUtils.isEmpty(minVal)) {
                                    sql.append(" and ").append(column).append(" > cast('").append(simpleDateFormat.format((Date) minVal)).append("' as timestamp)");
                                }
                                if (!StringUtils.isEmpty(maxVal)) {
                                    sql.append(" and ").append(column).append(" < cast('").append(simpleDateFormat.format((Date) maxVal)).append("' as timestamp)");
                                }
                            }
                            //Oracle
                            if(sqlType.toLowerCase().contains("oracle.jdbc.oracledriver")){
                                if (!StringUtils.isEmpty(minVal)) {
                                    sql.append(" and ").append(column).append(" > to_date( '").append(simpleDateFormat.format((Date) minVal)).append("','yyyy-mm-dd hh24:mi:ss')");
                                }
                                if (!StringUtils.isEmpty(maxVal)) {
                                    sql.append(" and ").append(column).append(" < to_date( '").append(simpleDateFormat.format((Date) maxVal)).append("','yyyy-mm-dd hh24:mi:ss')");
                                }
                            }
                        }
                    }

                    //开启in查询
                    if (field.isAnnotationPresent(In.class)) {
                        //获取要in的值
                        Field values = entityVoClass.getDeclaredField(field.getAnnotation(In.class).values());
                        values.setAccessible(true);
                        List<String> valuesList = (List<String>) values.get(entityVo);
                        if (valuesList != null && valuesList.size() > 0) {
                            StringBuilder inValues = new StringBuilder();
                            for (int i = 0; i < valuesList.size(); i++) {
                                inValues.append("'").append(SqlUtil.escapeSql(valuesList.get(i))).append("'");
                                if(i < valuesList.size()-1){
                                    inValues.append(",");
                                }
                            }

                            sql.append(" and ").append(column).append(" in (").append(inValues).append(")");
                        }
                    }
                }
            }
        } catch (Exception e) {
            //输出到日志文件中
            log.error(ErrorUtil.errorInfoToString(e));
        }
    }

    /**
     *
     * @param entityClass 自动拼接实体类
     * @param ignoreProperties 动态参数  忽略拼接的字段
     * @return sql
     */
    public static StringBuilder appendFields(Class<?> entityClass, String... ignoreProperties) {
        StringBuilder sql = new StringBuilder();
        List<String> ignoreList = Arrays.asList(ignoreProperties);
        sql.append("select ");

        for (Field field : entityClass.getDeclaredFields()) {
            //获取授权
            field.setAccessible(true);
            String fieldName = field.getName();//属性名称

            //非临时字段、非忽略字段
            if (!field.isAnnotationPresent(Transient.class) && !ignoreList.contains(fieldName)) {
                //拼接查询字段  驼峰属性转下划线
                sql.append(SqlUtil.translate(fieldName)).append(" ").append(",");
            }
        }
        //处理逗号（删除最后一个字符）
        sql.deleteCharAt(sql.length() - 1);

        String tableName = entityClass.getAnnotation(Table.class).name();
        sql.append("from ").append(tableName).append(" where '1' = '1' ");
        return sql;
    }

    /**
     * 拼接排序SQL
     *
     * @param pageCondition 继承了PageCondition分页条件的Vo类
     * @param sql    待拼接的SQL
     */
    public static void orderByColumn(PageCondition pageCondition, StringBuilder sql) {
        String sidx = pageCondition.getSidx();
        String sord = pageCondition.getSord();

        if (!StringUtils.isEmpty(sidx)) {
            //1.获取Bean
            BeanWrapper srcBean = new BeanWrapperImpl(pageCondition);
            //2.获取Bean的属性描述
            PropertyDescriptor[] pds = srcBean.getPropertyDescriptors();
            //3.获取符合的排序字段名
            for (PropertyDescriptor p : pds) {
                String propertyName = p.getName();
                if (sidx.equals(propertyName)) {
                    sql.append(" order by ").append(translate(sidx)).append("desc".equalsIgnoreCase(sord) ? " desc" : " asc");
                }
            }
        }
    }

    /**
     * 实体属性转表字段，驼峰属性转下划线，并全部转小写
     */
    private static String translate(String fieldName){
        return new PropertyNamingStrategy.SnakeCaseStrategy().translate(fieldName).toLowerCase();
    }

    /**
     * sql转义
     * 动态拼写SQL，需要进行转义防范SQL注入！
     */
    private static String escapeSql(String str) {
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
}
```



　　<span style="color: rgba(255, 0, 0, 1)">  SysUserVo.java</span> <br/>

　　entity，负责与数据表进行映射，具有共有属性，不应该被业务污染 <br/>

```
@Entity
@Table(name = "sys_user")
@Data
public class SysUser implements Serializable {
    @Id
    private String userId;//用户id

    private String loginName;//登录名

    private String userName;//用户名称

    private String password;//登录密码

    private String valid;//软删除标识，Y/N

    private String limitedIp;//限制允许登录的IP集合

    private Date expiredTime;//账号失效时间，超过时间将不能登录系统

    private Date lastChangePwdTime;//最近修改密码时间，超出时间间隔，提示用户修改密码

    private String limitMultiLogin;//是否允许账号同一个时刻多人在线，Y/N

    private Date createTime;//创建时间

    private Date updateTime;//修改时间

}
```



　　vo，负责传输数据，如接参、传参，当一个vo不满足多个业务需求时，可以新建多个vo类 <br/>

```
@Data
public class SysUserVo extends PageCondition implements Serializable {

    @In(values = "userIdList")//in查询
    private String userId;//用户id

    @Like
    private String loginName;//登录名

    private String userName;//用户名称

    private String password;//登录密码

    private String valid;//软删除标识，Y/N

    private String limitedIp;//限制允许登录的IP集合

    private Date expiredTime;//账号失效时间，超过时间将不能登录系统

    private Date lastChangePwdTime;//最近修改密码时间，超出时间间隔，提示用户修改密码

    private String limitMultiLogin;//是否允许账号同一个时刻多人在线，Y/N

    @Between(min = "createTimeStart", max = "createTimeEnd")//开启区间查询
    private Date createTime;//创建时间

    private Date updateTime;//修改时间

    private String oldPassword;//修改密码时输入的旧密码

    private String newPassword;//修改密码时输入的新密码

    private Date createTimeStart;
    private Date createTimeEnd;
    private List<String> userIdList;
}
```



　　main测试 <br/>

```
    public static void main(String[] args) {
        SqlUtil.sqlType = "com.mysql.cj.jdbc.Driver";
        SysUserVo sysUserVo = new SysUserVo();
        //like查询
        sysUserVo.setLoginName("张三");

        //日期区域查询
        sysUserVo.setCreateTimeStart(new Date());
        sysUserVo.setCreateTimeEnd(new Date());

        //in查询
        ArrayList<String> userIds = new ArrayList<>();
        userIds.add("1");
        userIds.add("2");
        sysUserVo.setUserIdList(userIds);

        //排序  asc desc
        sysUserVo.setSidx("createTime");
        sysUserVo.setSord("desc");

        //根据实体、Vo直接拼接全部SQL
        StringBuilder sql = SqlUtil.joinSqlByEntityAndVo(SysUser.class,sysUserVo);
        System.out.println(sql.toString());
    }
```



　　结果 <br/>

```
15:10:21.457 [main] DEBUG cn.huanzi.qch.baseadmin.util.SqlUtil - entity中没有这个字段，拼接查询SQL直接跳过：oldPassword
15:10:21.467 [main] DEBUG cn.huanzi.qch.baseadmin.util.SqlUtil - entity中没有这个字段，拼接查询SQL直接跳过：newPassword
15:10:21.467 [main] DEBUG cn.huanzi.qch.baseadmin.util.SqlUtil - entity中没有这个字段，拼接查询SQL直接跳过：createTimeStart
15:10:21.467 [main] DEBUG cn.huanzi.qch.baseadmin.util.SqlUtil - entity中没有这个字段，拼接查询SQL直接跳过：createTimeEnd
15:10:21.467 [main] DEBUG cn.huanzi.qch.baseadmin.util.SqlUtil - entity中没有这个字段，拼接查询SQL直接跳过：userIdList
select user_id ,login_name ,user_name ,password ,valid ,limited_ip ,expired_time ,last_change_pwd_time ,limit_multi_login ,create_time ,update_time from sys_user where '1' = '1'  and user_id in ('1','2') and login_name like '%张三%' and create_time > str_to_date( '2020-10-10 15:10:21','%Y-%m-%d %H:%i:%s') and create_time < str_to_date( '2020-10-10 15:10:21','%Y-%m-%d %H:%i:%s') order by create_time desc
```



　　<span>  　　美化后的SQL</span> <br/>

![](https://img2020.cnblogs.com/blog/1353055/202010/1353055-20201010151101874-554903797.png)  <br/>







　　业务冲突问题，场景重现： <br/>

　　A只要对loginName使用@Like查询，其他全部是等值查询，但是B像要对userName使用@Like查询，其他全部是等值查询，这时候两者的业务需要体现在同一个Vo类中就冲突了，如果我们在entity映射类中使用自定义注解，这种冲突情况就不能很好的解决，因为映射类应当有且只有一个，但现在改成在Vo类中使用自定义注解，我们可以新建多个对应Vo类来解决这种冲突问题 <br/>





## 　　代码开源 <br/>

　　注：本文的的代码，在base-admin项目的SqlUtil.java工具类中 <br/>



　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/base-admin](https://github.com/huanzi-qch/base-admin) <br/>

　　码云：[https://gitee.com/huanzi-qch/base-admin](https://gitee.com/huanzi-qch/base-admin) <br/>




