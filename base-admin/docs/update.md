## 　　补充更新 <br/>

<span style="color: rgba(255, 0, 0, 1)">  2020-05-14更新</span> <br/>

1、新增百度富文本的使用，但还没配置上传接口：[UEditor文档](http://fex.baidu.com/ueditor/#start-start) <br/>

<span style="color: rgba(255, 0, 0, 1)">  longtext</span> <br/>

![](https://img2020.cnblogs.com/blog/1353055/202005/1353055-20200514175242672-1484757215.png)  <br/>



2、新增“”记住我“”功能，也就是rememberMe，原理以及源码探究请看这位大佬的博客：[https://blog.csdn.net/qq_37142346/article/details/80114609](https://blog.csdn.net/qq_37142346/article/details/80114609) <br/>

![](https://img2020.cnblogs.com/blog/1353055/202005/1353055-20200514175643111-1580626155.png) ![](https://img2020.cnblogs.com/blog/1353055/202005/1353055-20200514181035600-1632503549.png)  <br/>

需要新增一张表，SQL文件我也以及更新了 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202005/1353055-20200514175723923-1608094283.png)  <br/>



3、修复若干bug，使其系统越来越完善 <br/>



<span style="color: rgba(255, 0, 0, 1)">  2020-05-16更新</span> <br/>

1、系统设置新增系统颜色，头部、左侧菜单的颜色可按心情切换（SQL文件已同步更新） <br/>

![](https://img2020.cnblogs.com/blog/1353055/202005/1353055-20200516175012845-1963105858.png)  <br/>



<span style="color: rgba(255, 0, 0, 1)">  　　2020-07-02更新</span> <br/>

1、用户管理模块新增“当前在线用户”管理，可实时查看当前在线用户，以及对当前在线用户进行强制下线操作 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202007/1353055-20200702153541116-1976770548.gif)  <br/>



<span style="color: rgba(255, 0, 0, 1)">  　　2020-12-31更新</span> <br/>

系统菜单、用户个性菜单新增排序字段，可自定义排序 <br/>

private Integer sortWeight;//同级排序权重：0-10 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202012/1353055-20201231144712854-67925321.png)  <br/>



![](https://img2020.cnblogs.com/blog/1353055/202012/1353055-20201231144736155-1443567111.png)  <br/>

<span style="color: rgba(255, 0, 0, 1)">   　　2021-04-19更新</span> <br/>

支持创建、展示多级菜单 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210518172549395-1167820552.png)  <br/>





<span style="color: rgba(255, 0, 0, 1)">  2021-04-22更新</span> <br/>

登录页放开“七天免登陆”选项 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202105/1353055-20210518172357607-188016356.png)  <br/>

<span style="color: rgba(255, 0, 0, 1)">  　2021-06-25更新</span> <br/>

1、我优化了AutoGenerator.java的代码，并升级了V2.0版本的代码生成器，支持使用模板文件生成代码：AutoGeneratorPlus.java <br/>

详情请参考：[https://www.cnblogs.com/huanzi-qch/p/14927738.html](https://www.cnblogs.com/huanzi-qch/p/14927738.html) <br/>



2、OpenApi对外开放的接口，做限流处理，支持在系统设置中开启、关闭 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202106/1353055-20210625161917851-660941644.gif)  <br/>

![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210715171715550-1384145747.png)  <br/>





2021-07-15更新：进行了一波代码优化（例如：创建集合时合理估算大小赋初始值，避免扩容带来的消耗），内存能省则内存 <br/>

优化前： <br/>

![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210715171858735-29560781.png)  <br/>

优化后： <br/>

![](https://img2020.cnblogs.com/blog/1353055/202107/1353055-20210715171916695-1714182519.png)  <br/>



2022-03-09更新：系统设置新增密码复杂度要求，开启后超过90天未更新密码将弹窗提示，用户修改密码时有密码复杂度限制（管理员新增用户、用户登录无复杂度要求）； <br/>

![](https://img2022.cnblogs.com/blog/1353055/202203/1353055-20220309174745034-1815306630.png)  <br/>



![](https://img2022.cnblogs.com/blog/1353055/202203/1353055-20220309175004059-9698048.png)  <br/>

![](https://img2022.cnblogs.com/blog/1353055/202203/1353055-20220309174724621-1528383392.png)  <br/>





2022-08-25：新增[密码安全策略](https://www.cnblogs.com/huanzi-qch/p/16613636.html)，详情请戳：[密码安全策略](https://www.cnblogs.com/huanzi-qch/p/16613636.html) <br/>

![](https://img2022.cnblogs.com/blog/1353055/202208/1353055-20220825151000735-290936223.png)  <br/>



<span style="color: rgba(255, 0, 0, 1)">  2022-11-09更新</span> <br/>

1、新增统一异常处理，详情请戳：[SpringBoot系列——自定义统一异常处理 ](https://www.cnblogs.com/huanzi-qch/p/14788991.html) <br/>

![](https://img2022.cnblogs.com/blog/1353055/202211/1353055-20221109103642804-1712730480.png) ![](https://img2022.cnblogs.com/blog/1353055/202211/1353055-20221109103651309-812152889.png)  <br/>

2、新增附件模块，详情请戳：[SpringBoot系列——附件管理：整合业务表单实现上传、回显、下载](https://www.cnblogs.com/huanzi-qch/p/15294673.html) <br/>

![](https://img2022.cnblogs.com/blog/1353055/202211/1353055-20221109103704925-600250301.png)  <br/>





![](https://img2022.cnblogs.com/blog/1353055/202211/1353055-20221109103715914-1398442543.png)  <br/>

