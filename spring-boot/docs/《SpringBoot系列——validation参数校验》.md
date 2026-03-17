
## 　　前言 <br/>

　　日常开发中，接口的参数校验必不可少，本文记录使用validation优雅进行参数校验。 <br/>

　　官方介绍：https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-validation <br/>



## 　　代码编写 <br/>

　　引入依赖 <br/>

```
        <!--引入validation依赖-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
```

　　创建两种Vo <br/>

```
/**
 * 用户Vo
 */
@Data
public class UserVoByAdd {

    @Pattern(regexp = "\\d+$",message = "主键只能是数字")
    @NotEmpty(message = "主键不能为空")
    private String id;//表id

    @NotEmpty(message = "名字不能为空")
    private String name;//名字

    @DecimalMin(value = "18",message = "年龄不能小于18岁")
    @DecimalMax(value = "25",message = "年龄不能大于25岁")
    @NotNull(message = "年龄不能为空")
    private Integer age;//年龄

    @NotEmpty(message = "地址不能为空")
    private String addr;//地址

    @Email(message = "邮件格式不正确")
    @NotEmpty(message = "邮件不能为空")
    private String email;//邮件
}
```

```
/**
 * 用户Vo
 */
@Data
public class UserVoByEdit {

    @NotEmpty(message = "主键不能为空")
    private String id;//表id

    private String name;//名字

    @DecimalMin(value = "18",message = "年龄不能小于18岁")
    @DecimalMax(value = "25",message = "年龄不能大于25岁")
    private Integer age;//年龄

    private String addr;//地址

    @Email(message = "邮件格式不正确")
    private String email;//邮件
}
```

　　统一异常捕获 <br/>

```
/**
 * 统一异常处理
 */
@RestControllerAdvice
public class ExceptionHandlerConfig {

    /**
     * validation参数校验异常 统一处理
     */
    @ExceptionHandler(value = BindException.class)
    @ResponseBody
    public Result exceptionHandler500(BindException e){
        e.printStackTrace();
        StringBuilder stringBuilder = new StringBuilder();
        for (ObjectError error : e.getAllErrors()) {
            stringBuilder.append("[");
            stringBuilder.append(((FieldError) error).getField());
            stringBuilder.append(" ");
            stringBuilder.append(error.getDefaultMessage());
            stringBuilder.append("]");
        }
        return Result.of(10002,false,"【参数校验失败】 " + stringBuilder.toString());
    }
    @ExceptionHandler(value = ConstraintViolationException.class)
    @ResponseBody
    public Result exceptionHandler500(ConstraintViolationException e){
        e.printStackTrace();
        StringBuilder stringBuilder = new StringBuilder();
        for (ConstraintViolation<?> error : e.getConstraintViolations()) {
            PathImpl pathImpl = (PathImpl) error.getPropertyPath();
            String paramName = pathImpl.getLeafNode().getName();
            stringBuilder.append("[");
            stringBuilder.append(paramName);
            stringBuilder.append(" ");
            stringBuilder.append(error.getMessage());
            stringBuilder.append("]");
        }
        return Result.of(10002,false,"【参数校验失败】 " + stringBuilder.toString());

    }

    /**
     * 未知异常 统一处理
     */
    @ExceptionHandler(value =Exception.class)
    @ResponseBody
    public Result exceptionHandler(Exception e){
        e.printStackTrace();
        return Result.of(10001,false,"【未知异常】 "+e.getMessage());
    }
}
```

　　测试controller <br/>

```
/**
 * 测试Controller
 */
@Validated
@RestController
@RequestMapping("/test/")
public class Controller {

    /**
     * 新增用户
     */
    @RequestMapping("addUser")
    public Result addUser(@Validated UserVoByAdd userVo){
        System.out.println(userVo);
        return Result.of( "操作成功！");
    }

    /**
     * 编辑用户
     */
    @RequestMapping("editUser")
    public Result editUser(@Validated UserVoByEdit userVo){
        System.out.println(userVo);
        return Result.of( "操作成功！");
    }

    /**
     * 根据id查找用户
     */
    @RequestMapping("findUserById")
    public Result findUserById(@Size(min = 1, max = 5,message = "id超出范围") @NotEmpty(message = "id不能为空") String id) {
        System.out.println(id);
        return Result.of( "操作成功！");
    }
}
```

## 　　效果演示 <br/>

　　addUser <br/>

　　http://localhost:10010/test/addUser <br/>

　　http://localhost:10010/test/addUser?id=123&name=张三&email=1111@qq.com&age=20&addr=南宁市 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210708115642220-1683559459.png)  <br/>

![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210708115716893-1854703703.png)  <br/>

![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210708115806536-1299026875.png)  <br/>







　　editUser <br/>

　　http://localhost:10010/test/editUser <br/>

　　http://localhost:10010/test/editUser?id=123&name=李四&age=20 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210708115847589-1718922804.png)  <br/>





![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210708115907471-528774292.png)  <br/>





![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210708115921885-135949445.png)  <br/>







　　findUserById <br/>

　　http://localhost:10010/test/findUserById <br/>

　　http://localhost:10010/test/findUserById?id=123 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210708120626831-1019139627.png)  <br/>





![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210708120646814-312222587.png)  <br/>





![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210708120657537-113751153.png)  <br/>





##  　　后记 <br/>

　　springboot-validation参数校验暂时先记录到这，后续再进行补充。 <br/>



## 　　代码开源 <br/>



　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


