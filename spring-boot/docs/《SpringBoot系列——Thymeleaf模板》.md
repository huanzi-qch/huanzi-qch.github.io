
## 　　前言 <br/>

　　<span class="hljs-keyword">  <span class="hljs-preprocessor">    输出到response再响应到浏览器，虽然java是一次编译，到处运行，但也大大增加了服务器压力，而且jsp将后台java语言嵌入页面，还要放入服务容器才能打开，前后端不分离，严重增加了前端工程师的开发工作、效率。  </span></span> <br/>

　　<span class="hljs-keyword">  <span class="hljs-preprocessor">    <a href="https://www.thymeleaf.org/index.html" target="_blank" rel="noopener nofollow">      thymeleaf官网    </a>    对thymeleaf的介绍：  </span></span> <br/>

　　Thymeleaf is a modern server-side Java template engine for both web and standalone environments. <br/>

　　Thymeleaf's main goal is to bring elegant natural templates to your development workflow — HTML that can be correctly displayed in browsers and also work as static prototypes, allowing for stronger collaboration in development teams. <br/>

　　With modules for Spring Framework, a host of integrations with your favourite tools, and the ability to plug in your own functionality, Thymeleaf is ideal for modern-day HTML5 JVM web development — although there is much more it can do. <br/>



　　[thymeleaf使用教程](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#what-is-thymeleaf)，骚操作：鼠标右键，翻译成简体中文再看。 <br/>

　　thymeleaf使用th属性赋予每个标签与后台交互的能力，当html文件在本地直接用浏览器打开，浏览器引擎会忽略掉th属性，并正常渲染页面，当把html文件放到服务容器访问，th属性与后台交互，获取数据替换原先的内容，这样前端工程师在编写html页面时，在本地开发，正常实现页面逻辑效果即可，数据先写死，当放到服务容器时数据从后台获取。 <br/>



　　spring对thymeleaf的配置，来自springboot参考手册，Common application properties：[https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#common-application-properties](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#common-application-properties) <br/>

```
# THYMELEAF (ThymeleafAutoConfiguration)
spring.thymeleaf.cache=true # Whether to enable template caching.
spring.thymeleaf.check-template=true # Whether to check that the template exists before rendering it.
spring.thymeleaf.check-template-location=true # Whether to check that the templates location exists.
spring.thymeleaf.enabled=true # Whether to enable Thymeleaf view resolution for Web frameworks.
spring.thymeleaf.enable-spring-el-compiler=false # Enable the SpringEL compiler in SpringEL expressions.
spring.thymeleaf.encoding=UTF-8 # Template files encoding.
spring.thymeleaf.excluded-view-names= # Comma-separated list of view names (patterns allowed) that should be excluded from resolution.
spring.thymeleaf.mode=HTML # Template mode to be applied to templates. See also Thymeleaf's TemplateMode enum.
spring.thymeleaf.prefix=classpath:/templates/ # Prefix that gets prepended to view names when building a URL.
spring.thymeleaf.reactive.chunked-mode-view-names= # Comma-separated list of view names (patterns allowed) that should be the only ones executed in CHUNKED mode when a max chunk size is set.
spring.thymeleaf.reactive.full-mode-view-names= # Comma-separated list of view names (patterns allowed) that should be executed in FULL mode even if a max chunk size is set.
spring.thymeleaf.reactive.max-chunk-size=0B # Maximum size of data buffers used for writing to the response.
spring.thymeleaf.reactive.media-types= # Media types supported by the view technology.
spring.thymeleaf.render-hidden-markers-before-checkboxes=false # Whether hidden form inputs acting as markers for checkboxes should be rendered before the checkbox element itself.
spring.thymeleaf.servlet.content-type=text/html # Content-Type value written to HTTP responses.
spring.thymeleaf.servlet.produce-partial-output-while-processing=true # Whether Thymeleaf should start writing partial output as soon as possible or buffer until template processing is finished.
spring.thymeleaf.suffix=.html # Suffix that gets appended to view names when building a URL.
spring.thymeleaf.template-resolver-order= # Order of the template resolver in the chain.
spring.thymeleaf.view-names= # Comma-separated list of view names (patterns allowed) that can be resolved.
```



## 　　使用 <br/>

　　maven引入依赖 <br/>

```
        <!--Thymeleaf模板依赖-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
```



　　项目结构 <br/>

　　thymeleaf默认，页面跳转默认路径：src/main/resources/templates，静态资源默认路径：src/main/resources/static； <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181108155202689-1191796547.png)  <br/>



　　yml配置文件 <br/>

　　我们也可以再配置文件中修改它：classpath:/view/ <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181108160502107-1738951049.png)  <br/>



 　　controller页面跳转 <br/>

　　使用ModelAndView进行跳转，将数据add进去 <br/>

　　PS：thymeleaf设置页面路径，不要用“/”开头，这玩意有个坑，本地开发环境运行正常，部署到linux就会报404 <br/>

```
    @RequestMapping("/login.do")
    public ModelAndView login(User user){
        Result result=userService.login(user);
        ModelAndView mv=new ModelAndView();
        mv.addObject("newText","你好，Thymeleaf！");
        mv.addObject("gender","1");
        mv.addObject("userList",result.getData());
        if(result.getData()!=null) {
            mv.addObject("loginUser",result.getData());
        }
        mv.setViewName("index.html");
        return mv;
    }
```



　　html页面取值 <br/>

　　引入命名空间，避免校验错误<html xmlns:th="http://www.thymeleaf.org"> <br/>

```
<!DOCTYPE html>
<!--解决idea thymeleaf 表达式模板报红波浪线-->
<!--suppress ALL -->
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8" />
    <title>srpingboot</title>
</head>
<body>
    <!-- 属性替换，其他属性同理 -->
    <h1 th:text="${newText}">Hello World</h1>
    <!--
        设置多个attr
        th:attr="id=${user.id},data-xxx=${user.xxx},data-yyy=${user.yyy}"

        片段的使用、传值和调用
        <div th:fragment="common(text1,text2)">
            ...
        </div>
        th:insert 是最简单的：它只是插入指定的片段作为其主机标签的主体。
        <div th:insert="base ::common(${text1},${text2})"></div>

        th:replace实际上用指定的片段替换它的主机标签。
        <div th:replace="base ::common(${text1},${text2})"></div>　　　　　　　　　三目表达式：　　　　　<h3 th:text="${loginUser != null} ? ${loginUser.username} : '请登录'"></h3>　
    -->

    <!-- if-else -->
    <h3 th:if="${loginUser} ne null" th:text="${loginUser.username}"></h3>
    <h3 th:unless="${loginUser} ne null">请登录</h3>

    <!-- switch -->
    <div th:switch="${gender}">
        <p th:case="'1'">男</p>
        <p th:case="'0'">女</p>
        <!-- th:case="*"  类似switch中的default -->
        <p th:case="*">其他</p>
    </div>

    <!-- 　　　　each　　　　其中，iterStat参数为状态变量，常用的属性有　　　　index 迭代下标，从0开始　　　　count 迭代下标，从1开始　　　　size 迭代元素的总量　　　　current 当前元素
　　 -->
    <table>
        <thead>
            <tr>
                <th>id</th>
                <th>username</th>
                <th>password</th>
                <th>created</th>
                <th>description</th>
            </tr>
        </thead>
        <tbody>
            <tr th:each="user,iterStat : ${userList}">
                <td th:text="${user.id}"></td>
                <td th:text="${user.username}"></td>
                <td th:text="${user.password}"></td>
                <td th:text="${user.created}"></td>
                <td th:text="${user.description}"></td>
            </tr>
        </tbody>
    </table>
</body>
<!-- 引入静态资源 -->
<script th:src="@{/js/jquery-1.9.1.min.js}" type="application/javascript"></script>
</html>
```



　　本地打开 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181108164214198-960633340.png)  <br/>



　　服务容器打开，登录失败页面效果 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181108164006606-936007126.png)  <br/>



　　服务容器打开，登录成功页面效果 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201811/1353055-20181108163916190-1510490891.png)  <br/>



## 　　标准表达式 <br/>

　　简单表达
　　变量表达式： ${...}
　　选择变量表达式： *{...}
　　消息表达式： #{...}
　　链接网址表达式： @{...}
　　片段表达式： ~{...} <br/>

　　字面
　　文本文字：'one text'，'Another one!'，...
　　号码文字：0，34，3.0，12.3，...
　　布尔文字：true，false
　　空字面： null
　　文字标记：one，sometext，main，...
　　文字操作：
　　字符串连接： +
　　文字替换： |The name is ${name}| <br/>

　　算术运算
　　二元运算符：+，-，*，/，%
　　减号（一元运算符）： - <br/>

　　布尔运算
　　二元运算符：and，or
　　布尔否定（一元运算符）： !，not <br/>

　　比较和平等
　　比较：>，<，>=，<=（gt，lt，ge，le）
　　等值运算符：==，!=（eq，ne） <br/>

　　条件运算符
　　if-then: (if) ? (then)
　　if-then-else: (if) ? (then) : (else)
　　default: (value) ?: (defaultvalue) <br/>

　　特殊特征符
　　无操作： _ <br/>

　　所有这些功能都可以组合和嵌套，例：
　　'User is of type ' + (${user.isAdmin()} ? 'Administrator' : (${user.type} ?: 'Unknown')) <br/>

　　官网表达式介绍：[https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#standard-expression-syntax](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#standard-expression-syntax) <br/>


## 　　后记 <br/>

　　springboot+thymeleaf，前后端分离已经成为了趋势，这里进行学习记录整理，以免以后又要到处查资料。 <br/>



## 　　补充 <br/>

　　2019-07-24补充：除此之外，thymeleaf还内置了很多对象，可以从上下文获取数据，还有好多对象的操作方法，具体请看： <br/>

　　附录A：表达式基本对象：[https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#appendix-a-expression-basic-objects](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#appendix-a-expression-basic-objects) <br/>

　　附录B：表达式实用程序对象：[https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#appendix-b-expression-utility-objects](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html#appendix-b-expression-utility-objects) <br/>



　　比如： <br/>

　　在页面获取项目路径 <br/>

```
<script th:inline="javascript">
    //项目根路径
    // ctx = /*[[@{/}]]*/'';
    ctx = [[${#request.getContextPath()}]];//应用路径
</script>
```



 　　判断集合长度 <br/>

```
<p th:if="${#lists.size(list)} < 25">
    <p>list集合长度小于25！</p>
</p>
```

　　字符串全大写、小写 <br/>

```
<p th:text="${#strings.toUpperCase(name)}"></p>

<p th:text="${#strings.toLowerCase(name)}"></p>
```

　　有一点要注意，使用这些内置对象，方法传参里面不需要再用${}来取值了，例如，后台传过来的名称叫name <br/>

　　错误使用： <br/>

```
<p th:text="${#strings.toUpperCase($(name))}"></p>
```

　　正确使用： <br/>

```
<p th:text="${#strings.toUpperCase(name)}"></p>
```



　　更多内置对象方法请看官网！ <br/>



　　补充：本地环境不报错，Linux环境下报错，模板不存在：Error resolving template [/bam/login], template might not exist or might not be accessible by any of the configured Template Resolvers <br/>

　　解决： <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201908/1353055-20190822191652982-1403888902.png)  <br/>

　　把/去掉就可以了 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201908/1353055-20190822191636954-1426428911.png)  <br/>



　　<span style="color: rgba(255, 0, 0, 1)">  2021-04-30更新</span> <br/>

　　<span style="font-family: 宋体">  如何实现递归？例子：菜单递归</span> <br/>

　　递归模板定义 <br/>



```
<!-- 递归用户系统菜单模板 -->
<th:block th:fragment="sysMenu(menuList)">
    <dd class="layui-nav-item" th:each="menu,iterStat : ${menuList}">
        <a th:text="${menu.menuName}"
           th:data-url="${#request.getContextPath() + menu.menuPath}"
           th:data-id="${menu.menuId}" class="huanzi-menu" href="javascript:;">XXX菜单</a>
        <dl class="layui-nav-child" th:if="${#lists.size(menu.children)} > 0">
            <th:block th:include="this::sysMenu(${menu.children})"></th:block>
        </dl>
    </dd>
</th:block>
```

　　后端数据结构（精简了数据仅保留基本结构） <br/>

```
[
	{“menuName”:”系统管理”,”children”:[
		{“menuName”:"系统设置",”children”:[]},
		{“menuName”:"权限管理",”children”:[]},
		{“menuName”:"菜单管理",”children”:[]},
		{“menuName”:"用户管理",”children”:[]},
		{“menuName”:"实时监控",”children”:[]},
		{“menuName”:"实时日志",”children”:[]},
		{“menuName”:"新增测试",”children”:[
			{“menuName”:"三级菜单",”children”:[]},
			{“menuName”:"三级1",”children”:[]},
			{“menuName”:"三级2",”children”:[]},
		]},
	]},
	{“menuName”:"XXX菜单",”children”:[]},
	{“menuName”:”YYY菜单”,”children”:[]},
]
```

　　代码使用 <br/>

```
<ul class="layui-nav layui-nav-tree" lay-filter="test" lay-shrink="all" th:style="${' background-color:' + sys.sysColor + ' !important;'}">
    <!-- 动态读取加载系统菜单 -->
    <li class="layui-nav-item" th:each="menu,iterStat : ${menuList}">
        <a th:text="${menu.menuName}"
           th:data-url="${#request.getContextPath() + menu.menuPath}"
           th:data-id="${menu.menuId}" class="huanzi-menu" href="javascript:;">XXX菜单</a>
        <dl class="layui-nav-child" th:if="${#lists.size(menu.children)} > 0">
            <th:block th:include="common/head::sysMenu(${menu.children})"></th:block>
        </dl>
    </li>
</ul>
```

　　页面效果 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202104/1353055-20210430170853862-1710005981.png)  <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


