
## 　　前言 <br/>



　　Swagger UI是可视化实时API文档，按照规范写好接口代码后，直接实时查看、测试API，无需再单独编写API文档，省时省力 <br/>



　　Swagger UI官网：[https://swagger.io/tools/swagger-ui/](https://swagger.io/tools/swagger-ui/) <br/>

　　Swagger UI官方GitHub：[https://github.com/swagger-api/swagger-ui](https://github.com/swagger-api/swagger-ui) <br/>



## 　　引入依赖 <br/>

　　在pom文件引入最新版依赖 <br/>

```
        <!-- Swagger UI API接口-->
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger2</artifactId>
            <version>2.9.2</version>
        </dependency>
        <dependency>
            <groupId>io.springfox</groupId>
            <artifactId>springfox-swagger-ui</artifactId>
            <version>2.9.2</version>
        </dependency>
```



## 　　编写代码 <br/>

 　　项目结构 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201908/1353055-20190806121324077-916773245.png)  <br/>



　　Swagger UI 配置信息 <br/>

```
/**
 * Swagger UI 配置信息
 */
@Configuration
@EnableSwagger2
public class SwaggerConfig {
    /**
     * 添加摘要信息(Docket)
     */
    @Bean
    public Docket controllerApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(new ApiInfoBuilder()
                        .title("API实时接口文档")
                        .description("用于实时查看、测试API")
                        .contact(new Contact("huanzi-qch", "https://www.cnblogs.com/huanzi-qch/", ""))
                        .version("版本号:1.0")
                        .build())
                .select()
                //API基础扫描路径
                .apis(RequestHandlerSelectors.basePackage("cn.huanzi.qch.springbootswagger2.controller"))
                .paths(PathSelectors.any())
                .build();
    }
}
```



　　Vo对象与controller <br/>

```
@Data
@ApiModel(description = "User实体Vo")
public class UserVo {
    @ApiModelProperty("用户id")
    private Integer id;

    @ApiModelProperty("用户名称")
    private String userName;
}
```

```
@RestController
@RequestMapping("user")
@Api(tags="user模块")
public class UserController {

    @ApiOperation(value = "根据id查询用户信息", notes = "查询数据库中某个的用户信息")
    @ApiImplicitParam(name = "id", value = "用户ID", paramType = "path", required = true)
    @GetMapping("get/{id}")
    public String getUserById(@PathVariable int id) {
        if(id == 0){
            return "查无此人";
        }else{
            return "{\"id\":\""+id+"\",\"userName\":\"张三\"}";
        }
    }

    @ApiOperation(value = "根据UserVo对象查询用户信息", notes = "查询数据库中符合条件的用户信息")
    @ApiImplicitParam(name = "userVo", value = "UserVo对象", paramType = "UserVo")
    @PostMapping("list")
    public String getUserByUser(UserVo userVo) {
        if(userVo.getId() == 0){
            return "查无此人";
        }else{
            return userVo.toString();
        }
    }

}
```



　　启动类加入@EnableSwagger2注解 <br/>

```
@EnableSwagger2
@SpringBootApplication
public class SpringbootSwagger2Application {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootSwagger2Application.class, args);
    }

}
```





## 　　效果 <br/>

　　访问路径：/swagger-ui.html，即可访问实时API接口文档 <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/201908/1353055-20190806115553676-365250141.png)  <br/>



　　<span class="http_method">  <span class="path">    /user/get/{id}  </span></span> <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201908/1353055-20190806120157360-1754718141.png) ![](https://huanzi-qch.github.io/file-server/blog-image/201908/1353055-20190806115803294-1157308096.png) ![](https://huanzi-qch.github.io/file-server/blog-image/201908/1353055-20190806115850041-1309324364.png) ![](https://huanzi-qch.github.io/file-server/blog-image/201908/1353055-20190806115926091-510526541.png)  <br/>





　　<span class="http_method">  　　   <span class="path">    /user/list  </span></span> <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201908/1353055-20190806120126913-1319285200.png) ![](https://huanzi-qch.github.io/file-server/blog-image/201908/1353055-20190806120313843-970337911.png)  <br/>





##  　　后记 <br/>

　　Swagger UI暂时先记录到这，以后在补充 <br/>





## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


