
## 　　前言 <br/>

　　Java网络编程之Socket套接字，Socket套接字使用TCP提供了两台计算机之间的通信机制 <br/>

　　TCP（英语：Transmission Control Protocol，传输控制协议） 是一种面向连接的、可靠的、基于字节流的传输层通信协议，TCP 层是位于 IP 层之上，应用层之下的中间层。TCP 保障了两个应用程序之间的可靠通信。通常用于互联网协议，被称 TCP / IP <br/>

　　本文记录Java的Socket通信简单实例 <br/>



## 　　服务端 <br/>

```
package cn.huanzi.qch.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Socket服务端
 */
public class SocketServer {
    public static void main(String[] args) throws Exception{
        //服务端在20006端口监听客户端请求的TCP连接
        ServerSocket server = new ServerSocket(20086);
        Socket client;

        System.out.println("服务端启动成功！");

        //如果使用多线程，那就需要线程池，防止并发过高时创建过多线程耗尽资源
        ExecutorService threadPool = Executors.newFixedThreadPool(10);

        while (true) {
            //等待客户端的连接，如果没有获取连接
            client = server.accept();

            //为每个客户端连接开启一个线程
            threadPool.submit(new ServerThread(client));
        }
    }
}

/**
 * 与客户端连接操作异步线程
 */
class ServerThread implements Runnable {
    //socket连接
    private final Socket client;

    public ServerThread(Socket client){
        this.client = client;
    }

    @Override
    public void run() {
        try{
            System.out.println("与客户端["+client.getInetAddress()+":"+client.getPort()+"]连接成功！");

            //获取Socket的输出流，用来向客户端发送数据
            PrintStream out = new PrintStream(client.getOutputStream());
            //获取Socket的输入流，用来接收从客户端发送过来的数据
            BufferedReader buf = new BufferedReader(new InputStreamReader(client.getInputStream(), StandardCharsets.UTF_8));

            boolean flag =true;
            while(flag){
                //接收从客户端发送过来的数据
                String msg = buf.readLine();

                //约定：通过约定符号'exit'通知服务端关闭与客户端的连接
                if("exit".equals(msg)){
                    flag = false;
                }else{
                    //将接收到的字符串前面加上echo，发送到对应的客户端
                    out.println("echo:"+msg);
                }
                System.out.println("收到客户端["+client.getInetAddress()+":"+client.getPort()+"]消息："+msg);
            }

            System.out.println("与客户端["+client.getInetAddress()+":"+client.getPort()+"]断开连接...");

            out.close();
            buf.close();
            client.close();
        }catch(Exception e){
            System.err.println("Socket连接异常...");
            e.printStackTrace();
        }
    }
}
```



## 　　客户端 <br/>

```
package cn.huanzi.qch.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;

/**
 * Socket客户端
 */
public class SocketClient {
    //地址
    private static final String host = "127.0.0.1";

    //端口
    private static final int port = 20086;

    //Socket连接
    private static Socket client;

    //Socket的输出流，用来发送数据到服务端
    private static PrintStream out;

    //Socket的输入流，用来接收从服务端发送过来的数据
    private static BufferedReader buf;

    /**
     * 初始化Socket连接
     */
    private static void init() throws IOException {
        //客户端请求与 host 在 port 端口建立TCP连接
        client = new Socket(host, port);
        //获取Socket的输出流
        out = new PrintStream(client.getOutputStream());
        //获取Socket的输入流
        buf = new BufferedReader(new InputStreamReader(client.getInputStream(), StandardCharsets.UTF_8));
    }

    /**
     * 发送消息
     */
    private static void sendMsg(String msg) throws IOException {
        try{
            //发送数据到服务端
            out.println(msg);
        }catch (Exception e){
            //打印日志，并重连Socket
            System.err.println("Socket连接异常，正在重新连接...");
            e.printStackTrace();

            init();

            //重新发送数据数据到服务端
            out.println(msg);
        }


        //等待服务端响应
        try{
            String echo = buf.readLine();
            System.out.println("收到服务端回应："+echo);
        }catch(SocketTimeoutException e){
            System.err.println("服务端响应超时...");
            e.printStackTrace();
        } catch (IOException e) {
            System.err.println("服务端响应异常...");
            e.printStackTrace();
        }
    }

    /**
     * 关闭Socket连接
     * 约定：通过约定符号'exit'通知服务端关闭与客户端的连接
     */
    private static void close() throws IOException {
        //通知服务端结束与客户端的连接异步线程
        out.println("exit");

        out.close();
        buf.close();
        client.close();
    }


    public static void main(String[] args) throws IOException, InterruptedException {
        init();

        for (int i = 1; i <= 5; i++) {
            sendMsg("你好，我是消息"+i);
            Thread.sleep(2000);//休眠
        }

        close();
    }
}
```



## 　　效果 <br/>

　　先运行服务端，再运行客户端 <br/>



　　客户端 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202110/1353055-20211027175601820-1438163236.gif)  <br/>



　　服务端 <br/>

![](https://img2020.cnblogs.com/blog/1353055/202110/1353055-20211027175615646-1533326083.gif)  <br/>



## 　　后记 <br/>

　　为了减少传输数据的大小，可以通过约定报文格式，传输16进制数据，例如：OxFF 01 3A 4D <br/>



　　Java的Socket通信简单实例暂时先记录到这，后续再进行补充 <br/>


