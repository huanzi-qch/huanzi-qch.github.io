
## 　　前言 <br/>

　　Spring Boot提供了与三个JSON映射库的集成： <br/>

Gson
Jackson
JSON-B <br/>

　　Jackson是首选的默认库。 <br/>

　　官网介绍： <br/>

　　[https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/boot-features-json.html#boot-features-json-jackson](https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/boot-features-json.html#boot-features-json-jackson) <br/>

　　[https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/howto-spring-mvc.html#howto-customize-the-jackson-objectmapper](https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/howto-spring-mvc.html#howto-customize-the-jackson-objectmapper) <br/>



　　通常，我们将Java对象转成Json时称之为序列化，反之将Json转成Java对象时称之为反序列化，本文简单介绍一下Jackson，以及在SpringBoot项目开发中常用的Jackson方法 <br/>



## 　　如何引入 <br/>

　　SpringBoot提供了JSON依赖，我们可以按下面方式引入 <br/>



　　1、直接引入JSON依赖 <br/>

```
    <!-- springboot-json -->
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-json</artifactId>
    </dependency>
```



　　2、一般情况下我们引入MVC，MVC里面帮我们引入了JSON依赖 <br/>

```
        <!-- springboot web(MVC)-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
```

![](https://img2018.cnblogs.com/blog/1353055/201908/1353055-20190805103016228-251844923.png)  <br/>

　　最终引入的依赖是 <br/>

![](https://img2018.cnblogs.com/blog/1353055/201908/1353055-20190805104403274-1029580113.png)  <br/>



## 　　Jackson注解 <br/>

　　Jackson的注解详细介绍 <br/>

　　英文官方介绍：[https://github.com/FasterXML/jackson-annotations](https://github.com/FasterXML/jackson-annotations) <br/>



### 　　常用注解 <br/>

　　<span style="font-family: 宋体">  <strong>    　　@JsonProperty   </strong>  序列化、反序列化时，属性的名称</span> <br/>

　　<span style="font-family: 宋体">  <code>    <strong>      @JsonIgnoreProperties    </strong>       </code>  序列化、反序列化忽略属性，多个时用“,”隔开</span> <br/>

　　<span style="font-family: 宋体">  <code>    <strong>      @JsonIgnore      </strong>    序列化、反序列化  </code>  忽略属性</span> <br/>

　　<span style="font-family: 宋体">  <strong>    @JsonAlias    </strong>  为反序列化期间要接受的属性定义一个或多个替代名称，可以与@JsonProperty一起使用</span> <br/>

　　<span style="font-family: 宋体">  <code>    <strong>      @JsonInclude    </strong>       </code>  当属性的值为空（null或者""）时，不进行序列化，可以减少数据传输</span> <br/>

　　<span style="font-family: 宋体">  <code>    <strong>      @JsonFormat    </strong>       </code>  序列化、反序列化时，格式化时间</span> <br/>



## 　　测试 <br/>



　　写一个controller测试一下 <br/>

　　先写一个页面跳转 <br/>

```
    /**
     * 跳转页面，页面引入了jquery，主要用于下面的ajax调用测试
     */
    @GetMapping("/")
    public ModelAndView index(){
        return new ModelAndView("index");
    }
```



### 　　反序列化方式 <br/>

　　完整测试Vo： <br/>

```
@Data
//序列化、反序列化忽略的属性，多个时用“,”隔开
@JsonIgnoreProperties({"captcha"})
//当属性的值为空（null或者""）时，不进行序列化，可以减少数据传输
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class UserVoByJson {

    // 序列化、反序列化时，属性的名称
    @JsonProperty("userName")
    private String username;

    // 为反序列化期间要接受的属性定义一个或多个替代名称，可以与@JsonProperty一起使用
    @JsonAlias({"pass_word", "passWord"})
    @JsonProperty("pwd")
    private String password;

    //序列化、反序列化时，格式化时间
    @JsonFormat(locale = "zh", timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createDate;

    //序列化、反序列化忽略属性
    @JsonIgnore
    private String captcha;

}
```



　　使用@RestController标注类，相对于所有的方法都用@ResponseBody标注，MVC会帮我们调用序列化，将Java对象转成Json再响应给调用方，同时形参要加@RequestBody标注，MVC会帮我们调用反序列化将Json转成Java对象，这就要求我们调用的时候需要传一个Json字符串过来 <br/>

```
    /*
        $.ajax({
           type:"POST",
           url:"http://localhost:10099/testByJson",
           data:JSON.stringify({
                userName:"sa",
                pass_word:"123fff",
                captcha:"abcd",
                createDate:"2019-08-05 11:34:31"
            }),
           dataType:"JSON",
           contentType:"application/json;charset=UTF-8",
           success:function(data){
               console.log(data);
           },
           error:function(data){
                console.log("报错啦");
           }
        })
     */
    /**
     * 反序列化方式注入，只能post请求
     */
    @PostMapping("testByJson")
    public UserVoByJson testByJson(@RequestBody UserVoByJson userVo) {
        System.out.println(userVo);
        return userVo;
    }
```



　　调用测试 <br/>

　　1、先注释所有注解，仅打开这个两个类上面的注解@JsonIgnoreProperties、@JsonInclude <br/>

```
@Data
//序列化、反序列化忽略的属性，多个时用“,”隔开
@JsonIgnoreProperties({"captcha"})
//当属性的值为空（null或者""）时，不进行序列化，可以减少数据传输
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class UserVoByJson {

    // 序列化、反序列化时，属性的名称
//    @JsonProperty("userName")
    private String username;

    // 为反序列化期间要接受的属性定义一个或多个替代名称，可以与@JsonProperty一起使用
//    @JsonAlias({"pass_word", "passWord"})
//    @JsonProperty("pwd")
    private String password;

    //序列化、反序列化时，格式化时间
//    @JsonFormat(locale = "zh", timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createDate;

    //序列化、反序列化忽略属性
//    @JsonIgnore
    private String captcha;

}
```

　　前端调用时全部按属性名称 <br/>

```
   data:JSON.stringify({
        username:"sa",
        password:"123fff",
        captcha:"abcd"
    })
```

　　反序列化（后端控制台打印） <br/>

```
UserVoByJson(username=sa, password=123fff, createDate=null, captcha=null)
```

　　序列化（ajax的回调） <br/>

```
{username: "sa", password: "123fff"}
```

　　captcha属性前端已经传值，但设置了@JsonIgnoreProperties注解反序列化时该属性被忽略，因此为空，而序列化的时候@JsonInclude配置的是JsonInclude.Include.NON_EMPTY，当属性的值为空（null或者""）时，不进行序列化，所以序列化的最终结果如上所示 <br/>



　　2、先注释所有注解，放开@JsonProperty、@JsonAlias、@JsonIgnore <br/>

```
@Data
//序列化、反序列化忽略的属性，多个时用“,”隔开
//@JsonIgnoreProperties({"captcha"})
//当属性的值为空（null或者""）时，不进行序列化，可以减少数据传输
//@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class UserVoByJson {

    // 序列化、反序列化时，属性的名称
    @JsonProperty("userName")
    private String username;

    // 为反序列化期间要接受的属性定义一个或多个替代名称，可以与@JsonProperty一起使用
    @JsonAlias({"pass_word", "passWord"})
    @JsonProperty("pwd")
    private String password;

    //序列化、反序列化时，格式化时间
//    @JsonFormat(locale = "zh", timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createDate;

    //序列化、反序列化忽略属性
    @JsonIgnore
    private String captcha;

}
```

　　前端调用还是按属性名称 <br/>

```
   data:JSON.stringify({
        username:"sa",
        password:"123fff",
        captcha:"abcd"
    })
```

　　反序列化（后端控制台打印） <br/>

```
UserVoByJson(username=null, password=null, createDate=null, captcha=null)
```

　　序列化（ajax的回调） <br/>

```
{createDate: null, userName: null, pwd: null}
```

　　captcha被@JsonIgnore标注，序列化、反序列忽略它，username、password被@JsonProperty标注，传参的时候只能用别名，password同时被@JsonAlias标注，可以用代替名称 <br/>

　　因此我们可以这样调用 <br/>

```
   data:JSON.stringify({
        userName:"sa",
        pass_word:"123fff",
        //以下两种也一样
        //passWord:"123fff",
        //pwd:"123fff",
        captcha:"abcd"
    })
```

　　反序列化（后端控制台打印） <br/>

```
UserVoByJson(username=sa, password=123fff, createDate=null, captcha=null)
```

　　序列化（ajax的回调） <br/>

```
{userName: "sa", pwd: "123fff"}
```



　　3、先注释所有注解，放开@JsonFormat <br/>

```
@Data
//序列化、反序列化忽略的属性，多个时用“,”隔开
//@JsonIgnoreProperties({"captcha"})
//当属性的值为空（null或者""）时，不进行序列化，可以减少数据传输
//@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class UserVoByJson {

    // 序列化、反序列化时，属性的名称
//    @JsonProperty("userName")
    private String username;

    // 为反序列化期间要接受的属性定义一个或多个替代名称，可以与@JsonProperty一起使用
//    @JsonAlias({"pass_word", "passWord"})
//    @JsonProperty("pwd")
    private String password;

    //序列化、反序列化时，格式化时间
    @JsonFormat(locale = "zh", timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createDate;

    //序列化、反序列化忽略属性
//    @JsonIgnore
    private String captcha;

}
```

　　前端调用 <br/>

```
   data:JSON.stringify({
        createDate:"2019-08-05 11:34:31"
    })
```

　　反序列化（后端控制台打印） <br/>

```
UserVoByJson(username=null, password=null, createDate=Mon Aug 05 11:34:31 GMT+08:00 2019, captcha=null)
```

　　序列化（ajax的回调） <br/>

```
{username: null, password: null, createDate: "2019-08-05 11:34:31", captcha: null}
```

　　PS：没有配置之前这样调用会报错400 <br/>

```
Resolved [org.springframework.http.converter.HttpMessageNotReadableException: JSON parse error: Cannot deserialize value of type `java.util.Date` from String "2019-08-05 11:34:31": not a valid representation (error: Failed to parse Date value '2019-08-05 11:34:31': Cannot parse date "2019-08-05 11:34:31": while it seems to fit format 'yyyy-MM-dd'T'HH:mm:ss.SSSZ', parsing fails (leniency? null)); nested exception is com.fasterxml.jackson.databind.exc.InvalidFormatException: Cannot deserialize value of type `java.util.Date` from String "2019-08-05 11:34:31": not a valid representation (error: Failed to parse Date value '2019-08-05 11:34:31': Cannot parse date "2019-08-05 11:34:31": while it seems to fit format 'yyyy-MM-dd'T'HH:mm:ss.SSSZ', parsing fails (leniency? null))
```



###  　　MVC方式注入 <br/>

　　Vo类 <br/>

```
@Data
public class UserVoByMvc {
    private String username;
    private String password;
    private Date createDate;
    private String captcha;
}
```



　　如果不是以反序列化的方式注入，而是MVC的方式注入又是怎么样呢？去掉@RequestBody就变成MVC注入 <br/>

```
    /*
        $.ajax({
           type:"POST",
           url:"http://localhost:10099/testByMvc",
           data:{
                username:"sa",
                password:"123fff",
                captcha:"abcd"
            },
           dataType:"JSON",
           //contentType:"application/json;charset=UTF-8",//使用这个，get请求能接到参数，post接不到
           contentType:"application/x-www-form-urlencoded",//使用这个，get、post都能接收到参数
           success:function(data){
               console.log(data);
           },
           error:function(data){
                console.log("报错啦");
           }
        })
     */
    /**
     * MVC方式注入
     */
    @RequestMapping("testByMvc")
    public UserVoByMvc testByMvc(UserVoByMvc userVo) {
        System.out.println(userVo);
        return userVo;
    }
```



　　MVC注入的时候，接参过程Jackson的注解就不再生效了，这时候我们传参就得按照MVC的规则来，Date类型首先就不能传字符串 <br/>

　　前端调用 <br/>

```
           data:{
                username:"sa",
                password:"123fff",
                captcha:"abcd"
            }
```

　　后台打印 <br/>

```
UserVoByMvc(username=sa, password=123fff, createDate=null, captcha=abcd)
```

　　ajax回调 <br/>

```
{username: "sa", password: "123fff", createDate: null, captcha: "abcd"}
```

　　那MVC方式注入，Date日期类型该怎么支持传字符串呢？在配置文件新增MVC日期格式化就可以愉快的传输固定格式的日期字符串了 <br/>

```
#MVC接参时，日期处理
spring.mvc.date-format=yyyy-MM-dd HH:mm:ss
```

　　（偷个懒，效果与预期一样，就贴图了。。。） <br/>



　　同时，不管是采用哪种注入方法，我们可以配置全局的日期处理，这样一来就可以愉快开发了 <br/>

```
#全局日期格式化处理

#MVC接参时，日期处理
spring.mvc.date-format=yyyy-MM-dd HH:mm:ss

#Jackson序列化、反序列化时，日期处理
spring.jackson.date-format=yyyy-MM-dd HH:mm:ss
```



　　我们顺便来看一下在配置文件都有哪些Jackson配置，每个配置的具体功能见名思意，就不阐述了 <br/>

![](https://img2018.cnblogs.com/blog/1353055/201908/1353055-20190805102252298-1701179061.png)  <br/>



### 　　接收集合对象 <br/>



　　1、反序列化方式 <br/>

```
    /*
    let datas = [];//对象集合
     for(let i = 0; i < 5; i++){
         let data = {"userName":i + ""};//对象
         datas.push(data);
     }
     $.ajax({
         type:"POST",
         url:"http://localhost:10099/testListByJson",
         data:JSON.stringify(datas),
         dataType:"JSON",
         contentType:"application/json;charset=UTF-8",
         success:function(data){
            console.log(data);
         },
         error:function(data){
             console.log("报错啦");
         }
     })
     */
    /**
     * 反序列化方式，接收集合对象，只能post请求
     */
    @PostMapping("testListByJson")
    public String testListByJson(@RequestBody List<UserVoByJson> userVos){
        userVos.forEach(System.out::println);
        return "{\"code\":200}";
    }
```

　　后台打印 <br/>

```
UserVoByJson(username=0, password=null, createDate=null, captcha=null)
UserVoByJson(username=1, password=null, createDate=null, captcha=null)
UserVoByJson(username=2, password=null, createDate=null, captcha=null)
UserVoByJson(username=3, password=null, createDate=null, captcha=null)
UserVoByJson(username=4, password=null, createDate=null, captcha=null)
```





## 　　ObjectMapper <br/>

　　以上都是配置注解，具体操作都是MVC帮我们做了，那我们如何使用Jackson进行Json操作呢？我们在官方文档可以看到Jackson为我们提供了com.fasterxml.jackson.databind.ObjectMapper类操作Json <br/>

　　官方文档相关介绍：[https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/howto-spring-mvc.html#howto-customize-the-jackson-objectmapper](https://docs.spring.io/spring-boot/docs/2.1.6.RELEASE/reference/html/howto-spring-mvc.html#howto-customize-the-jackson-objectmapper) <br/>



### 　　常用方法 <br/>

```
    /**
     * 测试 ObjectMapper对象
     */
    public static void main(String[] args) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            //当属性的值为空（null或者""）时，不进行序列化，可以减少数据传输
            mapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);

            //设置日期格式
            mapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));

            //1、Java对象转Json字符串
            UserVoByJson userVo = new UserVoByJson();
            userVo.setUsername("张三");
            userVo.setPassword("666");
            String jsonString = mapper.writeValueAsString(userVo);
            System.out.println(jsonString);

            //2、Json字符串转Java对象
            jsonString = "{\"userName\":\"张三\"}";
            UserVoByJson userVo1 = mapper.readValue(jsonString, UserVoByJson.class);
            System.out.println(userVo1);

            //3、Java对象类型转换
            HashMap<Object, Object> map = new HashMap<>();
            map.put("userName", "张三");
            UserVoByJson userVo2 = mapper.convertValue(map, UserVoByJson.class);
            System.out.println(userVo2);

            //4、将json字符串转换成List
            String listJsonString = "[{\"userName\":\"张三\"},{\"userName\":\"李四\"}]";
            List<UserVoByJson> userVoList = mapper.readValue(listJsonString, mapper.getTypeFactory().constructParametricType(List.class, UserVoByJson.class));
            System.out.println(userVoList);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
```

　　打印 <br/>

```
{"userName":"张三","pwd":"666"}
UserVoByJson(username=张三, password=null, createDate=null, captcha=null)
UserVoByJson(username=张三, password=null, createDate=null, captcha=null)
[UserVoByJson(username=张三, password=null, createDate=null, captcha=null), UserVoByJson(username=李四, password=null, createDate=null, captcha=null)]
```





 　　还有一些不怎么常用的方法，比如下面这几个（除了转成Json字符串） <br/>

![](https://img2018.cnblogs.com/blog/1353055/201908/1353055-20190805162126220-772318139.png)  <br/>



## 　　后记 <br/>

　　通常，实体类用于ORM映射框架与数据打交道，比如：User，要求对象的属性要与数据库字段一一对应，少了不行，多了也不行，没有对应映射的得用注解标注（比如JPA），所以我们一般用Vo对象进行传输、接参等，会多很多乱七八糟的属性（分页信息，仅用于接参的临时属性等），比如：UserVo，User、UserVo两个对象使用工具类相互转换，有时候Vo对象有些乱七八糟的属性不想进行序列化传输，就需要设置序列化过滤 <br/>

　　在SpringBoot中使用Jackson操作Json序列化、反序列化的简单操作就暂时记录到这，以后再继续补充 <br/>



## 　　补充 <br/>

　　2019-10-22补充：不同时区，时间序列化处理 <br/>

　　需求：要求系统根据当前登录账号存储的时区字段，web端显示对应时区的时间 <br/>

　　通常情况下，系统会分为svc端服务、web端服务，svc服务负责与数据库打交道，web服务负责与浏览器打交道；因此，我们可以在svc服务数据存库的时候统一存储GMT+0000，web服务序列化响应的时候根据当前登录账户时区进行显示，简单来说就是：web端服务根据当前登录人的时区来显示日期时间，但svc端服务日期入库统一采用GMT+0000时区。 <br/>

　　实现： <br/>

　　svc端服务，在系统启动时设置全局默认GMT+0000时区 <br/>

```
@SpringBootApplication
public class XXXApplication {
    public static void main(String[] args) {
        //设置全局默认时区
        TimeZone.setDefault(TimeZone.getTimeZone("GMT+0000"));
        SpringApplication.run(XXXApplication .class, args);
    }
}
```



　　web端服务，设置自定义JsonSerializer<Date>日期序列化实现类，在实现类中获取登录账户时区，设置序列化日期格式 <br/>

```
@JsonComponent
public class WebDateFormat {

    //SimpleDateFormat对象
    private static final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss Z");

    @Autowired
    private LoginService loginService;

    //格式化日期
    public static class DateFormatSerializer extends JsonSerializer<Date> {
        @Override
        public void serialize(Date value, JsonGenerator gen, SerializerProvider serializers) {
            try {
                //获取登录账号时区字段，并设置序列化日期格式
                String timeZone = loginService.getLoginUser().getTimeZone();
                format.setTimeZone(TimeZone.getTimeZone(timeZone));
                gen.writeString(format.format(value));

            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    //解析日期字符串
    public static class DateParseDeserializer extends JsonDeserializer<Date> {
        @Override
        public Date deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
            try {
                //获取登录账号时区字段，并设置序列化日期格式
                String timeZone = loginService.getLoginUser().getTimeZone();
                format.setTimeZone(TimeZone.getTimeZone(timeZone));
                return format.parse(p.getValueAsString());

            } catch (ParseException e) {
                throw new RuntimeException(e);
            }
        }
    }
}
```



　　<span style="color: rgba(255, 0, 0, 1)">  　　2020-07-31更新</span> <br/>

　　lombok跟mvc注入的bug记录 <br/>

```
    /**
     mvc参数自动注入 反射生成set方法，正常来说是set后面紧跟的第一个字母大写，比如这样：objId，setObjId，
     但当它碰到第二个字母大写的时候，第一个是小写，比如：uPosition，setuPosition，
     实体类中我用的是lombok，它帮我们生成的是setUPosition，导致找不到set方法值注入不进去

     解决方法：手动写uPosition uUnits的set，get方法，覆盖lombok帮我们生成的set，get方法
     */
    public String getuPosition() {
        return uPosition;
    }
    public void setuPosition(String uPosition) {
        this.uPosition = uPosition;
    }
    public String getuUnits() {
        return uUnits;
    }
    public void setuUnits(String uUnits) {
        this.uUnits = uUnits;
    }
```

　　所以当某个字段接不到参、或者序列化丢失数据、ORM框架无法映射数据等问题时，可以往这个方向去排查问题 <br/>





## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


