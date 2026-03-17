
## 　　前言 <br/>

　　日常开发中，我们都习惯了使用ORM框架来帮我们操作数据库，本文复习、记录Java如何使用原生JDBC操作数据库 <br/>



## 　　完整代码 <br/>

　　特点： <br/>

　　使用了连接池的概念； <br/>

　　支持打印执行的最终SQL语句； <br/>

　　并封装几个简单方法：page分页查询、find查询所有、findOne查询单个、execute执行方法； <br/>

```
package cn.huanzi.qch.util;

import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 原生jdbc操作数据库工具类
 * https://www.cnblogs.com/huanzi-qch/p/15474928.html
 */
public class DbUtil {

    //驱动类型
    private static String driver = "";

    //连接池数
    private static final int poolCount = 1;
    //空闲连接实例
    private static final ArrayList<Connection> freePools = new ArrayList<>(poolCount);
    //正在使用连接实例
    private static final ArrayList<Connection> usePools = new ArrayList<>(poolCount);

    //数据库连接：地址、用户名、密码
    public DbUtil(String url, String username, String password){
        //初始化连接池
        if(freePools.size() + usePools.size() <= 0){
            try {
                for (int i = 0; i < poolCount; i++) {
                    //数据库连接：地址、用户名、密码
                    Connection connection = DriverManager.getConnection(url, username, password);
                    connection.setAutoCommit(true);//自动提交事务

                    freePools.add(connection);
                }

                System.out.println("初始化连接池成功！连接数：" + (freePools.size() + usePools.size()));
            } catch (SQLException e) {
                System.err.println("初始化连接池异常...");
                e.printStackTrace();
            }
        }
    }
    public DbUtil(String url, String username, String password, String driver){
        this(url,username,password);

        //加载驱动
        try {
            /*
                同时需要引入相关驱动依赖

                1、MySQL：
                com.mysql.cj.jdbc.Driver

                2、Oracle：
                oracle.jdbc.driver.OracleDriver

                3、pgsql：
                org.postgresql.Driver

             */
            this.driver = driver;
            Class.forName(driver);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    /**
     * 获取 Connection 连接
     */
    private synchronized Connection getConnection() {
        Connection connection = null;
        if(freePools.size() > 0){
            //从空闲连接池获取，获取后-1
            connection = freePools.get(0);
            freePools.remove(0);

            //正在使用池+1
            usePools.add(connection);

            System.out.println("【连接获取】 空闲数：" + freePools.size() + "，使用数：" + usePools.size());
        }else{
            try {
                System.err.println("暂无空闲连接实例，请等待...");
                wait(500);

                return getConnection();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        return connection;
    }

    /**
     * 设置是否自动提交事务
     * 当需要进行批量带事务的操作时，关闭自动提交手动管理事务，将会大大提高效率！
     */
    public void setAutoCommit(boolean autoCommit){
        try {
            this.getConnection().setAutoCommit(autoCommit);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 关闭自动提交事务时，需要手动管理事务提交、回滚
     */
    public void commit(){
        try {
            this.getConnection().commit();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
    public void rollback(){
        try {
            this.getConnection().rollback();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 释放Connection连接
     */
    private void release(Connection connection){
        //空闲池+1
        freePools.add(connection);

        //使用池-1
        for (int i = 0; i < usePools.size(); i++) {
            if(connection == usePools.get(i)){
                usePools.remove(i);
                break;
            }
        }

        System.out.println("【连接释放】 空闲数：" + freePools.size() + "，使用数：" + usePools.size());

    }

    /**
     * 关闭连接池
     */
    public void close(){
        //空闲池
        try {
            for (Connection connection : freePools) {
                connection.close();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        //使用池
        try {
            for (Connection connection : usePools) {
                connection.close();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        System.out.println("【连接池关闭】");
    }

    /**
     * 查询
     * 查询语句
     */
    public Page<HashMap<String, Object>> page(int pageNumber,int pageSize,String sql, Object... params) {
        ArrayList<HashMap<String, Object>> list = new ArrayList<>();

        //获取连接
        Connection conn = this.getConnection();
        ResultSet rs;

        int totalSize = 0;

        //sql语句拼接上count
        String countSql = "select count(1) from (" + sql + ") as count_table";

        //语法糖
        //关闭PreparedStatement，会连带关闭ResultSet
        try(PreparedStatement ps = conn.prepareStatement(countSql);) {
            //设置SQL、以及参数
            if (params != null) {
                for (int i = 1; i <= params.length; i++) {
                    Object param = params[i-1];
                    if(param instanceof Integer){
                        ps.setInt(i, Integer.parseInt(String.valueOf(param)));
                    }else if(param instanceof String) {
                        ps.setString(i, String.valueOf(param));
                    }else{
                        ps.setObject(i, param);
                    }

                }
            }

            //执行查询
            rs = ps.executeQuery();

            //打印执行的sql
            printSql(countSql,params);

            //获取查询结果
            ResultSetMetaData rm = rs.getMetaData();

            //封装结果集
            while (rs.next()) {
                totalSize = rs.getInt(1);
            }

        } catch (Exception e) {
            System.err.println("执行 page().count 异常...");
            e.printStackTrace();
        }

        int totalPage = (int) Math.ceil((double) totalSize / (double) pageSize);//总页数，向上取整


        //sql语句拼接上分页
        String pageSql;
        if(driver.toLowerCase().contains("mysql")){
            pageSql = sql + " limit ? offset ?";
        }
        else if(driver.toLowerCase().contains("postgresql")){
            pageSql = sql + " limit ? offset ?";
        }
        else if(driver.toLowerCase().contains("oracle")){
            pageSql = sql + " offset ? rows fetch next ? rows only";
        }
        else{
            throw new RuntimeException("暂不支持此类型数据库！");
        }

        //语法糖
        //关闭PreparedStatement，会连带关闭ResultSet
        try(PreparedStatement ps = conn.prepareStatement(pageSql);) {
            int pageIndex = 1;
            //设置SQL、以及参数
            if (params != null) {
                for (int i = 1; i <= params.length; i++) {
                    Object param = params[i-1];
                    if(param instanceof Integer){
                        ps.setInt(i, Integer.parseInt(String.valueOf(param)));
                    }else if(param instanceof String) {
                        ps.setString(i, String.valueOf(param));
                    }else{
                        ps.setObject(i, param);
                    }

                    pageIndex++;
                }
            }

            //设置分页参数
            int pageIndex1;
            int pageIndex2;
            if(driver.toLowerCase().contains("mysql")){
                pageIndex1 = pageSize;
                pageIndex2 = (pageNumber - 1) * pageSize;
            }
            else if(driver.toLowerCase().contains("postgresql")){
                pageIndex1 = pageSize;
                pageIndex2 = (pageNumber - 1) * pageSize;
            }
            else if(driver.toLowerCase().contains("oracle")){
                pageIndex1 = (pageNumber-1) * pageSize;
                pageIndex2 = pageSize;
            }
            else{
                throw new RuntimeException("暂不支持此类型数据库！");
            }

            // 设置limit的值（即每页的记录数）
            ps.setInt(pageIndex, pageIndex1);
            // 设置offset的值（即跳过的记录数）
            ps.setInt(pageIndex+1, pageIndex2);

            //执行查询
            rs = ps.executeQuery();


            //打印执行的sql
            List<Object> paramsList = Arrays.stream(params).collect(Collectors.toList());
            paramsList.add(pageIndex1);
            paramsList.add(pageIndex2);
            printSql(pageSql,paramsList.toArray());

            //获取查询结果
            ResultSetMetaData rm = rs.getMetaData();
            int columnCount = rm.getColumnCount();

            //封装结果集
            while (rs.next()) {
                HashMap<String, Object> map = new HashMap<>(columnCount);
                for (int i = 1; i <= columnCount; i++) {
                    String name = rm.getColumnName(i).toLowerCase();
                    Object value = rs.getObject(i);

                    map.put(name,value);
                }
                list.add(map);
            }

        } catch (Exception e) {
            System.err.println("执行 page() 异常...");
            e.printStackTrace();
        }

        //释放连接实例
        this.release(conn);

        return new Page<>(pageNumber,pageSize,totalSize,totalPage,list);
    }
    public List<HashMap<String,Object>> find(String sql, Object... params) {
        int pageSize = Integer.MAX_VALUE; // 每页显示的记录数
        int pageNumber = 1; // 要获取的页码
        return this.page(pageNumber,pageSize,sql,params).getList();
    }
    public HashMap<String,Object> findOne(String sql, Object... params){
        int pageSize = 1; // 每页显示的记录数
        int pageNumber = 1; // 要获取的页码
        List<HashMap<String, Object>> list = this.page(pageNumber, pageSize, sql, params).getList();
        return list.size() > 0 ? list.get(0) : null;
    }

    /**
     * 执行
     * 新增/删除/更新 等SQL语句
     */
    public int execute(String sql, Object... params){
        int flag = 0;

        //获取连接
        Connection conn = this.getConnection();

        //语法糖
        try(PreparedStatement ps = conn.prepareStatement(sql);) {
            //设置SQL、以及参数
            if (params != null) {
                for (int i = 0; i < params.length; i++) {
                    ps.setObject(i + 1, params[i]);
                }
            }

            //执行
            flag = ps.executeUpdate();

            //打印执行的sql
            printSql(sql,params);
        } catch (SQLException e) {
            //回滚事务
            try {
                conn.rollback();
            } catch (SQLException ex) {
                throw new RuntimeException(ex);
            }
            System.err.println("执行 execute() 异常...");
            e.printStackTrace();
        }

        //释放连接实例
        this.release(conn);

        return flag;
    }

    /**
     * 打印最终执行的sql
     */
    private void printSql(String sql, Object... params) {
        try{
            for (Object param : params) {
                if(param instanceof Integer){
                    sql = sql.replaceFirst("\\?", "%d");
                }else{
                    sql = sql.replaceFirst("\\?", "'%s'");
                }
            }
            System.out.printf((sql) + ";%n",params);
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    //分页对象
    private static class Page<T> {
        private int pageNumber;
        private int pageSize;
        private int totalPage;
        private int totalSize;
        private List<T> list;

        public Page(int pageNumber, int pageSize, int totalPage, int totalSize, List<T> list) {
            this.pageNumber = pageNumber;
            this.pageSize = pageSize;
            this.totalPage = totalPage;
            this.totalSize = totalSize;
            this.list = list;
        }

        public int getPageNumber() {
            return pageNumber;
        }

        public void setPageNumber(int pageNumber) {
            this.pageNumber = pageNumber;
        }

        public int getPageSize() {
            return pageSize;
        }

        public void setPageSize(int pageSize) {
            this.pageSize = pageSize;
        }

        public int getTotalPage() {
            return totalPage;
        }

        public void setTotalPage(int totalPage) {
            this.totalPage = totalPage;
        }

        public int getTotalSize() {
            return totalSize;
        }

        public void setTotalSize(int totalSize) {
            this.totalSize = totalSize;
        }

        public List<T> getList() {
            return list;
        }

        public void setList(List<T> list) {
            this.list = list;
        }

        @Override
        public String toString() {
            return "Page{" +
                    "pageNumber=" + pageNumber +
                    ", pageSize=" + pageSize +
                    ", totalPage=" + totalPage +
                    ", totalSize=" + totalSize +
                    ", list=" + list.toString() +
                    '}';
        }
    }
}
DbUtil
```



## 　　效果 <br/>

　　运行main函数 <br/>

```
public static void main(String[] args) {
        DbUtil dbUtil = new DbUtil("jdbc:mysql://localhost/base_admin","root","123456","com.mysql.cj.jdbc.Driver");

        Page<HashMap<String, Object>> page = dbUtil.page(1, 10, "select id,name,type_id from game where name like ? order by name desc", "%龙%");
        System.out.println(page);

        List<HashMap<String, Object>> list = dbUtil.find("select id,name,type_id from game where name like ? order by name desc", "%龙%");
        System.out.println(list);

        HashMap<String, Object> map = dbUtil.findOne("select id,name,type_id from game where name like ? order by name desc", "%龙%");
        System.out.println(map);

        dbUtil.close();
    }
```

　　控制台打印 <br/>

```
初始化连接池成功！连接数：1
【连接获取】 空闲数：0，使用数：1
select count(1) from (select id,name,type_id from game where name like '%龙%' order by name desc) as count_table;
select id,name,type_id from game where name like '%龙%' order by name desc limit 10 offset 0 ;
【连接释放】 空闲数：1，使用数：0
Page{pageNumber=1, pageSize=10, totalPage=20, totalSize=2, list=[{name=龙腾世纪3：审判, type_id=3, id=6ddd15a43f66451f9c2337a01c1576e7}, {name=龙腾世纪2, type_id=2, id=c658aa4830c0491e8a7cebc7402a3277}, {name=龙珠：超宇宙2, type_id=3, id=66a54bc64dd94106b426e30e50087e4b}, {name=龙珠：超宇宙, type_id=7, id=cc2d7e3ea9a3426c8244ba14cdddbd84}, {name=龙珠斗士Z/龙珠格斗Z/龙珠战士Z, type_id=7, id=d1626b9e7866498f9890abcf2c151473}, {name=龙珠Z：卡卡罗特, type_id=7, id=48fd9ed4045c45caa277ae46b4103bfa}, {name=龙星的瓦尔尼尔, type_id=2, id=38f7e8c45b2e48ecbd56c487a852343f}, {name=龙之信条：黑暗觉醒, type_id=2, id=f9200afa2c8b44aa986bf6748fe12318}, {name=轩辕剑4：黑龙舞兮云飞扬, type_id=2, id=1fafa496053347dfa9c240618f4bcd59}, {name=赵云传：云汉腾龙, type_id=2, id=9964c7f9031b4fa5b662c3a2b1f6fc28}]}
【连接获取】 空闲数：0，使用数：1
select count(1) from (select id,name,type_id from game where name like '%龙%' order by name desc) as count_table;
select id,name,type_id from game where name like '%龙%' order by name desc limit 2147483647 offset 0 ;
【连接释放】 空闲数：1，使用数：0
[{name=龙腾世纪3：审判, type_id=3, id=6ddd15a43f66451f9c2337a01c1576e7}, {name=龙腾世纪2, type_id=2, id=c658aa4830c0491e8a7cebc7402a3277}, {name=龙珠：超宇宙2, type_id=3, id=66a54bc64dd94106b426e30e50087e4b}, {name=龙珠：超宇宙, type_id=7, id=cc2d7e3ea9a3426c8244ba14cdddbd84}, {name=龙珠斗士Z/龙珠格斗Z/龙珠战士Z, type_id=7, id=d1626b9e7866498f9890abcf2c151473}, {name=龙珠Z：卡卡罗特, type_id=7, id=48fd9ed4045c45caa277ae46b4103bfa}, {name=龙星的瓦尔尼尔, type_id=2, id=38f7e8c45b2e48ecbd56c487a852343f}, {name=龙之信条：黑暗觉醒, type_id=2, id=f9200afa2c8b44aa986bf6748fe12318}, {name=轩辕剑4：黑龙舞兮云飞扬, type_id=2, id=1fafa496053347dfa9c240618f4bcd59}, {name=赵云传：云汉腾龙, type_id=2, id=9964c7f9031b4fa5b662c3a2b1f6fc28}, {name=小缇娜强袭龙堡：奇幻之地大冒险, type_id=3, id=2b669d34a46c45ebb879c2ab99c93e07}, {name=如龙：极2/单机.同屏联机, type_id=3, id=1dc965ad698e4e45a19fc5c223dfb4c2}, {name=如龙0, type_id=3, id=cbba795cacc24faa91c3c6f0f4425656}, {name=卧龙：苍天陨落, type_id=2, id=ac7046da74524a80ad3630bb86a0eebb}, {name=勇者斗恶龙：英雄, type_id=2, id=12966e8fea414b36a29b52d4fbfcd03a}, {name=勇者斗恶龙：创世小玩家2, type_id=3, id=88dac2b7297f457aaacb682e71616e99}, {name=勇者斗恶龙X：觉醒的五种族离线版, type_id=2, id=8315e45b25c948daa69432c71ba1b614}, {name=勇者斗恶龙11, type_id=2, id=92909a8c49e14ce1aa3f82532cd8c191}, {name=光明之响：龙奏回音, type_id=3, id=1925343d1ada43caace4b653d7a4f603}, {name=傲世苍龙赵云传, type_id=2, id=1c55d262dc67419e9d08305cacd563cc}]
【连接获取】 空闲数：0，使用数：1
select count(1) from (select id,name,type_id from game where name like '%龙%' order by name desc) as count_table;
select id,name,type_id from game where name like '%龙%' order by name desc limit 1 offset 0 ;
【连接释放】 空闲数：1，使用数：0
{name=龙腾世纪3：审判, type_id=3, id=6ddd15a43f66451f9c2337a01c1576e7}
【连接池关闭】
```



## 　　后记 <br/>

　　原生JDBC操作数据库暂时先记录到这，后续再进行补充 <br/>

　　PS：当需要进行批量带事务的操作时，将自动提交改成false，然后手动管理，将会大大提高效率！ <br/>



## 　　更新 <br/>

　　2024-09-29更新：使用连接池、封装page分页方法、支持打印执行的最终SQL； <br/>




