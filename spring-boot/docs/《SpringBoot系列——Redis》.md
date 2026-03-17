
## 　　前言 <br/>

　　Redis是一个缓存、消息代理和功能丰富的键值存储。StringBoot提供了基本的自动配置。本文记录一下springboot与redis的简单整合实例 <br/>

　　官方文档：[https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-redis](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/htmlsingle/#boot-features-redis) <br/>



## 　　前期准备 <br/>

　　首先我们要有一个Redis服务，由于我没有Linux环境，为了方便搭建项目，直接在Windows下安装，参考这篇博客：[Windows下安装Redis服务](https://www.cnblogs.com/jaign/articles/7920588.html) <br/>

　　安装步骤：一直点下一步（偷懒，步骤9、10设置密码我没有设置） <br/>

　　下载、安装、启动好Redis服务后我们设置一个key并获取一下 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190108162637345-1420602164.png)  <br/>



## 　　代码编写 <br/>

　　maven引包 <br/>

```
        <!-- Redis -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
```



　　配置文件 <br/>

　　我们先看一下都有哪些Redis相关配置，发现好多都有默认值，而且刚好符合我们现在的测试环境，于是乎我的配置文件是这样滴.... <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190108163335710-365124919.png)  <br/>

```
server.port=1113
spring.application.name=redis-server
```



　　写一个订阅监听 <br/>

```
/**
 * redis 订阅、监听
 */
@Configuration
public class Listeners {

    /**
     * 订阅
     */
    @Bean
    public RedisMessageListenerContainer container(
            MessageListenerAdapter listenerAdapter1,
            MessageListenerAdapter listenerAdapter2,
            RedisConnectionFactory connectionFactory
            ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        //订阅频道
        container.addMessageListener(listenerAdapter1, new PatternTopic("topic1"));
        container.addMessageListener(listenerAdapter2, new PatternTopic("topic1"));

        container.addMessageListener(listenerAdapter2, new PatternTopic("topic2"));
        return container;
    }

    /**
     * 监听
     */
    @Bean
    MessageListenerAdapter listenerAdapter1(Receiver1 receiver){
        return new MessageListenerAdapter(receiver);
    }
    @Bean
    MessageListenerAdapter listenerAdapter2(Receiver2 receiver){
        return new MessageListenerAdapter(receiver);
    }

    /**
     * 接收器
     */
    @Component
    class Receiver1 {
        public void handleMessage(String message) {
            System.out.println("Receiver1接收器："+message);
        }
    }
    @Component
    class Receiver2 {
        public void handleMessage(String message) {
            System.out.println("Receiver2接收器："+message);
        }
    }
}
```



　　接口测试代码 <br/>

```
@RestController
public class Controller {

    @Autowired
    private StringRedisTemplate template;

    /**
     * 获取缓存
     */
    //测试：http://localhost:10088/redis/get/huanzi
    @RequestMapping("/redis/get/{key}")
    public String get(@PathVariable("key") String key){
        return template.opsForValue().get(key);
    }

    /**
     * 设置缓存
     */
    //测试：http://localhost:10088/redis/set/huanzi/huanzi
    @RequestMapping("/redis/set/{key}/{value}")
    public Boolean set(@PathVariable("key") String key,@PathVariable("value") String value){
        boolean flag = true;
        try {
            template.opsForValue().set(key,value);
            //有效时长（秒）
            template.expire(key, 10, TimeUnit.SECONDS);
        } catch (Exception e) {
            e.printStackTrace();
            flag = false;
        }

        return flag;
    }

    /**
     * 发布消息
     */
    //测试：http://localhost:10088/redis/eventPush
    @RequestMapping("/redis/eventPush")
    public Boolean eventPush(){
        template.convertAndSend("topic1","topic1-我是第一种事件消息");
        template.convertAndSend("topic2","topic2-我是第二种事件消息");
        return true;
    }
}
```





## 　　测试效果 <br/>

　　设置、获取缓存 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190108163652744-936641714.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190108163711720-19056369.png)  <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/201901/1353055-20190108163726100-547374174.png)  <br/>



 　　发布、订阅 <br/>

![](https://huanzi-qch.github.io/file-server/blog-image/202106/1353055-20210618161813429-1990244564.png)  <br/>



![](https://huanzi-qch.github.io/file-server/blog-image/202106/1353055-20210618161832093-2062525508.png)  <br/>







## 　　扩展工具类 <br/>

　　关于StringRedisTemplate类的操作自行查阅资料，我在网上找了一个工具类，我没有测试过，但可以参考自行测试！ <br/>

```
@SuppressWarnings("ALL")
@Component
public class RedisUtil {

    private static StringRedisTemplate template;

    /**
     * 静态注入
     */
    public RedisUtil(StringRedisTemplate template) {
        RedisUtil.template = template;
    }

    /**
     * 指定缓存失效时间
     *
     * @param key  键
     * @param time 时间(秒)
     */
    private void expire(String key, long time) {
        try {
            if (time > 0) {
                template.expire(key, time, TimeUnit.SECONDS);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * 根据key 获取过期时间
     *
     * @param key 键 不能为null
     * @return 时间(秒) 返回0代表为永久有效
     */
    public long getExpire(String key) {
        return template.getExpire(key, TimeUnit.SECONDS);
    }

    /**
     * 判断key是否存在
     *
     * @param key 键
     * @return true 存在 false不存在
     */
    public boolean hasKey(String key) {
        try {
            return template.hasKey(key);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 删除缓存
     *
     * @param key 可以传一个值 或多个
     */
    public void del(String... key) {
        if (key != null && key.length > 0) {
            if (key.length == 1) {
                template.delete(key[0]);
            } else {
                template.delete(CollectionUtils.arrayToList(key));
            }
        }
    }

    //============================String=============================  

    /**
     * 普通缓存获取
     *
     * @param key 键
     * @return 值
     */
    public Object get(String key) {
        return key == null ? null : template.opsForValue().get(key);
    }

    /**
     * 普通缓存放入
     *
     * @param key   键
     * @param value 值
     * @return true成功 false失败
     */
    public boolean set(String key, Object value) {
        try {
            template.opsForValue().set(key, String.valueOf(value));
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }

    }

    /**
     * 普通缓存放入并设置时间
     *
     * @param key   键
     * @param value 值
     * @param time  时间(秒) time要大于0 如果time小于等于0 将设置无限期
     * @return true成功 false 失败
     */
    public boolean set(String key, Object value, long time) {
        try {
            if (time > 0) {
                template.opsForValue().set(key, String.valueOf(value), time, TimeUnit.SECONDS);
            } else {
                set(key, value);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 递增
     *
     * @param key 键
     * @return
     */
    public long incr(String key, long delta) {
        if (delta < 0) {
            throw new RuntimeException("递增因子必须大于0");
        }
        return template.opsForValue().increment(key, delta);
    }

    /**
     * 递减
     *
     * @param key 键
     * @return
     */
    public long decr(String key, long delta) {
        if (delta < 0) {
            throw new RuntimeException("递减因子必须大于0");
        }
        return template.opsForValue().increment(key, -delta);
    }

    //================================Map=================================  

    /**
     * HashGet
     *
     * @param key  键 不能为null
     * @param item 项 不能为null
     * @return 值
     */
    public Object hget(String key, String item) {
        return template.opsForHash().get(key, item);
    }

    /**
     * 获取hashKey对应的所有键值
     *
     * @param key 键
     * @return 对应的多个键值
     */
    public Map<Object, Object> hmget(String key) {
        return template.opsForHash().entries(key);
    }

    /**
     * HashSet
     *
     * @param key 键
     * @param map 对应多个键值
     * @return true 成功 false 失败
     */
    public boolean hmset(String key, Map<String, Object> map) {
        try {
            template.opsForHash().putAll(key, map);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * HashSet 并设置时间
     *
     * @param key  键
     * @param map  对应多个键值
     * @param time 时间(秒)
     * @return true成功 false失败
     */
    public boolean hmset(String key, Map<String, Object> map, long time) {
        try {
            template.opsForHash().putAll(key, map);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 向一张hash表中放入数据,如果不存在将创建
     *
     * @param key   键
     * @param item  项
     * @param value 值
     * @return true 成功 false失败
     */
    public boolean hset(String key, String item, Object value) {
        try {
            template.opsForHash().put(key, item, value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 向一张hash表中放入数据,如果不存在将创建
     *
     * @param key   键
     * @param item  项
     * @param value 值
     * @param time  时间(秒)  注意:如果已存在的hash表有时间,这里将会替换原有的时间
     * @return true 成功 false失败
     */
    public boolean hset(String key, String item, Object value, long time) {
        try {
            template.opsForHash().put(key, item, value);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 删除hash表中的值
     *
     * @param key  键 不能为null
     * @param item 项 可以使多个 不能为null
     */
    public void hdel(String key, Object... item) {
        template.opsForHash().delete(key, item);
    }

    /**
     * 判断hash表中是否有该项的值
     *
     * @param key  键 不能为null
     * @param item 项 不能为null
     * @return true 存在 false不存在
     */
    public boolean hHasKey(String key, String item) {
        return template.opsForHash().hasKey(key, item);
    }

    /**
     * hash递增 如果不存在,就会创建一个 并把新增后的值返回
     *
     * @param key  键
     * @param item 项
     * @param by   要增加几(大于0)
     * @return
     */
    public double hincr(String key, String item, double by) {
        return template.opsForHash().increment(key, item, by);
    }

    /**
     * hash递减
     *
     * @param key  键
     * @param item 项
     * @param by   要减少记(小于0)
     * @return
     */
    public double hdecr(String key, String item, double by) {
        return template.opsForHash().increment(key, item, -by);
    }

    //============================Set=============================

    /**
     * 根据key获取Set中的所有值
     *
     * @param key 键
     * @return
     */
    public Set<Object> sGet(String key) {
        try {
            return Collections.singleton(template.opsForSet().members(key));
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 根据value从一个set中查询,是否存在
     *
     * @param key   键
     * @param value 值
     * @return true 存在 false不存在
     */
    public boolean sHasKey(String key, Object value) {
        try {
            return template.opsForSet().isMember(key, value);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将数据放入set缓存
     *
     * @param key    键
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSet(String key, Object... values) {
        try {
            return template.opsForSet().add(key, String.valueOf(values));
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 将set数据放入缓存
     *
     * @param key    键
     * @param time   时间(秒)
     * @param values 值 可以是多个
     * @return 成功个数
     */
    public long sSetAndTime(String key, long time, String... values) {
        try {
            Long count = template.opsForSet().add(key, values);
            if (time > 0) {
                expire(key, time);
            }
            return count;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 获取set缓存的长度
     *
     * @param key 键
     * @return
     */
    public long sGetSetSize(String key) {
        try {
            return template.opsForSet().size(key);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 移除值为value的
     *
     * @param key    键
     * @param values 值 可以是多个
     * @return 移除的个数
     */
    public long setRemove(String key, Object... values) {
        try {
            Long count = template.opsForSet().remove(key, values);
            return count;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    //===============================list=================================  

    /**
     * 获取list缓存的内容
     *
     * @param key   键
     * @param start 开始
     * @param end   结束  0 到 -1代表所有值
     * @return
     */
    public List<String> lGet(String key, long start, long end) {
        try {
            return template.opsForList().range(key, start, end);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 获取list缓存的长度
     *
     * @param key 键
     * @return
     */
    public long lGetListSize(String key) {
        try {
            return template.opsForList().size(key);
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 通过索引 获取list中的值
     *
     * @param key   键
     * @param index 索引  index>=0时， 0 表头，1 第二个元素，依次类推；index<0时，-1，表尾，-2倒数第二个元素，依次类推
     * @return
     */
    public Object lGetIndex(String key, long index) {
        try {
            return template.opsForList().index(key, index);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 将list放入缓存
     *
     * @param key   键
     * @param value 值
     * @return
     */
    public boolean lSet(String key, Object value) {
        try {
            template.opsForList().rightPush(key, (String) value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将list放入缓存
     *
     * @param key   键
     * @param value 值
     * @param time  时间(秒)
     * @return
     */
    public boolean lSet(String key, Object value, long time) {
        try {
            template.opsForList().rightPush(key, (String) value);
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将list放入缓存
     *
     * @param key   键
     * @param value 值
     * @return
     */
    public boolean lSet(String key, List<Object> value) {
        try {
            template.opsForList().rightPushAll(key, String.valueOf(value));
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 将list放入缓存
     *
     * @param key   键
     * @param value 值
     * @param time  时间(秒)
     * @return
     */
    public boolean lSet(String key, List<Object> value, long time) {
        try {
            template.opsForList().rightPushAll(key, String.valueOf(value));
            if (time > 0) {
                expire(key, time);
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 根据索引修改list中的某条数据
     *
     * @param key   键
     * @param index 索引
     * @param value 值
     * @return
     */
    public boolean lUpdateIndex(String key, long index, Object value) {
        try {
            template.opsForList().set(key, index, (String) value);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 移除N个值为value
     *
     * @param key   键
     * @param count 移除多少个
     * @param value 值
     * @return 移除的个数
     */
    public long lRemove(String key, long count, Object value) {
        try {
            Long remove = template.opsForList().remove(key, count, value);
            return remove;
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }
}
View Code
```



##  　　后记 <br/>

　　这只是一个单机版的Redis服务，而且还是Windows上面的，后续有空再搭建Redis集群 <br/>



　　redis的发布、订阅可以做业务解耦、或者服务之间的互动。 <br/>

　　例如我们有一个“订单系统”、“消息系统”： <br/>

　　1、“消息系统”订阅、监听用户下单频道。 <br/>

　　2、“订单系统”收到用户下单后处理自己的业务，同时发布用户下单消息。 <br/>

　　3、“消息系统”收到订阅回调后给用户发送下单成功的短信提醒。 <br/>



## 　　补充 <br/>

　　我们经常会使用到sessionId来作为Redis的key，记录一下多种获取request、response的方法 <br/>

　　1、直接从controller传进来 <br/>

```
    @PostMapping("xxx")
    public String xxx(HttpServletRequest request, HttpServletResponse response) {
        return null;
    }
```



　　2、从RequestContextHolder获取 <br/>

```
        RequestAttributes requestAttributes = RequestContextHolder.currentRequestAttributes();
        HttpServletRequest request = ((ServletRequestAttributes) requestAttributes).getRequest();
        HttpServletResponse response = ((ServletRequestAttributes) requestAttributes).getResponse();
```





## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


