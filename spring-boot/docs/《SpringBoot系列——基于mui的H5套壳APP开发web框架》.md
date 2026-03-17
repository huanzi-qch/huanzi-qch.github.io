
## 　　前言 <br/>

　　大致原理：创建一个main主页面，只有主页面有头部、尾部，中间内容嵌入iframe内容子页面，如果在当前页面进行跳转操作，也是在iframe中进行跳转，而如果点击尾部按钮切换模块、页面，那就切换iframe标签的src进行更新url，这样我们在跳转页面时，头部、尾部都不会刷新，浏览效果更佳，配合mui前端框架，使操作体验更接近原生App <br/>

　　如果不用考虑APP上架审核的问题，可以采用H5套壳的方式开发APP，可以降低开发人员的学习成本，uni-app + H5这样的套壳Web App，会Web项目开发的开发就能轻松上手 <br/>

　　得益于[之前的总结](https://www.cnblogs.com/huanzi-qch/p/11972723.html)，基于mui的H5套壳APP开发web框架，逐步完善，开源分享 <br/>



##  　　技术栈 <br/>

　　springboot + thymelea + mui <br/>



## 　　效果演示 <br/>

### 　　目录结构 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418162828614-537987111.png)  <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418164114680-2035179176.png)  <br/>



### 　　uni-app套壳 <br/>

　　1、新建uni-app项目，页面仅使用webview组件，直接指定服务地址 <br/>

```
<web-view id="webView" :src="url"></web-view>
```



　　2、配置沉浸式 <br/>

　　需要设置page.json <br/>

```
 {
   "globalStyle": {
        "navigationStyle":"custom"
    },
    "usingComponts": true 
 }
```

　　以及manifest.json <br/>

```
 "app-plus" : {
        "statusbar" : {
            "immersed" : true
        }
 }
```

　　其他的暂时不配置，比如APP图标、启动图等，提交云端打包、下载安装 <br/>



　　App 版比H5版多一个系统状态栏占高 <br/>

```
    //h5端默认隐藏
    mui.plusReady(function(){
        //显示系统状态栏占高
        $(".huanzi-header .statusbar").css("display","block");

        //自适应高度
        adaptiveHeight();
    });
```

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418162136860-310781788.jpg) ![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418162150221-2003270239.jpg) ![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418162159888-1096019981.jpg) ![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418171858078-531899123.jpg) ![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418171913397-501072046.jpg)  <br/>



### 　　头、尾操作 <br/>

　　分为标题头部按钮操作、底部按钮操作 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200424114810404-652385204.gif) ![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418161008485-67351516.gif)  <br/>



### 　　按钮切换模式 <br/>

　　按钮切换分为两种模式：1 切换立即加载初始url　　   2 切换仅回显页面，在当前页面点击才加载（切换为首次加载除外） <br/>

　　切换方式也很简单，在配置文件进行修改即可 <br/>

```
#底部按钮切换模式：1 切换立即加载初始url  2 切换仅回显页面，在当前页面点击才加载（切换为首次加载除外）
huanzi.buttom.switch.mode=1
```



　　1 切换立即加载初始url  <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418160620144-1640198832.gif)  <br/>



　　2 切换仅回显页面，在当前页面点击才加载（切换为首次加载除外） <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418155817817-1395272483.gif)  <br/>



### 　　mui loading <br/>

　　显示：mui.showLoading('加载中...','div'); <br/>

　　隐藏：mui.hideLoading(); <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418163155028-1006907532.gif)  <br/>

　　其他mui弹窗效果，请移步官网文档查看！ <br/>



### 　　自定义封装 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418163508030-1050002114.gif)  <br/>



### 　　物理按钮监听 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418174631737-599701732.png)  <br/>



### 　　顶部进度条 <br/>

　　<span style="color: rgba(152, 118, 170, 1)">  <a href="http://ricostacruz.com/nprogress/" target="_blank" rel="noopener nofollow">    NProgress插件  </a>  <span style="color: rgba(136, 136, 136, 1)">    <br/>  </span></span> <br/>

　　<span style="color: rgba(152, 118, 170, 1)">  <span style="color: rgba(0, 0, 0, 1)">    在main主页面中引入，head.html的最开始处调用start  </span></span> <br/>



```
    <!-- 顶部进度条开始 -->
    <head>
        <script>
            //顶部进度条开始，子页面加载才调用
            if(window.location.pathname !== "/muiwrapper/main"){
                window.parent.NProgress.start();
            }
        </script>
    </head>
```



　　在iframe的onload回调中调用done <br/>

```
        //顶部进度条结束
        window.NProgress.done();
```

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200420152841456-539527016.gif)  <br/>





## 　　更新、补充 <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  2020-04-27更新：</span> <br/>

　　1、新增底部按钮动态配置，真正项目应用中，可以从数据库动态读取，这样的话后面需要调整按钮配置也不需要修改代码，直接改配置即可 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200427183652018-1249153402.png)  <br/>

　　底部按钮 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200427184656246-505858890.png)  <br/>



 　　以及对于的iframe <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200427184747132-1780545899.png)  <br/>





　　2、自定义弹窗，告警、确认弹窗内部调用父类显示，回调依旧执行子iframe的方法，效果就是遮阴层能后覆盖标题栏、底部按钮 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200427184601477-1448032805.gif)  <br/>



 　　3、优化代码main.html代码，尽量使用thymeleaf语法；开启初始化所有页面功能，页面提前加载、提高后续切换页面体验； <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200427184200038-334959752.gif)  <br/>





　　<span style="color: rgba(255, 0, 0, 1)">  2020-06-01更新</span> <br/>

　　1、优化tab页切换效果，实现过渡动画，而不是直接切换； <br/>

![](https://img2020.cnblogs.com/blog/1353055/202006/1353055-20200601182004465-192387753.gif)  <br/>



　　2、同tab页中，div窗体切换效果实现； <br/>

![](https://img2020.cnblogs.com/blog/1353055/202006/1353055-20200601182054905-804317260.gif)  <br/>



　　3、新增自定义键盘（来自大佬的开源组件分享：https://www.jianshu.com/p/cb21ca8786a4，不支持中文），主要用于输入密码等对安全行为要求较高的动作 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202006/1353055-20200601182249300-1204984047.gif)  <br/>





## 　　后记 <br/>

　　注意，浏览器访问需要打开控制台，切换到移动端模式，还有我们的适配器判断过于简单，有些情况下会判断错误，例如360浏览器 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202004/1353055-20200418180306923-878973716.png)  <br/>

　　代码其实不多，主要涉及都父、子窗口相互调用的问题，基于mui的H5套壳APP开发web框架暂时记录到这，后续再进行补充 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


