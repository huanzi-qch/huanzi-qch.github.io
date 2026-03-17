
## 　　前言 <br/>

　　我们注意到springboot项目启动时，控制台会打印自带的banner，然后对于部分IT骚年来说，太单调太普通太一般了；所以，是时候表演真正的技术了 <br/>



##  　　项目结构 <br/>

　　我们只需要在springboot项目的resources文件夹下面创建一个banner.txt文件，springboot启动的时候会去加载这个文件，项目结构： <br/>

![](https://img2018.cnblogs.com/blog/1353055/201811/1353055-20181106172258270-1259442361.png)  <br/>



##  　　banner.txt <br/>

　　这里有几个定制banner的网站，文字、图片都可以秀起来，怎么秀就看你的骚操作了 <br/>

　　[http://patorjk.com/software/taag](http://patorjk.com/software/taag) <br/>

　　[http://www.network-science.de/ascii/](http://www.network-science.de/ascii/) <br/>

　　[http://www.degraeve.com/img2txt.php](http://www.degraeve.com/img2txt.php) <br/>



　　banner.txt的内容： <br/>

${AnsiColor.BRIGHT_YELLOW}  ////////////////////////////////////////////////////////////////////  //　　                      _ooOoo_                               //  //                         o8888888o                              //  //                         88" . "88                              //  //                         (| ^_^ |)                              //  //                         O\  =  /O                              //  //                      ____/`---'\____                           //  //                    .'  \\|     |//  `.                         //  //                   /  \\|||  :  |||//  \                        //  //                  /  _||||| -:- |||||-  \                       //  //                  |   | \\\  -  /// |   |                       //  //                  | \_|  ''\---/''  |   |                       //  //                  \  .-\__  `-`  ___/-. /                       //  //                ___`. .'  /--.--\  `. . ___                     //  //              ."" '<  `.___\_<|>_/___.'  >'"".                  //  //            | | :  `- \`.;`\ _ /`;.`/ - ` : | |                 //  //            \  \ `-.   \_ __\ /__ _/   .-` /  /                 //  //      ========`-.____`-.___\_____/___.-`____.-'========         //  //                           `=---='                              //  //      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^        //  //            佛祖保佑       永不宕机      永无BUG                　　//////////////////////////////////////////////////////////////////////  <br/>

![](https://img2018.cnblogs.com/blog/1353055/201811/1353055-20181106172554326-79639619.png)  <br/>

　　banner.txt配置 <br/>

　　${AnsiColor.BRIGHT_RED}：设置控制台中输出内容的颜色 <br/>

　　${application.version}：用来获取MANIFEST.MF文件中的版本号 <br/>

　　${application.formatted-version}：格式化后的${application.version}版本信息 <br/>

　　${spring-boot.version}：Spring Boot的版本号 <br/>

　　${spring-boot.formatted-version}：格式化后的${spring-boot.version}版本信息 <br/>



　　spring对banner的配置，来自springboot参考手册，Common application properties：[https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#common-application-properties](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#common-application-properties) <br/>

```
# BANNER
spring.banner.charset=UTF-8 # Banner file encoding.
spring.banner.location=classpath:banner.txt # Banner text resource location.
spring.banner.image.location=classpath:banner.gif # Banner image file location (jpg or png can also be used).
spring.banner.image.width=76 # Width of the banner image in chars.
spring.banner.image.height= # Height of the banner image in chars (default based on image height).
spring.banner.image.margin=2 # Left hand image margin in chars.
spring.banner.image.invert=false # Whether images should be inverted for dark terminal themes.
```



## 　　效果  <br/>

![](https://img2018.cnblogs.com/blog/1353055/201811/1353055-20181106172731074-2137398188.png)  <br/>



## 　　结束语 <br/>

　　秀儿，是你吗？ <br/>

　　banner默认开启，如果不想让它打印怎么办？ <br/>

　　方法1，在main的run方法设置 <br/>

```
/**
 * 启动主类，springboot的入口
 * springboot 默认扫描的类是在启动类的当前包和下级包
 */
@SpringBootApplication
public class SpringbootWebsocketSpringdataJpaApplication {

    public static void main(String[] args) {
        SpringApplication springApplication = new SpringApplication(SpringbootWebsocketSpringdataJpaApplication.class);
        //Banner.Mode.OFF 关闭
        springApplication.setBannerMode(Banner.Mode.OFF);
        springApplication.run(args);
    }
}
```

 　　方法2，Edit Configurations --> 勾选Hide banner <br/>

![](https://img2018.cnblogs.com/blog/1353055/201811/1353055-20181108102452583-1276364041.png)  <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


