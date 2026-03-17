
## 　　前言 <br/>

　　日常开发中，大多数项目都会涉及到附件上传、回显、下载等功能，本文记录封装通用附件管理模块，并与业务模块进行整合实现上传、回显、下载 <br/>

　　我们之前已经对文件上传下载有过记录，传送门：[基于“[formData批量上传的多种实现](https://www.cnblogs.com/huanzi-qch/p/9853067.html)” 的多图片预览、上传的多种实现](https://www.cnblogs.com/huanzi-qch/p/10186367.html)、[formData批量上传的多种实现](https://www.cnblogs.com/huanzi-qch/p/9853067.html)、[自定义input文件上传样式](https://www.cnblogs.com/huanzi-qch/p/9842204.html)，这里也是基于之前的写一个完整例子 <br/>



　　技术栈：layui + thymeleaf + springboot <br/>



## 　　代码编写 <br/>

### 　　项目结构 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916174127145-1602950871.png)  <br/>



###  　　前端 <br/>

　　定义模板 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916174446754-1858372178.png)  <br/>



 　　脚本 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916174555860-2012896710.png)  <br/>







### 　　后端 <br/>

　　Vo类 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916174724757-405745729.png)  <br/>





　　Controller <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916174705858-1757593823.png)  <br/>





## 　　测试效果 <br/>

　　test.html页面有两个测试表单，分别整合附件管理模块，需要引入在线jq、layui依赖，再引入我们的附件管理css、js脚本 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916175123355-1784744792.png)  <br/>



### 　　上传 <br/>

```
    //表单提交
    function submit1() {
        //调用自己的保存业务
        let testFormData = $("#testForm1").serializeObject();
        console.log(testFormData);

        //上传附件
        Attachment.upload("123456");
    }
```

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916175705254-1862525589.gif)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916175842856-1419786232.png)  <br/>



 　　上传的文件在AttachmentVo的files数组中 <br/>



### 　　回显可编辑 <br/>

```
    //表单回显（可编辑）
    function showForm1() {
        //回显基础数据
        $("#testForm1").form({username:"张三",age:18});

        //回显附件
        Attachment.showDndEditAttachments("123456");
    }
```

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916180325495-2038226199.gif)  <br/>

　　重新编辑时，删掉的附件在AttachmentVo的deletes数组中，新上传的附件在files数组中  <br/>



### 　　回显不可编辑 <br/>

```
    //表单回显（不可编辑）
    function showForm2() {
        //回显基础数据
        $("#testForm2").form({username:"李四",age:81});

        //禁用表单、以及隐藏按钮
        $("#testForm2 input").prop("disabled", true);
        $("#button21").remove();
        $("#button22").remove();

        //回显附件
        Attachment.showDndDownloadAttachments("7890");
    }
```

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916180608895-807176197.gif)  <br/>

 　　不可编辑的回显中，可以进行下载附件操作 <br/>



### 　　下载 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202109/1353055-20210916180755733-1891837324.gif)  <br/>



## 　　后记 <br/>

　　不同的业务表单再也不用自己维护附件，直接引入我们通用的附件管理模块，快速实现功能、风格统一 <br/>





## 　　更新 <br/>

　　2022-04-26更新：前端图片压缩 <br/>

　　大致原理：用户上传的File图片对象，画到canvas画布上，再转成File对象，从而实现压缩 <br/>

```
let file = $("input[name='attachment']")[0].files[0];
new ImageCompressor({
  file: file,
  quality: 0.6,//自定义配置压缩比
  mimeType: 'image/jpeg',//输出图片类型
  maxWidth: 2000,//最大宽
  maxHeight: 2000,//最大高
  width: 1000,//宽
  height: 1000,//高
  minWidth: 500,//最小宽
  minHeight: 500,//最大高
  convertSize: 2048000,//png转jpeg阈值
  loose: true,//是否宽松模式，控制当压缩的图片 size 大于源图片，输出源图片，否则输出压缩后图片，默认是 true

  // 压缩前回调
  beforeCompress: function (result) {
    console.log('压缩之前图片尺寸大小: ', result.size);
    console.log('mime 类型: ', result.type);
  },

  // 压缩成功回调
  success: function (result) {
    console.log('压缩之后图片尺寸大小: ', result.size);
    console.log('mime 类型: ', result.type);
    console.log('实际压缩率： ', ((file.size - result.size) / file.size * 100).toFixed(2) + '%');

    //test页面追加压缩后的图片效果
    ImageCompressor.file2DataUrl(result, function (url) {
        let img = document.createElement("img");
        img.src = url;

        document.body.appendChild(img);
    })
  },

  // 发生错误
  error: function (msg) {
    console.error(msg);
  }
});
```

![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220426113114765-567225227.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220426113134633-1528550373.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202204/1353055-20220426113148747-1298857174.png)  <br/>



　　<span style="color: rgba(255, 0, 0, 1)">  2022-10-28更新</span> <br/>

　　1、通常情况下，附件的根路径是不会放在项目里面的，因此我们需要做路径映射，方便用接口访问附件文件 <br/>

```
#附件存储路径
file.upload-path=E:\\fj\\
```



```
package cn.huanzi.qch.springbootfilesupload.attachment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 附件管理Config配置
 */
@Component
public class AttachmentConfig implements WebMvcConfigurer {
    /**
     * 附件存储路径
     */
    @Value("${file.upload-path}")
    private String uploadPath;

    /**
     * 附件路径映射，映射后可直接通过接口访问文件
     * 例如：http://localhost:10010/api/file/123.png
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/api/file/**").addResourceLocations("file:"+uploadPath);
    }
}
```



 　　2、写了一个常见的文件上传、下载、显示模块，根目录在配置文件中设置，文件按年月分文件夹存储，方便按月进行备份，并用UUID来作为文件名避免上传同名文件时造成冲突，使用无意义的UUID作为文件名还可提高安全性，同时使用HashMap模拟数据库附件表 <br/>



　　配置文件 <br/>

```
#单个文件大小
spring.servlet.multipart.max-file-size=50MB
#总大小
spring.servlet.multipart.max-request-size=500MB

#附件存储路径
file.upload-path=E:\\fj\\
```

　　后端controller代码 <br/>

```
package cn.huanzi.qch.springbootfilesupload.attachment.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.UUID;

/**
 * 文件上传、下载、显示
 */
@RestController
@RequestMapping("/file/")
public class AttachmentController2 {
    //模拟数据库
    private final HashMap<String,HashMap<String,String>> map = new HashMap<>();

    //日期格式化
    private final SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMM");

    /**
     * 文件存储根路径
     */
    @Value("${file.upload-path}")
    private String uploadPath;

    /**
     * 上传
     */
    @PostMapping("upload")
    public HashMap<String, String> upload(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();

        /*
            把附件表id当做文件名保存文件
            1、可以避免上传同名文件时造成冲突
            2、文件名无业务含义，附件安全性高
         */
        String fileid = getUUID();

        //文件名称
        String filename = originalFilename.substring(0,originalFilename.lastIndexOf("."));

        //文件类型，后缀名
        String filetype = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);

        //文件大小（MB），保留两位小数点
        double size = file.getSize() / 1024.00 / 1024.00;
        String filesize = String.format("%.2f",size)+"MB";

        //保存路径，按年月份文件夹
        String path = simpleDateFormat.format(new Date());
        //如果文件夹不存在，创建文件夹
        File pathFile = new File(uploadPath + path);
        if(!pathFile.exists()){
            pathFile.mkdir();
        }

        //保存文件，例如：E:\fj\20221027\123.txt
        file.transferTo(new File(uploadPath  + path + "\\" + fileid + "." + filetype));

        //保存附件表，做好映射关联关系
        HashMap<String, String> hashMap = new HashMap<>();
        hashMap.put("fileid",fileid);
        hashMap.put("filename",filename);
        hashMap.put("filetype",filetype);
        hashMap.put("filesize",filesize);
        hashMap.put("path",path);
        map.put(fileid,hashMap);

        return hashMap;
    }

    /**
     * 下载
     */
    @PostMapping("download/{fileid}")
    public ResponseEntity<byte[]> downLoad(@PathVariable String fileid) throws IOException {
        //根据查询附件表（此处为模拟数据）
        HashMap<String,String> hashMap = map.get(fileid);
        if(hashMap == null){
            throw new RuntimeException("下载错误：附件可能已经不存在！");
        }
        String filename = hashMap.get("filename");
        String filetype = hashMap.get("filetype");
        String path = hashMap.get("path");

        File file = new File(uploadPath  + path + "\\" + fileid + "." + filetype);
        byte[] fileBytes = new byte[Math.toIntExact(file.length())];
        new FileInputStream(file).read(fileBytes);

        //设置响应头
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", new String(filename.getBytes(StandardCharsets.UTF_8),StandardCharsets.ISO_8859_1) + "." + filetype);

        //下载文件
        return new ResponseEntity<>(fileBytes, headers, HttpStatus.CREATED);
    }

    /**
     * 显示
     * 浏览器预览，仅支持图片、txt、pdf等，不支持Word、Excel
     */
    @GetMapping("show/{fileid}")
    public void show(HttpServletRequest request, HttpServletResponse response, @PathVariable String fileid) throws ServletException, IOException {
        HashMap<String,String> hashMap = map.get(fileid);
        if(hashMap == null){
            throw new RuntimeException("显示错误：附件可能已经不存在！");
        }
        String filetype = hashMap.get("filetype");
        String path = hashMap.get("path");

        //转发附件路径映射接口
        request.getRequestDispatcher("/api/file/" + path + "/" + fileid + "." + filetype).forward(request,response);
    }

    /**
     * 生成32位UUID编码
     */
    private String getUUID(){
        return UUID.randomUUID().toString().trim().replaceAll("-", "");
    }

}
```

　　前端代码 <br/>

```
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>文件上传、下载、显示</title>
</head>
<body>
<input id="file" type="file">
<button onclick="fun1()">上传</button>
<p>查看：<span id="s1" onclick="fun2()" data-fileid="" style="color: blue;cursor: pointer;"></span></p>
<p>下载:<span id="s2" onclick="fun3()" data-fileid="" style="color: blue;cursor: pointer;"></span></p>
</body>
<script src="/jquery/jquery.js"></script>
<script>
    function fun1(){
        //构造请求头参数
        let formData = new FormData();
        formData.append("file",document.getElementById("file").files[0]);

        //执行上传
        $.ajax({
            url: "/file/upload",
            type: "post",
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                console.log('附件上传成功：', data);
                $("#s1").text(data.filename + "." + data.filetype);
                $("#s1").data("fileid",data.fileid);

                $("#s2").text(data.filename + "." + data.filetype);
                $("#s2").data("fileid",data.fileid);
            },
            error: function (e) {
                console.log('附件上传失败');
                throw e;
            }
        });
    }
    function fun2(){
        let fileid = $("#s1").data("fileid");
        window.open("/file/show/"+fileid);
    }
    function fun3(){
        let fileid = $("#s2").data("fileid");
        //创建临时的、隐藏的form表单，post提交，数据在请求体里，相对安全
        let $form = $(document.createElement('form')).css({display: 'none'}).attr("method", "POST").attr("action", "/file/download/"+fileid);
        $("body").append($form);
        $form.submit();
        //过河拆桥，提交完成后remove掉
        $form.remove();
    }
</script>
</html>
```

　　效果 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202210/1353055-20221028111115875-123222052.png)  <br/>



　　上传 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202210/1353055-20221028111258976-784602592.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202210/1353055-20221028111158867-203425197.png)  <br/>

　　下载 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202210/1353055-20221028111221242-264648431.png)  <br/>





## 　　代码开源 <br/>



　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


