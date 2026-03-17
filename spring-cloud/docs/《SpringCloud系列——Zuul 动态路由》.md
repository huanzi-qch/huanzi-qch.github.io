
## 　　前言 <br/>

　　Zuul 是在Spring Cloud Netflix平台上提供动态路由,监控,弹性,安全等边缘服务的框架，是Netflix基于jvm的路由器和服务器端负载均衡器，相当于是设备和 Netflix 流应用的 Web 网站后端所有请求的前门。本文基于上篇（[SpringCloud系列——Ribbon 负载均衡](https://www.cnblogs.com/huanzi-qch/p/10136254.html)）实现Zuul动态路由 <br/>

　　GitHub地址：[https://github.com/Netflix/zuul](https://github.com/Netflix/zuul) <br/>

　　官方文档：[https://cloud.spring.io/spring-cloud-static/spring-cloud-netflix/2.1.0.RC2/single/spring-cloud-netflix.html#_router_and_filter_zuul](https://cloud.spring.io/spring-cloud-static/spring-cloud-netflix/2.1.0.RC2/single/spring-cloud-netflix.html#_router_and_filter_zuul) <br/>



## 　　代码编写 <br/>

　　首先我们在springCloud下面新建一个springboot项目：zuul-server，pom继承parent，并且在Eureka上面注册（还不会服务注册与发现的，请戳：[SpringCloud系列——Eureka 服务注册与发现](https://www.cnblogs.com/huanzi-qch/p/10131985.html)） <br/>

![](https://img2018.cnblogs.com/blog/1353055/201812/1353055-20181219102108173-1887365913.png)  <br/>

 　　maven引入Zuul <br/>

```
        <!-- Zuul -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-zuul</artifactId>
        </dependency>
```

　　配置文件 <br/>

```
server.port=10010
spring.application.name=zuul-server
eureka.client.serviceUrl.defaultZone=http://localhost:1111/eureka/
#健康检查（需要spring-boot-starter-actuator依赖）
eureka.client.healthcheck.enabled=true
# 续约更新时间间隔（默认30秒）
eureka.instance.lease-renewal-interval-in-seconds=10
# 续约到期时间（默认90秒）
eureka.instance.lease-expiration-duration-in-seconds=10

#zuul代理配置  zuul.routes.服务名.path,服务名要与注册的一致
#应用名映射
zuul.routes.myspringboot.path=/myspringboot/**
zuul.routes.myspringboot.service-id=myspringboot

#URL映射
#zuul.routes.myspringboot.path=/myspringboot/**
#zuul.routes.myspringboot-url.url=http://localhost:10087/
```

　　自定义Zuul过滤器 <br/>

　　更多的检查规则后续慢慢健全 <br/>

```
/**
 * Zuul过滤器，实现了路由检查
 */
public class AccessFilter extends ZuulFilter {

    /**
     * 通过int值来定义过滤器的执行顺序
     */
    @Override
    public int filterOrder() {
        // PreDecoration之前运行
        return PRE_DECORATION_FILTER_ORDER - 1;
    }

    /**
     * 过滤器的类型，在zuul中定义了四种不同生命周期的过滤器类型：
     *     public static final String ERROR_TYPE = "error";
     *     public static final String POST_TYPE = "post";
     *     public static final String PRE_TYPE = "pre";
     *     public static final String ROUTE_TYPE = "route";
     */
    @Override
    public String filterType() {
        return PRE_TYPE;
    }

    /**
     * 过滤器的具体逻辑
     */
    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        System.out.println(String.format("%s AccessFilter request to %s", request.getMethod(),request.getRequestURL().toString()));
        String accessToken = request.getParameter("accessToken");
        //有权限令牌
        if (!StringUtils.isEmpty(accessToken)) {
            ctx.setSendZuulResponse(true);
            ctx.setResponseStatusCode(200);
            //可以设置一些值
            ctx.set("isSuccess", true);
            return null;
        } else {
            ctx.setSendZuulResponse(false);
            ctx.setResponseStatusCode(401);
            ctx.setResponseBody("{\"result\":\"accessToken is not correct!\"}");
            //可以设置一些值
            ctx.set("isSuccess", false);
            return null;
        }
    }

    /**
     * 返回一个boolean类型来判断该过滤器是否要执行
     */
    @Override
    public boolean shouldFilter() {
        return true;
    }
}
```

　　启动类 <br/>

　　添加@EnableZuulProxy注解并使用自定义过滤器 <br/>

```
@EnableZuulProxy
@SpringBootApplication
public class ZuulServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZuulServerApplication.class, args);
    }

    @Bean
    public AccessFilter accessFilter() {
        return new AccessFilter();
    }
}
```



##  　　效果演示 <br/>

　　启动所有项目，我们在Eureka上注册了四个服务，相比上篇（[SpringCloud系列——Ribbon 负载均衡](https://www.cnblogs.com/huanzi-qch/p/10136254.html)）多了一个Zuul <br/>

![](https://img2018.cnblogs.com/blog/1353055/201812/1353055-20181219113012111-1845808767.png)  <br/>



　　浏览器访问 http://localhost:10010/myspringboot/feign/ribbon、http://localhost:10010/myspringboot/feign/ribbon?accessToken=123456 <br/>

　　http://localhost:10010/ 这个端口对外暴露，相对于总入口，后面接不同的路径由，Zuul路由到对应的服务上 <br/>

　　1、没有accessToken是，无法通过检查 <br/>

　　2、携带accessToken时，可正常路由，并且Feign调用、Ribbon负载均衡 <br/>

![](https://img2018.cnblogs.com/blog/1353055/201812/1353055-20181219112735658-1129092138.gif)  <br/>



## 　　后记 <br/>

　　我们为什么要使用Zuul呢？ <br/>

　　1、请求校验、路由转发，接口校验与业务逻辑分离 <br/>

　　2、隐藏诸多服务路径，只暴露统一入口，安全 <br/>

　　更多Zuul配置，请看官方文档 <br/>



## 　　更新 <br/>

　　2021-12-24更新：动态更新zuul路由配置 <br/>

　　<span style="color: rgba(0, 0, 0, 1)">  　　正常zuul路由配置是在配置文件里设置，当我们想动态调整，又不想重启zuul-server服务时：</span> <br/>

　　<span style="color: rgba(0, 0, 0, 1)">  　　　　1、zuul-server会实时从eureka-server注册表中拉取在线服务更新路由</span> <br/>

　　<span style="color: rgba(0, 0, 0, 1)">  　　　　2、可以从config-server配置中心获取最新配置</span> <br/>

　　<span style="color: rgba(0, 0, 0, 1)">  　　　　3、可以从数据库读取表数据获取最新配置</span> <br/>



　　<span style="color: rgba(0, 0, 0, 1)">  　　这里记录一下第三种方案</span> <br/>

![](https://img2020.cnblogs.com/blog/1353055/202112/1353055-20211224154946744-1454067149.png)  <br/>

　　<span style="color: rgba(0, 0, 0, 1)">  　　mysql新建zuul路由表</span> <br/>

```
-- ----------------------------
-- Table structure for zuul_route
-- ----------------------------
DROP TABLE IF EXISTS `zuul_route`;
CREATE TABLE `zuul_route`  (
  `id` varchar(25) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '表id（一般直接用service_id的值即可）',
  `service_id` varchar(25) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '服务名',
  `path` varchar(25) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '路径',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = 'zuul路由表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of zuul_route
-- ----------------------------
INSERT INTO `zuul_route` VALUES ('service-a', 'service-a', '/service-a/**');
INSERT INTO `zuul_route` VALUES ('service-b', 'service-b', '/service-b/**');
INSERT INTO `zuul_route` VALUES ('service-c', 'service-c', '/service-c/**');
INSERT INTO `zuul_route` VALUES ('sso-server', 'sso-server', '/sso-server/**');
```

　　pom文件引入 <br/>

```
        <!-- mysql -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>

        <!-- JdbcTemplate -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jdbc</artifactId>
        </dependency>
```

　　配置文件注释路由配置，新增数据库连接配置 <br/>

```
# 省略其他代码...

#zuul路由配置
# 应用名映射     zuul.routes.服务名.[path、service-id]，服务名要与eureka注册的一致
#zuul.routes.service-a.path=/service-a/**
#zuul.routes.service-a.service-id=service-a
#zuul.routes.service-b.path=/service-b/**
#zuul.routes.service-b.service-id=service-b
#zuul.routes.sso-server.path=/sso-server/**
#zuul.routes.sso-server.service-id=sso-server

#URL映射
#zuul.routes.service-a.path=/service-a/**
#zuul.routes.service-a-url.url=http://localhost:10081/

#数据库连接配置
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/test?characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
spring.datasource.username=root
spring.datasource.password=123456
```

　　新建一个ZuulRouteLocator，实现InitializingBean接口，主要用于afterPropertiesSet回调进行zuul路由初始化 <br/>

```
package cn.huanzi.qch.zuul.zuulserver.config;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.netflix.zuul.filters.*;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.cloud.netflix.zuul.filters.ZuulProperties.ZuulRoute;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * 自定义zuul路由
 */
@Component
public class ZuulRouteLocator implements InitializingBean {

    @Autowired
    private CompositeRouteLocator compositeRouteLocator;

    @Autowired
    private ZuulProperties zuulProperties;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 刷新zuul路由
     *
     * 数据来源：
     *      配置文件
     *      数据库zuul路由表
     */
    public List<Route> refreshRoutes() {
        //读取原配置文件的路由配置
        Map<String, ZuulRoute> routes = zuulProperties.getRoutes();

        //读取数据库zuul路由表配置
       List<ZuulRoute> routeList = jdbcTemplate.query("select id,service_id,path from zuul_route", new BeanPropertyRowMapper<>(ZuulRoute.class));

        //routeList数据并添加到routes中
        for (ZuulRoute route : routeList) {
            routes.put(route.getId(), route);
        }

        //刷新zuul路由
        zuulProperties.setRoutes(routes);
        compositeRouteLocator.refresh();

        //返回现有路由
        return compositeRouteLocator.getRoutes();
    }

    /**
     * 初始化路由信息
     */
    @Override
    public void afterPropertiesSet() {
        this.refreshRoutes();
    }
}
```

　　在写一个controller，用于主动刷新 <br/>

```
package cn.huanzi.qch.zuul.zuulserver.controller;

import cn.huanzi.qch.zuul.zuulserver.config.ZuulRouteLocator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.netflix.zuul.filters.Route;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ZuulRouteController {

    @Autowired
    ZuulRouteLocator zuulRouteLocator;

    /**
     * 读取数据库zuul表，刷新zuul路由
     */
    @GetMapping("/zuulRouteRefresh")
    public List<Route> zuulRouteRefresh(){
        return zuulRouteLocator.refreshRoutes();
    }

}
```

　　http://localhost:10010/zuulRouteRefresh <br/>

![](https://img2020.cnblogs.com/blog/1353055/202112/1353055-20211224155015802-1834888607.png)  <br/>







## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springCloud](https://github.com/huanzi-qch/springCloud) <br/>

　　码云：[https://gitee.com/huanzi-qch/springCloud](https://gitee.com/huanzi-qch/springCloud) <br/>


