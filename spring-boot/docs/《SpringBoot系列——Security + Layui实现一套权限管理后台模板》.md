
## 　　前言 <br/>

　　Spring Security官网：[https://spring.io/projects/spring-security](https://spring.io/projects/spring-security) <br/>

　　Spring Security是一个功能强大且高度可定制的身份验证和访问控制框架，侧重于为Java应用程序提供身份验证和授权。Security通过大量的拦截器进行校验，具体请看官网列出的列表：[https://docs.spring.io/spring-security/site/docs/4.2.4.RELEASE/reference/htmlsingle/#ns-custom-filters](https://docs.spring.io/spring-security/site/docs/4.2.4.RELEASE/reference/htmlsingle/#ns-custom-filters) <br/>

　　本文记录在SpringBoot项目中整合Spring Security进行权限控制，配合Layui，实现一套相对简单的权限管理后台模板 <br/>



## 　　效果演示  <br/>

　　登录，一个简单的登录页面，没登录之前，访问任意接口都会被拦截到登录页面（本例中，密码没有进行加密，存储的是明文，大家自己再进行加密存储跟校验，我这样就从简了） <br/>

　　我们可以利用配置文件的分支选择，设置开发环境不进行验证码校验，测试、生产环境再开启验证码校验，这样可以大大方便我们开发调试 <br/>

![](https://img2018.cnblogs.com/blog/1353055/201907/1353055-20190722153024760-1740023259.gif)  <br/>

　　xxx_huanzi，普通用户权限登录 <br/>

![](https://img2018.cnblogs.com/blog/1353055/201907/1353055-20190722154822127-120733016.gif)  <br/>

　　xxx_sa、xxx_admin，管理员权限登录 <br/>

![](https://img2018.cnblogs.com/blog/1353055/201907/1353055-20190722154845298-1962235731.gif)  <br/>

　　退出登录 <br/>

![](https://img2018.cnblogs.com/blog/1353055/201907/1353055-20190722154923874-2107543327.gif)  <br/>


## 　　关键代码 <br/>

### 　　数据表 <br/>

　　首先我们要确定下我们需要哪些表，结构跟测试数据我一起贴出来 <br/>

　　系统用户表 <br/>

```
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `user_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户id',
  `login_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '登录名',
  `user_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户名称',
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '登录密码',
  `valid` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '软删除标识，Y/N',
  `limited_ip` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '限制允许登录的IP集合',
  `limited_mac` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '更高级别的安全限制，限制允许登录的mac地址集合',
  `expired_time` datetime NULL DEFAULT NULL COMMENT '账号失效时间，超过时间将不能登录系统',
  `last_change_pwd_time` datetime NOT NULL COMMENT '最近修改密码时间，超出时间间隔，提示用户修改密码',
  `limit_multi_login` char(1) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '是否允许账号同一个时刻多人在线，Y/N',
  `greate_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '修改时间',
  PRIMARY KEY (`user_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '系统用户表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES ('1', 'xxx_sa', 'sa', '123456', 'Y', NULL, NULL, '2020-09-01 16:35:16', '2019-07-19 16:35:46', 'N', '2019-07-19 16:36:03', '2019-07-19 16:36:07');
INSERT INTO `sys_user` VALUES ('2', 'xxx_admin', 'admin', '123456', 'Y', NULL, NULL, '2020-09-01 16:35:16', '2019-07-19 16:35:46', 'N', '2019-07-19 16:36:03', '2019-07-19 16:36:07');
INSERT INTO `sys_user` VALUES ('3', 'xxx_huanzi', 'huanzi', '123456', 'Y', NULL, NULL, '2020-09-01 16:35:16', '2019-07-19 16:35:46', 'N', '2019-07-19 16:36:03', '2019-07-19 16:36:07');

SET FOREIGN_KEY_CHECKS = 1;
```

　　系统权限表 <br/>

```
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_authority
-- ----------------------------
DROP TABLE IF EXISTS `sys_authority`;
CREATE TABLE `sys_authority`  (
  `authority_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '权限id',
  `authority_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '权限名称，ROLE_开头，全大写',
  `authority_remark` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '权限描述',
  PRIMARY KEY (`authority_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '系统权限表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of sys_authority
-- ----------------------------
INSERT INTO `sys_authority` VALUES ('1', 'ROLE_SA', '超级管理员权限');
INSERT INTO `sys_authority` VALUES ('2', 'ROLE_ADMIN', '管理员权限');
INSERT INTO `sys_authority` VALUES ('3', 'ROLE_USER', '普通用户权限');

SET FOREIGN_KEY_CHECKS = 1;
```

　　系统菜单表 <br/>

```
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_menu`;
CREATE TABLE `sys_menu`  (
  `menu_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '菜单id',
  `menu_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '菜单名称',
  `menu_path` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '菜单路径',
  `menu_parent_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '上级id',
  PRIMARY KEY (`menu_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '系统菜单表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of sys_menu
-- ----------------------------
INSERT INTO `sys_menu` VALUES ('1', '系统管理', '/sys', NULL);
INSERT INTO `sys_menu` VALUES ('2', '用户管理', '/sys/user', '1');
INSERT INTO `sys_menu` VALUES ('3', '权限管理', '/sys/authority', '1');
INSERT INTO `sys_menu` VALUES ('4', '菜单管理', '/sys/menu', '1');
INSERT INTO `sys_menu` VALUES ('5', 'XXX菜单', '/menu/xxx', '');
INSERT INTO `sys_menu` VALUES ('6', 'XXX菜单1', '/menu/xxx1', '5');
INSERT INTO `sys_menu` VALUES ('7', 'XXX菜单2', '/menu/xxx2', '5');

SET FOREIGN_KEY_CHECKS = 1;
```

　　用户与权限关联表 <br/>

```
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_user_authority
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_authority`;
CREATE TABLE `sys_user_authority`  (
  `user_authority_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户权限表id',
  `user_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户id',
  `authority_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '权限id',
  PRIMARY KEY (`user_authority_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户权限表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of sys_user_authority
-- ----------------------------
INSERT INTO `sys_user_authority` VALUES ('1', '1', '1');
INSERT INTO `sys_user_authority` VALUES ('2', '2', '2');
INSERT INTO `sys_user_authority` VALUES ('3', '3', '3');

SET FOREIGN_KEY_CHECKS = 1;
```

　　用户与菜单关联表 <br/>

```
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_user_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_menu`;
CREATE TABLE `sys_user_menu`  (
  `user_menu_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户菜单表id',
  `user_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户id',
  `menu_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '菜单id',
  PRIMARY KEY (`user_menu_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户菜单表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of sys_user_menu
-- ----------------------------
INSERT INTO `sys_user_menu` VALUES ('1', '1', '1');
INSERT INTO `sys_user_menu` VALUES ('10', '3', '6');
INSERT INTO `sys_user_menu` VALUES ('11', '3', '7');
INSERT INTO `sys_user_menu` VALUES ('2', '1', '2');
INSERT INTO `sys_user_menu` VALUES ('3', '1', '3');
INSERT INTO `sys_user_menu` VALUES ('4', '1', '4');
INSERT INTO `sys_user_menu` VALUES ('41', '1', '5');
INSERT INTO `sys_user_menu` VALUES ('42', '1', '6');
INSERT INTO `sys_user_menu` VALUES ('43', '1', '7');
INSERT INTO `sys_user_menu` VALUES ('5', '2', '1');
INSERT INTO `sys_user_menu` VALUES ('51', '2', '5');
INSERT INTO `sys_user_menu` VALUES ('52', '2', '6');
INSERT INTO `sys_user_menu` VALUES ('53', '2', '7');
INSERT INTO `sys_user_menu` VALUES ('6', '2', '2');
INSERT INTO `sys_user_menu` VALUES ('7', '2', '3');
INSERT INTO `sys_user_menu` VALUES ('8', '2', '4');
INSERT INTO `sys_user_menu` VALUES ('9', '3', '5');

SET FOREIGN_KEY_CHECKS = 1;
```

　　用户快捷菜单表 <br/>

```
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for sys_shortcut_menu
-- ----------------------------
DROP TABLE IF EXISTS `sys_shortcut_menu`;
CREATE TABLE `sys_shortcut_menu`  (
  `shortcut_menu_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户快捷菜单id',
  `shortcut_menu_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户快捷菜单名称',
  `shortcut_menu_path` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户快捷菜单路径',
  `user_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '用户id',
  `shortcut_menu_parent_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '上级id',
  PRIMARY KEY (`shortcut_menu_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户快捷菜单表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of sys_shortcut_menu
-- ----------------------------
INSERT INTO `sys_shortcut_menu` VALUES ('s1', '百度', 'https://www.baidu.com', '2', NULL);
INSERT INTO `sys_shortcut_menu` VALUES ('s2', 'layui', 'https://www.layui.com/', '3', NULL);

SET FOREIGN_KEY_CHECKS = 1;
```

　　大家可能会发现我们的系统用户表有很多字段，又是限制IP地址、又是限制Mac地址，这是基于安全性考虑，系统可以能会限制用户的登录地址， 这些字段都是一下安全性方面相关，但在这个例子了我并没有实现这些功能，大家可以沿着我的这个思路实现一下系统安全性功能 <br/>



### 　　maven引包 <br/>

　　Spring Boot提供了一个spring-boot-starter-security启动程序，它将Spring Security相关的依赖项聚合在一起，使用maven引入 <br/>

```
        <!-- security安全校验 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
```



### 　　生成后台代码 <br/>

　　引好包后，使用我们的通用后台接口与代码自动生成工具，运行main方法直接生成这六个表的后台代码（不知道怎么操作的请看我之前的博客：[SpringBoot系列——Spring-Data-JPA（究极进化版） 自动生成单表基础增、删、改、查接口](https://www.cnblogs.com/huanzi-qch/p/10281773.html)） <br/>

![](https://img2018.cnblogs.com/blog/1353055/201907/1353055-20190722151815355-1720509912.png)  <br/>





### 　　核心配置 <br/>

　　核心配置在SecurityConfig <br/>

　　由此也扩展出了用户认证处理、密码处理、登录成功处理、登录失败处理、验证码处理、errorPage处理，这些我就不贴出来了，大家自己去看代码　 <br/>

![](https://img2018.cnblogs.com/blog/1353055/201907/1353055-20190722151613785-1900773745.png)  <br/>

```
package cn.huanzi.qch.springbootsecurity.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private CaptchaFilterConfig captchaFilterConfig;

    @Autowired
    private UserConfig userConfig;

    @Autowired
    private PasswordConfig passwordConfig;

    @Autowired
    private LoginFailureHandlerConfig loginFailureHandlerConfig;

    @Autowired
    private LoginSuccessHandlerConfig loginSuccessHandlerConfig;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth
                //用户认证处理
                .userDetailsService(userConfig)
                //密码处理
                .passwordEncoder(passwordConfig);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                // 关闭csrf防护
                .csrf().disable()
                .headers().frameOptions().disable()
                .and()

                //定制url访问权限
                .authorizeRequests()
                .antMatchers("/layui/**", "/css/**", "/js/**", "/images/**", "/webjars/**", "/getVerifyCodeImage").permitAll()
                //系统相关、非业务接口只能是管理员以上有权限，例如获取系统权限接口、系统用户接口、系统菜单接口、以及用户与权限、菜单关联接口
                .antMatchers("/sysUser/**","/sysAuthority/**","/sysMenu/**","/sysUserAuthority/**","/sysUserMenu/**").hasAnyAuthority("ROLE_ADMIN","ROLE_SA")
                //admin接口测试
                .antMatchers("/admin/**").hasAnyAuthority("ROLE_ADMIN","ROLE_SA")
                .anyRequest().authenticated()
                .and()

                //登录处理
                .addFilterBefore(captchaFilterConfig, UsernamePasswordAuthenticationFilter.class)
                .formLogin()
                .loginProcessingUrl("/login")
                .loginPage("/loginPage")
                .failureHandler(loginFailureHandlerConfig)
                .successHandler(loginSuccessHandlerConfig)
                .permitAll()
                .and()

                //登出处理
                .logout()
                .logoutUrl("/logout")
                .logoutSuccessUrl("/loginPage")
                .permitAll()
        ;
    }
}
SecurityConfig.java
```

## 　　后记 <br/>

 　　这只是一个简单的演示，数据都是直接在数据库插入的，应该做成在页面进行管理，比如： <br/>

![](https://img2018.cnblogs.com/blog/1353055/201907/1353055-20190722155805579-536150460.png)  <br/>

　　更多的功能我就不展开了，大家直接进行扩展，本文就记录到这，有什么问题以后再进行补充，具体的代码已经放到GitHub、码云上了，SQL文件我也放在了里面， <br/>

![](https://img2018.cnblogs.com/blog/1353055/201907/1353055-20190722161117301-1653686358.png)  <br/>



　　大家可以搞下来跑一下，有什么建议或者问题都可以评论留言 <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>




