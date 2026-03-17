
## 　　前言 <br/>

　　日常开发中，Excel的导出、导入可以说是最常见的功能模块之一，一个通用的、健壮的的工具类可以节省大量开发时间，让我们把更多精力放在业务处理上中 <br/>

　　之前我们也写了一个Excel的简单导出，甚至可以不依赖poi，还扩展了纯前端导出Excel！详情请戳：《[POI导出Excel ](https://www.cnblogs.com/huanzi-qch/p/9964231.html)》《[踹掉后端，前端导出Excel](https://www.cnblogs.com/huanzi-qch/p/16149773.html)》，遗憾的是这些导出并不支持复杂表头 <br/>

　　HExcel，一个简单通用的导入导出Excel工具类 <br/>

　　　　1、支持导出复杂表头（支持表头单元格水平合并、垂直合并，支持表头单元格个性化样式）
　　　　2、支持导入读取sheet数据（只需要提供title与key的关系，不需要管列的顺序）
　　　　3、支持合并当前列中相同数据行
　　　　4、数据行单元格支持设置下列选项
 　　　　5、兼容.xls、.xlsx格式，支持.xlsx密码加解密 <br/>

　　代码思路都在代码注释里，感兴趣的自己看注释 <br/>



　　PS：依赖 poi 以及 hutool <br/>

```
<!-- POI -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi</artifactId>
    <version>5.2.3</version>
</dependency>
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.3</version>
</dependency>
<!-- hutool -->
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-all</artifactId>
    <version>5.8.37</version>
</dependency>
```



## 　　先睹为快 <br/>

![](https://img2023.cnblogs.com/blog/1353055/202310/1353055-20231030111512568-367153868.png)  <br/>

![](https://img2024.cnblogs.com/blog/1353055/202409/1353055-20240914103053706-881958173.png)  <br/>



 　　表头目前支持以下属性，可自行扩展： <br/>

```
title  标题
key  key
width  宽度
align 对齐方式
background-color  背景颜色（POI的IndexedColors）
color  字体颜色（POI的IndexedColors）
children  子级表头
hide    是否为隐藏列
merge-data    是否合并当前列相同行
drop-down    单元格下拉框值，数组
```



## 　　完整代码 <br/>

```
import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.date.DatePattern;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.NumberUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import org.apache.poi.hssf.usermodel.*;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackageAccess;
import org.apache.poi.poifs.crypt.Decryptor;
import org.apache.poi.poifs.crypt.EncryptionInfo;
import org.apache.poi.poifs.crypt.EncryptionMode;
import org.apache.poi.poifs.crypt.Encryptor;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.ss.formula.functions.T;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.streaming.SXSSFCell;
import org.apache.poi.xssf.streaming.SXSSFRow;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.util.*;

/**
 * HExcel，一个简单通用的导入导出Excel工具类
 * 1、支持导出复杂表头（支持表头单元格水平合并、垂直合并，支持表头单元格个性化样式）
 * 2、支持导入读取sheet数据（只需要提供title与key的关系，不需要管列的顺序）
 * 3、支持合并当前列中相同数据行
 * 4、数据行单元格支持设置下列选项
 * 5、兼容.xls、.xlsx格式，支持.xlsx密码加解密
 *
 * PS：依赖 poi 以及 hutool
 *
 * 详情请戳：https://www.cnblogs.com/huanzi-qch/p/17797355.html
 */
public class HExcel {
    //HSSFWorkbook格式用来解析Excel2003（xls）的文件
    //XSSFWorkbook格式用来解析Excel2007（xlsx）的文件

    /**
     * 获取一个HExcel实例，并初始化空Workbook对象，默认.xls  PS:文档密码加解密仅支持.xlsx
     */
    public static HExcel newInstance(){
        HExcel hExcelUtil = new HExcel();
        hExcelUtil.workbook = new HSSFWorkbook();
        return hExcelUtil;
    }
    public static HExcel newInstanceXls(){
        return newInstance();
    }
    public static HExcel newInstanceXlsx(){
        HExcel hExcelUtil = new HExcel();
        hExcelUtil.workbook = new XSSFWorkbook();
        return hExcelUtil;
    }

    /**
     * 获取一个HExcel实例，并根据excelFile初始化Workbook对象，根据后缀名自动判断  PS:文档密码加解密仅支持.xlsx
     */
    public static HExcel newInstance(File excelFile){
        return newInstance(excelFile,null);
    }
    public static HExcel newInstance(File excelFile,String pwd){
        HExcel hExcelUtil = new HExcel();
        try(FileInputStream inp = new FileInputStream(excelFile);) {
            if(excelFile.toString().toLowerCase().endsWith(".xlsx")){
                //无密码
                if(StrUtil.isBlank(pwd)){
                    hExcelUtil.workbook = new XSSFWorkbook(inp);
                }
                //解密
                else{
                    POIFSFileSystem pfs = new POIFSFileSystem(inp);
                    EncryptionInfo encInfo = new EncryptionInfo(pfs);
                    Decryptor decryptor = Decryptor.getInstance(encInfo);
                    decryptor.verifyPassword(pwd);

                    hExcelUtil.workbook = new XSSFWorkbook(decryptor.getDataStream(pfs));
                }
            }
            else if(excelFile.toString().toLowerCase().endsWith(".xls")){
                hExcelUtil.workbook = new HSSFWorkbook(inp);
            }
            else{
                throw new RuntimeException("仅支持.xlsx、.xls格式！");
            }
        } catch (Exception e) {
            throw new RuntimeException("【HExcel】 根据excelFile初始化Workbook对象异常",e);
        }
        return hExcelUtil;
    }
    public static HExcel newInstance(InputStream inputStream){
        return newInstance(inputStream,"xls",null);
    }
    public static HExcel newInstance(InputStream inputStream,String fileType,String pwd){
        HExcel hExcelUtil = new HExcel();
        try(FileInputStream inp = (FileInputStream) inputStream;) {
            if("xlsx".equalsIgnoreCase(fileType)){
                //无密码
                if(StrUtil.isBlank(pwd)){
                    hExcelUtil.workbook = new XSSFWorkbook(inp);
                }
                //解密
                else{
                    POIFSFileSystem pfs = new POIFSFileSystem(inp);
                    EncryptionInfo encInfo = new EncryptionInfo(pfs);
                    Decryptor decryptor = Decryptor.getInstance(encInfo);
                    decryptor.verifyPassword(pwd);

                    hExcelUtil.workbook = new XSSFWorkbook(decryptor.getDataStream(pfs));
                }
            }
            else if("xls".equalsIgnoreCase(fileType)){
                hExcelUtil.workbook = new HSSFWorkbook(inp);
            }
            else{
                throw new RuntimeException("仅支持.xlsx、.xls格式！");
            }
        } catch (Exception e) {
            throw new RuntimeException("【HExcel】 根据excelFile初始化Workbook对象异常",e);
        }
        return hExcelUtil;
    }

    /**
     * 导入并读取Excel
     *
     * @param sheetIndex 需要读取的sheet下标，从0开始
     * @param headers 表头
     * @return 返回数据集合
     */
    public <T> ArrayList<T> readSheet(int sheetIndex,JSONArray headers,Class<T> clazz){
        //title与key的关系json对象headers = {JSONArray@2046}  size = 1
        JSONObject headerTitleKey = this.getLastHeader(headers);
        int firstDataRow = headerTitleKey.getInt("header-depth");

        //最终返回的数据集合
        ArrayList<T> list = new ArrayList<>();

        //获取sheet
        Sheet sheet = this.workbook.getSheetAt(sheetIndex);

        //获取title与col的对应关系
        HashMap<Integer, String> headerMap = new HashMap<>();
        int lastCellNum = sheet.getRow(0).getLastCellNum();
        for (int i = 0; i < lastCellNum; i++) {
            for (int j = firstDataRow-1; j >=0 ; j--) {
                Cell cell = sheet.getRow(j).getCell(i);
                if(cell != null && !"".equals(cell.getStringCellValue())){
                    String title = cell.getStringCellValue();
                    headerMap.put(i,title);
                    break;
                }
            }
        }

        //获取数据
        DataFormatter dataFormatter = new DataFormatter();
        for (int i = firstDataRow; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            JSONObject object = new JSONObject();
            for (int j = 0; j < lastCellNum; j++) {
                String title = headerMap.get(j);
                String key = headerTitleKey.getStr(title);

                if(row != null && key != null && !"".equals(key)){
                    Cell cell = row.getCell(j);
                    if(cell == null){
                        continue;
                    }
                    Object value;

                    if(cell.getCellTypeEnum() == CellType.NUMERIC){//数字类型
                        value = cell.getNumericCellValue();
//                        value = Double.parseDouble(dataFormatter.formatCellValue(cell));
                    }else{//字符串类型
                        value = cell.getStringCellValue();
//                        value = dataFormatter.formatCellValue(cell);
                    }
                    object.set(key,value);
                }
            }
            list.add(object.toBean(clazz));
        }



        return list;
    }

    /**
     * 构造一个sheet，以及生成复杂表头、表数据
     *
     * @param sheetName sheet名称
     * @param headers 复杂表头json数组对象
     * @param dataLists 表数据集合
     * @return HExcel
     */
    public <T> HExcel buildSheet(String sheetName, JSONArray headers, List<T> dataLists) {
        //建立新的sheet对象
        Sheet sheet = this.workbook.getSheet(sheetName);
        if(sheet == null){
            sheet = this.workbook.createSheet(sheetName);//设置表单名
        }

        //生成复杂表头
        int row = 0;//当前行
        int col = 0;//当前列
        HashMap<String, Object> hashMap = createHeader(sheet,row,col,headers);
        ArrayList<JSONObject> headerList = (ArrayList<JSONObject>) hashMap.get("headerList");
        row = (int) hashMap.get("maxRow");

        //取出水平合并区域数据
        List<CellRangeAddress> cellRangeAddressList = sheet.getMergedRegions();
        //垂直合并，单元格为空，且不属于水平合并区域
        //这里row-1是因为，生成所有表头结束后，maxRow比最大行+1，
        for (int i = 0; i < headerList.size(); i++) {
            for (int j = 0; j <= row-1; j++) {
                boolean flag = true;

                //单元格不为空
                Cell cell = sheet.getRow(j).getCell(i);
                if(cell != null){
                    continue;
                }
                //检查合并区域
                for (CellRangeAddress cellAddresses : cellRangeAddressList) {
                    int OldFirstRow = cellAddresses.getFirstRow();
                    int OldLastRow = cellAddresses.getLastRow();
                    int OldFirstCol = cellAddresses.getFirstColumn();
                    int OldLastCol = cellAddresses.getLastColumn();

                    //与合并区域重叠
                    if ((OldFirstRow >= j && OldLastRow <= j) && (OldFirstCol >= i && OldLastCol <= i)) {
                        flag = false;
                        break;
                    }
                }

                //满足条件，将上一个单元格与最后一个单元格合并
                if(flag){
                    mergedCell(sheet,j-1,row-1,i,i);
                    break;
                }
            }
        }

        //开始填充数据
        HashMap<String, Object> mergeDataTempMap = new HashMap<>();
        CellStyle dataStyle = createDataStyle(sheet);
        for (int listIndex = 0; listIndex < dataLists.size(); listIndex++) {
            Object object = dataLists.get(listIndex);
            Map<String, Object> map = BeanUtil.beanToMap(object);

            //创建内容行
            Row dataRow = sheet.createRow(row);
            //隐藏行
            //dataRow.setZeroHeight(true);
            for (int i = 0; i < headerList.size(); i++) {
                JSONObject header = headerList.get(i);
                String key = header.getStr("key");
                Object val = map.get(key);

                //当前列是否设置为下拉框，用于限定用户输入内容
                List<String> dropDownDataList = header.getBeanList("drop-down", String.class);
                if(dropDownDataList != null && dropDownDataList.size() > 0){
                    DataValidationHelper dataValidationHelper = sheet.getDataValidationHelper();
                    DataValidationConstraint dataValidationConstraint = dataValidationHelper.createExplicitListConstraint(dropDownDataList.toArray(new String[] {}));
                    DataValidation dataValidation = dataValidationHelper.createValidation(dataValidationConstraint, new CellRangeAddressList(row, row, i, i));
                    sheet.addValidationData(dataValidation);

                    //数据与下拉框内容不匹配时，置空
                    if(!dropDownDataList.contains(String.valueOf(val))){
                        val = null;
                    }
                }

                //如果是隐藏列，取消自动换行
                Object hide = header.get("hide");
                if(hide != null && (boolean)hide){
                    dataStyle.setWrapText(false);
                }

                //创建单元格内容
                createCell(dataRow, i, dataStyle, val == null ? "" : val);

                //当前列是否合并相同数据行
                Object mergeData = header.get("merge-data");
                if(mergeData != null && (boolean)mergeData){
                    //保存临时数据
                    if(mergeDataTempMap.get("val_"+i) == null){
                        mergeDataTempMap.put("val_"+i,String.valueOf(val));
                        mergeDataTempMap.put("row_"+i,row);
                    }
                    //如果当前行数据与临时数据不一致，合并上方相同行
                    if(!String.valueOf(val).equals(String.valueOf(mergeDataTempMap.get("val_"+i)))){
                        mergedCell(sheet,(int)mergeDataTempMap.get("row_"+i),row - 1,i,i);

                        mergeDataTempMap.put("val_"+i,val);
                        mergeDataTempMap.put("row_"+i,row);
                    }
                    //如果最后一行数据与临时数据一致，合并相同行
                    if(listIndex >= dataLists.size()-1 && String.valueOf(val).equals(String.valueOf(mergeDataTempMap.get("val_"+i)))){
                        mergedCell(sheet,(int)mergeDataTempMap.get("row_"+i),row,i,i);
                    }

                }
            }
            row++;
        }

        return this;
    }

    /**
     * 保存成File文件  PS:文档密码加解密仅支持.xlsx
     *
     * @param path 完整文件路径+文件名
     */
    public void toFile(String path) {
        toFile(path,null);
    }
    public void toFile(String path,String pwd) {
        //try-catch语法糖
        try (FileOutputStream out = new FileOutputStream(path);){

            if(StrUtil.isBlank(pwd)){
                this.workbook.write(out);
            }else{
                // 加密内容
                EncryptionInfo info = new EncryptionInfo(EncryptionMode.standard);
                Encryptor enc = info.getEncryptor();
                enc.confirmPassword(pwd);

                // 输出
                POIFSFileSystem fs = new POIFSFileSystem();
                OutputStream os = enc.getDataStream(fs);
                this.workbook.write(os);

                os.flush();
                os.close();
                fs.writeFilesystem(out);
            }
        }catch (Exception e){
            throw new RuntimeException("【HExcel】 Workbook对象文件流写入File异常，密码加密失败",e);
        }
    }

    /**
     * 保存到HttpServletResponse
     *
     * @param fileName 文件名
     * @param response HttpServletResponse对象
     */
    public void toHttpServletResponse(String fileName, HttpServletResponse response) {
        //try-catch语法糖
        try (ServletOutputStream outputStream = response.getOutputStream();){
            response.setHeader("Accept-Ranges", "bytes");
            response.setHeader("Content-disposition", "attachment; filename=\"" + URLEncoder.encode(fileName, "UTF-8") + "\"");
            response.setContentType("application/octet-stream");
            this.workbook.write(outputStream);
        }catch (Exception e){
            throw new RuntimeException("【HExcel】 Workbook对象文件流写入Response异常",e);
        }
    }

    /**
     * 关闭Workbook
     */
    public void close(){
        try{
            //关闭Workbook
            this.workbook.close();
        } catch (Exception e) {
            throw new RuntimeException("【HExcel】 关闭Workbook异常",e);
        }
    }


    /*          已下设置私有，对外隐藏实现细节           */

    /**
     * Workbook对象
     */
    private Workbook workbook;

    /**
     * 构造表头
     *
     * @param sheet sheet
     * @param row 当前操作行
     * @param col 当前操作列
     * @param headers 表头数据
     * @return 返回一个map对象，供上级表头获取最新当前操作行、列、key集合
     */
    private HashMap<String,Object> createHeader(Sheet sheet, int row, int col, JSONArray headers){
        //最终返回对象
        HashMap<String, Object> hashMap = new HashMap<>();

        //key集合
        ArrayList<JSONObject> headerList = new ArrayList<>();

        Workbook wb = sheet.getWorkbook();
        Row headerRow = sheet.getRow(row);
        if(headerRow == null){
            headerRow = sheet.createRow(row);
        }
        for (Object object : headers) {
            JSONObject header = (JSONObject) object;
            String title = (String) header.get("title");
            String key = (String) header.get("key");
            Object width = header.get("width");
            Object hide = header.get("hide");
            Object align = header.get("align");
            Object backgroundColor = header.get("background-color");
            Object color = header.get("color");
            Object children = header.get("children");

            //单元格样式
            CellStyle headerStyle = createHeaderStyle(sheet);

            //自定义单元格背景色
            if(backgroundColor != null){
                headerStyle.setFillForegroundColor(Short.parseShort(backgroundColor+""));
            }

            //自定义单元格字体颜色
            if(color != null){
                Font font = wb.createFont();
                font.setColor(Short.parseShort(color+""));
                headerStyle.setFont(font);
            }

            //默认单元格宽度，20
            sheet.setColumnWidth(col, 20 * 256);
            if(width != null){
                //自定义单元格宽度
                sheet.setColumnWidth(col, (int) width * 256);
            }

            //隐藏列，设置宽度0
            if(hide != null && (boolean)hide){
                //sheet.setColumnWidth(col, 0);
                sheet.setColumnHidden(col,true);
            }

            //默认水平对齐方式（水平居中）
            if(align != null){
                //自定义水平对齐方式
                HorizontalAlignment alignment;
                switch (String.valueOf(align).toUpperCase()){
                    case "LEFT":
                        alignment = HorizontalAlignment.LEFT;
                        break;
                    case "RIGHT":
                        alignment = HorizontalAlignment.RIGHT;
                        break;
                    default:
                        alignment = HorizontalAlignment.CENTER;
                        break;
                }
                headerStyle.setAlignment(alignment);
            }

            //System.out.println(title + " " + key + " " + row + " " + col);

            //生成单元格同时设置内容
            createCell(headerRow, col, headerStyle, title);

            //无子级表头
            if(children == null){
                //保留顺序，方便后面设置数据
                headerList.add(header);

                //当前列+1
                col++;
            }
            //有子级表头
            else{
                //递归生成子级表头前，保存父级表头col，用于水平合并
                int firstCol = col;

                //递归调用
                HashMap<String, Object> hashMap1 = createHeader(sheet, row + 1, col, (JSONArray) children);

                //获取最新col、key集合
                col = (int) hashMap1.get("col");
                hashMap.put("maxRow",hashMap1.get("maxRow"));
                headerList.addAll((ArrayList<JSONObject>) hashMap1.get("headerList"));

                //水平合并，这里col-1是因为，生成子级表头结束后，col比最后一个下级表头+1，
                if(!(firstCol == col-1)){
                    mergedCell(sheet,row,row,firstCol,col-1);
                }
            }
        }

        //将数据设置到对象中，返回上一层
        hashMap.put("maxRow",(hashMap.get("maxRow") != null ? Integer.parseInt(hashMap.get("maxRow")+"") : 0) + 1);//最大行
        hashMap.put("row",row);//当前操作行
        hashMap.put("col",col);//当前操作列
        hashMap.put("headerList",headerList);//key集合

        return hashMap;
    }

    /**
     * 创建一个单元格
     *
     * @param Row 当前行对象
     * @param col 当前列
     * @param cellStyle 单元格样式对象
     * @param value 单元格内容
     */
    private void createCell(Row Row, int col, CellStyle cellStyle, Object value) {
        Cell cell = Row.createCell(col);  // 创建单元格
        cell.setCellStyle(cellStyle); // 设置单元格样式

        // 设置值
        String valueStr = String.valueOf(value);
        if  (NumberUtil.isNumber(valueStr)){//数字
            cell.setCellValue(NumberUtil.parseDouble(NumberUtil.toStr(NumberUtil.parseNumber(valueStr))));
        } else if  (value instanceof Date){//日期
            cell.setCellValue(DateUtil.format((Date) value, DatePattern.NORM_DATETIME_FORMAT));
        }else{//字符串
            cell.setCellValue(valueStr);
        }

    }

    /**
     * 构造表头、数据样式
     *
     * @param sheet sheet
     * @return 返回一个单元格样式对象
     */
    private CellStyle createHeaderStyle(Sheet sheet){
        Workbook wb = sheet.getWorkbook();

        //表头的样式
        CellStyle headerStyle = wb.createCellStyle();
        headerStyle.setAlignment(HorizontalAlignment.CENTER);//水平居中
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);//垂直居中
        //列名的字体
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 12);
        font.setFontName("新宋体");
        headerStyle.setFont(font);// 把字体 应用到当前样式
        headerStyle.setWrapText(true);//自动换行
        //填充样式，前景色、天空蓝
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());

        // 设置边框
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);

        //设置为文本格式
        DataFormat format = workbook.createDataFormat();
        headerStyle.setDataFormat(format.getFormat("@")); // "@" 表示文本格式

        return headerStyle;
    }
    private CellStyle createDataStyle(Sheet sheet){
        Workbook wb = sheet.getWorkbook();

        //内容的样式
        CellStyle dataStyle = wb.createCellStyle();
        dataStyle.setAlignment(HorizontalAlignment.CENTER);//水平居中
        dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);//垂直居中
        //内容的字体
        Font font = wb.createFont();
        font.setFontHeightInPoints((short) 12);
        font.setFontName("新宋体");
        dataStyle.setFont(font);// 把字体 应用到当前样式
        dataStyle.setWrapText(true);//自动换行
        //默认无填充
        dataStyle.setFillPattern(FillPatternType.NO_FILL);
        // 设置边框
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);
        dataStyle.setBorderTop(BorderStyle.THIN);

        //设置为文本格式
        DataFormat format = workbook.createDataFormat();
        dataStyle.setDataFormat(format.getFormat("@")); // "@" 表示文本格式

        return dataStyle;
    }

    /**
     * 合并单元格
     *
     * @param sheet sheet
     * @param firstRow 起始行
     * @param lastRow 结束行
     * @param firstCol 起始列
     * @param lastCol 结束列
     */
    private void mergedCell(Sheet sheet,int firstRow, int lastRow, int firstCol, int lastCol){
        //一个单元格无需合并，例如：[0,0,0,0]
        if(firstRow == lastRow && firstCol == lastCol){
            return;
        }

        //先取出合并前的单元格样式
        CellStyle cellStyle = sheet.getRow(firstRow).getCell(firstCol).getCellStyle();

        //合并
        sheet.addMergedRegion(new CellRangeAddress(firstRow, lastRow, firstCol, lastCol));

        //解决合并后的边框等样式问题
        int first;
        int end;
        //垂直合并
        if(firstCol == lastCol){
            first = firstRow;
            end = lastRow+1;

            for (int i = first; i < end; i++) {
                Row row = sheet.getRow(i);
                if(row == null){
                    row = sheet.createRow(i);
                }
                Cell cell = row.getCell(firstCol);
                if(cell == null){
                    cell = row.createCell(firstCol);
                }
                cell.setCellStyle(cellStyle);
            }
        }
        //水平合并
        else{
            first = firstCol;
            end = lastCol+1;

            for (int i = first; i < end; i++) {
                Row row = sheet.getRow(firstRow);
                if(row == null){
                    row = sheet.createRow(firstRow);
                }
                Cell cell = row.getCell(i);
                if(cell == null){
                    cell = row.createCell(i);
                }
                cell.setCellStyle(cellStyle);
            }
        }
    }

    /**
     * 递归获取最末端表头、以及深度
     * @param headers 表头
     * @return 末端表头，以及额外设置多一个表头深度属性
     */
    private JSONObject getLastHeader(JSONArray headers){
        return this.getLastHeader(headers,1);
    }
    private JSONObject getLastHeader(JSONArray headers,int currentRow){
        JSONObject headerTitleKey = new JSONObject();
        for (Object o : headers) {
            JSONObject header = (JSONObject) o;
            String title = (String) header.get("title");
            String key = (String) header.get("key");
            Object children = header.get("children");

            if(children != null){
                int lastRow = currentRow;
                headerTitleKey.putAll(this.getLastHeader((JSONArray)children,++currentRow));
                currentRow = lastRow;
            }

            if (key == null) {
                continue;
            }

            headerTitleKey.set(title,key);
        }

        //额外设置表头深度属性
        headerTitleKey.set("header-depth", Math.max(currentRow,headerTitleKey.getInt("header-depth") != null ? headerTitleKey.getInt("header-depth") : currentRow));
        return headerTitleKey;
    }

}
View Code
```



##        完整main测试 <br/>

```
    public static void main(String[] args) {
        //获取HExcel实例
        HExcel hExcel1 = HExcel.newInstanceXls();
        HExcel hExcel2 = HExcel.newInstanceXlsx();

        //数据，一般是查数据库，经过数据处理生成
        List<Student> dataList = new ArrayList<>();

        Student data1 = new Student();
        data1.setUserId("asdfasdffadfasdfasdfsdfasdfasdfadfasdfasdf");
        data1.setUserName("张三");
        data1.setClazz("重点班");
        data1.setSex("男");
        data1.setAge(20);
        data1.setDate(new Date());
        data1.setYuWen(90.500);
        data1.setYingYu(0.0);
        data1.setShuXue(85.123);
        data1.setWuLi(80.000);
        data1.setTotal(255.0);
        data1.setLevel("A");
        dataList.add(data1);

        Student data2 = new Student();
        data2.setUserId("222");
        data2.setUserName("李四");
        data2.setClazz("重点班");
        data2.setSex("女");
        data2.setAge(18);
        data2.setDate(new Date());
        data2.setYuWen(81.0);
        data2.setYingYu(0.0);
        data2.setShuXue(90.0);
        data2.setWuLi(70.0);
        data2.setTotal(241.0);
        dataList.add(data2);

        Student data3 = new Student();
        data3.setUserId("333");
        data3.setUserName("王五");
        data3.setClazz("普通班");
        data3.setSex("男");
        data3.setAge(20);
        data3.setDate(new Date());
        data3.setYuWen(90.500);
        data3.setYingYu(0.0);
        data3.setShuXue(85.123);
        data3.setWuLi(80.000);
        data3.setTotal(255.0);
        data3.setLevel("A");
        dataList.add(data3);

        Student data4 = new Student();
        data4.setUserId("444");
        data4.setUserName("刘六");
        data4.setClazz("普通班");
        data4.setSex("男");
        data4.setAge(20);
        data4.setDate(new Date());
        data4.setYuWen(90.500);
        data4.setYingYu(0.0);
        data4.setShuXue(85.123);
        data4.setWuLi(80.000);
        data4.setTotal(255.0);
        data4.setLevel("A");
        dataList.add(data4);

        Student data5 = new Student();
        data5.setUserId("555");
        data5.setUserName("周七");
        data5.setClazz("尖子班");
        data5.setSex("男");
        data5.setAge(20);
        data5.setDate(new Date());
        data5.setYuWen(90.500);
        data5.setYingYu(0.0);
        data5.setShuXue(85.123);
        data5.setWuLi(80.000);
        data5.setTotal(255.0);
        data5.setLevel("A");
        dataList.add(data5);

        //如果是固定表头数据，可以在项目资源文件夹下面新建个json文件夹，用来保存表头json数据，方便读、写
        //JSONArray header = JSONUtil.parseArray(ResourceUtil.readUtf8Str("json/header.json"));

        //如果是动态表头数据，直接把json字符串写在代码里，方便动态生成表头数据

        //表头
        String sheetName = "学生成绩单";
        JSONArray headers = JSONUtil.parseArray("" +
                "[\n" +
                "    {\n" +
                "        \"title\":\""+sheetName+"\",\n" +
                "        \"children\":[\n" +
                "            {\n" +
                "                \"title\":\"日期："+DateUtil.today()+"\",\n" +
                "                \"align\":\"right\",\n" +
                "                \"children\":[\n" +
                "                    {\n" +
                "                        \"title\":\"隐藏列，用户id\",\n" +
                "                        \"key\":\"userId\",\n" +
                "                        \"hide\":true,\n" +
                "                    },\n" +
                "                    {\n" +
                "                        \"title\":\"班级\",\n" +
                "                        \"key\":\"clazz\",\n" +
                "                        \"merge-data\":true,\n" +
                "                    },\n" +
                "                    {\n" +
                "                        \"title\":\"姓名\",\n" +
                "                        \"key\":\"userName\",\n" +
                "                    },\n" +
                "                    {\n" +
                "                        \"title\":\"入学时间\",\n" +
                "                        \"key\":\"date\",\n" +
                "                        \"width\":30,\n" +
                "                    },\n" +
                "                    {\n" +
                "                        \"title\":\"语文\",\n" +
                "                        \"key\":\"yuWen\",\n" +
                "                    },\n" +
                "                    {\n" +
                "                        \"title\":\"数学\",\n" +
                "                        \"key\":\"shuXue\",\n" +
                "                    },\n" +
                "                    {\n" +
                "                        \"title\":\"总分\",\n" +
                "                        \"key\":\"total\",\n" +
                "                        \"background-color\":17,\n" +
                "                        \"color\":10,\n" +
                "                        \"width\":30,\n" +
                "                        \"merge-data\":true,\n" +
                "                    },\n" +
                "                    {\n" +
                "                        \"title\":\"考试成绩等级\",\n" +
                "                        \"key\":\"level\",\n" +
                "                        \"width\":10,\n" +
                "                        \"background-color\":25,\n" +
                "                        \"color\":5,\n" +
                "                        \"drop-down\":[\n" +
                "                            \"A\",\n" +
                "                            \"B\",\n" +
                "                            \"C\",\n" +
                "                            \"D\",\n" +
                "                        ],\n" +
                "                    },\n" +
                "                ]\n" +
                "            },\n" +
                "        ]\n" +
                "    },\n" +
                "]" +
                "");
        //生成sheet
        hExcel1.buildSheet(sheetName, headers, dataList);
        hExcel2.buildSheet(sheetName, headers, dataList);

        //表头
        JSONArray headers2 = JSONUtil.parseArray("" +
                "[\n" +
                "    {\n" +
                "        \"title\":\"姓名\",\n" +
                "        \"key\":\"userName\",\n" +
                "    },\n" +
                "    {\n" +
                "        \"title\":\"学科成绩\",\n" +
                "        \"children\":[\n" +
                "            {\n" +
                "                \"title\":\"语文\",\n" +
                "                \"key\":\"yuWen\",\n" +
                "            },\n" +
                "            {\n" +
                "                \"title\":\"数学\",\n" +
                "                \"key\":\"shuXue\",\n" +
                "            },\n" +
                "        ]\n" +
                "    },\n" +
                "    {\n" +
                "        \"title\":\"总分\",\n" +
                "        \"key\":\"total\",\n" +
                "        \"align\":\"right\",\n" +
                "        \"background-color\":17,\n" +
                "        \"color\":10,\n" +
                "        \"width\":30\n," +
                "    },\n" +
                "]" +
                "");
        //生成sheet
        hExcel1.buildSheet("学生成绩单2", headers2, dataList);
        hExcel2.buildSheet("学生成绩单2", headers2, dataList);

        //表头
        JSONArray headers3 = JSONUtil.parseArray("" +
                "[\n" +
                "    {\n" +
                "        \"title\":\"姓名\",\n" +
                "        \"key\":\"userName\"\n" +
                "    },\n" +
                "    {\n" +
                "        \"title\":\"性别\",\n" +
                "        \"key\":\"sex\"\n" +
                "    },\n" +
                "    {\n" +
                "        \"title\":\"年龄\",\n" +
                "        \"key\":\"age\"\n" +
                "    },\n" +
                "    {\n" +
                "        \"title\":\"学科成绩\",\n" +
                "        \"children\":[\n" +
                "            {\n" +
                "                \"title\":\"语言类\",\n" +
                "                \"children\":[\n" +
                "                    {\n" +
                "                        \"title\":\"语文\",\n" +
                "                        \"key\":\"yuWen\",\n" +
                "                        \"background-color\":7,\n" +
                "                        \"color\":5,\n" +
                "                    },\n" +
                "                  ]\n" +
                "            },\n" +
                "            {\n" +
                "                \"title\":\"科学类\",\n" +
                "                \"background-color\":10,\n" +
                "                \"children\":[\n" +
                "                    {\n" +
                "                        \"title\":\"数学\",\n" +
                "                        \"key\":\"shuXue\"\n" +
                "                    },\n" +
                "                    {\n" +
                "                        \"title\":\"物理\",\n" +
                "                        \"key\":\"wuLi\"\n" +
                "                    }\n" +
                "                 ]\n" +
                "            },\n" +
                "        ]\n" +
                "    },\n" +
                "    {\n" +
                "        \"title\":\"总分\",\n" +
                "        \"key\":\"total\",\n" +
                "        \"align\":\"right\",\n" +
                "        \"background-color\":17,\n" +
                "        \"color\":10,\n" +
                "        \"width\":30\n," +
                "    },\n" +
                "]"+
                "");
        //生成sheet
        hExcel1.buildSheet("学生成绩单3", headers3, dataList);
        hExcel2.buildSheet("学生成绩单3", headers3, dataList);

        //表头
        JSONArray headers4 = JSONUtil.parseArray("" +
                "[\n" +
                "    {\n" +
                "        \"title\":\"姓名\",\n" +
                "        \"key\":\"userName\"\n" +
                "    },\n" +
                "    {\n" +
                "        \"title\":\"性别\",\n" +
                "        \"key\":\"sex\"\n" +
                "    },\n" +
                "    {\n" +
                "        \"title\":\"年龄\",\n" +
                "        \"key\":\"age\"\n" +
                "    },\n" +
                "    {\n" +
                "        \"title\":\"学科成绩\",\n" +
                "        \"children\":[\n" +
                "            {\n" +
                "                \"title\":\"语文\",\n" +
                "                \"key\":\"yuWen\",\n" +
                "            },\n" +
                "            {\n" +
                "                \"title\":\"科学类\",\n" +
                "                \"background-color\":10,\n" +
                "                \"children\":[\n" +
                "                    {\n" +
                "                        \"title\":\"数学\",\n" +
                "                        \"key\":\"shuXue\"\n" +
                "                    },\n" +
                "                    {\n" +
                "                        \"title\":\"物理\",\n" +
                "                        \"key\":\"wuLi\"\n" +
                "                    }\n" +
                "                 ]\n" +
                "            },\n" +
                "            {\n" +
                "                \"title\":\"英语\",\n" +
                "                \"key\":\"yingYu\",\n" +
                "            },\n" +
                "        ]\n" +
                "    },\n" +
                "    {\n" +
                "        \"title\":\"总分\",\n" +
                "        \"key\":\"total\",\n" +
                "        \"align\":\"right\",\n" +
                "        \"background-color\":17,\n" +
                "        \"color\":10,\n" +
                "        \"width\":30\n" +
                "      \n" +
                "    }\n" +
                "]"+
                "");
        //生成sheet
        hExcel1.buildSheet("学生成绩单4", headers4, dataList);
        hExcel2.buildSheet("学生成绩单4", headers4, dataList);

        //保存成File文件
        hExcel1.toFile("C:\\Users\\huanz\\Desktop\\学生成绩单复杂表头导出测试.xls");
        hExcel2.toFile("C:\\Users\\huanz\\Desktop\\学生成绩单复杂表头导出测试.xlsx");
        hExcel2.toFile("C:\\Users\\huanz\\Desktop\\学生成绩单复杂表头导出测试-带密码.xlsx","666666");
        System.out.println("导出完成！\n");

        //关闭对象
        hExcel1.close();
        hExcel2.close();

        //导入

        //根据Excel文件，获取HExcel实例
//        HExcel hExcel3 = HExcel.newInstance(new File("C:\\Users\\huanz\\Desktop\\学生成绩单复杂表头导出测试.xls"));
//        HExcel hExcel3 = HExcel.newInstance(new File("C:\\Users\\huanz\\Desktop\\学生成绩单复杂表头导出测试.xlsx"));
        HExcel hExcel3 = HExcel.newInstance(new File("C:\\Users\\huanz\\Desktop\\学生成绩单复杂表头导出测试-带密码.xlsx"),"666666");

        //根据表头，读取指定位置的sheet数据，打印sheetList数据
        System.out.println("导入读取完成！");
        for (Student map : hExcel3.readSheet(0, headers, Student.class)) {
            System.out.println(map.toString());
        }
        System.out.println("导入读取完成！");
        for (Student map : hExcel3.readSheet(1, headers2, Student.class)) {
            System.out.println(map.toString());
        }
        System.out.println("导入读取完成！");
        for (Student map : hExcel3.readSheet(2, headers3, Student.class)) {
            System.out.println(map.toString());
        }
        System.out.println("导入读取完成！");
        for (Student map : hExcel3.readSheet(3, headers4, Student.class)) {
            System.out.println(map.toString());
        }

        //关闭对象
        hExcel3.close();

    }

    /**
     * main测试学生类
     */
    static class Student {
        private String userId; //id
        private String userName; //姓名
        private String clazz; //班级
        private String sex; //性别
        private Integer age; //年龄
        private Date date; //入学时间
        private Double yuWen; //语文成绩
        private Double yingYu; //英语成绩
        private Double shuXue; //数学成绩
        private Double wuLi; //物理成绩
        private Double total; //总分
        private String level; //等级

        public Student() {
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public String getClazz() {
            return clazz;
        }

        public void setClazz(String clazz) {
            this.clazz = clazz;
        }

        public String getSex() {
            return sex;
        }

        public void setSex(String sex) {
            this.sex = sex;
        }

        public Integer getAge() {
            return age;
        }

        public void setAge(Integer age) {
            this.age = age;
        }

        public Date getDate() {
            return date;
        }

        public void setDate(Date date) {
            this.date = date;
        }

        public Double getYuWen() {
            return yuWen;
        }

        public void setYuWen(Double yuWen) {
            this.yuWen = yuWen;
        }

        public Double getYingYu() {
            return yingYu;
        }

        public void setYingYu(Double yingYu) {
            this.yingYu = yingYu;
        }

        public Double getShuXue() {
            return shuXue;
        }

        public void setShuXue(Double shuXue) {
            this.shuXue = shuXue;
        }

        public Double getWuLi() {
            return wuLi;
        }

        public void setWuLi(Double wuLi) {
            this.wuLi = wuLi;
        }

        public Double getTotal() {
            return total;
        }

        public void setTotal(Double total) {
            this.total = total;
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }

        @Override
        public String toString() {
            return "Student{" +
                    "userId='" + userId + '\'' +
                    ", userName='" + userName + '\'' +
                    ", clazz='" + clazz + '\'' +
                    ", sex='" + sex + '\'' +
                    ", age=" + age +
                    ", date=" + date +
                    ", yuWen=" + yuWen +
                    ", yingYu=" + yingYu +
                    ", shuXue=" + shuXue +
                    ", wuLi=" + wuLi +
                    ", total=" + total +
                    ", level='" + level + '\'' +
                    '}';
        }
    }
View Code
```



## 　　后记 <br/>

　　<span style="font-family: 宋体">  工具类暂时先记录到这，后续再进行补充</span> <br/>





## 　　补充 <br/>



　　<span style="color: rgba(255, 0, 0, 1)">  2024-09-14更新</span> <br/>

 　　导出新增同一列中，合并相同数据行； <br/>

![](https://img2024.cnblogs.com/blog/1353055/202409/1353055-20240914104148718-935114205.png)  <br/>



　　<span style="font-family: 宋体">  <span style="color: rgba(255, 0, 0, 1)">    2024-06-15更新  </span></span> <br/>

 　　导出新增隐藏列、支持单元格支持配置下拉框；优化导入功能； <br/>

![](https://img2024.cnblogs.com/blog/1353055/202406/1353055-20240615132242141-1944175420.png)  <br/>



　　<span style="color: rgba(255, 0, 0, 1)">  2025-07-09更新</span> <br/>

　　新增导入导出都兼容.xls、.xlsx两种格式 <br/>

　　.xlsx支持密码加解密 <br/>


