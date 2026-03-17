
## 　　前言 <br/>

　　IO流：数据传输的通道，通过流的方式读写文件，流是指一连串流动的字节/字符 <br/>

　　流按流动方向可分为：输入/输出流　　（注：输入/输出流是相对于计算机内存，数据源和目标） <br/>

　　　　输入流，从数据源文件输入到程序：源文件 -> 程序 <br/>

　　　　输出流，从程序输出到目标文件中：程序 -> 目标文件 <br/>

　　流按数据单元可分为：字节/字符流 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202201/1353055-20220106164428714-697163213.png)  <br/>



## 　　字节流 <br/>

### 　　demo <br/>

　　字节流，实现非文本文件的复制粘贴 <br/>

```
    public static void main(String[] args) {
        //计时器，hutool工具类
        TimeInterval timer = DateUtil.timer();

        byteFileCopy();

        System.out.println("\n操作完成，耗时："+timer.intervalMs()+"（毫秒）");
    }

    /*
        字节流，实现非文本文件的复制粘贴
        文本文件不建议使用字节流操作，因为中文字符占两个字节，如果正好被分割就会出现乱码
     */
    public static void byteFileCopy(){
        final String srcFile = "F:\\logo.png";//源文件
        final String targetFile = "F:\\logo1.png";//目标文件

        //除了从文件中读取，也可以使用ByteArrayInputStream直接读取
        try(FileInputStream inputStream = new FileInputStream(srcFile);
            FileOutputStream outputStream = new FileOutputStream(targetFile,false);) {
            byte[] chars = new byte[1024];//缓存区大小，有初始化0值
            int length;
            while ((length = inputStream.read(chars)) != -1) {
                //写入，写入部分数组
                outputStream.write(chars, 0, length);//如果写入完整数组，会将未被填充的0值也一起写入
            }

            //刷新输入流
            outputStream.flush();
        } catch (IOException e) {
            System.err.println("操作失败...");
            e.printStackTrace();
        }
    }
```

![](http://huanzi.qzz.io/file-server/blog-image/202201/1353055-20220106165409160-884828492.png)  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202201/1353055-20220106165346530-721965181.png)  <br/>







　　字节流，使用ObjectOutputStream保存、读取java对象 <br/>

```
    public static void main(String[] args) {
        //计时器，hutool工具类
        TimeInterval timer = DateUtil.timer();

        javaObject();

        System.out.println("\n操作完成，耗时："+timer.intervalMs()+"（毫秒）");
    }


    /*
        字节流，使用ObjectOutputStream保存、读取java对象
     */
    public static void javaObject(){
        final String targetFile = "F:\\User.txt";//目标文件

        //写入
        try(ObjectOutputStream outputStream = new ObjectOutputStream(new FileOutputStream(targetFile,false));) {
            final HashMap<String, Object> hashMap = new HashMap<>(4);
            hashMap.put("id","00001");
            hashMap.put("age",18);
            hashMap.put("name","张三");
            hashMap.put("addTime",new Date());

            outputStream.writeObject(hashMap);

            //刷新输入流
            outputStream.flush();
        } catch (IOException e) {
            System.err.println("操作失败...");
            e.printStackTrace();
        }

        //读取
        try(ObjectInputStream inputStream = new ObjectInputStream(new FileInputStream(targetFile))) {
            Object object = inputStream.readObject();

            //打印
            System.out.println(object);
        } catch (IOException | ClassNotFoundException e) {
            System.err.println("操作失败...");
            e.printStackTrace();
        }
    }
```

![](http://huanzi.qzz.io/file-server/blog-image/202201/1353055-20220106165631619-762993592.png)  <br/>





![](http://huanzi.qzz.io/file-server/blog-image/202201/1353055-20220106165658809-1476977642.png)  <br/>







## 　　字符流 <br/>

### 　　demo <br/>


　　字符流，实现文本文件的复制粘贴 <br/>

　　PS：txt小说从知轩藏书下载 <br/>

```
    public static void main(String[] args) {
        //计时器，hutool工具类
        TimeInterval timer = DateUtil.timer();

        charFileCopy();

        System.out.println("\n操作完成，耗时："+timer.intervalMs()+"（毫秒）");
    }

    /*
        字符流，实现文本文件的复制粘贴
        文本文件处理不建议使用FileReader、FileWriter，这两个对象使用默认系统编码，并且不能手动设置，读取和写入文件都应与源文件编码一致，否则会乱码
     */
    public static void charFileCopy(){
        final String charsetName = "GBK";//ANSI编码，可用GBK读取
        final String srcFile = "F:\\《凡人修仙传》（校对版全本+番外）作者：忘语.txt";//源文件
        final String targetFile = "F:\\《凡人修仙传》.txt";//目标文件

        //try-catch语法糖
        try(InputStreamReader reader =  new InputStreamReader(new FileInputStream(srcFile), charsetName);
            OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(targetFile), charsetName);) {
            char[] chars = new char[1024];//缓存区大小，有初始化null值
            int length;
            while ((length = reader.read(chars)) != -1) {
                //打印
                //System.out.print(new String(chars, 0, length));

                //写入，写入部分数组
                writer.write(chars, 0, length);//如果写入完整数组，会将未被填充的null值也一起写入
            }

            //刷新输入流
            writer.flush();
        } catch (IOException e) {
            System.err.println("操作失败...");
            e.printStackTrace();
        }
    }
```

![](http://huanzi.qzz.io/file-server/blog-image/202201/1353055-20220106165957070-1317322921.png)  <br/>





![](http://huanzi.qzz.io/file-server/blog-image/202201/1353055-20220106170019155-126998794.png)  <br/>





![](http://huanzi.qzz.io/file-server/blog-image/202201/1353055-20220106170050664-1578025947.png)  <br/>







　　字符流，BufferedReader读取 <br/>



```
    public static void main(String[] args) {
        //计时器，hutool工具类
        TimeInterval timer = DateUtil.timer();

        charRead();

        System.out.println("\n操作完成，耗时："+timer.intervalMs()+"（毫秒）");
    }

    /*
        字符流，BufferedReader读取
        BufferedReader，自带缓冲区可方便的读取整行
     */
    public static void charRead(){
        //直接读取
        try(BufferedReader reader =  new BufferedReader(new CharArrayReader("人民英雄永垂不朽！\nheroes immortal!\n你好世界，Hello Java".toCharArray()),1024);) {
            //从文件读取
            //try(BufferedReader reader =  new BufferedReader(new InputStreamReader(new FileInputStream("F:\\test.txt"), "UTF-8"),1024);) {

            //1、read读取
            char[] chars = new char[1024];//缓存区大小，有初始化null值
            int length;
            while ((length = reader.read(chars)) != -1) {
                //打印
                System.out.print(new String(chars, 0, length));
            }

            //2、readLine读取
            String line;
            while((line = reader.readLine()) != null) {
                //打印，补回换行符
                System.out.print(line+"\n");
            }

            //3、转成Stream，再进行操作
            reader.lines().forEach((line1)->{
                //打印，补回换行符
                System.out.print(line1+"\n");
            });
            
            //经测试，以上三种方式结果一致
            
        } catch (IOException e) {
            System.err.println("操作失败...");
            e.printStackTrace();
        }
    }
```

![](http://huanzi.qzz.io/file-server/blog-image/202201/1353055-20220106170424352-2028342189.png)  <br/>



##  　　更新 <br/>

　　2022-03-09更新，删除文件夹下面的所有东西 <br/>

```
    public static void main(String[] args) {
        String path = "E:\\abc";//文件夹
        
        //循环删除所有文件、文件夹
        deleteAllFile(new File(path));
        
        //然后在创建新空文件夹
        new File(path).mkdir();
        
        System.out.println("操作完成！");
    }
    //递归删除所有文件
    private static void deleteAllFile(File file){
        if (file.isFile()) {
            file.delete();
        } else if (file.isDirectory()) {
            for (File listFile : Objects.requireNonNull(file.listFiles())) {
                deleteAllFile(listFile);
            }
            file.delete();
        }
    }
```



## 　　后记 <br/>

　　要点： <br/>

　　1、文本文件建议使用字符流操作，因为中文字符占两个字节，用字节流如果正好被分割就会出现乱码 <br/>

　　2、文本文件处理不建议使用FileReader、FileWriter，这两个对象使用默认系统编码，并且不能手动设置，读取和写入文件都应与源文件编码一致，否则会乱码；读取文本使用BufferedReader操作，自带缓冲区可方便的读取整行 <br/>

　　3、使用ObjectOutputStream来保存、读取java对象，利用好了可以实现骚操作（自行扩展） <br/>



　　Java基础之IO流暂时先记录到这，后续再进行补充 <br/>




