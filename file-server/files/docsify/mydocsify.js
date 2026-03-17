let body = document.body;
let head = document.head;

let logaPath = '../file-server/images/logo.png';
let nodeArray = [
    //logo
    {tagName:'link',rel:'shortcut icon',type:'image/x-icon',href:logaPath},
    //docsify脚本
    // {tagName:'link',rel:'stylesheet',href:'https://fastly.jsdelivr.net/npm/docsify/themes/vue.css'},
    {tagName:'link',rel:'stylesheet',href:'../file-server/files/docsify/vue.css'},
    // {tagName:'script',src:'https://fastly.jsdelivr.net/npm/docsify/lib/docsify.js'},
    {tagName:'script',src:'../file-server/files/docsify/docsify.js'},
    //插件
    // {tagName:'script',src:'https://fastly.jsdelivr.net/npm/docsify/lib/plugins/zoom-image.min.js'},
    {tagName:'script',src:'../file-server/files/docsify/zoom-image.min.js'},
    {tagName:'script',src:'//busuanzi.ibruce.info/busuanzi?jsonpCallback=BusuanziCallback',referrerPolicy:'no-referrer-when-downgrade'},
];

//通用配置
window.$docsify = {
    name: 'huanzi-qch',
    loadNavbar: true,//导航栏
    loadSidebar: true,//目录栏
    coverpage: true,//封面
    onlyCover: true,
    auto2top: true,
    busuanzi_value:{
        site_uv: -1,
        page_pv: -1,
        site_pv: -1
    },
    plugins: [
        //底部版权声明
        function(hook, vm) {
            hook.beforeEach(function(html) {
                return html +
                    "\n" +
                    "<hr>" +
                    //"<a target='_blank' href=''></a><br/>" +
                    "<p><span style='color: #1e2a35;cursor: pointer; ' onclick=\"window.open('/file-server/ad/adservice.html', '_blank')\" title=\"AD广告位服务说明\">AD广告位</span>（长期招租，如有需要请私信）</p>" +
                    "<br/>" +
                    "<a target='_blank' href='https://www.aliyun.com/activity?userCode=ckkryd9h'>【阿里云】阿里云最全的优惠活动聚集地！</a><br/>" +
                    "<a target='_blank' href='https://cloud.tencent.com/act/cps/redirect?redirect=11447&cps_key=e1c9db729edccd479fc902634492bf53'>【腾讯云】腾讯云当前最新优惠活动专区！</a><br/>" +
                    "<br/><br/>" +
                    "<span style='float: left;'>Copyright © 2021 - 至今 huanzi-qch</span>" +
                    "<span id='busuanzi_container_site_pv' style='float: right;'>本站总访问量 <span id='busuanzi_value_site_pv'>" + window.$docsify.busuanzi_value.site_pv + "</span> 次</span>";
            });
        },
        //返回顶部
        function(hook, vm) {
            let CONFIG = {
                auto: true,
                text: 'Top',
                right: 15,
                bottom: 140,
                offset: 500
            };
            let opts = vm.config.scrollToTop || CONFIG;
            CONFIG.auto = opts.auto && typeof opts.auto === "boolean" ? opts.auto : CONFIG.auto;
            CONFIG.text = opts.text && typeof opts.text === "string" ? opts.text : CONFIG.text;
            CONFIG.right = opts.right && typeof opts.right === "number" ? opts.right : CONFIG.right;
            CONFIG.bottom = opts.bottom && typeof opts.bottom === "number" ? opts.bottom : CONFIG.bottom;
            CONFIG.offset = opts.offset && typeof opts.offset === "number" ? opts.offset : CONFIG.offset;
            let onScroll = function(e) {
                if (!CONFIG.auto) {
                    return
                }
                let offset = window.document.documentElement.scrollTop;
                let $scrollBtn = Docsify.dom.find("span.scroll-to-top");
                $scrollBtn.style.display = offset >= CONFIG.offset ? "block" : "none"
            };
            hook.mounted(function() {
                let scrollBtn = document.createElement("span");
                scrollBtn.className = "scroll-to-top";
                scrollBtn.style.display = CONFIG.auto ? "none" : "block";
                scrollBtn.style.overflow = "hidden";
                scrollBtn.style.position = "fixed";
                scrollBtn.style.right = CONFIG.right + "px";
                scrollBtn.style.bottom = CONFIG.bottom + "px";
                scrollBtn.style.width = "50px";
                scrollBtn.style.height = "50px";
                scrollBtn.style.background = "white";
                scrollBtn.style.color = "#666";
                scrollBtn.style.border = "1px solid #ddd";
                scrollBtn.style.borderRadius = "4px";
                scrollBtn.style.lineHeight = "42px";
                scrollBtn.style.fontSize = "16px";
                scrollBtn.style.textAlign = "center";
                scrollBtn.style.boxShadow = "0px 0px 6px #eee";
                scrollBtn.style.cursor = "pointer";
                let textNode = document.createTextNode(CONFIG.text);
                scrollBtn.appendChild(textNode);
                document.body.appendChild(scrollBtn);
                window.addEventListener("scroll", onScroll);
                scrollBtn.onclick = function(e) {
                    e.stopPropagation();
                    let step = window.scrollY / 15;
                    let scroll = function() {
                        window.scrollTo(0, window.scrollY - step);
                        if (window.scrollY > 0) {
                            setTimeout(scroll, 15)
                        }
                    };
                    scroll()
                }
            })
        }
    ]
};

//更新自定义右侧目录，以及反防盗链
function update(url){
    //自动目录
    let catalogue = document.getElementsByClassName('catalogue');
    if(catalogue.length <= 0){
        catalogue = document.createElement('div');
        catalogue.className = 'catalogue';
        body.append(catalogue);
    }else{
        catalogue = catalogue[0];
        catalogue.innerHTML = "";
    }
    catalogue.style.display='none';

    setTimeout(function () {
        //img图片反防盗链
        for(let img of document.getElementsByTagName('img')){
            img.setAttribute('referrerPolicy','no-referrer');
        }

        //自动目录
        let close = document.createElement('a');
        close.className = 'catalogue-close';
        close.onclick = function (){
            this.parentElement.remove();
        }
        close.innerText = '✕';
        catalogue.append(close);
        for(let child of document.getElementById('main').children){
            if(child.nodeName === 'H2' || child.nodeName === 'H3'){
                let a = document.createElement('a');
                a.href = url + "?id=" + child.id;
                a.innerText = child.innerText;

                if(child.nodeName === 'H2'){
                    a.className = 'catalogue-h2';
                }else{
                    a.className = 'catalogue-h3';
                }
                catalogue.append(a);
            }
        }
        catalogue.style.display='block';
    },1000);
}

//不蒜子 页面访问统计回调
function BusuanziCallback(data){
    window.$docsify.busuanzi_value = data;
    document.getElementById('busuanzi_value_site_pv').innerText = window.$docsify.busuanzi_value.site_pv;
}

//DOM加载完成执行
(function (){
    //动态引入脚本
    for(let node of nodeArray){
        let element = document.createElement(node.tagName);
        for(let key in node){
            if('tagName' !== key){
                element[key] = node[key];
            }
        }
        if('link' === node.tagName){
            head.append(element);
        }else{
            body.append(element);
        }
    }

    //离线模式
    // if (typeof navigator.serviceWorker !== 'undefined') {
    //     navigator.serviceWorker.register('../file-server/files/docsify/docsify-sw.js')
    // }

    //监听URL发生变化，是否生成自定义右侧目录
    let url = window.location.href;
    if(url.indexOf('docs') !== -1){
        url = window.location.hash.split("?")[0];
        update(url);
    }
    window.onhashchange = function () {
        let hash = window.location.hash.split("?")[0];
        if(hash !== '#/' && url.indexOf(hash) === -1){
            url = hash;
            update(url);
        }else{
            let catalogue = document.getElementsByClassName('catalogue');
            if(window.location.href.indexOf("docs") === -1 && catalogue.length > 0){
                catalogue[0].remove();
            }
        }
    };
})();