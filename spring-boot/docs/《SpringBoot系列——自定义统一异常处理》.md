
## 　　前言 <br/>

　　springboot内置的/error错误页面并不一定适用我们的项目，这时候就需要进行自定义统一异常处理，本文记录springboot进行自定义统一异常处理。 <br/>



　　1、使用@ControllerAdvice、@RestControllerAdvice捕获运行时异常。 <br/>

　　2、重写ErrorController，手动抛出自定义ErrorPageException异常，方便404、403等被统一处理。 <br/>



　　官网文档相关介绍： <br/>

　　https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-error-handling <br/>





## 　　代码 <br/>

　　项目结构 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202105/1353055-20210520104557224-2135856828.png)  <br/>





　　引入我们父类pom即可，无需引入其他依赖 <br/>



　　开始之前，需要先定下统一返回对象、自定义异常枚举类 <br/>

```
/**
 * 自定义异常枚举类
 */
public enum ErrorEnum {
    //自定义系列
    USER_NAME_IS_NOT_NULL("10001","【参数校验】用户名不能为空"),
    PWD_IS_NOT_NULL("10002","【参数校验】密码不能为空"),

    //400系列
    BAD_REQUEST("400","请求的数据格式不符!"),
    UNAUTHORIZED("401","登录凭证过期!"),
    FORBIDDEN("403","抱歉，你无权限访问!"),
    NOT_FOUND("404", "请求的资源找不到!"),

    //500系列
    INTERNAL_SERVER_ERROR("500", "服务器内部错误!"),
    SERVICE_UNAVAILABLE("503","服务器正忙，请稍后再试!"),

    //未知异常
    UNKNOWN("10000","未知异常!");


    /** 错误码 */
    private String code;

    /** 错误描述 */
    private String msg;

    ErrorEnum(String code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public String getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }
}
```

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
    private String msg = "操作成功";

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

    public static <T> Result<T> error(ErrorEnum errorEnum) {
        return new Result(errorEnum.getCode(), false, errorEnum.getMsg());
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



　　新增两个自定义异常，便于统一处理时捕获异常 <br/>

```
/**
 * 自定义业务异常
 */
public class ServiceException extends RuntimeException {

    /**
     * 自定义异常枚举类
     */
    private ErrorEnum errorEnum;

    /**
     * 错误码
     */
    private String code;

    /**
     * 错误信息
     */
    private String errorMsg;


    public ServiceException() {
        super();
    }

    public ServiceException(ErrorEnum errorEnum) {
        super("{code:" + errorEnum.getCode() + ",errorMsg:" + errorEnum.getMsg() + "}");
        this.errorEnum = errorEnum;
        this.code = errorEnum.getCode();
        this.errorMsg = errorEnum.getMsg();
    }

    public ServiceException(String code,String errorMsg) {
        super("{code:" + code + ",errorMsg:" + errorMsg + "}");
        this.code = code;
        this.errorMsg = errorMsg;
    }

    public ErrorEnum getErrorEnum() {
        return errorEnum;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
```



```
/**
 * 自定义错误页面异常
 */
public class ErrorPageException extends ServiceException {

    public ErrorPageException(String code,String msg) {
        super(code, msg);
    }
}
```



　　重写ErrorController，不在跳转原生错误页面，而是抛出我们的自定义异常 <br/>

```
/**
 * 自定义errorPage
 * 直接继承 BasicErrorController
 */
@Controller
public class ErrorPageConfig extends BasicErrorController {

    public ErrorPageConfig(){
        super(new DefaultErrorAttributes(),new ErrorProperties());
    }

    @Override
    @RequestMapping(
            produces = {"text/html"}
    )
    public ModelAndView errorHtml(HttpServletRequest request, HttpServletResponse response) {
        doError(request);
        return null;
    }

    @Override
    @RequestMapping
    public ResponseEntity<Map<String, Object>> error(HttpServletRequest request) {
        doError(request);
        return null;
    }

    private void doError(HttpServletRequest request) {
        Map<String, Object> model = this.getErrorAttributes(request, this.isIncludeStackTrace(request, MediaType.ALL));

        //抛出ErrorPageException异常，方便被ExceptionHandlerConfig处理
        String path = model.get("path").toString();
        String status = model.get("status").toString();

        //静态资源文件发生404，无需抛出异常
        if(!path.contains("/common/") && !path.contains(".")){
            throw new ErrorPageException(status, path);
        }
    }
}
```



 　　@RestControllerAdvice，统一异常处理，捕获并返回统一返回对象Result，同时把异常信息打印到日志中 <br/>

```
/**
 * 统一异常处理
 */
@Slf4j
@RestControllerAdvice
public class ExceptionHandlerConfig{

    /**
     * 业务异常 统一处理
     */
    @ExceptionHandler(value = ServiceException.class)
    @ResponseBody
    public Object exceptionHandler400(ServiceException e){
        return returnResult(e,Result.error(e.getErrorEnum()));
    }

    /**
     * 错误页面异常 统一处理
     */
    @ExceptionHandler(value = ErrorPageException.class)
    @ResponseBody
    public Object exceptionHandler(ErrorPageException e){
        ErrorEnum errorEnum;
        switch (Integer.parseInt(e.getCode())) {
            case 404:
                errorEnum = ErrorEnum.NOT_FOUND;
                break;
            case 403:
                errorEnum = ErrorEnum.FORBIDDEN;
                break;
            case 401:
                errorEnum = ErrorEnum.UNAUTHORIZED;
                break;
            case 400:
                errorEnum = ErrorEnum.BAD_REQUEST;
                break;
            default:
                errorEnum = ErrorEnum.UNKNOWN;
                break;
        }

        return returnResult(e,Result.error(errorEnum));
    }

    /**
     * 空指针异常 统一处理
     */
    @ExceptionHandler(value =NullPointerException.class)
    @ResponseBody
    public Object exceptionHandler500(NullPointerException e){
        return returnResult(e,Result.error(ErrorEnum.INTERNAL_SERVER_ERROR));
    }

    /**
     * 其他异常 统一处理
     */
    @ExceptionHandler(value =Exception.class)
    @ResponseBody
    public Object exceptionHandler(Exception e){
        return returnResult(e,Result.of(ErrorEnum.UNKNOWN.getCode(), false, "【" + e.getClass().getName() + "】" + e.getMessage()));
    }

    /**
     * 是否为ajax请求
     * ajax请求，响应json格式数据，否则应该响应html页面
     */
    private Object returnResult(Exception e,Result errorResult){
        //把错误信息输入到日志中
        log.error(ErrorUtil.errorInfoToString(e));

        ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = requestAttributes.getRequest();
        HttpServletResponse response = requestAttributes.getResponse();

        //设置http响应状态
        response.setStatus(200);

        //判断是否为ajax请求
        if ("XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With"))){
            return errorResult;
        }else{
            return new ModelAndView("error","msg",errorResult.getMsg());
        }
    }
}
```



　　新建测试controller，新增几个测试接口，模拟多种异常报错的情况 <br/>

```
/**
 * 模拟异常测试
 */
@RestController
@RequestMapping("/test/")
public class TestController {
    /**
     * 正常返回数据
     */
    @GetMapping("index")
    public Result index(){
        return Result.of("正常返回数据");
    }

    /**
     * 模拟空指针异常
     */
    @GetMapping("nullPointerException")
    public Result nullPointerException(){
        //故意制造空指针异常
        String msg = null;
        msg.equals("huanzi-qch");
        return Result.of("正常返回数据");
    }

    /**
     * 模拟业务异常，手动抛出业务异常
     */
    @GetMapping("serviceException")
    public Result serviceException(){
        throw new ServiceException(ErrorEnum.USER_NAME_IS_NOT_NULL);
    }
}
```



## 　　效果 <br/>

　　正常数据返回 <br/>

　　http://localhost:10010/test/index <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202105/1353055-20210520105629028-2025953222.png)  <br/>





　　模拟空指针异常 <br/>

　　http://localhost:10010/test/nullPointerException <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202105/1353055-20210520105648152-231571199.png)  <br/>





　　模拟业务异常 <br/>

　　http://localhost:10010/test/serviceException <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202105/1353055-20210520105732411-1476675514.png)  <br/>



 　　调用错误接口，404 <br/>

　　http://localhost:10010/test/serviceException111 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202105/1353055-20210520105817523-1730017428.png)  <br/>



## 　　更新 <br/>

　　2022-03-22更新：统一异常处理返回格式调整：ajax请求返回json格式数据，其他情况下跳转自定义error页面 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202203/1353055-20220322145752889-420287128.png)  <br/>







## 　　后记 <br/>

　　自定义统一异常处理暂时先记录到这，后续再进行补充。 <br/>



## 　　代码开源 <br/>



　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


