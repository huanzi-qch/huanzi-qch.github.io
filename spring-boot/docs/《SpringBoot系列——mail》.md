
## 　　前言 <br/>

　　邮件是许多项目里都需要用到的功能，之前一直都是用JavaMail来发，现在Spring框架为使用JavaMailSender接口发送电子邮件提供了一个简单的抽象，Spring Boot为它提供了自动配置以及启动模块。springboot参考手册介绍：[https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-email](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-email) <br/>

　　作为发送方，首先需要开启POP3/SMTP服务，登录邮箱后前往设置进行开启，开启后取得授权码。 <br/>

　　POP3 :
　　POP3是Post Office Protocol 3的简称，即[邮局协议](https://www.baidu.com/s?wd=%E9%82%AE%E5%B1%80%E5%8D%8F%E8%AE%AE&tn=SE_PcZhidaonwhc_ngpagmjz&rsv_dl=gh_pc_zhidao)的第3个版本,规定怎样将个人计算机连接到Internet的邮件服务器和下载电子邮件的电子协议。是因特网电子邮件的第一个离线协议标准,POP3允许用户从服务器上把邮件存储到本地主机（即自己的计算机）上,同时删除保存在邮件服务器上的邮件，而POP3服务器则是遵循POP3协议的接收邮件服务器，用来接收电子邮件的。
　　 <br/>

　　SMTP：
　　SMTP 的全称是“Simple Mail Transfer Protocol”，即简单邮件传输协议。是一组用于从源地址到目的地址传输邮件的规范，通过来控制邮件的中转方式。SMTP 协议属于 TCP/IP 协议簇，帮助每台计算机在发送或中转信件时找到下一个目的地。SMTP 服务器就是遵循 SMTP 协议的发送邮件服务器。 <br/>



## 　　代码编写 <br/>

　　maven引包，其中，邮件模板需要用到thymeleaf <br/>

```
        <!-- springboot mail -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-mail</artifactId>
        </dependency>
        <!-- thymeleaf模板 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <!-- springboot web(MVC)-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!-- springboot -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
```



　　appliaction.propertise配置文件 <br/>

```
#设置服务端口
server.port=10010

# Email (MailProperties)
spring.mail.default-encoding=UTF-8
spring.mail.host=smtp.qq.com
spring.mail.username=huanzi.qch@qq.com #发送方邮件名 spring.mail.password= #授权码 spring.mail.properties.mail.smtp.auth=true spring.mail.properties.mail.smtp.starttls.enable=true spring.mail.properties.mail.smtp.starttls.required=true
```



　　SpringBootMailServiceImpl.java <br/>

```
@Service
class SpringBootMailServiceImpl implements SpringBootMailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * 发送方
     */
    @Value("${spring.mail.username}")
    private String from;

    /**
     * 发送简单邮件
     *
     * @param to      接收方
     * @param subject 邮件主题
     * @param text    邮件内容
     */
    @Override
    public void sendSimpleMail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    /**
     * 发送HTML格式的邮件
     *
     * @param to      接收方
     * @param subject 邮件主题
     * @param content HTML格式的邮件内容
     * @throws MessagingException
     */
    @Override
    public void sendHtmlMail(String to, String subject, String content) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        //true表示需要创建一个multipart message
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);

        mailSender.send(message);
    }

    /**
     * 发送HTML格式的邮件，并可以添加附件
     * @param to      接收方
     * @param subject 邮件主题
     * @param content HTML格式的邮件内容
     * @param files   附件
     * @throws MessagingException
     */
    @Override
    public void sendAttachmentsMail(String to, String subject, String content, List<File> files) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);
        //添加附件
        for(File file : files){
            helper.addAttachment(file.getName(), new FileSystemResource(file));
        }

        mailSender.send(message);
    }
}
```



　　测试controller <br/>

```
    @Autowired
    private SpringBootMailService springBootMailService;

    @Autowired
    private TemplateEngine templateEngine;

    @GetMapping("/index")
    public String index() throws MessagingException {
        //简单邮件
        springBootMailService.sendSimpleMail("1726639183@qq.com","Simple Mail","第一封简单邮件");

        //HTML格式邮件
        Context context = new Context();
        context.setVariable("username","我的小号");
        springBootMailService.sendHtmlMail("1726639183@qq.com","HTML Mail",templateEngine.process("mail/mail",context));

        //HTML格式邮件，带附件
        Context context2 = new Context();
        context2.setVariable("username","我的小号（带附件）");
        ArrayList<File> files = new ArrayList<>();
        files.add(new File("C:\\Users\\Administrator\\Desktop\\上传测试.txt"));
        files.add(new File("C:\\Users\\Administrator\\Desktop\\上传测试2.txt"));
        springBootMailService.sendAttachmentsMail("1726639183@qq.com","Attachments Mail",templateEngine.process("mail/attachment",context2),files);

        return "hello springboot！";
    }
```



　　两个html模板，路径：myspringboot\src\main\resources\templates\mail\ <br/>

　　mail.html <br/>

```
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Mail Templates</title>
</head>
<body>
    <h3><span th:text="${username}"></span>，你好！</h3>
    <p style="color: red;">这是一封HTML格式的邮件。</p>
</body>
</html>
```

　　attachment.html <br/>

```
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Mail Templates Accessory</title>
</head>
<body>
    <h3><span th:text="${username}"></span>，你好！</h3>
    <p>这是一封HTML格式的邮件。请收下附件！</p>
</body>
</html>
```



　　<span style="color: rgba(51, 102, 255, 1)">  new JavaMailSenderImpl()  <span style="color: rgba(0, 0, 0, 1)">    ，实现动态配置Email  </span></span> <br/>

```
    public static void main(String[] args) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setDefaultEncoding("UTF-8");//默认编码
        mailSender.setHost("smtp.qq.com");//主机地址
        mailSender.setProtocol("smtp");//协议
        mailSender.setPort(25);//端口 smtp:25/smtps:465
        mailSender.setUsername("huanzi.qch@qq.com");//发送方邮件名（账号）
        mailSender.setPassword("");//授权码（密码）

        //简单邮件，与原先操作无异...
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("huanzi.qch@qq.com");
        message.setTo("1726639183@qq.com");
        message.setSubject("Simple Mail");
        message.setText("第一封简单邮件");
        mailSender.send(message);

        //html邮件，与原先操作无异...

        //带附件邮件，与原先操作无异...

        System.out.println("发送成功！");
    }
```





## 　　效果 <br/>

　　Simple Mail <br/>

![](https://img2018.cnblogs.com/blog/1353055/201811/1353055-20181114143635401-1740134390.png)  <br/>



　　HTML Mail <br/>

![](https://img2018.cnblogs.com/blog/1353055/201811/1353055-20181114143716623-183560954.png)  <br/>



　　Attachments Mail  <br/>

![](https://img2018.cnblogs.com/blog/1353055/201811/1353055-20181114143749450-1090599335.png)  <br/>

![](https://img2018.cnblogs.com/blog/1353055/201811/1353055-20181114143905171-1629693212.png)  <br/>





## 　　后记 <br/>

　　本文章部分参考：https://www.cnblogs.com/yangtianle/p/8811732.html <br/>



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


