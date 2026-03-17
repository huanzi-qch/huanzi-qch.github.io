/**
 * 自定义web弹窗/层：简易风格的msg与可拖放的dialog
 * 依赖jquery
 * 作者：https://www.cnblogs.com/huanzi-qch/
 * 出处：https://www.cnblogs.com/huanzi-qch/p/10082116.html
 */
var tip = {

    /**
     * 初始化
     */
    init: function () {
        var titleDiv = null;//标题元素
        var dialogDiv = null;//窗口元素
        var titleDown = false;//是否在标题元素按下鼠标
        var resizeDown = false;//是否在缩放元素按下鼠标
        var offset = {x: 0, y: 0};//鼠标按下时的坐标系/计算后的坐标
        /*
            使用 on() 方法添加的事件处理程序适用于当前及未来的元素（比如由脚本创建的新元素）。
            问题：事件绑定在div上出现div移动速度跟不上鼠标速度，导致鼠标移动太快时会脱离div，从而无法触发事件。
            解决：把事件绑定在document文档上，无论鼠标在怎么移动，始终是在文档范围之内。
        */
        //鼠标在标题元素按下
        $(document).on("mousedown", ".tip-title", function (e) {
            var event1 = e || window.event;
            titleDiv = $(this);
            dialogDiv = titleDiv.parent();
            titleDown = true;
            offset.x = e.clientX - parseFloat(dialogDiv.css("left"));
            offset.y = e.clientY - parseFloat(dialogDiv.css("top"));
        });
        //鼠标移动
        $(document).on("mousemove", function (e) {
            var event2 = e || window.event;
            var eveX = event2.clientX;             // 获取鼠标相对于浏览器x轴的位置
            var eveY = event2.clientY;             // 获取鼠标相对于浏览器Y轴的位置
            // var height = document.body.clientHeight;//表示HTML文档所在窗口的当前高度；
            // var width = document.body.clientWidth;//表示HTML文档所在窗口的当前宽度；
            var height = window.innerHeight;//浏览器窗口的内部高度；
            var width = window.innerWidth;//浏览器窗口的内部宽度；

            //在标题元素按下
            if (titleDown) {

                //处理滚动条
                if (tip.hasXScrollbar()) {
                    height = height - tip.getScrollbarWidth();
                }
                if (tip.hasYScrollbar()) {
                    width = width - tip.getScrollbarWidth();
                }

                //上边
                var top = (eveY - offset.y);
                if (top <= 0) {
                    top = 0;
                }
                if (top >= (height - dialogDiv.height())) {
                    top = height - dialogDiv.height() - 5;
                }

                //左边
                var left = (eveX - offset.x);
                if (left <= 0) {
                    left = 0;
                }
                if (left >= (width - dialogDiv.width())) {
                    left = width - dialogDiv.width() - 5;
                }
                dialogDiv.css({
                    "top": top + "px",
                    "left": left + "px"
                });
            }

            //在缩放元素按下
            if (resizeDown) {
                var newWidth = (dialogDiv.resize.width + (eveX - offset.x));
                if (dialogDiv.resize.initWidth >= newWidth) {
                    newWidth = dialogDiv.resize.initWidth;
                }
                var newHeight = (dialogDiv.resize.height + (eveY - offset.y));
                if (dialogDiv.resize.initHeight >= newHeight) {
                    newHeight = dialogDiv.resize.initHeight;
                }

                dialogDiv.css("width", newWidth + "px");
                dialogDiv.find(".tip-content").css("height", newHeight + "px");
            }
        });
        //鼠标弹起
        $(document).on("mouseup", function (e) {
            //清空对象
            titleDown = false;
            resizeDown = false;
            titleDiv = null;
            dialogDiv = null;
            offset = {x: 0, y: 0};
        });
        //阻止按钮事件冒泡
        $(document).on("mousedown", ".tip-title-min,.tip-title-max,.tip-title-close", function (e) {
            e.stopPropagation();//阻止事件冒泡
        });
        //最小化
        $(document).on("click", ".tip-title-min", function (e) {
            // var height = document.body.clientHeight;//表示HTML文档所在窗口的当前高度；
            // var width = document.body.clientWidth;//表示HTML文档所在窗口的当前宽度；
            var height = window.innerHeight;//浏览器窗口的内部高度；
            var width = window.innerWidth;//浏览器窗口的内部宽度；
            var $parent = $(this).parents(".tip-dialog");
            //显示浏览器滚动条
            document.body.parentNode.style.overflowY = "auto";

            //当前是否为最大化
            if ($parent[0].isMax) {
                $parent[0].isMax = false;
                $parent.css({
                    "top": $parent[0].topMin,
                    "left": $parent[0].leftMin,
                    "height": $parent[0].heightMin,
                    "width": $parent[0].widthMin
                });
            }
            //当前是否为最小化
            if (!$parent[0].isMin) {
                $parent[0].isMin = true;
                $parent[0].bottomMin = $parent.css("bottom");
                $parent[0].leftMin = $parent.css("left");
                $parent[0].heightMin = $parent.css("height");
                $parent[0].widthMin = $parent.css("width");
                $parent.css({
                    "top": "",
                    "bottom": "5px",
                    "left": 0,
                    "height": "30px",
                    "width": "95px"
                });
                $parent.find(".tip-title-text").css("display", "none");
                $parent.find(".tip-content").css("display", "none");
            } else {
                $parent[0].isMin = false;
                $parent.css({
                    "top": $parent[0].topMin,
                    "bottom": $parent[0].bottomMin,
                    "left": $parent[0].leftMin,
                    "height": $parent[0].heightMin,
                    "width": $parent[0].widthMin
                });
                $parent.find(".tip-title-text").css("display", "block");
                $parent.find(".tip-content").css("display", "block");
            }
        });
        //最大化
        $(document).on("click", ".tip-title-max", function (e) {
            // var height = document.body.clientHeight;//表示HTML文档所在窗口的当前高度；
            // var width = document.body.clientWidth;//表示HTML文档所在窗口的当前宽度；
            var height = window.innerHeight;//浏览器窗口的内部高度；
            var width = window.innerWidth;//浏览器窗口的内部宽度；
            var $parent = $(this).parents(".tip-dialog");
            //当前是否为最小化
            if ($parent[0].isMin) {
                $parent[0].isMin = false;
                $parent.css({
                    "top": $parent[0].topMin,
                    "bottom": $parent[0].bottomMin,
                    "left": $parent[0].leftMin,
                    "height": $parent[0].heightMin,
                    "width": $parent[0].widthMin
                });
                $parent.find(".tip-title h2").css("display", "block");
            }
            //当前是否为最大化
            if (!$parent[0].isMax) {
                //隐藏浏览器滚动条
                document.body.parentNode.style.overflowY = "hidden";
                $parent[0].isMax = true;
                $parent[0].topMin = $parent.css("top");
                $parent[0].leftMin = $parent.css("left");
                $parent[0].heightMin = $parent.css("height");
                $parent[0].widthMin = $parent.css("width");
                $parent.css({
                    "top": 0,
                    "left": 0,
                    "height": height - 5 + "px",
                    "width": width - 5 + "px"
                });
            } else {
                //显示浏览器滚动条
                document.body.parentNode.style.overflowY = "auto";
                $parent[0].isMax = false;
                $parent.css({
                    "top": $parent[0].topMin,
                    "left": $parent[0].leftMin,
                    "height": $parent[0].heightMin,
                    "width": $parent[0].widthMin
                });
            }
        });
        //缩放
        $(document).on("mousedown", ".tip-resize", function (e) {
            var event1 = e || window.event;
            dialogDiv = $(this).parent();
            resizeDown = true;
            offset.x = e.clientX;
            offset.y = e.clientY;
            //点击时的宽高
            dialogDiv.resize.width = dialogDiv.width();
            dialogDiv.resize.height = dialogDiv.find(".tip-content").height();
        });
        //关闭
        $(document).on("click", ".tip-title-close", function (e) {
            $(this).parents(".tip-dialog").parent().remove();
            //显示浏览器滚动条
            document.body.parentNode.style.overflowY = "auto";
        });
        //点击窗口优先显示
        $(document).on("click", ".tip-dialog", function (e) {
            $(".tip-dialog").css("z-index","9999");
            $(this).css("z-index","10000");
        });
    },

    /**
     * 是否存在X轴方向滚动条
     */
    hasXScrollbar: function () {
        return document.body.scrollWidth > (window.innerWidth || document.documentElement.clientWidth);
    },

    /**
     * 是否存在Y轴方向滚动条
     */
    hasYScrollbar: function () {
        return document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
    },

    /**
     * 计算滚动条的宽度
     */
    getScrollbarWidth: function () {
        /*
            思路：生成一个带滚动条的div，分析得到滚动条长度，然后过河拆桥
         */
        var scrollDiv = document.createElement("div");
        scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;';
        document.body.appendChild(scrollDiv);
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
        document.body.removeChild(scrollDiv);

        return scrollbarWidth;

    },

    /**
     * tip提示
     * tip.msg("哈哈哈哈哈");
     * tip.msg({text:"哈哈哈哈哈",time:5000});
     */
    msg: function (setting) {
        var time = setting.time || 2000; // 显示时间（毫秒） 默认延迟2秒关闭
        var text = setting.text || setting; // 文本内容

        //组装HTML
        var tip = "<div class='tip tip-msg'>"
            + text +
            "</div>";

        //删除旧tip
        $(".tip-msg").remove();

        //添加到body
        $("body").append(tip);

        //获取jq对象
        var $tip = $(".tip-msg");

        //动画过渡
        $tip.animate({opacity: 1}, 500);

        //计算位置浏览器窗口上下、左右居中
        // var height = document.body.clientHeight;//表示HTML文档所在窗口的当前高度；
        var width = document.body.clientWidth;//表示HTML文档所在窗口的当前宽度；
        var height = window.innerHeight;//浏览器窗口的内部高度；
        // var width = window.innerWidth;//浏览器窗口的内部宽度；
        width = ((width / 2) - ($tip.css("width").replace("px", "") / 2)) / width;
        height = ((height / 2) - ($tip.css("height").replace("px", "") / 2)) / height;
        $tip.css({
            "top": (height * 100) + "%",
            "left": (width * 100) + "%"
        });

        //延迟删除
        setTimeout(function () {
            //动画过渡
            $tip.animate({opacity: 0}, 500, function () {
                $tip.remove();
            });
        }, time);
    },

    /**
         可拖放窗口
         tip.dialog({title:"测试弹窗标题",content:"测试弹窗内容"});
         tip.dialog({
            title:"测试弹窗标题",
            class:"myClassName",
            content:"<h1>测试弹窗内容</h1>",
            offset: ['100px', '50px'],
            area:["200px","100px"],
            shade:0,
            callBack:function(){
                console.log('弹窗已加载完毕');
            },
            closeCallBack:function(){
                console.log('你点击了关闭按钮');
            }
         });
     */
    dialog: function (setting) {
        var title = setting.title || "这里是标题"; // 标题
        var clazz = setting.class || ""; // class
        var content = setting.content || "这里是内容"; // 内容
        var area = setting.area; // 宽高
        var offset = setting.offset || "auto"; // 位置 上、左
        var shade = setting.shade !== undefined ? setting.shade : 0.7;//遮阴 为0时无遮阴对象

        //组装HTML
        var tip = "<div>\n" +
            "    <!-- 遮阴层 -->\n" +
            "    <div class=\"tip tip-shade\"></div>\n" +
            "    <!-- 主体 -->\n" +
            "    <div class=\"tip tip-dialog " + clazz + "\">\n" +
            "        <!-- 标题 -->\n" +
            "        <div class=\"tip tip-title\">\n" +
            "            <h2 class=\"tip tip-title-text\"></h2>\n" +
            "            <div class=\"tip tip-title-btn\">\n" +
            "                <button class=\"tip tip-title-min\" title=\"最小化\">--</button>\n" +
            "                <button class=\"tip tip-title-max\" title=\"最大化\">O</button>\n" +
            "                <button class=\"tip tip-title-close\" title=\"关闭\">X</button>\n" +
            "            </div>\n" +
            "        </div>\n" +
            "        <!-- 窗口内容 -->\n" +
            "        <div class=\"tip tip-content\"></div>\n" +
            "        <!-- 右下角改变窗口大小 -->\n" +
            "        <div class=\"tip tip-resize\"></div>\n" +
            "    </div>\n" +
            "</div>";

        var $tip = $(tip);

        //添加到body
        $("body").append($tip);

        //设置遮阴
        $tip.find(".tip-shade").css("opacity", shade);
        if (shade === 0) {
            $tip.find(".tip-shade").css({
                "width": "0",
                "height": "0"
            });
        }

        //获取dialog对象
        $tip = $tip.find(".tip-dialog");

        //标题
        $tip.find(".tip-title-text").html(title);

        //内容
        $tip.find(".tip-content").append(content);

        //设置初始宽高
        if (area) {
            $tip.css({
                "width": area[0],
            });
            $tip.find(".tip-content").css({
                "height": area[1]
            });
        }

        //动画过渡
        $tip.animate({opacity: 1}, 500);

        //计算位置浏览器窗口上下、左右居中
        if (offset === "auto") {
            // var height = document.body.clientHeight;//表示HTML文档所在窗口的当前高度；
            var width = document.body.clientWidth;//表示HTML文档所在窗口的当前宽度；
            var height = window.innerHeight;//浏览器窗口的内部高度；
            // var width = window.innerWidth;//浏览器窗口的内部宽度；
            width = ((width / 2) - ($tip.css("width").replace("px", "") / 2)) / width;
            height = ((height / 2) - ($tip.css("height").replace("px", "") / 2)) / height;
            $tip.css({
                "top": (height * 100) + "%",
                "left": (width * 100) + "%"
            });
        } else if (Array.isArray(offset)) {
            $tip.css({
                "top": offset[0],
                "left": offset[1]
            });
        }

        //初始值宽高
        $tip.resize.initWidth = $tip.width();
        $tip.resize.initHeight = $tip.find(".tip-content").height();

        //绑定关闭按钮回调
        if(setting.closeCallBack){
            $(".tip-title-close").click(function (e) {
                setting.closeCallBack();
            });
        }

        //执行回调
        setting.callBack && setting.callBack();
    },

    //生成目录弹窗，锚点信息数组
    navCategoryAnchor : [],

    /**
     * 生成目录弹窗，支持到二级目录
     * {
     *     list1:$('#cnblogs_post_body h2'),//目录的一级标题集合（如何找到一级目录）
     *     list2:"$list1.nextAll('h3')",//目录的二级标题集合，（如何从每个一级目录节点$list1下面找到二级目录）
     *     offset: ['40%', '10%'],//弹窗位置
     *    area:["156px","250px"]//弹窗大小
     * }
     */
    generateContentList : function(setting){
        setting.offset ? setting.offset : setting.offset = ['40%', '10%'];//弹窗位置
        setting.area ? setting.area : setting.area = ["156px","250px"];//弹窗大小

        //点击章节，滚动带动画效果
        $("body").on("click","#navCategory a",function() {
            $("html, body").animate({
                scrollTop: $($(this).attr("href")).offset().top - 100 + "px"
            }, 800);
            return false;
        });

        //监听鼠标滚动事件
        window.addEventListener('scroll', function () {
            //无需频繁的进行遍历判断
            if(new Date().getTime() % 2 == 0){
                var scrolled = document.documentElement.scrollTop || document.body.scrollTop
                for(var i = 0;i<tip.navCategoryAnchor.length;i++){
                    if((i==0) ?
                        (tip.navCategoryAnchor[i+1].offset >= scrolled) :
                        (tip.navCategoryAnchor[i].offset <= scrolled && ((i == tip.navCategoryAnchor.length - 1) ? true : tip.navCategoryAnchor[i + 1].offset >= scrolled))){

                        $("#"+tip.navCategoryAnchor[i].a).css("color","#519cea");
                    }else{
                        $("#"+tip.navCategoryAnchor[i].a).css("color","");
                    }
                }
            }
        });

        //生成目录索引列表
        var h2_list = setting.list1;//目录的一级标题，找到所有h2

        if(h2_list.length>0){
            //返回顶部，元素之前追加
            $("body").prepend('<a name="_labelTop"></a>');

            var content    = '<div id="navCategory">';
            content    += '<ul>';
            //一级标题
            for(var i =0;i<h2_list.length;i++){
                var h2_id = "_label_h2" + i;
                var h2_text = $(h2_list[i]).text();
                //去左右空格;
                h2_text = h2_text.replace(/(^\s*)|(\s*$)/g, "");
                $(h2_list[i]).attr("id",h2_id);
                //锚点位置
                tip.navCategoryAnchor.push({a:h2_id+"_a",offset:$(h2_list[i]).offset().top});
                content += '<li><a id="'+h2_id+'_a" href="#' + h2_id + '">' + h2_text + '</a></li>';
                //目录的二级标题，找到所有的h3
                var h3_list = eval(setting.list2.replace("$list1","$(h2_list[i])"));

                for(var j=0; j<h3_list.length; j++){
                    var h3_id = "_label_h3_" + i + "_" + j;
                    var h3_text = $(h3_list[j]).text();
                    //去左右空格;
                    h3_text = h3_text .replace(/(^\s*)|(\s*$)/g, "");
                    $(h3_list[j]).attr("id",h3_id);
                    //锚点位置
                    tip.navCategoryAnchor.push({a:h3_id+"_a",offset:$(h3_list[j]).offset().top});
                    content += '<li style="padding-left: 25px"><a id="'+h3_id+'_a" href="#' + h3_id + '">' + h3_text + '</a></li>';
                }
            }
            content += '</ul>';
            content += '</div>';

            //生成目录拖拽弹窗
            tip.dialog({title:"目录",content:content,offset: setting.offset,area:setting.area,shade:0});
        }
    }
};

$(function(){
    //初始化
    tip.init();
});