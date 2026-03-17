
## 　　前言 <br/>

　　我们在之前的实现了springboot与data-jpa的增、删、改、查简单使用（请戳：[SpringBoot系列——Spring-Data-JPA](https://www.cnblogs.com/huanzi-qch/p/9970545.html)），并实现了升级版（请戳：[SpringBoot系列——Spring-Data-JPA](https://www.cnblogs.com/huanzi-qch/p/9970545.html)（升级版）），在基础版、升级版中，我们实现了单表的基础get、save（插入/更新）、list、page、delete接口，并写了一套通用common代码，每个单表去继承从而实现这套基础接口、同时，我们使用用Vo去接收、传输数据，实体负责与数据库表映射。 <br/>

　　但是，单表增、删、改、查基础功能相似，代码高度相似，我们新增一个单表操作的步骤：复制、粘贴、修改文件夹、文件名、类名、修改传参实体对象...，为了实现快速开发，我们在前面两个版本的基础上，使用代码自动生成一套单表的基础增、删、改、查接口 <br/>



##  　　代码编写 <br/>

　　首先我们先创建一个新的工程项目，实现一套common代码，以便单表直接继承 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117105154731-1858025745.png)  <br/>

　　<span style="color: rgba(255, 0, 0, 1)">  （文末贴出CodeDOM.java完整代码）</span> <br/>

　　首先定义几个属性，构造函数传入表名，基础路径基于表名进行赋值 <br/>

```
    /**
     * 表名
     */
    private String tableName;

    /**
     * 基础路径
     */
    private String basePackage_;
    private String package_;
    private String basePath;
```

　　构造函数 <br/>

```
    /**
     * 构造参数，出入表名
     */
    private CodeDOM(String tableName) {
        this.tableName = tableName;
        basePackage_ = "cn\\huanzi\\springbootjpa\\";
        package_ = basePackage_ + StringUtil.camelCaseName(tableName).toLowerCase() + "\\";
        //System.getProperty("user.dir") 获取的是项目所在路径，如果我们是子项目，则需要添加一层路径
        basePath = System.getProperty("user.dir") + "\\src\\main\\java\\" + package_;
    }
```



### 　　查询表信息 <br/>

　　首先要连接数据库，连接数据使用jdbc进行连接 <br/>

```
    /**
     * 数据连接相关
     */
    private static final String URL = "jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2B8&characterEncoding=utf-8";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "123456";
    private static final String DRIVERCLASSNAME = "com.mysql.jdbc.Driver";
```

```
    /**
     * JDBC连接数据库工具类
     */
    private static class DBConnectionUtil {

        static {
            // 1、加载驱动
            try {
                Class.forName(DRIVERCLASSNAME);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
        }

        /**
         * 返回一个Connection连接
         *
         * @return
         */
        public static Connection getConnection() {
            Connection conn = null;
            // 2、连接数据库
            try {
                conn = DriverManager.getConnection(URL, USERNAME, PASSWORD);
            } catch (SQLException e) {
                e.printStackTrace();
            }
            return conn;
        }

        /**
         * 关闭Connection，Statement连接
         *
         * @param conn
         * @param stmt
         */
        public static void close(Connection conn, Statement stmt) {
            try {
                conn.close();
                stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        /**
         * 关闭Connection，Statement，ResultSet连接
         *
         * @param conn
         * @param stmt
         * @param rs
         */
        public static void close(Connection conn, Statement stmt, ResultSet rs) {
            try {
                close(conn, stmt);
                rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

    }
```

　　获取数据表的表机构信息（本系列用的是MySQL数据库），通过查询 information_schema 表，SQL： <br/>

```
select column_name,data_type,column_comment,column_key,extra from information_schema.columns where table_schema = (select database()) and table_name=?
```



　　创建一个表结构对象，然后封装一下方法： <br/>

```
    /**
     * 表结构行信息实体类
     */
    private class TableInfo {
        private String columnName;
        private String dataType;
        private String columnComment;
        private String columnKey;
        private String extra;

        TableInfo() {
        }

        String getColumnName() {
            return columnName;
        }

        void setColumnName(String columnName) {
            this.columnName = columnName;
        }

        String getDataType() {
            return dataType;
        }

        void setDataType(String dataType) {
            this.dataType = dataType;
        }

        String getColumnComment() {
            return columnComment;
        }

        void setColumnComment(String columnComment) {
            this.columnComment = columnComment;
        }

        String getColumnKey() {
            return columnKey;
        }

        void setColumnKey(String columnKey) {
            this.columnKey = columnKey;
        }

        String getExtra() {
            return extra;
        }

        void setExtra(String extra) {
            this.extra = extra;
        }
    }
```

```
    /**
     * 获取表结构信息
     *
     * @return list
     */
    private List<TableInfo> getTableInfo() {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        ArrayList<TableInfo> list = new ArrayList<>();
        try {
            conn = DBConnectionUtil.getConnection();
            String sql = "select column_name,data_type,column_comment,column_key,extra from information_schema.columns where table_schema = (select database()) and table_name=?";
            ps = conn.prepareStatement(sql);
            ps.setString(1, tableName);
            rs = ps.executeQuery();
            while (rs.next()) {
                TableInfo tableInfo = new TableInfo();
                //列名，全部转为小写
                tableInfo.setColumnName(rs.getString("column_name").toLowerCase());
                //列类型
                tableInfo.setDataType(rs.getString("data_type"));
                //列注释
                tableInfo.setColumnComment(rs.getString("column_comment"));
                //主键
                tableInfo.setColumnKey(rs.getString("column_key"));
                //主键类型
                tableInfo.setExtra(rs.getString("extra"));
                list.add(tableInfo);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            assert rs != null;
            DBConnectionUtil.close(conn, ps, rs);
        }
        return list;
    }
```

　　<span style="color: rgba(255, 0, 0, 1)">  　2020-11-25更新</span> <br/>

　　bug修复：修复代码生成工具类，不同库有相同表时，生成的实体类有重复字段的bug；查询表结构信息时，条件限定当前连接库即可：table_schema = (select database()) <br/>





　　那么oracle应该怎么查呢？ <br/>

```
--表结构信息
select * from user_tab_columns where table_name='TB_USER'
--表字段注释
select * from user_col_comments  where table_name='TB_USER'
--表注释
select * from user_tab_comments  where table_name='TB_USER'
```

　　我们看一下系统都提供有哪些表，这...太多了 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117112541385-1415474894.png)  <br/>



### 　　数据处理 <br/>

　　数据处理，比如数据字段类型转成java类型、字段的下划线转驼峰等，我们封装一下工具类： <br/>

```
    /**
     * 字符串处理工具类
     */
    private static class StringUtil {
        /**
         * 数据库类型->JAVA类型
         *
         * @param dbType 数据库类型
         * @return JAVA类型
         */
        private static String typeMapping(String dbType) {
            String javaType = "";
            if ("int|integer".contains(dbType)) {
                javaType = "Integer";
            } else if ("float|double|decimal|real".contains(dbType)) {
                javaType = "Double";
            } else if ("date|time|datetime|timestamp".contains(dbType)) {
                javaType = "Date";
            } else {
                javaType = "String";
            }
            return javaType;
        }

        /**
         * 驼峰转换为下划线
         */
        public static String underscoreName(String camelCaseName) {
            StringBuilder result = new StringBuilder();
            if (camelCaseName != null && camelCaseName.length() > 0) {
                result.append(camelCaseName.substring(0, 1).toLowerCase());
                for (int i = 1; i < camelCaseName.length(); i++) {
                    char ch = camelCaseName.charAt(i);
                    if (Character.isUpperCase(ch)) {
                        result.append("_");
                        result.append(Character.toLowerCase(ch));
                    } else {
                        result.append(ch);
                    }
                }
            }
            return result.toString();
        }

        /**
         * 首字母大写
         */
        public static String captureName(String name) {
            char[] cs = name.toCharArray();
            cs[0] -= 32;
            return String.valueOf(cs);

        }

        /**
         * 下划线转换为驼峰
         */
        public static String camelCaseName(String underscoreName) {
            StringBuilder result = new StringBuilder();
            if (underscoreName != null && underscoreName.length() > 0) {
                boolean flag = false;
                for (int i = 0; i < underscoreName.length(); i++) {
                    char ch = underscoreName.charAt(i);
                    if ("_".charAt(0) == ch) {
                        flag = true;
                    } else {
                        if (flag) {
                            result.append(Character.toUpperCase(ch));
                            flag = false;
                        } else {
                            result.append(ch);
                        }
                    }
                }
            }
            return result.toString();
        }
    }
```



### 　　文件处理 <br/>

　　文件处理比如创建文件夹、文件，将字符写入文件等，我们先获取一下基础路径，并封装一下文件工具类： <br/>

```
    /**
     * file工具类
     */
    private static class FileUtil {
        /**
         * 创建文件
         *
         * @param pathNameAndFileName 路径跟文件名
         * @return File对象
         */
        private static File createFile(String pathNameAndFileName) {
            File file = new File(pathNameAndFileName);
            try {
                //获取父目录
                File fileParent = file.getParentFile();
                if (!fileParent.exists()) {
                    fileParent.mkdirs();
                }
                //创建文件
                if (!file.exists()) {
                    file.createNewFile();
                }
            } catch (Exception e) {
                file = null;
                System.err.println("新建文件操作出错");
                e.printStackTrace();
            }
            return file;
        }

        /**
         * 字符流写入文件
         *
         * @param file         file对象
         * @param stringBuffer 要写入的数据
         */
        private static void fileWriter(File file, StringBuffer stringBuffer) {
            //字符流
            try {
                FileWriter resultFile = new FileWriter(file, true);//true,则追加写入 false,则覆盖写入
                PrintWriter myFile = new PrintWriter(resultFile);
                //写入
                myFile.println(stringBuffer.toString());

                myFile.close();
                resultFile.close();
            } catch (Exception e) {
                System.err.println("写入操作出错");
                e.printStackTrace();
            }
        }
    }
```





### 　　创建代码 <br/>

　　根据我们项目的路径规范，代码编写规范，我们定义好文件的模板，并封装成对应的方法 <br/>

```
    /**
     * 创建pojo实体类
     */
    private void createPojo(List<TableInfo> tableInfos) {
        File file = FileUtil.createFile(basePath + "pojo\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ".java");
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append(
                "package " + package_.replaceAll("\\\\", ".") + "pojo;\n" +
                        "\n" +
                        "import lombok.Data;\n" +
                        "import javax.persistence.*;\n" +
                        "import java.io.Serializable;\n" +
                        "import java.util.Date;\n" +
                        "\n" +
                        "@Entity\n" +
                        "@Table(name = \"" + tableName + "\")\n" +
                        "@Data\n" +
                        "public class " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + " implements Serializable {\n"
        );
        //遍历设置属性
        for (TableInfo tableInfo : tableInfos) {
            //主键
            if ("PRI".equals(tableInfo.getColumnKey())) {
                stringBuffer.append("    @Id\n");
            }
            //自增
            if ("auto_increment".equals(tableInfo.getExtra())) {
                stringBuffer.append("    @GeneratedValue(strategy= GenerationType.IDENTITY)\n");
            }
            stringBuffer.append("    private " + StringUtil.typeMapping(tableInfo.getDataType()) + " " + StringUtil.camelCaseName(tableInfo.getColumnName()) + ";//" + tableInfo.getColumnComment() + "\n\n");
        }
        stringBuffer.append("}");
        FileUtil.fileWriter(file, stringBuffer);
    }
```

```
    /**
     * 创建vo类
     */
    private void createVo(List<TableInfo> tableInfos) {
        File file = FileUtil.createFile(basePath + "vo\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo.java");
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append(
                "package " + package_.replaceAll("\\\\", ".") + "vo;\n" +
                        "\n" +                        "import "+ basePackage_.replaceAll("\\\\", ".") +" common.pojo.PageCondition;"+
                        "import lombok.Data;\n" +
                        "import java.io.Serializable;\n" +
                        "import java.util.Date;\n" +
                        "\n" +
                        "@Data\n" +
                        "public class " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo extends PageCondition implements Serializable {\n"
        );
        //遍历设置属性
        for (TableInfo tableInfo : tableInfos) {
            stringBuffer.append("    private " + StringUtil.typeMapping(tableInfo.getDataType()) + " " + StringUtil.camelCaseName(tableInfo.getColumnName()) + ";//" + tableInfo.getColumnComment() + "\n\n");
        }
        stringBuffer.append("}");
        FileUtil.fileWriter(file, stringBuffer);
    }
```

```
    /**
     * 创建repository类
     */
    private void createRepository(List<TableInfo> tableInfos) {
        File file = FileUtil.createFile(basePath + "repository\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Repository.java");
        StringBuffer stringBuffer = new StringBuffer();
        String t = "String";
        //遍历属性
        for (TableInfo tableInfo : tableInfos) {
            //主键
            if ("PRI".equals(tableInfo.getColumnKey())) {
                t = StringUtil.typeMapping(tableInfo.getDataType());
            }
        }
        stringBuffer.append(
                "package " + package_.replaceAll("\\\\", ".") + "repository;\n" +
                        "\n" +
                        "import " + basePackage_.replaceAll("\\\\", ".") + "common.repository.*;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "pojo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ";\n" +
                        "import org.springframework.stereotype.Repository;\n" +
                        "\n" +
                        "@Repository\n" +
                        "public interface " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Repository extends CommonRepository<" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ", " + t + "> {"
        );
        stringBuffer.append("\n");
        stringBuffer.append("}");
        FileUtil.fileWriter(file, stringBuffer);
    }
```

```
    /**
     * 创建service类
     */
    private void createService(List<TableInfo> tableInfos) {
        File file = FileUtil.createFile(basePath + "service\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Service.java");
        StringBuffer stringBuffer = new StringBuffer();
        String t = "String";
        //遍历属性
        for (TableInfo tableInfo : tableInfos) {
            //主键
            if ("PRI".equals(tableInfo.getColumnKey())) {
                t = StringUtil.typeMapping(tableInfo.getDataType());
            }
        }
        stringBuffer.append(
                "package " + package_.replaceAll("\\\\", ".") + "service;\n" +
                        "\n" +
                        "import " + basePackage_.replaceAll("\\\\", ".") + "common.service.*;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "pojo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ";\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "vo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo;\n" +
                        "\n" +
                        "public interface " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Service extends CommonService<" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo, " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ", " + t + "> {"
        );
        stringBuffer.append("\n");
        stringBuffer.append("}");
        FileUtil.fileWriter(file, stringBuffer);

        //Impl
        File file1 = FileUtil.createFile(basePath + "service\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "ServiceImpl.java");
        StringBuffer stringBuffer1 = new StringBuffer();
        stringBuffer1.append(
                "package " + package_.replaceAll("\\\\", ".") + "service;\n" +
                        "\n" +
                        "import " + basePackage_.replaceAll("\\\\", ".") + "common.service.*;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "pojo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ";\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "vo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "repository." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Repository;\n" +
                        "import org.springframework.beans.factory.annotation.Autowired;\n" +
                        "import org.springframework.stereotype.Service;\n" +
                        "import org.springframework.transaction.annotation.Transactional;\n" +
                        "import javax.persistence.EntityManager;\n" +
                        "import javax.persistence.PersistenceContext;\n" +
                        "\n" +
                        "@Service\n" +
                        "@Transactional\n" +
                        "public class " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "ServiceImpl extends CommonServiceImpl<" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo, " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ", " + t + "> implements " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Service{"
        );
        stringBuffer1.append("\n\n");
        stringBuffer1.append(
                "    @PersistenceContext\n" +
                        "    private EntityManager em;\n");

        stringBuffer1.append("" +
                "    @Autowired\n" +
                "    private " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Repository " + StringUtil.camelCaseName(tableName) + "Repository;\n");
        stringBuffer1.append("}");
        FileUtil.fileWriter(file1, stringBuffer1);
    }
```

```
    /**
     * 创建controller类
     */
    private void createController(List<TableInfo> tableInfos) {
        File file = FileUtil.createFile(basePath + "controller\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Controller.java");
        StringBuffer stringBuffer = new StringBuffer();
        String t = "String";
        //遍历属性
        for (TableInfo tableInfo : tableInfos) {
            //主键
            if ("PRI".equals(tableInfo.getColumnKey())) {
                t = StringUtil.typeMapping(tableInfo.getDataType());
            }
        }
        stringBuffer.append(
                "package " + package_.replaceAll("\\\\", ".") + "controller;\n" +
                        "\n" +
                        "import " + basePackage_.replaceAll("\\\\", ".") + "common.controller.*;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "pojo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ";\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "vo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "service." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Service;\n" +
                        "import org.springframework.beans.factory.annotation.Autowired;\n" +
                        "import org.springframework.web.bind.annotation.*;\n" +
                        "\n" +
                        "@RestController\n" +
                        "@RequestMapping(\"/" + StringUtil.camelCaseName(tableName) + "/\")\n" +
                        "public class " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Controller extends CommonController<" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo, " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ", " + t + "> {"
        );
        stringBuffer.append("\n");
        stringBuffer.append("" +
                "    @Autowired\n" +
                "    private " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Service " + StringUtil.camelCaseName(tableName) + "Service;\n");
        stringBuffer.append("}");
        FileUtil.fileWriter(file, stringBuffer);
    }
```

 　　需要注意的是：目前生成的pojo的主键，只用了@Id声明该属性为表主键，尚缺一个主键生成策略，这个需要根据自己的情况来选择主键生成策略 <br/>

　　PS：缺少主键生成策略或者设置错误将会出现以下问题： <br/>

　　程序不报错，JPA查询出来的数据长度正常，内容都是重复的，但mysql数据库运行查询语句结果正常 <br/>

```
    /*
        JPA提供的四种主键生成策略
        GenerationType.TABLE：使用一个特定的数据库表格来保存主键。 
        GenerationType.SEQUENCE：根据底层数据库的序列来生成主键，条件是数据库支持序列。 
        GenerationType.IDENTITY：主键由数据库自动生成（主要是自动增长型） 
        GenerationType.AUTO：主键由程序控制。
     */
    @GeneratedValue(strategy = GenerationType.IDENTITY)
```



　　提供一个方法让外部直接调用 <br/>

```
    /**
     * 快速创建，供外部调用，调用之前先设置一下项目的基础路径
     */
    private String create() {
        List<TableInfo> tableInfo = getTableInfo();
        createPojo(tableInfo);
        createVo(tableInfo);
        createRepository(tableInfo);
        createService(tableInfo);
        createController(tableInfo);
        return tableName + " 后台代码生成完毕！";
    }
```



## 　　效果演示 <br/>

　　main方法运行 <br/>

```
    public static void main(String[] args) {
        String[] tables = {"tb_user"};
        for (int i = 0; i < tables.length; i++) {
            String msg = new CodeDOM(tables[i]).create();
            System.out.println(msg);
        }
    }
```

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117122600517-127136101.png)  <br/>



![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117122431097-1661939436.png)  <br/>

###  　　生成代码 <br/>

　　我们查看一下生成的代码 <br/>

```
package cn.huanzi.springbootjpa.tbuser.pojo;

import lombok.Data;
import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "tb_user")
@Data
public class TbUser implements Serializable {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;//表id

    private String username;//用户名

    private String password;//密码

    private Date created;//创建时间

    private Integer descriptionId;//关联详情id

}
```

```
package cn.huanzi.springbootjpa.tbuser.vo;

import lombok.Data;
import java.io.Serializable;
import java.util.Date;

@Data
public class TbUserVo extends PageCondition implements Serializable {
    private Integer id;//表id

    private String username;//用户名

    private String password;//密码

    private Date created;//创建时间

    private Integer descriptionId;//关联详情id

}
```

```
package cn.huanzi.springbootjpa.tbuser.repository;

import cn.huanzi.springbootjpa.common.repository.*;
import cn.huanzi.springbootjpa.tbuser.pojo.TbUser;
import org.springframework.stereotype.Repository;

@Repository
public interface TbUserRepository extends CommonRepository<TbUser, Integer> {
}
```

```
package cn.huanzi.springbootjpa.tbuser.service;

import cn.huanzi.springbootjpa.common.service.*;
import cn.huanzi.springbootjpa.tbuser.pojo.TbUser;
import cn.huanzi.springbootjpa.tbuser.vo.TbUserVo;

public interface TbUserService extends CommonService<TbUserVo, TbUser, Integer> {
}
```

```
package cn.huanzi.springbootjpa.tbuser.service;

import cn.huanzi.springbootjpa.common.service.*;
import cn.huanzi.springbootjpa.tbuser.pojo.TbUser;
import cn.huanzi.springbootjpa.tbuser.vo.TbUserVo;
import cn.huanzi.springbootjpa.tbuser.repository.TbUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Service
@Transactional
public class TbUserServiceImpl extends CommonServiceImpl<TbUserVo, TbUser, Integer> implements TbUserService{

    @PersistenceContext
    private EntityManager em;
    @Autowired
    private TbUserRepository tbUserRepository;
}
```

```
package cn.huanzi.springbootjpa.tbuser.controller;

import cn.huanzi.springbootjpa.common.controller.*;
import cn.huanzi.springbootjpa.tbuser.pojo.TbUser;
import cn.huanzi.springbootjpa.tbuser.vo.TbUserVo;
import cn.huanzi.springbootjpa.tbuser.service.TbUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tbUser/")
public class TbUserController extends CommonController<TbUserVo, TbUser, Integer> {
    @Autowired
    private TbUserService tbUserService;
}
```

　　我们启动项目 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117122953765-329979330.png)  <br/>

　　依次访问基础接口： <br/>

### 　　get接口 <br/>

　　http://localhost:10086/tbUser/get/1 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117131852058-1211991096.png)  <br/>

### 　　page接口 <br/>

　　http://localhost:10086/tbUser/page?page=1&rows=10 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117132010288-182929651.png)  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117131830326-1835278690.png)  <br/>

###  　　list接口 <br/>

　　http://localhost:10086/tbUser/list <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117131935603-1140779840.png)  <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117132108366-1226429010.png)  <br/>





### 　　save接口 <br/>

　　（插入跟更新） <br/>

　　没有id或id不存在，为插入，http://localhost:10086/tbUser/save?username=张麻子&password=123 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117132205904-678524783.png)  <br/>

　　id已存在，则为更新，注意：这里的更新是你的字段是什么jpa就帮你存什么，如果想要实现只更新接参对象有值的字段，应该先用id去同步数据，再更新， <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117132418971-249352696.png)  <br/>

### 　　delete接口 <br/>

　　http://localhost:10086/tbUser/delete/15 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117132513586-1532754190.png)  <br/>

## 　　扩展 <br/>

　　1、有一些同学会发现，代码生成后idea并没有帮我们扫描出来，这时候我们可以手动去刷新一下，对着我们的项目右键，然后刷新 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117133058832-167645642.png)  <br/>

　　2、个人觉得代码生成用groovy更加合适，只是我现在对它的语法使用还不熟悉，后面我们可以尝试一下使用groovy来生成代码，在idea里使用groovy生成代码： <br/>

　　groovy文件的位置： <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117133403916-394454028.png)  <br/>

　　使用方法：用idea的datebase连接数据库后，对着表右击 <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201901/1353055-20190117133525134-1958832617.png)  <br/>



## 　　后记 <br/>

　　这套代码的风格是单表继承通用CRUD、分页、排序接口，在启动类的同级目录下面，按一张表一个目录分层级存放文件，技术选型：springboot + thymeleaf + springdata-jpa + mysql，pojo实体对象负责ORM框架与数据库的映射，vo对象负责接参、传参，vo与pojo通过CopyUtil工具类进相互转换 <br/>

　　一人挖井，全村喝水；有了这一套基础代码跟代码自动生成单表基础增、删、改、查接口，我们的开发效率大大提高 <br/>



## 　　完整代码 <br/>

```
package cn.huanzi.qch.springbootjpa.util;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * 自动生成代码
 */
public class CodeDOM {

    /**
     * 构造参数，出入表名
     */
    private CodeDOM(String tableName) {
        this.tableName = tableName;
        basePackage_ = "cn\\huanzi\\qch\\springbootjpa\\";
        package_ = basePackage_ + StringUtil.camelCaseName(tableName).toLowerCase() + "\\";
        //System.getProperty("user.dir") 获取的是项目所在路径，如果我们是子项目，则需要添加一层路径
        basePath = System.getProperty("user.dir") + "\\springboot-jpa\\src\\main\\java\\" + package_;
    }

    /**
     * 数据连接相关
     */
    private static final String URL = "jdbc:mysql://localhost:3306/test?serverTimezone=GMT%2B8&characterEncoding=utf-8";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "123456";
    private static final String DRIVERCLASSNAME = "com.mysql.jdbc.Driver";
    /**
     * 表名
     */
    private String tableName;

    /**
     * 基础路径
     */
    private String basePackage_;
    private String package_;
    private String basePath;

    /**
     * 创建pojo实体类
     */
    private void createPojo(List<TableInfo> tableInfos) {
        File file = FileUtil.createFile(basePath + "pojo\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ".java");
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append(
                "package " + package_.replaceAll("\\\\", ".") + "pojo;\n" +
                        "\n" +
                        "import lombok.Data;\n" +
                        "import javax.persistence.*;\n" +
                        "import java.io.Serializable;\n" +
                        "import java.util.Date;\n" +
                        "\n" +
                        "@Entity\n" +
                        "@Table(name = \"" + tableName + "\")\n" +
                        "@Data\n" +
                        "public class " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + " implements Serializable {\n"
        );
        //遍历设置属性
        for (TableInfo tableInfo : tableInfos) {
            //主键
            if ("PRI".equals(tableInfo.getColumnKey())) {
                stringBuffer.append("    @Id\n");
            }
            //自增
            if ("auto_increment".equals(tableInfo.getExtra())) {
                stringBuffer.append("    @GeneratedValue(strategy= GenerationType.IDENTITY)\n");
            }
            stringBuffer.append("    private " + StringUtil.typeMapping(tableInfo.getDataType()) + " " + StringUtil.camelCaseName(tableInfo.getColumnName()) + ";//" + tableInfo.getColumnComment() + "\n\n");
        }
        stringBuffer.append("}");
        FileUtil.fileWriter(file, stringBuffer);
    }

    /**
     * 创建vo类
     */
    private void createVo(List<TableInfo> tableInfos) {
        File file = FileUtil.createFile(basePath + "vo\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo.java");
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append(
                "package " + package_.replaceAll("\\\\", ".") + "vo;\n" +
                        "\n" +
                        "import "+ basePackage_.replaceAll("\\\\", ".") +" common.pojo.PageCondition;"+
                        "import lombok.Data;\n" +
                        "import java.io.Serializable;\n" +
                        "import java.util.Date;\n" +
                        "\n" +
                        "@Data\n" +
                        "public class " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo extends PageCondition implements Serializable {\n"
        );
        //遍历设置属性
        for (TableInfo tableInfo : tableInfos) {
            stringBuffer.append("    private " + StringUtil.typeMapping(tableInfo.getDataType()) + " " + StringUtil.camelCaseName(tableInfo.getColumnName()) + ";//" + tableInfo.getColumnComment() + "\n\n");
        }
        stringBuffer.append("}");
        FileUtil.fileWriter(file, stringBuffer);
    }

    /**
     * 创建repository类
     */
    private void createRepository(List<TableInfo> tableInfos) {
        File file = FileUtil.createFile(basePath + "repository\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Repository.java");
        StringBuffer stringBuffer = new StringBuffer();
        String t = "String";
        //遍历属性
        for (TableInfo tableInfo : tableInfos) {
            //主键
            if ("PRI".equals(tableInfo.getColumnKey())) {
                t = StringUtil.typeMapping(tableInfo.getDataType());
            }
        }
        stringBuffer.append(
                "package " + package_.replaceAll("\\\\", ".") + "repository;\n" +
                        "\n" +
                        "import " + basePackage_.replaceAll("\\\\", ".") + "common.repository.*;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "pojo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ";\n" +
                        "import org.springframework.stereotype.Repository;\n" +
                        "\n" +
                        "@Repository\n" +
                        "public interface " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Repository extends CommonRepository<" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ", " + t + "> {"
        );
        stringBuffer.append("\n");
        stringBuffer.append("}");
        FileUtil.fileWriter(file, stringBuffer);
    }

    /**
     * 创建service类
     */
    private void createService(List<TableInfo> tableInfos) {
        File file = FileUtil.createFile(basePath + "service\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Service.java");
        StringBuffer stringBuffer = new StringBuffer();
        String t = "String";
        //遍历属性
        for (TableInfo tableInfo : tableInfos) {
            //主键
            if ("PRI".equals(tableInfo.getColumnKey())) {
                t = StringUtil.typeMapping(tableInfo.getDataType());
            }
        }
        stringBuffer.append(
                "package " + package_.replaceAll("\\\\", ".") + "service;\n" +
                        "\n" +
                        "import " + basePackage_.replaceAll("\\\\", ".") + "common.service.*;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "pojo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ";\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "vo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo;\n" +
                        "\n" +
                        "public interface " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Service extends CommonService<" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo, " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ", " + t + "> {"
        );
        stringBuffer.append("\n");
        stringBuffer.append("}");
        FileUtil.fileWriter(file, stringBuffer);

        //Impl
        File file1 = FileUtil.createFile(basePath + "service\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "ServiceImpl.java");
        StringBuffer stringBuffer1 = new StringBuffer();
        stringBuffer1.append(
                "package " + package_.replaceAll("\\\\", ".") + "service;\n" +
                        "\n" +
                        "import " + basePackage_.replaceAll("\\\\", ".") + "common.service.*;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "pojo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ";\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "vo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "repository." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Repository;\n" +
                        "import org.springframework.beans.factory.annotation.Autowired;\n" +
                        "import org.springframework.stereotype.Service;\n" +
                        "import org.springframework.transaction.annotation.Transactional;\n" +
                        "import javax.persistence.EntityManager;\n" +
                        "import javax.persistence.PersistenceContext;\n" +
                        "\n" +
                        "@Service\n" +
                        "@Transactional\n" +
                        "public class " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "ServiceImpl extends CommonServiceImpl<" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo, " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ", " + t + "> implements " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Service{"
        );
        stringBuffer1.append("\n\n");
        stringBuffer1.append(
                "    @PersistenceContext\n" +
                        "    private EntityManager em;\n");

        stringBuffer1.append("" +
                "    @Autowired\n" +
                "    private " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Repository " + StringUtil.camelCaseName(tableName) + "Repository;\n");
        stringBuffer1.append("}");
        FileUtil.fileWriter(file1, stringBuffer1);
    }

    /**
     * 创建controller类
     */
    private void createController(List<TableInfo> tableInfos) {
        File file = FileUtil.createFile(basePath + "controller\\" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Controller.java");
        StringBuffer stringBuffer = new StringBuffer();
        String t = "String";
        //遍历属性
        for (TableInfo tableInfo : tableInfos) {
            //主键
            if ("PRI".equals(tableInfo.getColumnKey())) {
                t = StringUtil.typeMapping(tableInfo.getDataType());
            }
        }
        stringBuffer.append(
                "package " + package_.replaceAll("\\\\", ".") + "controller;\n" +
                        "\n" +
                        "import " + basePackage_.replaceAll("\\\\", ".") + "common.controller.*;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "pojo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ";\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "vo." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo;\n" +
                        "import " + package_.replaceAll("\\\\", ".") + "service." + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Service;\n" +
                        "import org.springframework.beans.factory.annotation.Autowired;\n" +
                        "import org.springframework.web.bind.annotation.*;\n" +
                        "\n" +
                        "@RestController\n" +
                        "@RequestMapping(\"/" + StringUtil.camelCaseName(tableName) + "/\")\n" +
                        "public class " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Controller extends CommonController<" + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Vo, " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + ", " + t + "> {"
        );
        stringBuffer.append("\n");
        stringBuffer.append("" +
                "    @Autowired\n" +
                "    private " + StringUtil.captureName(StringUtil.camelCaseName(tableName)) + "Service " + StringUtil.camelCaseName(tableName) + "Service;\n");
        stringBuffer.append("}");
        FileUtil.fileWriter(file, stringBuffer);
    }

    /**
     * 获取表结构信息
     *
     * @return list
     */
    private List<TableInfo> getTableInfo() {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;
        ArrayList<TableInfo> list = new ArrayList<>();
        try {
            conn = DBConnectionUtil.getConnection();
            String sql = "select column_name,data_type,column_comment,column_key,extra from information_schema.columns where table_name=?";
            ps = conn.prepareStatement(sql);
            ps.setString(1, tableName);
            rs = ps.executeQuery();
            while (rs.next()) {
                TableInfo tableInfo = new TableInfo();
                //列名，全部转为小写
                tableInfo.setColumnName(rs.getString("column_name").toLowerCase());
                //列类型
                tableInfo.setDataType(rs.getString("data_type"));
                //列注释
                tableInfo.setColumnComment(rs.getString("column_comment"));
                //主键
                tableInfo.setColumnKey(rs.getString("column_key"));
                //主键类型
                tableInfo.setExtra(rs.getString("extra"));
                list.add(tableInfo);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            assert rs != null;
            DBConnectionUtil.close(conn, ps, rs);
        }
        return list;
    }

    /**
     * file工具类
     */
    private static class FileUtil {
        /**
         * 创建文件
         *
         * @param pathNameAndFileName 路径跟文件名
         * @return File对象
         */
        private static File createFile(String pathNameAndFileName) {
            File file = new File(pathNameAndFileName);
            try {
                //获取父目录
                File fileParent = file.getParentFile();
                if (!fileParent.exists()) {
                    fileParent.mkdirs();
                }
                //创建文件
                if (!file.exists()) {
                    file.createNewFile();
                }
            } catch (Exception e) {
                file = null;
                System.err.println("新建文件操作出错");
                e.printStackTrace();
            }
            return file;
        }

        /**
         * 字符流写入文件
         *
         * @param file         file对象
         * @param stringBuffer 要写入的数据
         */
        private static void fileWriter(File file, StringBuffer stringBuffer) {
            //字符流
            try {
                FileWriter resultFile = new FileWriter(file, false);//true,则追加写入 false,则覆盖写入
                PrintWriter myFile = new PrintWriter(resultFile);
                //写入
                myFile.println(stringBuffer.toString());

                myFile.close();
                resultFile.close();
            } catch (Exception e) {
                System.err.println("写入操作出错");
                e.printStackTrace();
            }
        }
    }

    /**
     * 字符串处理工具类
     */
    private static class StringUtil {
        /**
         * 数据库类型->JAVA类型
         *
         * @param dbType 数据库类型
         * @return JAVA类型
         */
        private static String typeMapping(String dbType) {
            String javaType = "";
            if ("int|integer".contains(dbType)) {
                javaType = "Integer";
            } else if ("float|double|decimal|real".contains(dbType)) {
                javaType = "Double";
            } else if ("date|time|datetime|timestamp".contains(dbType)) {
                javaType = "Date";
            } else {
                javaType = "String";
            }
            return javaType;
        }

        /**
         * 驼峰转换为下划线
         */
        public static String underscoreName(String camelCaseName) {
            StringBuilder result = new StringBuilder();
            if (camelCaseName != null && camelCaseName.length() > 0) {
                result.append(camelCaseName.substring(0, 1).toLowerCase());
                for (int i = 1; i < camelCaseName.length(); i++) {
                    char ch = camelCaseName.charAt(i);
                    if (Character.isUpperCase(ch)) {
                        result.append("_");
                        result.append(Character.toLowerCase(ch));
                    } else {
                        result.append(ch);
                    }
                }
            }
            return result.toString();
        }

        /**
         * 首字母大写
         */
        public static String captureName(String name) {
            char[] cs = name.toCharArray();
            cs[0] -= 32;
            return String.valueOf(cs);

        }

        /**
         * 下划线转换为驼峰
         */
        public static String camelCaseName(String underscoreName) {
            StringBuilder result = new StringBuilder();
            if (underscoreName != null && underscoreName.length() > 0) {
                boolean flag = false;
                for (int i = 0; i < underscoreName.length(); i++) {
                    char ch = underscoreName.charAt(i);
                    if ("_".charAt(0) == ch) {
                        flag = true;
                    } else {
                        if (flag) {
                            result.append(Character.toUpperCase(ch));
                            flag = false;
                        } else {
                            result.append(ch);
                        }
                    }
                }
            }
            return result.toString();
        }
    }

    /**
     * JDBC连接数据库工具类
     */
    private static class DBConnectionUtil {

        {
            // 1、加载驱动
            try {
                Class.forName(DRIVERCLASSNAME);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
        }

        /**
         * 返回一个Connection连接
         *
         * @return
         */
        public static Connection getConnection() {
            Connection conn = null;
            // 2、连接数据库
            try {
                conn = DriverManager.getConnection(URL, USERNAME, PASSWORD);
            } catch (SQLException e) {
                e.printStackTrace();
            }
            return conn;
        }

        /**
         * 关闭Connection，Statement连接
         *
         * @param conn
         * @param stmt
         */
        public static void close(Connection conn, Statement stmt) {
            try {
                conn.close();
                stmt.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        /**
         * 关闭Connection，Statement，ResultSet连接
         *
         * @param conn
         * @param stmt
         * @param rs
         */
        public static void close(Connection conn, Statement stmt, ResultSet rs) {
            try {
                close(conn, stmt);
                rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

    }

    /**
     * 表结构行信息实体类
     */
    private class TableInfo {
        private String columnName;
        private String dataType;
        private String columnComment;
        private String columnKey;
        private String extra;

        TableInfo() {
        }

        String getColumnName() {
            return columnName;
        }

        void setColumnName(String columnName) {
            this.columnName = columnName;
        }

        String getDataType() {
            return dataType;
        }

        void setDataType(String dataType) {
            this.dataType = dataType;
        }

        String getColumnComment() {
            return columnComment;
        }

        void setColumnComment(String columnComment) {
            this.columnComment = columnComment;
        }

        String getColumnKey() {
            return columnKey;
        }

        void setColumnKey(String columnKey) {
            this.columnKey = columnKey;
        }

        String getExtra() {
            return extra;
        }

        void setExtra(String extra) {
            this.extra = extra;
        }
    }

    /**
     * 快速创建，供外部调用，调用之前先设置一下项目的基础路径
     */
    private String create() {
        List<TableInfo> tableInfo = getTableInfo();
        createPojo(tableInfo);
        createVo(tableInfo);
        createRepository(tableInfo);
        createService(tableInfo);
        createController(tableInfo);
        System.out.println("生成路径位置：" + basePath);
        return tableName + " 后台代码生成完毕！";
    }

    public static void main(String[] args) {
        String[] tables = {"tb_description"};
        for (String table : tables) {
            String msg = new CodeDOM(table).create();
            System.out.println(msg);
        }
    }
}
CodeDOM
```



## 　　补充 <br/>

　　1、发现了一个问题，我们在自动生成controller里有个地方是写死的... <br/>

![](http://huanzi.qzz.io/file-server/blog-image/201904/1353055-20190410171233998-2104577982.png)  <br/>

　　改一下，顺便升级一下CodeDOM类，我已经更新了博客文章，现在你看的文章已经是正确的，且是升级后的版本。  <br/>



　　2、有细心园友发现我们漏贴了CommonController的代码，我们在这里补贴一下，另外说一下，其他的common代码在jpa升级版中 [SpringBoot系列——Spring-Data-JPA（升级版）](https://www.cnblogs.com/huanzi-qch/p/9984261.html)，但里面当时我们只写了service层、repository层的通用代码，以及通讯对象和实体与Vo转换工具等其他公用代码，controller是在本文才加上去的。 <br/>

```
/**
 * 通用Controller
 *
 * @param <V> 实体类Vo
 * @param <E> 实体类
 * @param <T> id主键类型
 */
public class CommonController<V, E,T> {

    @Autowired
    private CommonService<V, E,T> commonService;
    
    /*
        CRUD、分页、排序测试
     */
    //    @PostMapping("page")
    @RequestMapping("page")
    public Result<PageInfo<V>> page(V entityVo) {
        return commonService.page(entityVo);
    }

    //    @PostMapping("list")
    @RequestMapping("list")
    public Result<List<V>> list(V entityVo) {
        return commonService.list(entityVo);
    }

    //    @GetMapping("get/{id}")
    @RequestMapping("get/{id}")
    public Result<V> get( @PathVariable("id") T id) {
        return commonService.get(id);
    }

    //    @PostMapping("save")
    @RequestMapping("save")
    public Result<V> save( V entityVo) {
        return commonService.save(entityVo);
    }

    //    @GetMapping("delete/{id}")
    @RequestMapping("delete/{id}")
    public Result<T> delete( @PathVariable("id") T id) {
        /*
        批量删除
        @DeleteMapping("deleteBatch")
        public Result<T> deleteBatch(@RequestBody List<String> ids){}
        前端调用：
        $.ajax({
            url: ctx + "deleteBatch",
            type: "DELETE",
            data: JSON.stringify([id1,id2]),
            dataType: "JSON",
            contentType: 'application/json',
            success: function (data) { 

            }
        });
         */
        return commonService.delete(id);
    }
}
CommonController
```



## 　　代码开源 <br/>

　　代码已经开源、托管到我的GitHub、码云： <br/>

　　GitHub：[https://github.com/huanzi-qch/springBoot](https://github.com/huanzi-qch/springBoot) <br/>

　　码云：[https://gitee.com/huanzi-qch/springBoot](https://gitee.com/huanzi-qch/springBoot) <br/>


