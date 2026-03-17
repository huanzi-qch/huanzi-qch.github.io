
## 　　前言 <br/>

　　日常开发中，我们可能会碰到需要进行防重放与操作幂等的业务，本文记录SpringBoot实现简单防重与幂等 <br/>



　　防重放，防止数据重复提交 <br/>

　　操作幂等性，多次执行所产生的影响均与一次执行的影响相同 <br/>



　　解决什么问题？ <br/>

　　表单重复提交，用户多次点击表单提交按钮 <br/>

　　接口重复调用，接口短时间内被多次调用 <br/>



　　思路如下： <br/>

　　1、前端页面表提交钮置灰不可点击+js节流防抖 <br/>

　　2、Redis防重Token令牌 <br/>

　　3、数据库唯一主键 + 乐观锁 <br/>



## 　　具体方案 <br/>

　　pom引入依赖 <br/>

```
        <!-- Redis -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>

        <!-- thymeleaf模板 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>

        <!--添加MyBatis-Plus依赖 -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
            <version>3.4.0</version>
        </dependency>

        <!--添加MySQL驱动依赖 -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
```

![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408171121175-1522889774.png)  <br/>



 　　一个测试表 <br/>

```
CREATE TABLE `idem`  (
  `id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '唯一主键',
  `msg` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '业务数据',
  `version` int(8) NOT NULL COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '防重放与操作幂等测试表' ROW_FORMAT = Compact;
```



### 　　前端页面 <br/>



　　先写一个test页面，引入jq <br/>

```
<!DOCTYPE html>
<!--解决idea thymeleaf 表达式模板报红波浪线-->
<!--suppress ALL -->
<html xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="UTF-8" />
  <title>防重放与操作幂等</title>

  <!-- 引入静态资源 -->
  <script th:src="@{/js/jquery-1.9.1.min.js}" type="application/javascript"></script>
</head>
<body>
  <form>
    <!-- 隐藏域 -->
    <input type="hidden" id="token" th:value="${token}"/>

    <!-- 业务数据 -->
    id：<input id="id" th:value="${id}"/> <br/>
    msg：<input id="msg" th:value="${msg}"/> <br/>
    version：<input id="version" th:value="${version}"/> <br/>

    <!-- 操作按钮 -->
    <br/>
    <input type="submit" value="提交" onclick="formSubmit(this)"/>
    <input type="reset" value="重置"/>
  </form>
  <br/>

  <button id="btn">节流测试，点我</button>
  <br/>
  <button id="btn2">防抖测试，点我</button>
</body>
<script>
  /*

  //插入
  for (let i = 0; i < 5; i++) {
    $.get("http://localhost:10010/idem/insert?id=1&msg=张三"+i+"&version=1",null,function (data){
      console.log(data);
    });
  }

  //修改
  for (let i = 0; i < 5; i++) {
    $.get("http://localhost:10010/idem/update?id=1&msg=李四"+i+"&version=1",null,function (data){
      console.log(data);
    });
  }

  //删除
  for (let i = 0; i < 5; i++) {
    $.get("http://localhost:10010/idem/delete?id=1",null,function (data){
      console.log(data);
    });
  }

  //查询
  for (let i = 0; i < 5; i++) {
    $.get("http://localhost:10010/idem/select?id=1",null,function (data){
      console.log(data);
    });
  }

  //test表单测试
  for (let i = 0; i < 5; i++) {
    $.get("http://localhost:10010/test/test?token=abcd&id=1&msg=张三"+i+"&version=1",null,function (data){
      console.log(data);
    });
  }

  //节流测试
  for (let i = 0; i < 5; i++) {
    document.getElementById('btn').onclick();
  }

  //防抖测试
  for (let i = 0; i < 5; i++) {
    document.getElementById('btn2').onclick();
  }

   */


  function formSubmit(but){
    //按钮置灰
    but.setAttribute("disabled","disabled");

    let token = $("#token").val();
    let id = $("#id").val();
    let msg = $("#msg").val();
    let version = $("#version").val();

    $.ajax({
      type: 'post',
      url: "/test/test",
      contentType:"application/x-www-form-urlencoded",
      data: {
        token:token,
        id:id,
        msg:msg,
        version:version,
      },
      success: function (data) {
        console.log(data);

        //按钮恢复
        but.removeAttribute("disabled");
      },
      error: function (xhr, status, error) {
        console.error("ajax错误！");

        //按钮恢复
        but.removeAttribute("disabled");
      }
    });

    return false;
  }

  document.getElementById('btn').onclick = throttle(function () {
    console.log('节流测试 helloworld');
  }, 1000)
  // 节流：给定一个时间，不管这个时间你怎么点击，点上天，这个时间内也只会执行一次
  // 节流函数
  function throttle(fn, delay) {
    var lastTime = new Date().getTime()
    delay = delay || 200
    return function () {
      var args = arguments
      var nowTime = new Date().getTime()
      if (nowTime - lastTime >= delay) {
        lastTime = nowTime
        fn.apply(this, args)
      }
    }
  }

  document.getElementById('btn2').onclick = debounce(function () {
    console.log('防抖测试 helloworld');
  }, 1000)
  // 防抖：给定一个时间，不管怎么点击按钮，每点一次，都会在最后一次点击等待这个时间过后执行
  // 防抖函数
  function debounce(fn, delay) {
    var timer = null
    delay = delay || 200
    return function () {
      var args = arguments
      var that = this
      clearTimeout(timer)
      timer = setTimeout(function () {
        fn.apply(that, args)
      }, delay)
    }
  }
</script>
</html>
View Code
```



　　按钮置灰不可点击 <br/>



　　点击提交按钮后，将提交按钮置灰不可点击，ajax响应后再恢复按钮状态 <br/>

```
  function formSubmit(but){
    //按钮置灰
    but.setAttribute("disabled","disabled");

    let token = $("#token").val();
    let id = $("#id").val();
    let msg = $("#msg").val();
    let version = $("#version").val();

    $.ajax({
      type: 'post',
      url: "/test/test",
      contentType:"application/x-www-form-urlencoded",
      data: {
        token:token,
        id:id,
        msg:msg,
        version:version,
      },
      success: function (data) {
        console.log(data);

        //按钮恢复
        but.removeAttribute("disabled");
      },
      error: function (xhr, status, error) {
        console.error("ajax错误！");

        //按钮恢复
        but.removeAttribute("disabled");
      }
    });

    return false;
  }
```



![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408162813517-417068331.gif)  <br/>





　　js节流、防抖 <br/>



　　节流：给定一个时间，不管这个时间你怎么点击，点上天，这个时间内也只会执行一次 <br/>

```
  document.getElementById('btn').onclick = throttle(function () {
    console.log('节流测试 helloworld');
  }, 1000)
  // 节流：给定一个时间，不管这个时间你怎么点击，点上天，这个时间内也只会执行一次
  // 节流函数
  function throttle(fn, delay) {
    var lastTime = new Date().getTime()
    delay = delay || 200
    return function () {
      var args = arguments
      var nowTime = new Date().getTime()
      if (nowTime - lastTime >= delay) {
        lastTime = nowTime
        fn.apply(this, args)
      }
    }
  }
```

![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408162329052-1883725075.gif)  <br/>





　　防抖：给定一个时间，不管怎么点击按钮，每点一次，都会在最后一次点击等待这个时间过后执行 <br/>

```
  document.getElementById('btn2').onclick = debounce(function () {
    console.log('防抖测试 helloworld');
  }, 1000)
  // 防抖：给定一个时间，不管怎么点击按钮，每点一次，都会在最后一次点击等待这个时间过后执行
  // 防抖函数
  function debounce(fn, delay) {
    var timer = null
    delay = delay || 200
    return function () {
      var args = arguments
      var that = this
      clearTimeout(timer)
      timer = setTimeout(function () {
        fn.apply(that, args)
      }, delay)
    }
  }
```

![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408162427552-1054891426.gif)  <br/>





### 　　Redis <br/>

　　防重Token令牌 <br/>



　　跳转前端表单页面时，设置一个UUID作为token，并设置在表单隐藏域 <br/>

```
    /**
     * 跳转页面
     */
    @RequestMapping("index")
    private ModelAndView index(String id){
        ModelAndView mv = new ModelAndView();
        mv.addObject("token",UUIDUtil.getUUID());
        if(id != null){
            Idem idem = new Idem();
            idem.setId(id);
            List select = (List)idemService.select(idem);
            idem = (Idem)select.get(0);
            mv.addObject("id", idem.getId());
            mv.addObject("msg", idem.getMsg());
            mv.addObject("version", idem.getVersion());
        }
        mv.setViewName("test.html");
        return mv;
    }
```

```
  <form>
    <!-- 隐藏域 -->
    <input type="hidden" id="token" th:value="${token}"/>

    <!-- 业务数据 -->
    id：<input id="id" th:value="${id}"/> <br/>
    msg：<input id="msg" th:value="${msg}"/> <br/>
    version：<input id="version" th:value="${version}"/> <br/>

    <!-- 操作按钮 -->
    <br/>
    <input type="submit" value="提交" onclick="formSubmit(this)"/>
    <input type="reset" value="重置"/>
  </form>
```





　　后台查询redis缓存，如果token不存在立即设置token缓存，允许表单业务正常进行；如果token缓存已经存在，拒绝表单业务 <br/>

　　PS：token缓存要设置一个合理的过期时间 <br/>

```
    /**
     * 表单提交测试
     */
    @RequestMapping("test")
    private String test(String token,String id,String msg,int version){
        //如果token缓存不存在，立即设置缓存且设置有效时长（秒）
        Boolean setIfAbsent = template.opsForValue().setIfAbsent(token, "1", 60 * 5, TimeUnit.SECONDS);

        //缓存设置成功返回true，失败返回false
        if(Boolean.TRUE.equals(setIfAbsent)){

            //模拟耗时
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            //打印测试数据
            System.out.println(token+","+id+","+msg+","+version);

            return "操作成功！";
        }else{
            return "操作失败，表单已被提交...";
        }
    }
```

![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408163528742-1485512079.gif)  <br/>

　　for循环测试中，5个操作只有一个执行成功！ <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408163619443-2023665782.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408164844216-540541056.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408164955731-1608185195.png)  <br/>







### 　　数据库 <br/>

　　唯一主键 + 乐观锁 <br/>



　　查询操作自带幂等性 <br/>

```
    /**
     * 查询操作，天生幂等性
     */
    @Override
    public Object select(Idem idem) {
        QueryWrapper<Idem> queryWrapper = new QueryWrapper<>();
        queryWrapper.setEntity(idem);
        return idemMapper.selectList(queryWrapper);
    }
```

　　查询没什么好说的，只要数据不变，查询条件不变的情况下查询结果必然幂等 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408164116622-710736413.png)  <br/>





　　唯一主键可解决插入操作、删除操作 <br/>

```
    /**
     * 插入操作，使用唯一主键实现幂等性
     */
    @Override
    public Object insert(Idem idem) {
        String msg = "操作成功！";
        try{
            idemMapper.insert(idem);
        }catch (DuplicateKeyException e){
            msg = "操作失败，id："+idem.getId()+"，已经存在...";
        }
        return msg;
    }

    /**
     * 删除操作，使用唯一主键实现幂等性
     * PS：使用非主键条件除外
     */
    @Override
    public Object delete(Idem idem) {
        String msg = "操作成功！";
        int deleteById = idemMapper.deleteById(idem.getId());
        if(deleteById == 0){
            msg = "操作失败，id："+idem.getId()+"，已经被删除...";
        }
        return msg;
    }
```

　　利用主键唯一的特性，捕获处理重复操作 <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408164046833-1415367311.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408164516651-1181788841.png)  <br/>





![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408164314069-1777308095.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408164351479-2086841375.png)  <br/>









　　乐观锁可解决更新操作 <br/>

```
    /**
     * 更新操作，使用乐观锁实现幂等性
     */
    @Override
    public Object update(Idem idem) {
        String msg = "操作成功！";

        // UPDATE table SET [... 业务字段=? ...], version = version+1 WHERE (id = ? AND version = ?)
        UpdateWrapper<Idem> updateWrapper = new UpdateWrapper<>();

        //where条件
        updateWrapper.eq("id",idem.getId());
        updateWrapper.eq("version",idem.getVersion());

        //version版本号要单独设置
        updateWrapper.setSql("version = version+1");
        idem.setVersion(null);

        int update = idemMapper.update(idem, updateWrapper);
        if(update == 0){
            msg = "操作失败，id："+idem.getId()+"，已经被更新...";
        }

        return msg;
    }
```

　　执行更新sql语句时，where条件带上version版本号，如果执行成功，除了更新业务数据，同时更新version版本号标记当前数据已被更新 <br/>

```
UPDATE table SET [... 业务字段=? ...], version = version+1 WHERE (id = ? AND version = ?)
```



　　执行更新操作前，需要重新执行插入数据 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408164203930-566454572.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220408164233918-326297836.png)  <br/>





　　以上for循环测试中，5个操作同样只有一个执行成功！ <br/>



## 　　后记 <br/>



　　redis、乐观锁不要在代码先查询后if判断，这样会存在并发问题，导致数据不准确，应该把这种判断放在redis、数据库 <br/>

　　错误示例： <br/>

```
//获取最新缓存
String redisToken = template.opsForValue().get(token);

//为空则放行业务
if(redisToken == null){
    //设置缓存
    template.opsForValue().set(token, "1", 60 * 5, TimeUnit.SECONDS);

    //业务处理
}else{
    //拒绝业务
}
```

　　错误示例： <br/>

```
//获取最新版本号
Integer version = idemMapper.selectById(idem.getId()).getVersion();

//版本号相同，说明数据未被其他人修改
if(version == idem.getVersion()){
    //正常更新
}else{
    //拒绝更新
}
```





　　防重与幂等暂时先记录到这，后续再进行补充 <br/>



## 　　代码开源 <br/>



　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


