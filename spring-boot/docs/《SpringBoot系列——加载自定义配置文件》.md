
## 　　前言 <br/>

　　SpringBoot启动时默认加载bootstrap.properties或bootstrap.yml（这两个优先级最高）、application.properties或application.yml，如果我们配置了spring.profiles，同时会加载对应的application-{profile}.properties或application-{profile}.yml，profile为对应的环境变量，比如dev，如果没有配置，则会加载profile=default的配置文件 <br/>

　　虽然说配置项都写在同一个配置文件没有问题，但我们仍然希望能分开写，这样比较清晰，比如eureka的配置写在eureka.properties，数据库相关的配置写在datasource.properties等等，因此就需要设置加载外部配置文件 <br/>

　　更多关于配置项信息请看官网：[https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-external-config](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-external-config) <br/>

　　本文记录SpringBoot加载自定义配置文件的两个方法 <br/>



## 　　两种方法 <br/>

### 　　方法一 <br/>

　　直接在具体的类上面使用注解加载 <br/>

　　比如当你在ServiceAImpl需要使用到xxx.properties时 <br/>

```
//手动加载自定义配置文件
@PropertySource(value = {
        "classpath:xxx.properties",
}, encoding = "utf-8")
@Service
public class ServiceAImpl{

    @Value("${cn.huanzi.qch.xxx}")
    private String xxx;

}
```

　　如果你需要在更早一点引入，则可以在启动类上进行引入 <br/>

```
//手动加载自定义配置文件
@PropertySource(value = {
        "classpath:xxx.properties",
        "classpath:yyy.properties",
        "classpath:zzz.yml",
}, encoding = "utf-8")

@Component
@SpringBootApplication
public class SpringbootLoadmyprofilesApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringbootLoadmyprofilesApplication.class, args);
    }

    @Value("${cn.huanzi.qch.xxx}")
    private String xxx;

    @Value("${cn.huanzi.qch.yyy}")
    private String yyy;

    @Value("${cn.huanzi.qch.zzz}")
    private String zzz;

    @Bean
    void index(){
        System.out.println(xxx);
        System.out.println(yyy);
        System.out.println(zzz);
    }
}
```

　　如果我们只是在业务中需要用到自定义配置文件的值，这样引入并没有什么问题，但外部配置是一些启动项，SpringBoot官网并不推荐我们这样干 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190702170155107-1983770978.png)  <br/>

　　虽然在@SpringBootApplication上使用@PropertySource似乎是在环境中加载自定义资源的一种方便而简单的方法，但我们不推荐使用它，因为SpringBoot在刷新应用程序上下文之前就准备好了环境。使用@PropertySource定义的任何键都加载得太晚，无法对自动配置产生任何影响。 <br/>

　　这种情况下需要采用第二种方法 <br/>



### 　　方法二 <br/>

　　自定义环境处理类，在启动之前定制环境或应用程序上下文， <br/>

　　Customize the Environment or ApplicationContext Before It Starts：[https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#howto-customize-the-environment-or-application-context](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#howto-customize-the-environment-or-application-context) <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190702170624164-452322214.png)  <br/>

　　官网还提供了一个列子： <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190702170648034-1390470618.png)  <br/>



 　　我们也来写一个自定义环境处理，在运行SpringApplication之前加载任意配置文件到Environment环境中 <br/>

```
package cn.huanzi.qch.springbootloadmyprofiles;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.Properties;

/**
 自定义环境处理，在运行SpringApplication之前加载任意配置文件到Environment环境中
 */
public class MyEnvironmentPostProcessor implements EnvironmentPostProcessor {

    //Properties对象
    private final Properties properties = new Properties();

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment,SpringApplication application) {
        //自定义配置文件
        String[] profiles = {
                "xxx.properties",
                "yyy.properties",
                "zzz.yml",
        };

        //循环添加
        for (String profile : profiles) {
            //从classpath路径下面查找文件
            Resource resource = new ClassPathResource(profile);
            //加载成PropertySource对象，并添加到Environment环境中
            environment.getPropertySources().addLast(loadProfiles(resource));
        }
    }

    //加载单个配置文件
    private PropertySource<?> loadProfiles(Resource resource) {
        if (!resource.exists()) {
            throw new IllegalArgumentException("资源" + resource + "不存在");
        }
        try {
            //从输入流中加载一个Properties对象
            properties.load(resource.getInputStream());
            return new PropertiesPropertySource(resource.getFilename(), properties);
        }catch (IOException ex) {
            throw new IllegalStateException("加载配置文件失败" + resource, ex);
        }
    }
}
```

　　并且在META-INF/spring.factories中 <br/>

```
#启用我们的自定义环境处理类
org.springframework.boot.env.EnvironmentPostProcessor=cn.huanzi.qch.springbootloadmyprofiles.MyEnvironmentPostProcessor
```



##  　　简单测试 <br/>

　　先看一下我们的工程结构 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190702171020070-1289990159.png)  <br/>

　　xxx、yyy、zzz里面就只有一个值（yyy、zzz就对应改成yyy、zzz） <br/>

```
cn.huanzi.qch.xxx=this is xxx
```



　　如果不手动加载自定义配置文件，启动将会报错 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190702171531260-1042248823.png)  <br/>



　　因为我们这里不是启动项，方法一、方法二启动效果都差不多 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201907/1353055-20190702171610827-1744748719.png)  <br/>



## 　　后记 <br/>

　　部分代码参考：[https://www.jianshu.com/p/7ab1a62b04ed?from=timeline](https://www.jianshu.com/p/7ab1a62b04ed?from=timeline) <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


