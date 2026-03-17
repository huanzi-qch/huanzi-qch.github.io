
## 　　前言 <br/>

　　程序：一组有序的指令集合 <br/>

　　进程：执行中的程序 <br/>

　　线程：是进程中“单一持续控制流程” <br/>



　　进程跟程序的区别：程序是一组指令的集合，它是静态的实体，没有执行的含义。而进程是一个动态的实体，有自己的生命周期。一般说来，一个进程肯定与一个程序相对应，并且只有 一个，但是一个程序可以有多个进程，或者一个进程都没有。除此之外，进程还有并发性和交往性。简单地说，进程是程序的一部分，程序运行的时候会产生进程。 <br/>

　　进程与线程的区别：进程作为资源分配的单位，线程是调度和执行的单位 <br/>



## 　　线程状态 <br/>

　　新生状态、就绪状态、阻塞状态、运行状态、死亡状态 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202111/1353055-20211108103251860-1212684586.png)  <br/>





## 　　多线程的实现 <br/>

### 　　Thread <br/>

　　PS：无法实现线程之间的数据共享 <br/>

```
    /**
     * 通过 extends Thread
     */
    public class MyThread extends Thread{

        private final String name;

        public MyThread(String name){
            this.name = name;
        }

        @Override
        public void run(){
            for (int i = 0; i < 5; i++) {
                System.out.println(this.name + "：" + i);
            }
        }
    }
```

```
    public static void main(String[] args) {
        MyThread myThread = new MyThread("MyThread-0");
        myThread.start();
    }
```

![](http://huanzi.qzz.io/file-server/blog-image/202111/1353055-20211108104124175-1808697817.png)  <br/>





### 　　Runnable <br/>

```
    /**
     * 通过 implements Runnable
     */
    public class MyRunnable implements Runnable{

        private final String name;

        public MyRunnable(String name){
            this.name = name;
        }

        @Override
        public void run(){
            for (int i = 0; i < 5; i++) {
                System.out.println(this.name + "：" + i);
            }
        }
    }
```

```
    public static void main(String[] args) {
        MyRunnable myRunnable = new MyRunnable("MyRunnable-0");
        new Thread(myRunnable).start();

    }
```

![](http://huanzi.qzz.io/file-server/blog-image/202111/1353055-20211108104150026-1266690598.png)  <br/>





### 　　Callable<V> <br/>

```
    /**
     * 通过 implements Callable<V>
     */
    public class MyCallable implements Callable<String> {

        private final String name;

        public MyCallable(String name){
            this.name = name;
        }

        @Override
        public String call() throws Exception {
            for (int i = 0; i < 5; i++) {
                System.out.println(this.name + "：" + i);
            }
            return "执行完成";
        }
    }
```

```
    public static void main(String[] args) {
        MyCallable myCallable = new MyCallable("MyCallable-0");
        new Thread(new FutureTask<String>(myCallable)).start();

    }
```

![](http://huanzi.qzz.io/file-server/blog-image/202111/1353055-20211108104222143-1786209860.png)  <br/>





### 　　线程池 <br/>

```
    public static void main(String[] args) {
        MyThread myThread = new MyThread("MyThread-0");
        MyRunnable myRunnable = new MyRunnable("MyRunnable-0");
        MyCallable myCallable = new MyCallable("MyCallable-0");

        //线程池
        ExecutorService threadPool = Executors.newFixedThreadPool(10);
        threadPool.submit(myThread);
        threadPool.submit(myRunnable);
        threadPool.submit(myCallable);

        //关闭线程池
        threadPool.shutdown();
    }
```

![](http://huanzi.qzz.io/file-server/blog-image/202111/1353055-20211108104520857-1497761950.png)  <br/>





## 　　并发安全 <br/>

### 　　synchronized <br/>

　　使用synchronized关键字对线程加锁，在有线程获取该内存锁后，其它线程无法访问该内存，从而实现JAVA中简单的同步、互斥操作。 <br/>

　　同步代码块 <br/>

```
synchronized(Obj){//obj叫做同步监听器，只能是引用类型

}
```

　　同步方法 <br/>

```
public synchronized void fun(){//同步方法中，默认使用this当前对象作为同步对象 

}
```



### 　　Lock <br/>

　　从jdk1.5之后，java提供了另外一种方式来实现同步访问，那就是Lock。 <br/>

```
//可重入锁
Lock lock = new ReentrantLock();

//加锁
lock.lock();

try{
    //并发处理逻辑...
}catch(Exception ex){
     
}finally{
    //释放锁
    lock.unlock();
}
```



　　老公、老婆同时取钱例子： <br/>

```
/**
 * 银行账户
 */
public class Account {

    //余额
    private int balance = 1000;

    public Account() {
    }

    public Account(int balance) {
        this.balance = balance;
    }

    public int getBalance() {
        return balance;
    }

    public void setBalance(int balance) {
        this.balance = balance;
    }

}
```

　　使用synchronized <br/>

```
/**
 * 通过 implements Runnable
 */
public class MyRunnable implements Runnable{

    private final String name;

    private final Account account;

    public MyRunnable(Account account,String name){
        this.account = account;
        this.name = name;
    }

    @Override
    public void run(){
        for (int i = 0; i < 5; i++) {
            //加锁，锁的是银行账户对象
            synchronized (account) {
                //余额大于200
                if (account.getBalance() >= 200) {

                    //模拟耗时
                    try {
                        Thread.sleep(200);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                    //取钱成功
                    account.setBalance(account.getBalance() - 200);
                    System.out.println(this.name + "取走了200元，当前余额为：" + account.getBalance());
                } else {
                    System.out.println(this.name + "取钱失败，余额不足");
                }
            }
        }
    }
}
```

　　使用Lock <br/>

```
/**
 * 通过 implements Runnable
 */
public class MyRunnable implements Runnable{

    private final String name;

    private final Account account;

    //可重入锁
    private static final Lock lock = new ReentrantLock();

    public MyRunnable(Account account,String name){
        this.account = account;
        this.name = name;
    }

    @Override
    public void run(){
        for (int i = 0; i < 5; i++) {
            //加锁
            lock.lock();
            
            try{
                //余额大于200
                if (account.getBalance() >= 200) {

                    //模拟耗时
                    try {
                        Thread.sleep(200);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                    //取钱成功
                    account.setBalance(account.getBalance() - 200);
                    System.out.println(this.name + "取走了200元，当前余额为：" + account.getBalance());
                } else {
                    System.out.println(this.name + "取钱失败，余额不足");
                }
            }catch(Exception e){
                e.printStackTrace();
            }finally{
                //释放锁
                lock.unlock();
            }
        }
    }
}
```

　　测试 <br/>

```
    public static void main(String[] args) {
        //初始化银行账户
        Account account = new Account();

        //老公、老婆同时取钱
        new Thread(new MyRunnable(account,"老公")).start();
        new Thread(new MyRunnable(account,"老婆")).start();
    }
```



![](http://huanzi.qzz.io/file-server/blog-image/202111/1353055-20211108151546885-1914982486.png)  <br/>







　　如果不加锁，就会出现并发安全问题 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202111/1353055-20211108151527608-480901311.png)  <br/>









### 　　死锁 <br/>

　　死锁是指两个或两个以上的进程在执行过程中，由于竞争资源或者由于彼此通信而造成的一种阻塞的现象，若无外力作用，它们都将无法推进下去。此时称系统处于死锁状态或系统产生了死锁，这些永远在互相等待的进程称为死锁进程 <br/>

　　死锁的发生必须具备以下四个必要条件。 <br/>

　　1）互斥条件：指进程对所分配到的资源进行排它性使用，即在一段时间内某资源只由一个进程占用。如果此时还有其它进程请求资源，则请求者只能等待，直至占有资源的进程用毕释放。 <br/>

　　2）请求和保持条件：指进程已经保持至少一个资源，但又提出了新的资源请求，而该资源已被其它进程占有，此时请求进程阻塞，但又对自己已获得的其它资源保持不放。 <br/>

　　3）不剥夺条件：指进程已获得的资源，在未使用完之前，不能被剥夺，只能在使用完时由自己释放。 <br/>

　　4）环路等待条件：指在发生死锁时，必然存在一个进程——资源的环形链，即进程集合{P0，P1，P2，···，Pn}中的P0正在等待一个P1占用的资源；P1正在等待P2占用的资源，……，Pn正在等待已被P0占用的资源。 <br/>



![](http://huanzi.qzz.io/file-server/blog-image/202111/1353055-20211108105817859-1936812368.png)  <br/>





## 　　更新 <br/>

　　2022-03-09更新，日常开发中，可能会有这样的需求，需要多个线程来处理任务，同时主线程需要等待所有任务完成 <br/>

　　CountDownLatch类通过计数器使一个线程等待其他线程各自执行完毕后再执行，具有类似功能的还有CyclicBarrier类 <br/>

　　示例：线程池有3个线程，负责处理10个任务，主线程需要等待所有任务执行完，才继续放下执行 <br/>

```
    public static void main(String[] args) {
        //线程池
        ExecutorService executorService = Executors.newFixedThreadPool(3);

        //任务数
        int count = 10;
        CountDownLatch countDownLatch = new CountDownLatch(count);

        try {
            System.out.println("线程名称："+Thread.currentThread().getName()+"，开始多线程处理任务：");

            for (int i = 1; i <= count; i++) {
                //启动多线程
                executorService.submit(new MyRunnable(countDownLatch,String.valueOf(i)));
            }

            //等待所有任务完成，最多等待5分钟时间
            countDownLatch.await(5, TimeUnit.MINUTES);

            System.out.println("线程名称："+Thread.currentThread().getName()+"，所有任务完成！");
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        //关闭线程池
        executorService.shutdown();
    }

    static class MyRunnable implements Runnable{
        private final CountDownLatch countDownLatch;
        private final String number;

        public MyRunnable(CountDownLatch countDownLatch,String number){
            this.countDownLatch =  countDownLatch;
            this.number = number;
        }

        @Override
        public void run() {
            try {
                //模拟耗时
                Thread.sleep(500);

                System.out.println("线程名称："+Thread.currentThread().getName()+"、任务编号："+number+"，任务处理完成！");
            }catch (Exception e){
                e.printStackTrace();
            }finally {
                //标记一个任务完成
                countDownLatch.countDown();
            }
        }
    }
```

　　效果 <br/>

```
线程名称：main，开始多线程处理任务：
线程名称：pool-2-thread-3、任务编号：3，任务处理完成！
线程名称：pool-2-thread-1、任务编号：1，任务处理完成！
线程名称：pool-2-thread-2、任务编号：2，任务处理完成！
线程名称：pool-2-thread-1、任务编号：5，任务处理完成！
线程名称：pool-2-thread-3、任务编号：4，任务处理完成！
线程名称：pool-2-thread-2、任务编号：6，任务处理完成！
线程名称：pool-2-thread-3、任务编号：8，任务处理完成！
线程名称：pool-2-thread-1、任务编号：7，任务处理完成！
线程名称：pool-2-thread-2、任务编号：9，任务处理完成！
线程名称：pool-2-thread-3、任务编号：10，任务处理完成！
线程名称：main，所有任务完成！
```



 　　2022-04-07更新：线程池参数详解 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202204/1353055-20220407102314671-110219244.png)  <br/>





　　corePoolSize
　　线程池中保留的线程数，线程池核心线程大小，即使它们是空闲的也不会被销毁，除非设置allowCoreThreadTimeOut <br/>

　　maximumPoolSize
　　线程池最大线程数量，线程池中允许的最大线程数 <br/>

　　keepAliveTime
　　空闲线程存活时间，一个线程如果处于空闲状态，并且当前的线程数量大于corePoolSize，那么存活时间大于keepAliveTime后，这个空闲线程会被销毁 <br/>

　　unit
　　空闲线程存活时间单位，keepAliveTime参数的时间单位 <br/>

　　workQueue
　　工作队列，在任务执行之前用来保存任务的队列，一个任务被提交到线程池以后，首先会找有没有空闲存活线程，如果有则直接将任务交给这个空闲线程来执行，如果没有则会缓存到工作队列中，如果工作队列满了，才会创建一个新线程，然后从工作队列取出一个任务交由新线程来处理 <br/>

　　threadFactory
　　线程工厂，创建一个新线程时使用的工厂，可以用来设定线程名、是否为daemon线程等等 <br/>

　　handler
　　拒绝策略，当工作队列中的任务已到达最大限制，并且线程池中的线程数量也达到最大限制，这时如果有新任务提交进来，将使用的处理程序 <br/>



## 　　后记 <br/>

　　Thread.sleep()：使线程进入阻塞状态，会释放CPU资源但不会释放对象锁的控制 <br/>

　　Object.wait()：当前线程必须拥有此对象监视器。该线程释放对此监视器的所有权（释放synchronize锁）并等待，直到其他线程通过调用 notify 方法，或 notifyAll 方法通知在此对象的监视器上等待的线程醒来。然后该线程将等到重新获得对监视器的所有权后才能继续执行。  <br/>

　　Thread.sleep()与Object.wait()二者都可以暂停当前线程，释放CPU控制权，主要的区别在于Object.wait()在释放CPU同时，释放了对象锁的控制 <br/>


