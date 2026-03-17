
## 　　前言 <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　小知识</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　Java由Sun公司于1995年推出，2009年Sun公司被Oracle公司收购，取得Java的版权</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　Java之父：James Gosling（詹姆斯·高斯林）</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　专业术语</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　JDK：java development kit（java开发工具包）</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　JRE：java runtime environment（java运行环境） </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　JVM: java virual machine（java虚拟机：跨平台的核心）</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　java实现跨平台的核心原理</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、编译，将源文件编译成字节码文件（.class文件）</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、解释，将字节码文件解释成不同操作系统可识别的机器码文件（经过jvm）</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

## 　　基础语法 <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  0、常量与变量</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　常量：在程序运行过程中，不会发生变化的值</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　常量如何定义：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　在进行常量声明定义的时候，一般取名全部大写并且用_隔开且使用final进行修饰</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　例如：final 常量类型 常量名称 = VALUE_ABC;</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　变量：在程序运行过程中，会发生变化值</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　变量如何定义：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、声明加赋值：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　变量类型 变量名称 = value;</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、先声明，后赋值：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　变量类型  变量名称；</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　变量名称 = value；</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　变量会根据作用域的不同分为不同的类型</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、成员变量：定义在方法外，类内的变量</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　作用域：整个对象实例</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、局部变量：定义在方法内的变量</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　作用域：声明位置开始到整个方法结束</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　3、静态变量：使用static修饰的变量叫做静态变量</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　作用域：被所有对象实例所共享</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  1、标识符：给类，变量，方法，接口起得名字</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　规范：首字母必须是英文，_，$</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　其余部分可以是英文，下划线，$,数字</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　 　　java严格区分大小写，且长度无限制</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　不能使用java中的关键字</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　约定：驼峰标识、见名思意</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　类名：首字母大写，如果类名由若干单词组成，那么每个单词的首字母应该大写</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　方法名：小写字母开头，如果方法名含有若干单词，则后面的每个单词首字母大写</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　源文件名：必须和类名相同，文件名的后缀为.java</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  2、字符集：iso8859-1西欧字符集   gbk：简体和繁体中文    unicode国际通用字符集（utf-8，utf-16）</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  3、保留字（关键字）：供系统内部使用的，不可以在标识符中使用</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　例如：this、super</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  4、数据类型：基本数据类型，引用数据类型</span> <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202306/1353055-20230608165236305-1284690537.png)  <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  基本数据类型：4类8种</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　整型数据：byte：一个字节：范围是-128~127</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　　　short:两个字节：范围是-32768~32767</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　　　int :四个字节：范围正负21亿，是整型的默认类型</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　　　long：8个字节：使用的时候需要在后面加L或者l</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　浮点数据：float：单精度，7位小数，使用的时候需要加f或者F</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　　　double:双精度，14位小数，默认的浮点类型，</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　字符数据：char：2个字节，表示范围0-65535</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　布尔类型：true或者flase，只用1位表示</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  5、数据类型的转换：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　基本数据类型之间可以相互转换：自动转换，强制转换</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　自动转换：小类型转为大类型</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　强制转换：大类型转为小类型</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　不同类型的数据进行混合运算的时候，会将类型向最大的转换</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　byte--&gt;short、char--&gt;int--&gt;long--&gt;float--&gt;double</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  6、运算符：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　算术运算符：+、-、*、/、%、++、--</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　%是取模运算，++，--是单目运算符</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　关系运算符：&gt;、&lt;、==、!=、&gt;=、&lt;=</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　逻辑运算符：&amp;&amp;、||、！</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　短路与 &amp;&amp;，式子两边都为真才为真；如果左边第一个式子已经为假则后面的就不会再判断，为假</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　短路或 ||，式子两边有一个为真就为真；如果左边第一个式子已经为真则后面的就不会再判断，为真</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　取反 ！，真变假，假变真</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　位运算符：&amp;、|、~、^、&lt;&lt;,&gt;&gt;</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　赋值运算符：=</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　扩展赋值运算符：+=、-=、*=、/=、%=</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　条件运算符，三目表达式：？：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  7、注释</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　java中注释分为三种：注释不会被编译成字节码文件</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、单行注释：// 单行注释</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、多行注释：/* 注释内容 */</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　3、文档注释：/** 使用文档注释，当导出doc文件的时候会一起导出来 */</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　idea如何将项目中的接口方法、文档注释导出？</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　Tools --&gt; Generate JavaDoc</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

## 　　流程控制语句 <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　程序的执行有三种结构</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　顺序结构：Java代码执行顺序：从左到右、从上到下顺序执行</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　分支结构：if-else、switch</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　单分支：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

```
            if(false或true){
                语句;
            }
```

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　双分支：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

```
            if(false或true){
                语句;
            }else{
                语句;
            }
```

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　多分支：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

```
            if(false或true){
                语句;
            }elseif(false或true){
                语句;
            }
            ...
            else{
                语句;
            }
```

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　switch结构：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

```
            switch(value){
                case 值1：
                    语句;
                    break;
                ...
                default：
                    语句;
            }
```

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　循环结构：for、while、do-while</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　循环的结构的组成部分：初始化；判断条件；循环体；迭代器；</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　for循环语句：是最有效、最灵活的循环结构</span> <br/>

```
            for (int i = 0; i < 10; i++) {
                System.out.println(i);
            }
```

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　while：先判断，后执行</span> <br/>

```
            int i = 10;
            while (i >= 0){
                System.out.println(i);
                i--;
            }
```

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　do while：先执行，后判断（循环体至少执行一次）</span> <br/>

```
            int i = 10;
            do{
                System.out.println(i);
                i--;
            }while (i >= 0);
```

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　跳转：break、continue、return  </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　break：用于switch或循环，用于循环语句时，可跳出循环而执行循环后面的语句</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　continue：只能用在循环语句，跳出循环体中剩余的语句而执行下一次循环</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　return：从当前方法退出，返回到调用该方法的语句处，并从该语句的下一条语句处继续执行程序</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  递归：程序调用自身的编程技巧称为递归</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　结构：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　递归结束条件</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　递归体</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　特点：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　一个问题可被分解为若干层简单的子问题</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　子问题和上层问题的解决方案一致</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　外层问题的解决依赖于子问题的解决</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　缺点：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　递归调用会占用大量的系统堆栈，内存耗太多</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　递归调用层次多时速度要比循环慢很多</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  数组</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　数组是相同类型数据的有序集合</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　数组的特点：长度固定，连续空间，存储同一种类型数据</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　优点：按照索引查询效率高</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　缺点：添加删除元素效率低；按照内容查询效率低</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  二维数组：数组的数组</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

## 　　面向对象 <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　面向对象和面向过程都是一种编程思维方式，面向对象和面向过程是相辅相成的，不是完全对立的</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　宏观上都是面向对象的，微观上面向过程</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　对象是类的实例化，类是对象的抽象，类是对象的模板，对象是由类生成的</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　Java通过new关键字来调用构造器，从而返回该类的实例，一个对象应包含两部分：属性（特点，特征）和方法（行为，动作）</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　Java中，万事万物皆对象</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　构造方法（构造器）：对类的属性进行初始化的操作</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　要求：类名必须和方法名称一致，没有返回值，参数列表可以任意，构造方法可以实现重载</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　　　当自己不定义构造器的时候，系统会默认的分配一个空的构造方法，当定义构造器之后，就不再分配</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  代码块：由{}括起来的一段代码</span> <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202306/1353055-20230608170006256-1138979736.png) ![](http://huanzi.qzz.io/file-server/blog-image/202306/1353055-20230608170017342-795914692.png)  <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　普通代码块：方法中</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　在方法中添加{}没有任何意义</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　构造代码块：方法外，类内</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　构造代码块的代码在编译的时候会自动的添加到构造方法中</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　1、当有多个构造方法的时候，会将构造代码块放到每一个构造方法中</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　2、如果构造方法之间有相互调用，会放到最初的构造方法中</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　静态代码块：方法外，类内</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　如果希望加载后，对整个类进行某些初始化操作，可以使用static初始化块。</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　在类加载的时候完成初始化的工作</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　是在类初始化时执行，不是在创建对象时执行。</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　静态初始化块中不能访问非static成员。</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　同步代码块：使用synchronized关键字对线程加锁</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　在Java的Object类型中，都是带有一个内存锁的</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　有线程获取该内存锁后，其它线程无法访问该内存，从而实现JAVA中简单的同步、互斥操作</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  方法：完成特定功能的代码块，由5部分组成:访问修饰符，返回值，方法名称，参数列表，方法体</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

```
    [修饰符] 方法返回值类型 方法名(形参列表 ) {
        方法体
    }
```

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  方法调用：返回值类型 返回值 = 对象.方法(实参列表);</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　形参和实参</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　定义方法的参数是形式参数</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　调用方法的参数是实在参数</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　参数传递</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　基本数据类型的参数传递，无法通过方法调用改变变量的值</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

```
            //测试方法
            private static test(int i){
                    i++;
            }
            //main函数
            public static void main(String[] args) {
                int i = 1;
                test(i);
                //将会打印：1
                System.out.println(i);
            }
```

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　引用数据类型的参数传递，可以通过方法调用改变变量的值</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

```
        //测试方法
        private static void test(HashMap<String, String> hashMap){
            hashMap.put("name","李四");
        }
        //main函数
        public static void main(String[] args) {
            HashMap<String, String> hashMap = new HashMap<>();
            hashMap.put("name","张三");
            test(hashMap);
            //将会打印：{name=李四}
            System.out.println(hashMap);
        }
```

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  方法重写：当父类的某些方法不能满足子类的需要的时候，子类重新实现父类的方法</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　要求：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　重写方法必须和被重写方法具有相同方法名称、参数列表和返回类型。</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　　　重写方法不能使用比被重写方法更严格的访问权限且不能重写父类的私有方法和构造方法。</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  方法重载：一个类中可以定义有相同的名字，但参数不同（类型，个数，顺序不同）的多个方法，调用时会根据不同的参数表选择对应的方法。</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　只有返回值不同不构成方法的重载、只有形参的名称不同不构成方法的重载</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  封装、继承、多态：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　封装：该露的露，该藏的藏，将类的某些内部实现细节隐藏起来，只能通过公共的方法进行访问</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　继承：为了提高代码的复用性，对某一批类进行的抽象，抽出相同的属性和方法，组成父类，编写子类，使用extends关键字继承父类（java是单继承）</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　多态：同一个引用类型（父类），使用不同的实例（子类实例）而执行不同操作，多态可以让我们不用关心某个对象到底是什么具体类型，就可以使用该对象的某些方法，从而实现更加灵活的编程，提高系统的可扩展性</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  package包：为了解决类重名问题、便于管理类，有了包的概念，合适的类位于合适的包</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　在类中，package位于非注释性语句的第一行</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　包命名约定：域名倒写，例如：cn.huanzi.qch</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  import导包：导入后可以使用这个类</span> <br/>

![](http://huanzi.qzz.io/file-server/blog-image/202306/1353055-20230608170426707-1945071800.png)  <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  内部类：把一个类定义在另一个类的内部称为内部类</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　成员内部类、静态内部类、方法内部类、匿名内部类</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、内部类轻松访问外部类的私有属性</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、外部类不能直接使用内部类的成员和方法</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  抽象类：不需要进行实例化的类，使用abstract修饰</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、抽象类虽然不能实例化，但是依然需要构造方法，用来进行子类的实例化操作</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、当一个类不需要实例化的时候可将类定义为抽象类</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　3、抽象类为所有子类提供了一个通用模版，子类可以在这个模版基础上进行扩展</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　4、通过抽象类，可以避免子类设计的随意性。做到严格限制子类的设计，使子类之间更加通用，实现了规范和具体实现的分离</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　5、absteact是不能和final一起使用的</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  抽象方法：</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、在方法前加abstract关键字表示抽象方法，不需要方法实现</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、在抽象类中的抽象方法，子类必须进行重写</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　3、在抽象类中可以有无数个抽象方法，也可以没有抽象方法</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　4、如果一个类中有抽象方法，那么这个类一定是抽象类</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　5、子类必须要实现父类的抽象方法吗？不是，当子类也是一个抽象类的时候，可以不实现</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  接口：比抽象类还要抽象的抽象类，更加规范的对子类进行约束</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、接口不能被实例化</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、实现类可以实现多个接口、实现类必须实现接口的所有方法</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　3、如果实现类存在有继承，关键字extends必须在关键字implements之前</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　4、接口中的变量都是静态常量</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　interface 定义接口</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　implements 子类实现接口</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  访问修饰符：限定变量，方法，类的访问权限。</span> <br/>


| |本类|本包|子类|其他包|
|:----:|:----:|:----:|:----:|:----:|
|public|√|√|√|√|
|protected|√|√|√| |
|default|√|√| | |
|private|√| | | |
 <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  this关键字：指代当前对象</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、在构造方法中，this关键字必须位于第一行</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、构造方法中可以使用this()调用其他的构造方法</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　3、静态方法中不可以使用this关键字</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　4、在普通方法中，可以随便使用this关键字调用方法和属性，但是可以省略，一般情况下都省略</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　5、在构造方法中，this用于区分成员变量和参数</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　6、this不能在构造方法中和super同时使用</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  super关键字：指代父类对象，跟this的使用方法几乎一样</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  final关键字：最终的，不可变的</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、修饰变量：常量一般不用驼峰写法，而是全部大写加下划线分割。比如：final int DOG_AGE=18</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、修饰方法：该方法不可被子类重写。但是可以被重载</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　3、修饰类：修饰的类不能有子类，不能被继承。比如：Math、String</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　注意：final修饰的是引用变量时，只是引用值不能改变。对应的对象内部的属性仍然可变</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  static关键字：静态的意思，它属于类变量</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、static修饰的变量只在内存中存储一份，被所有对象实例所共享</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、static修饰的变量在类被载入的时候显示初始化</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　3、可以通过对象.变量名访问，也可以通过类名.变量名来访问，但是推荐使用类名</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　4、static只初始化一次</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　在类中，用static声明的成员变量为静态成员变量，被static修饰的方法叫做静态方法</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　1、可以通过类名.方法名直接调用，</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　2、在创建对象之前完成初始化功能</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　3、在static方法中不可以使用非static的方法和属性，（在调用该方法时，不会将对象的引用传递给它）</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>

## 　　后记 <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">  　　Java基础之基础语法与面向对象暂时先记录到这，后续再进行补充</span> <br/>

　　<span style="font-family: &quot;Microsoft YaHei&quot;">   </span> <br/>


