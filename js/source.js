// JavaScript source code
var border = "2px solid #ffd800";
var controlroom = "/pctrl.html";//控制室地址

var baseAddress = "";//基本目标网址（带端口号）
var socket = null;//用于显示进度的socket
var dragStart = false;//判断是否要进行拖拽的动作
var sendding = false;//用于标志当前指令发送是否成功
var timer = "";
var oldmenuState = "";
var baseAddress = "";//基本目标网址（带端口号）
var sourceArr = [];//声明数组存储视频文件名字的首字母，方便后来的搜索功能，以下的作用相同
var windowsArr = [];
var lastPath = ""
var imagePath = "";
var saveCurrentCookie = "";//存储subpath
var winLocation = window.location.href;
//从cookie中读取窗口号和网址
if ($.cookie("'" + encodeURI("窗口号") + "'") != null) {
    if ($.cookie("'" + encodeURI("窗口号") + "'").indexOf(",") >= 0) {
        var windowsArry = $.cookie("'" + encodeURI("窗口号") + "'").split(",");
        windowsArr = windowsArry;
    } else {
        windowsArr.unshift($.cookie("'" + encodeURI("窗口号") + "'"));
    }
}
var urlArr = [];
if ($.cookie("'" + encodeURI("网址") + "'") != null) {
    if ($.cookie("'" + encodeURI("网址") + "'").indexOf(",") >= 0) {
        var urlArry = $.cookie("'" + encodeURI("网址") + "'").split(",");
        urlArr = urlArry;
    } else {
        urlArr.unshift($.cookie("'" + encodeURI("网址") + "'"));
    }
}

$(function () {
    $(".top .search .logo").css("marginTop", ($(".search").height() - $(".top .search .logo").height()) / 2);
    $(".top .search .playScreen").css("marginTop", ($(".search").height() - $(".top .search .playScreen").height()) / 2);
    $(".top .tab .moreFile").css("marginTop", ($(".top .tab").height() - $(".top .tab .moreFile").height()) / 2);
    //引入swiper插件，鼠标滑动时触发content()函数，切换样式
    $(".logo").click(function () {
        window.location.href = controlroom;
    })
    $(".bangDIv img").css("marginTop", ($(".bangDIv").height() - $(".bangDIv img").height()) / 2);
    $(".searchImg").click(function () {
        var num = 0;
        var searchName = $(".searchName").val();
     
        if ($(".searchName").val() != "") {
            $(".swiper-slide-active").find("li").css("display", "none");
            $.each(sourceArr, function (index, value) {
                if (searchName.indexOf(value) >= 0 || value.indexOf(searchName) >= 0) {
                    var ss = $(".swiper-slide-active").find("li").eq(index).css("display", "block");
                    num++;
                }
            })
        } else {
            $(".swiper-slide-active").find("li").css("display", "block");
            num = sourceArr.length;
        }
            
     
        $(".sourceCount").html(num);
    })
    $(".moreFile").click(function () {
        if ($(".fileShadowContent").css("display") == "block") {
            $(".fileContent").animate({
                "marginLeft": "-170px"
            })
            $(".fileShadowContent").hide();
           
        } else {
            $(".fileShadowContent").show();
            $(".fileContent").animate({
                "marginLeft": "0"
            })
        }
    })
    //根据链接的url判断要跳转到第几个选项
    if (winLocation.indexOf("?") >= 0) {
        var thisTab = winLocation.split("?Tab=")[1];
        mySwiper.slideTo(thisTab, 1000, false);//切换到第一个slide，速度为1秒
        $.cookie("sourceTab", thisTab);
        content();
    } else {
    }
})
window.onload = function () {
    getData("", "", "", "video");
   
   
    getAllData();
    $(".closeNetImg").click(function () {
        $(".shadowDiv").hide();
    })
    $(".titleName").click(function () {
       
        for (var i = 0; i < $(".sourceCommon").length; i++) {
            $(".sourceCommon").eq(i).find(".titleIcon").attr("src", $(".sourceCommon").eq(i).find(".titleIcon").attr("src").split("Selected").join(""));
            $(".sourceCommon").eq(i).find(".slideicon").attr("src", "images/newSource/slideUp.png");
            $(".sourceCommon").removeClass("classFloder");
            $(".fileFolderUl").hide();
        }
        $(".sourceCommon .titleName").css("color", "#000");
        $(this).prev().attr("src", $(this).prev().attr("src").split(".")[0] + "Selected." + $(this).prev().attr("src").split(".")[1]);
        $(this).next().attr("src", "images/newSource/slideDown.png");
        $(this).css("color", "#f4d62d");
        $(this).parent().parent().addClass("classFloder");
        $(".classFloder .fileFolderUl").show();
        saveCurrentCookie = "";
        getData("", $(this).parent().parent().attr("typevalue"));
    })
    $(".okBang").click(function () {
        addBang(this, "yes");
    })
    $(".noBang").click(function () {
        addBang(this, "no");
    })
   
}
function content() {
    var len = $(".swiper-slide").length;
    for (var i = 0; i < len; i++) {
        var name = $(".swiper-slide").eq(i).attr("class");
        if (name.indexOf("swiper-slide-active") >= 0) {
            $(".tab li").find("span").css("borderBottom", "none");
            $(".tab li").find("span").css("color", "#fff");
            $(".tab li").eq(i - 1).find("span").css("borderBottom", border);
            $(".tab li").eq(i - 1).find("span").css("color", "#ffd800");
            if (i > $(".tab li").length) {
                $(".tab li").find("span").css("borderBottom", "none");
                $(".tab li").find("span").css("color", "#fff");
                $(".tab li").eq(0).find("span").css("borderBottom", border);
                $(".tab li").eq(0).find("span").css("color", "#ffd800");
            }
        }
    }
}
function getData(dataurl,typeval,thissubpath,className1) {
    var URL = "";
   // var uriTitle = window.location.href.split("typeIp=")[1];
    var className = $(".swiper-slide-active").children().attr("class");
    var sourceType = ""
    var itemType = "";
    var str1 = "";
    var taskid = 50000;
    //var taskIdCount = 0;
    var chinName = "视频";
    if (className == "" || className == undefined) {
        className = className1;
        className = "video"
        sourceType = "00100";
        
    } else {
        //sourceType = "";
        // className = $(".swiper-slide-active").children().attr("class");
        if ($(".swiper-slide-active").attr("class").indexOf("video") >= 0) {
            sourceType = "00100";
            itemType = "1010";
            chinName = "视频";
            taskid = 50000;

            if (thissubpath != "" && thissubpath != undefined) {
                str1 = '<div class="programBtn"><div class="showRate"><span id="rateValue">00:00</span><div id="rangeRate1" class="clearfix11"><div id="rangeLeft"></div><div id="rangeRate2"></div></div><span id="rateProgressValue" style="font-size:12px;display:block;float:left;width:12%;margin-left:1%;margin-top:5px;height:20px;line-height:20px;">00:00</span></div><ul class="moreFunction"><li><img src="../images/newSource/yinliang.png" class="materialSound soundNum" onclick="meterialSound(this);"/></li><li> <img class="before image" src="images/newSource/shangshou.png" onclick="docmd(14,0,1)"/></li><li><img class="start" src="images/newSource/zanting.png" onclick="pause(this)"/></li><li><img class="next image" src="images/newSource/xiashou.png" onclick="docmd(13,0,1)"/></li><li><img class="pause image" src="images/newSource/zanting_1.png" onclick="docmd(70,0,0)"/></li><li><img class="befoeHis" src="images/newSource/goHistory.png" onclick="gobefore(this)"/></li></ul><div id="meterial"><input class="range2" type="range" min="0" max="255" value="" onchange="change(this)" style="width:80%;display:block;float:left;margin-top:12px;"><span class="value2">5</span></div></div>';

            } else {
                str1 = '<div class="programBtn"><div class="showRate"><span id="rateValue">00:00</span><div id="rangeRate1" class="clearfix11"><div id="rangeLeft"></div><div id="rangeRate2"></div></div><span id="rateProgressValue" style="font-size:12px;display:block;float:left;width:12%;margin-left:1%;margin-top:5px;height:20px;line-height:20px;">00:00</span></div><ul class="moreFunction"><li><img src="../images/newSource/yinliang.png" class="materialSound soundNum" onclick="meterialSound(this);"/></li><li> <img class="before image" src="images/newSource/shangshou.png" onclick="docmd(14,0,1)"/></li><li><img class="start" src="images/newSource/zanting.png" onclick="pause(this)"/></li><li><img class="next image" src="images/newSource/xiashou.png" onclick="docmd(13,0,1)"/></li><li><img class="pause image" src="images/newSource/zanting_1.png" onclick="docmd(70,0,0)"/></li></ul><div id="meterial"><input class="range2" type="range" min="0" max="255" value="" onchange="change(this)" style="width:80%;display:block;float:left;margin-top:12px;"><span class="value2">5</span></div></div>';

            }
        } else if ($(".swiper-slide-active").attr("class").indexOf("image") >= 0) {
            sourceType = "00001";
            itemType = "1003";
            chinName = "图片";
            taskid = 51000;
            if (thissubpath != "" && thissubpath != undefined) {
                str1 = '<div class="programBtn"><ul class="moreFunction"><li> <img class="before image" src="images/newSource/shangshou.png" onclick="docmd(14,0,1)"/></li><li><img class="next image" src="images/newSource/xiashou.png" onclick="docmd(13,0,1)"/></li><li><img class="pause image" src="images/newSource/zanting_1.png" onclick="docmd(70,0,0)"/></li><li><img src="../images/newSource/shangfan.png" class="page_up" onclick="docmd(\'keycode\',\'0xFF55\',0)"/></li><li><img src="../images/newSource/xiafan.png" class="page_down"  onclick="docmd(\'keycode\',\'0xFF9B\',0)" /></li><li><img src="../images/newSource/zuiqian.png" class="page_Home" onclick="docmd(\'keycode\',\'0xFF50\',0)"/></li><li><img src="../images/newSource/zuihou.png" class="page_End" onclick="docmd(\'keycode\',\'0xFF57\',0)"/></li><li><img class="start" src="images/newSource/goHistory.png" onclick="gobefore(this)"/></li></ul></div>';

            } else {
                str1 = '<div class="programBtn"><ul class="moreFunction"><li> <img class="before image" src="images/newSource/shangshou.png" onclick="docmd(14,0,1)"/></li><li><img class="next image" src="images/newSource/xiashou.png" onclick="docmd(13,0,1)"/></li><li><img class="pause image" src="images/newSource/zanting_1.png" onclick="docmd(70,0,0)"/></li><li><img src="../images/newSource/shangfan.png" class="page_up" onclick="docmd(\'keycode\',\'0xFF55\',0)"/></li><li><img src="../images/newSource/xiafan.png" class="page_down"  onclick="docmd(\'keycode\',\'0xFF9B\',0)" /></li><li><img src="../images/newSource/zuiqian.png" class="page_Home" onclick="docmd(\'keycode\',\'0xFF50\',0)"/></li><li><img src="../images/newSource/zuihou.png" class="page_End" onclick="docmd(\'keycode\',\'0xFF57\',0)"/></li></ul></div>';

            }
        } else if ($(".swiper-slide-active").attr("class").indexOf("music") >= 0) {
            sourceType = "00010";
            itemType = "1009"
            chinName = "音乐";
            taskid = 52000;
            if (thissubpath != "" && thissubpath != undefined) {
                str1 = '<div class="programBtn"><div class="showRate"><span id="rateValue">00:00</span><div id="rangeRate1" class="clearfix11"><div id="rangeLeft"></div><div id="rangeRate2"></div></div><span id="rateProgressValue" style="font-size:12px;display:block;float:left;width:12%;margin-left:1%;margin-top:5px;height:20px;line-height:20px;">00:00</span></div><ul class="moreFunction"><li><img src="../images/newSource/yinliang.png" class="materialSound soundNum" onclick="meterialSound(this);"/></li><li> <img class="before image" src="images/newSource/shangshou.png" onclick="docmd(14,0,1)"/></li><li><img class="start" src="images/newSource/zanting.png" onclick="pause(this)"/></li><li><img class="next image" src="images/newSource/xiashou.png" onclick="docmd(13,0,1)"/></li><li><img class="pause image" src="images/newSource/zanting_1.png" onclick="docmd(70,0,0)"/></li><li><img class="befoeHis" src="images/newSource/goHistory.png" onclick="gobefore(this)"/></li></ul><div id="meterial"><input class="range2" type="range" min="0" max="255" value="" onchange="change(this)" style="width:80%;display:block;float:left;margin-top:15px;"><span class="value2">5</span></div></div>';

            } else {
                str1 = '<div class="programBtn"><div class="showRate"><span id="rateValue">00:00</span><div id="rangeRate1" class="clearfix11"><div id="rangeLeft"></div><div id="rangeRate2"></div></div><span id="rateProgressValue" style="font-size:12px;display:block;float:left;width:12%;margin-left:1%;margin-top:5px;height:20px;line-height:20px;">00:00</span></div><ul class="moreFunction"><li><img src="../images/newSource/yinliang.png" class="materialSound soundNum" onclick="meterialSound(this);"/></li><li> <img class="before image" src="images/newSource/shangshou.png" onclick="docmd(14,0,1)"/></li><li><img class="start" src="images/newSource/zanting.png" onclick="pause(this)"/></li><li><img class="next image" src="images/newSource/xiashou.png" onclick="docmd(13,0,1)"/></li><li><img class="pause image" src="images/newSource/zanting_1.png" onclick="docmd(70,0,0)"/></li></ul><div id="meterial"><input class="range2" type="range" min="0" max="255" value="" onchange="change(this)" style="width:80%;display:block;float:left;margin-top:15px;"><span class="value2">5</span></div></div>';

            }
        } else if ($(".swiper-slide-active").attr("class").indexOf("net") >= 0) {
            sourceType = "01000";
            itemType = "1003";
            chinName = "网页";
            taskid = 53000;
            if (thissubpath != "" && thissubpath != undefined) {
                str1 = '<div class="programBtn"><ul class="moreFunction"><li> <img class="edit image" src="images/source/edit.png" onclick="editNet(this)"/><li> <img class="before image" src="images/newSource/shangshou.png" onclick="docmd(14,0,1)"/></li><li><img class="next image" src="images/newSource/xiashou.png" onclick="docmd(13,0,1)"/></li><li><img class="pause image" src="images/newSource/zanting_1.png" onclick="docmd(70,0,0)"/></li><li><img src="../images/newSource/shangfan.png" class="page_up" onclick="docmd(\'keycode\',\'0xFF55\',0)"/></li><li><img src="../images/newSource/xiafan.png" class="page_down"  onclick="docmd(\'keycode\',\'0xFF9B\',0)" /></li><li><img src="../images/newSource/zuiqian.png" class="page_Home" onclick="docmd(\'keycode\',\'0xFF50\',0)"/></li><li><img src="../images/newSource/zuihou.png" class="page_End" onclick="docmd(\'keycode\',\'0xFF57\',0)"/></li><li><img class="start" src="images/newSource/goHistory.png" onclick="gobefore(this)"/></li></ul></div>';

            } else {
                str1 = '<div class="programBtn""><ul class="moreFunction"><li> <img class="edit image" src="images/source/edit.png" onclick="editNet(this)"/><li> <img class="before image" src="images/newSource/shangshou.png" onclick="docmd(14,0,1)"/></li><li><img class="next image" src="images/newSource/xiashou.png" onclick="docmd(13,0,1)"/></li><li><img class="pause image" src="images/newSource/zanting_1.png" onclick="docmd(70,0,0)"/></li><li><img src="../images/newSource/shangfan.png" class="page_up" onclick="docmd(\'keycode\',\'0xFF55\',0)"/></li><li><img src="../images/newSource/xiafan.png" class="page_down"  onclick="docmd(\'keycode\',\'0xFF9B\',0)" /></li><li><img src="../images/newSource/zuiqian.png" class="page_Home" onclick="docmd(\'keycode\',\'0xFF50\',0)"/></li><li><img src="../images/newSource/zuihou.png" class="page_End" onclick="docmd(\'keycode\',\'0xFF57\',0)"/></li></ul></div>';

            }
        } else if ($(".swiper-slide-active").attr("class").indexOf("word") >= 0) {
            sourceType = "10000";
            itemType = "1008";
            chinName = "文档";
            taskid = 54000;
            if (thissubpath != "" && thissubpath != undefined) {
                str1 = '<div class="programBtn"><ul class="moreFunction"><li> <img class="before image" src="images/newSource/shangshou.png" onclick="docmd(14,0,1)"/></li><li><img class="startPPT image" src="images/newSource/zanting.png" onclick="docmd(\'keycode\',\'screenClass -keyevent 0x53\')"/></li><li><img class="next image" src="images/newSource/xiashou.png" onclick="docmd(13,0,1)"/></li><li><img class="pause image" src="images/newSource/zanting_1.png" onclick="docmd(70,0,0)"/></li><li><img class="beforePage image" src="images/newSource/shangye.png" onclick="docmd(\'keycode\',\'screenClass -keyevent 0xFF55\',0)"/></li><li><img class="nextPage image" src="images/newSource/xiaye.png"  onclick="docmd(\'keycode\',\'screenClass -keyevent 0xFF9B\',0)" /></li><li><img src="../images/newSource/shouye.png" class="headPage" onclick="docmd(\'keycode\',\'screenClass -keyevent 0xFF50\',0)"/></li><li><img src="../images/newSource/weiye.png" class="endPage" onclick="docmd(\'keycode\',\'screenClass -keyevent 0xFF57\',0)" ></li><li><img class="beforeHis" src="images/newSource/goHistory.png" onclick="gobefore(this)"/></li></ul></div>';
            } else {
                str1 = '<div class="programBtn"><ul class="moreFunction"><li> <img class="before image" src="images/newSource/shangshou.png" onclick="docmd(14,0,1)"/></li><li><img class="startPPT image" src="images/newSource/zanting.png" onclick="docmd(\'keycode\',\'screenClass -keyevent 0x53\')"/></li><li><img class="next image" src="images/newSource/xiashou.png" onclick="docmd(13,0,1)"/></li><li><img class="pause image" src="images/newSource/zanting_1.png" onclick="docmd(70,0,0)"/></li><li><img class="beforePage image" src="images/newSource/shangye.png" onclick="docmd(\'keycode\',\'screenClass -keyevent 0xFF55\',0)"/></li><li><img class="nextPage image" src="images/newSource/xiaye.png"  onclick="docmd(\'keycode\',\'screenClass -keyevent 0xFF9B\',0)" /></li><li><img src="../images/newSource/shouye.png" class="headPage" onclick="docmd(\'keycode\',\'screenClass -keyevent 0xFF50\',0)"/></li><li><img src="../images/newSource/weiye.png" class="endPage" onclick="docmd(\'keycode\',\'screenClass -keyevent 0xFF57\',0)" ></li></ul></div>';
            }
        }
        $(".controlBottom").html(str1);
    }

    if (thissubpath != "" && thissubpath != undefined) {
        if (dataurl == undefined || dataurl == "") {
            URL = "/wpdigitalcontent.asp?type=" + sourceType + "&utf8=1&pageno=0&pagesize=1000&sort=4&desc=0&pathindex=" + typeval + "&subpath=" + thissubpath + "&displaydate="
        } else {
            if (dataurl.indexOf("?") >= 0) {
                URL = dataurl + "&type=" + sourceType + "&utf8=1&pageno=0&pagesize=1000&sort=4&desc=0&pathindex=" + typeval + "&subpath=" + thissubpath + "&displaydate=";
            } else {
                URL = dataurl + "?type=" + sourceType + "&utf8=1&pageno=0&pagesize=1000&sort=4&desc=0&pathindex=" + typeval + "&subpath=" + thissubpath + "&displaydate=";
            }
            //获取链接中的基本网址，以便定位缩略图
            var lastindex = dataurl.lastIndexOf("/");
            if (lastindex >= 0) {
                baseAddress = dataurl.substring(0, lastindex) + "/";
            } else {
                baseAddress = dataurl + "/";
            }
        }
    } else {
        if (dataurl == undefined || dataurl == "") {
            URL = "/wpdigitalcontent.asp?type=" + sourceType + "&utf8=1&pageno=0&pagesize=1000&sort=4&desc=0&pathindex=" + typeval + "&subpath=&displaydate="
        } else {
            if (dataurl.indexOf("?") >= 0) {
                URL = dataurl + "&type=" + sourceType + "&utf8=1&pageno=0&pagesize=1000&sort=4&desc=0&pathindex=" + typeval + "&subpath=&displaydate=";
            } else {
                URL = dataurl + "?type=" + sourceType + "&utf8=1&pageno=0&pagesize=1000&sort=4&desc=0&pathindex=" + typeval + "&subpath=&displaydate=";
            }
            //获取链接中的基本网址，以便定位缩略图
            var lastindex = dataurl.lastIndexOf("/");
            if (lastindex >= 0) {
                baseAddress = dataurl.substring(0, lastindex) + "/";
            } else {
                baseAddress = dataurl + "/";
            }
        }
    }
    
    
    $("."+className+" ul").html("");
    
    $.ajax({
        url: URL,
        type: "get",
        dataType: "xml",
        async: false,
        scriptCharset:"utf-8",
        success: function (data) {
            controlroom = "http://" + $(data).find("clientInfo").attr("controlroom") + ":8080/pctrl.html";
           
            var sourceCount = 0;
            var folderCount = 0;
            var sourceStr = "";
            var filefolderStr = "";
            var sdelectPlay = '<div class="sdelectPlay"><img src="images/newSource/0_10.png" onclick="showControl(this)"></div>';
            var dataType = "";
            var path = $(data).find("clientInfo").attr("contentpath");
            
             $(".logo").attr("subpath", $(data).find("clientInfo").attr("subpath"));

            if ($(data).find("clientInfo").attr("retnumber") == "0" && ($(data).find("clientInfo").attr("desc").indexOf("301") >= 0 || $(data).find("clientInfo").attr("desc").indexOf("301") >= 0)) {
                var thisnewurl = $(data).find("clientInfo").attr("desc").split("=")[1];
                //getData(thisnewurl);//跨域问题，拒绝访问
                var dataindex = thisnewurl.lastIndexOf("/");
                window.location.href = thisnewurl.substring(0, dataindex) + "/main.html";
            } else {
                for (var i = 0; i < $(data).find("item").length; i++) {
                    var sourceName = $(data).find("d1").eq(i).text();
                    var sourceImage = $(data).find("l2").eq(i).text();
                    var courceUrl = $(data).find("l1").eq(i).text();
                    dataType = $(data).find("tp").eq(i).text();
                    if (dataType == "999999") {
                        folderCount++;
                        if (folderCount > 0) {
                            $(".fileFolderContent").show();
                        }
                        var subPath = $(data).find("clientInfo").attr("subpath");
                        var fileName = $(data).find("d1").eq(i).text();
                        subPath = subPath + fileName;
                        var str1 = '<li pathSrc=' + fileName + ' onclick="clickFolder(this)"><img src="images/newSource/fileContent.png" class="folderImage" /><p>' + fileName + '</p></li>';
                        filefolderStr += str1;
                    } else {
                        sourceArr.push(sourceName);
                        if (sourceImage == "") {
                            sourceImage = "images/img2.png"
                        }
                        taskid++;
                        sourceCount++;
                        sourceStr += "<li taskid=" + taskid + " sourceName=" + sourceName + "><img class='thumbnailImg' src='" + baseAddress + "$$" + path + sourceImage + "' imgsrc='" + baseAddress + "$$" + path + courceUrl + "' onclick='checkFile(this)'/><div class='descBottom'><div class='sourceDec1'><span class='sourceName'>" + sourceName + "</span><span class='sourceDec'>aaaa</span></div><div class='judege' bangtitle="+courceUrl+"><span class='okBang bang'><div class='bangDIv'><img src='images/newSource/00_38.png' /></div><span class='okCount'>0</span></span><span class='noBang bang'><div class='bangDIv'><img src='images/newSource/00_40.png' /></div><span class='noCount'>0</span></span></div></div>" + sdelectPlay + "</li>"
                    }
                    if (saveCurrentCookie == "") {
                        if (dataType == "999999") {
                            
                        }
                    }  
                }
                $("." + className + " ul").html(sourceStr);
                $("." + className).attr("itemType", itemType);
                styleContent();
                //
                $(".contentCount").html("共<span class='sourceCount'>" + sourceCount + "</span>个" + chinName);

                if (itemType == "1009" || itemType == "1010") {
                    $(".moreFunction li").css("marginTop", 0);
                }
                if ($(".logo").attr("subpath") != undefined && $(data).find("clientInfo").attr("subpath") != ""&&$(".logo").attr("subpath") != "") {
                    $(".classFloder .fileFolderUl").html('<li onclick="gobefore(this)"><img class="beforeHis" src="images/newSource/goHistory.png"  style="display: block;"><p>返回上一级</p></li>' + filefolderStr);

                } else {
                    $(".classFloder .fileFolderUl").html(filefolderStr);

                }
            }
            showJudge();
        }, error: function (a, b, c) {
            console.log(a, b, c);
            $(".sourceCount").html("0");
        }
    })
}
function styleContent() {
    var numCount = parseInt(document.documentElement.clientWidth / $(".swiper-slide ul li ").width());
   //手机端获取高度和宽度时最好不使用window.screen.width，需要使用clientwidth
    $(".descBottom").css("width", $(".swiper-slide ul li .thumbnailImg").width());
    $(".judege .bang img").css("height", $(".judege .bang img").width());  
    $(".swiper-slide ul li ").css("marginLeft", (document.documentElement.clientWidth - numCount * $(".swiper-slide ul li ").width()) / (numCount + 1));
    $(".descBottom").css("marginLeft", $(".thumbnailImg").css("marginLeft"));
    $(".bangDIv img").css("paddingTop", ($(".bangDIv").height() - $(".bangDIv img").height()) / 2);
    $(".bangDIv img").css("marginLeft", ($(".bangDIv").width() - $(".bangDIv img").width()) / 2);
    $(".swiper-slide ul li:nth-child(2n+1) .sdelectPlay").css("right", $(".swiper-slide ul li:nth-child(2n+1)").width() - parseFloat($(".swiper-slide ul li:nth-child(2n+1) .thumbnailImg").css("marginLeft")) - $(".swiper-slide ul li:nth-child(2n+1) .thumbnailImg").width());
    $(".swiper-slide ul li:nth-child(2n) .sdelectPlay").css("right", $(".swiper-slide ul li:nth-child(2n)").width() - parseFloat($(".swiper-slide ul li:nth-child(2n) .thumbnailImg").css("marginLeft")) - $(".swiper-slide ul li:nth-child(2n) .thumbnailImg").width());
    //$(".swiper - slide").css("height",)
    $(".swiper-container").css("height", document.documentElement.clientHeight - $(".top").height() - $(".content").height());
    $(".shadowDiv").width("20em");
    if (document.documentElement.clientWidth > 375 && document.documentElement.clientWidth < 768) {
        

    } else if (document.documentElement.clientWidth >= 768 && document.documentElement.clientWidth < 1024) {
       
        $(".addContent .windowsNum").css("width", "46%");
        $(".addContent select").css("width", "43%");
        $(".addContent select").css("marginLeft", "24%");
        $(".addContent p span").css("width", "24%");

        $(".addUrlContent .inputText").css("width", "46%");
        //$(".addUrlContent textarea").css("width", "46%");
        $(".addUrlContent select").css("width", "43%");
        $(".addUrlContent select").css("marginLeft", "24%");
        $(".shadowDiv select").css("height", "22px");
        $(".urlContent").css("marginTop", "6%");
        $(".urlAddress").css("width", "24%");
        
    } else if (document.documentElement.clientWidth >= 1024) {
        
        $(".addContent .windowsNum").css("width", "47%");
        $(".addContent select").css("width", "42%");
        //$(".addContent select").css("marginLeft", "24.5%");

        $(".addUrlContent .inputText").css("width", "47%");
        //$(".addUrlContent textarea").css("width", "47%");
        $(".addUrlContent select").css("width", "42%");
        // $(".addUrlContent select").css("marginLeft", "24.5%");
        $(".shadowDiv select").css("height", "24px");

        $(".urlContent").css("marginTop", "1%");

        
    } else if (document.documentElement.clientWidth <= 375) {
        $(".shadowDiv").css("width", "20em");
        
        $(".addContent p input").css("width", $(".addContent p select").width() - 15);
        //$(".addContent p textarea").css("width", $(".addContent p input").width());
        $(".addUrlContent p input").css("width", $(".addUrlContent p select").width() - 15);

    }
    //此处是为了适配苹果手机和安卓手机
    var ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
        $(".inputText").css("width", parseInt($(".addContent p select").width()) - 10);
    } else {
        $(".inputText").css("width", parseInt($(".addContent p select").width()) - 18);
    }
    //$(".inputText").css("width", $(".addContent p select").width() - 10);
    
    $(".addContent textarea").next().css("height", $("textarea").height() + 2);
    //$(".addContent textarea").next().css("top", -$("textarea").height() - 2);
    //$(".addContent textarea").prev().css("lineHeight", $("textarea").height() + 2+"px");
    $(".addContent p .cleartext").css("left", $(".addContent").width()-15);
    //$(".addContent p .cleartext").css("top", "");
    //$(".addContent p:nth-child(2n) .cleartext").css("top", "128px");
    $(".addUrlContent p .cleartext").css("left", $(".addUrlContent").width()-25);
    //$(".addUrlContent p .cleartext").css("top", $(".addUrlContent").width());
    $(".swiper-slide-active ul li").css("marginLeft", (document.documentElement.clientWidth - parseInt((document.documentElement.clientWidth / $(".swiper-slide-active ul li").width())) * $(".swiper-slide-active ul li").width()) / (parseInt((document.documentElement.clientWidth / $(".swiper-slide-active ul li").width())) + 1));
   // alert($(".swiper-slide-active ul li").css("marginLeft"));
    $.cookie("sourceTab", mySwiper.realIndex + 1);
}
//显示平评论按钮
function showJudge() {
    for (var u = 0; u < $(".swiper-slide-active li").length; u++) {
        if ($(".swiper-slide-active li ").eq(u).attr("sourceName").indexOf("@_@") >= 0 || $(".swiper-slide-active li").eq(u).attr("sourceName").indexOf("@~@") >= 0) {
            $(".swiper-slide-active li .judege").eq(u).show();
            // $(".swiper-slide-active li .judege").eq(((".swiper-slide-active li").length) / 2 + u).show();
        } else {
            $(".swiper-slide-active li .judege").eq(u).hide();
            //$(".swiper-slide-active li .judege").eq(($(".swiper-slide-active li").length) / 2 + u).hide();
        }
    }
}
function showControl(thisItem) {
    if ($(thisItem).attr("src").indexOf("images/newSource/0_10.png") >= 0) {
        $(".sdelectPlay img").attr("src", "images/newSource/0_10.png");
        $(thisItem).attr("src", "images/newSource/0_07.png");
        $(".sdelectPlay img").attr("showFlag", "noFlag");
        $(thisItem).attr("showFlag", "flag");
        
        $(".bottom").show();
        $(".swiper-slide-active").css("height", $(".swiper-container").height() - 80);
       
    } else {
        $(thisItem).attr("src", "images/newSource/0_10.png");

        $(".bottom").hide();
        $(thisItem).attr("showFlag", "noFlag");
        $(".swiper-slide-active").css("height", "100%");
        $(".range2").val("128");
        $(".value2").html("128");
    }
}
function playNowPro() {
    $(".swiper-slide-active ul li").removeClass("current");
    for (var i = 0; i < $(".swiper-slide-active ul li").length; i++) {
        var itemType = $(".swiper-slide-active").children().attr("itemtype");
        var name = $(".swiper-slide-active ul li").eq(i).find(".thumbnailImg").attr("imgsrc");
        var taskId = $(".swiper-slide-active ul li").eq(i).attr("taskid");
       
        
        if ($(".swiper-slide-active ul li").eq(i).find(".sdelectPlay img").attr("src").indexOf("images/newSource/0_07.png") >= 0) {
            $(".swiper-slide-active ul li").eq(i).addClass("current");
            startUp(itemType, name, taskId);
           
            return false;
        }
    }
}
function startUp(itemType, contentName, taskID) {
    var des = contentName.split("/")[contentName.split("/").length - 1];
    if ($(".current").parent().parent().attr("class").indexOf("video") >= 0) {
       
        timer = setInterval("getRate()", 1000);
        changeNowRate();
    } else if ($(".current").parent().parent().attr("class").indexOf("music") >= 0) {
        
        timer = setInterval("getRate()", 1000);
        changeNowRate();
    } else if ($(".current").parent().parent().attr("class").indexOf("word") >= 0) {
        
        clearInterval(timer);
    } else {
        
        clearInterval(timer);
    }
    $.ajax({
		url:"/wpsendclientmsg.asp?wpsendclientmsg=76_-starttemptask <id>"+taskID+"</id><sunt>99</sunt><des>"+des+"</des><url>"+contentName+" -t</url><ttype>"+itemType+"</ttype><dur>36000</dur><win>0            -全屏窗口</win><wstate>100</wstate>&utf8=1",
		dataType:"text",
		type: 'GET',
		success: function(){
			
		},
		error:function(){
		}
	})
}
function getAllData(thislist) {
    $.ajax({
        url: "/wpgetxmlids.asp?rnd=" + parseInt(Math.random(9999) * 10000) + "&utf8=1&gettype=9",
        dataType: 'xml',
        type: 'GET',		//提交方式
        timeout: 35000,      //失败时间
        error: function (xml) {
        },
        success: function (xml) {
            var clientInfo = $(xml).find("clientInfo");//获得终端信息标签
            var clientName = $(clientInfo).attr("clientname");//获得终端名称
            var playTask = $(clientInfo).attr("playtask");
            var arrayTask = playTask.split("/")
            var currentTask = arrayTask[1];//获得当前播放节目的id
            var playVol = $(clientInfo).attr("playvol");//获得当前的系统音量
            var hostName = $(clientInfo).attr("hostname");//获得当前的计算机名
            var playState = $(clientInfo).attr("playstate");
            var playOrPause = playState.split("_");
            var playStart = playOrPause[0];

            var findex = playVol.split("/");
            var systemSound = findex[0];
            var mplayVol = "128";
            var playProc = $(clientInfo).attr("playproc").split("_");
            var playProc1 = playProc = parseInt(playProc[0]);//读取当前视频播放进度的万分比
            var playOrPause = playState.split("_");
            var gGetPlayDuring = $(clientInfo).attr("playdur").split("_");
            gGetPlayDuring = parseInt(gGetPlayDuring[0]);
            var playOrPause = playState.split("_");
            var playStatus = playOrPause[0];//获得当前节目所处的状态，是暂停还是继续
            changPlayStatus(playStatus);
            var findex = playVol.split("/");
            var systemSound = findex[0];
            var mplayVol = "128";
            if (findex >= 0) {

                playVol = playVol.substr(0, findex);
                findex = playVol.indexOf("/");
                if (findex >= 0) {
                    mplayVol = playVol.substr(findex + 1, playVol.length - findex - 1);
                    playVol = playVol.substr(0, findex);
                }
            }
            $(".range2").val(mplayVol);
            $(".value2").html(mplayVol);
            //此段代码为在没有节目播放时，默认将第一条的操作项展开
           
            if (window.location.href.indexOf("?Tab") < 0) {
                for (var i = 0; i < $(".videoContent").length; i++) {
                    if ($(".videoContent").eq(i).attr("taskid") == currentTask) {
                        //if()

                        $(".videoContent").eq(i).find(".moreImage").click();
                        $(".videoContent").eq(i).next().addClass("current");
                        break;
                    }
                }
            }

            $("#rangeRate1").attr("max", gGetPlayDuring);
            var strs = parseFloat($("#rangeRate1").css("width"));

            //$(".current").find(".rateProgress").val((playProc1/10000)*strs);
           // $("#rateProgressValue").html()
            $("#rateProgressValue").html(secondToMinute((gGetPlayDuring / 10000) * strs));
            if ($(".current").html() == undefined) {
                return;
            } else {
                if ($(".current").parent().parent().indexOf("video") >= 0) {
                    if (playStatus == "3") {
                        timer = setInterval("getRate()", 1000);

                    } else {
                        clearInterval(timer);
                    }

                }
            }

        }
    })
}

//专门为了获取音视频的播放状态，获取的方式和getData（）相同，只不过不再对其他的数据进行处理
function getRate() {
    if (dragStart) { return; }//判断是不是要进行拖拽的动作，若是则将获取进度的长连接终止掉
    if (sendding) { return; }
    sendding = true;
    if (socket != null && socket.readyState == 1) {
        socket.send("wpgetxmlids.asp?gettype=9&utf8=1&rnd=" + parseInt(Math.random(9999) * 10000));
    } else {
        connect();
        if (socket != null && socket.readyState == 1) {
            socket.send("wpgetxmlids.asp?gettype=9&utf8=1&rnd=" + parseInt(Math.random(9999) * 10000));
            sendding = false;
            return;

        }
        $.ajax({
            url: "/wpgetxmlids.asp?gettype=9&utf8=1&rnd=" + parseInt(Math.random(9999) * 10000),
            dataType: 'xml',
            type: 'GET',		//提交方式
            timeout: 2000,      //失败时间
            //timeout: 0,		//失败时间
            error: function (xml) {
            },
            success: function (xml) {
                var clientInfo = $(xml).find("clientInfo");//获得终端信息标签

                var playProc = $(clientInfo).attr("playproc").split("_");
                var playProc1 = playProc = parseInt(playProc[0]);
                var playTask = $(clientInfo).attr("playtask");
                var gGetPlayDuring = $(clientInfo).attr("playdur").split("_");
                gGetPlayDuring = parseInt(gGetPlayDuring[0]);
                var menuState = playTask.split("\/");
                menuState = (parseInt(menuState[0]) >> 6) & 0x03;
                $("#rangeRate1").attr("max", gGetPlayDuring);
                var strs = parseFloat($("#rangeRate1").css("width"));
              
                $("#rateProgressValue").html(secondToMinute((gGetPlayDuring / 10000) * strs));
                if (menuState != oldmenuState) {
                   
                }
               
                var strs = parseFloat($("#rangeRate1").css("width"));
                if (strs == NaN) {
                    strs = 0;
                }
                $(".rateValue").html(secondToMinute((playProc1 / 10000) * strs));

            }
        });
    }
    sendding = false;
}
//创建长连接，该部分的长连接主要用于音视频的进度条
function connect() {
    var hosturl = window.location.href.split("//")[1].split("/")[0];
    var host = "ws://" + hosturl + "/wpgetxmlids.asp?gettype=9&utf8=1&rnd=" + parseInt(Math.random(9999) * 10000);
    try {
        if (socket == null || socket.readyState != 1) {//1-连接成功建立，可以通信；2-连接正在进行关闭握手，即将关闭；
            if (socket != null) {					//3-连接已经关闭或者根本没有建立;0-正在连接
                delete socket;
            }
            socket = new WebSocket(host);//建立一个WebSocket
        }

        socket.onopen = function () {//建立连接
            console.log("Connection established");
        }
        socket.onmessage = function (data) {//接收送服务器端返回的数据
            var clientInfo = $($(data.data)[2]).find("clientInfo");

            var playProc = $(clientInfo).attr("playproc").split("_");
            var playProc1 = playProc = parseInt(playProc[0]);
            var playTask = $(clientInfo).attr("playtask");
            var gGetPlayDuring = $(clientInfo).attr("playdur").split("_");
            gGetPlayDuring = parseInt(gGetPlayDuring[0]);
            var menuState = playTask.split("\/");
            menuState = (parseInt(menuState[0]) >> 6) & 0x03;
            $("#rangeRate1").attr("max", gGetPlayDuring);
            if (menuState != oldmenuState) {
                //	changeMenuState(menuState);
            }
            oldmenuState = menuState;
            var reteWidth = parseFloat($("#rangeRate1").css("width")) - parseInt($("#rangeRate2").css("width"));
            var strs = parseFloat($("#rangeRate1").attr("max"));
            var dddty = (playProc1 / 10000) * strs / 1000;
            rateLeft = parseFloat(dddty * reteWidth / (strs / 1000));
            if (rateLeft >= reteWidth) {
                rateLeft = 0;
            }
             //$("#rateProgressValue").html(secondToMinute((playProc1 / 10000) * strs));
            $("#rateValue").html(secondToMinute((playProc1 / 10000) * strs));
            $("#rateProgressValue").html(secondToMinute(strs));
            $("#rangeRate2").css("left", rateLeft);
            $("#rangeLeft").css("width", rateLeft);
        }

        socket.onclose = function () {
            console.log("WebSocket closed!");
        }

    } catch (exception) {
        console.log(exception);
    }

}

//拖动改变播放进度
function rateProgress() {
    var value = document.getElementById('rateProgress').value;
    var nw = parseInt($("#tabscreen").attr("nowwindow"));
    document.getElementById('rateValue').innerHTML = secondToMinute(value);
    docmd(nw * 10000 + 3009, parseInt(document.getElementById('rateProgress').value));
    //每次拖动一次进度条就发送一次指令，以实时的获取当前的进度

    if (parseInt($("#rateProgress").val()) >= parseInt($("#rateProgress").attr("max"))) {
        $("#rateProgress").val(0);
    }
}
function changeNowRate() {
    //拖动进度条
    var thiscurrent = ""
    var rangeRate1 = "";
    var rangeRate2 = ""
   
    rangeRate1 = document.getElementById("rangeRate1");
    rangeRate2 = document.getElementById("rangeRate2");

    var changeFlage = 0;

    var nowSecond = 0;

    rangeRate2.addEventListener('touchstart', function (event) {
        changeFlage = 1;

        clearInterval(timer);
        //console.log("start"+changeFlage);
    })
    rangeRate2.addEventListener('touchmove', function (event) {
        changeFlage = 1;
        //console.log("move"+changeFlage);         
        event.preventDefault();
        var styles = window.getComputedStyle(rangeRate1, null);
        var width = styles.width;//灰色块的长度，用于计算红色块最大滑动的距离
        //leftWidth为当前灰色块距离屏幕最左侧的距离
       // var leftWidth = parseFloat(parseFloat($("#rangeRate1").css("width")) - parseFloat($("#rateValue").css("marginLeft")) - parseFloat($("#rateValue").css("width")));
        var leftWidth = parseFloat(parseFloat($("#rangeRate1").css("width")) * 0.04 +parseFloat( $("#rateValue").css("width")) + 10);

        //console.log(width);            
        if (event.targetTouches.length == 1) {
            var touch = event.targetTouches[0];
            //计算红色块的left值，pageX是相对于整个页面的坐标，减去10（红色块长度的一半）是为了让鼠标点显示在中间，
            //可以更改值看看效果，如果灰色块不是紧挨着屏幕，那还需要计算灰色块距离左屏幕的距离，应为pageX！！！                
            moveleft = touch.pageX - leftWidth - 10;
            if (moveleft <= 0) {//红色块的left值最小是0；                    
                moveleft = 0;
            };
            if (moveleft >= parseFloat(width) - 20) {////红色块的left值最小是灰色块的width减去红色块的width；                    
                moveleft = parseFloat(width) - 20;
            }
            rangeRate2.style.left = moveleft + "px";//最后把left值附
            var reteWidth = parseFloat($("#rangeRate1").css("width")) - parseInt($("#rangeRate2").css("width"));
            var strsMax = parseFloat($("#rangeRate1").attr("max"));
            //var nw = parseInt($("#tabscreen").attr("nowwindow"));
            nowSecond = moveleft * strsMax / reteWidth;
            $("#rateValue").html(secondToMinute(nowSecond));
            $("#rangeLeft").css("width", moveleft);
            console.log($("#rangeRate2").css("left"));
        };
    });
    rangeRate2.addEventListener('touchend', function (event) {
        var reteWidth = parseFloat($("#rangeRate1").css("width")) - parseInt($("#rangeRate2").css("width"));
        var strsMax = parseFloat($("#rangeRate1").attr("max"));
        //var nw = parseInt($("#tabscreen").attr("nowwindow"));
        nowSecond = moveleft * strsMax / reteWidth
        // docmd(nw * 10000 + 3009, parseInt(nowSecond));
        docmd(3009, parseInt(nowSecond));
        changeFlage = 0;
        //console.log("end"+changeFlage);
    })
}
//毫秒转化成分钟
function secondToMinute(num) {
    var num1 = 0;
    var num2 = 0
    num = num / 1000;
    if (num >= 60) {
        num1 = parseInt(num / 60);
        num2 = parseInt(num % 60);

    } else {
        num2 = parseInt(num % 60);
    }
    num = fillTime(num1) + ":" + fillTime(num2);
    return num;
}
//时间格式填充
function fillTime(num) {
    if (num < 10) {
        num = "0" + num;
    } else {
        num = num;
    }
    return num;
}
//音视频暂停/启动图片切换
function changPlayStatus(playStatus) {
    if (playStatus == "2") {
        $(".start").attr("src", "images/newSource/zanting.png");
    } else {
        $(".start").attr("src", "images/newSource/bofang.png");
    }
}

//拖动滑动条获取到相应的值
function change(thisName) {
    var value2 = thisName.value;
    $(thisName).next().html(value2);
    docmd(3001, getSoundNumSlip(thisName.value), 0);
}
//发送指令函数
//tempTask:"0"为正常发送的指令，"1"为上一项，下一项发送的指令
function docmd(cmdtype, cmdData, tempTask) {
    var cmdType = "" + cmdtype + "";
    var sendcmdurl = "/wpsendclientmsg.asp?rnd=" + parseInt(Math.random(9999) * 10000);
    if (tempTask != 1 && !isNaN(cmdtype)) {//执行显示端命令
        cmdstr = cmdtype + "," + cmdData;
        $.ajax({
            data: { wpsendclientmsg: cmdstr },
            url: sendcmdurl,
            dataType: 'html',
            type: 'GET',
            timeout: 15000,		//超时时间
            error: function (xml) {
                //timeShowMsg("title", "发送失败", 500);		//失败报错
            },
            success: function (xml) {
                if (xml) {
                    //timeShowMsg("title", "发送成功", 500);		//发送成功
                }
            }
        });
    }
    if (cmdtype == "keycode") {//发送键盘动作
        if (cmdData.indexOf("screenClass") >= 0) {
            cmdData = cmdData;
        } else {
            cmdData = "-keyevent " + cmdData;
        }
        $.ajax({
            data: { wpsendkeys: cmdData },
            url: sendcmdurl,
            dataType: 'html',
            type: 'GET',
            timeout: 5000,		//超时时间
            error: function (xml) {
               // timeShowMsg("title", "发送失败", 500);		//失败报错
            },
            success: function (xml) {
                if (xml) {
                    //  timeShowMsg("title", "发送成功", 500);		//发送成功

                }
            }
        });
    }
    //点击上一节目项，下一节目项，将当前节目的'current'去掉，将上一节目项/下一节目项添加上'current'
    if (cmdtype == 13) {
        if ($(".current").attr("taskid") < $(".current").parent().find("li").eq(length - 1).attr("taskid")) {
            var ele = $(".current").next();

            $(".current").parent().find("li").removeClass('current');
            ele.addClass("current");
            ele.find(".sdelectPlay img").click();
           // startUp($(".current").find(".startUp"));
            $(".playScreen").click();
        }
    }
    if (cmdtype == 14) {
        if ($(".current").attr("taskid") > $(".current").parent().find("li").eq(length-1).attr("taskid")) {
            var ele = $(".current").prev();

            $(".current").parent().find("li").removeClass('current');
            ele.addClass("current");
            ele.find(".sdelectPlay img").click();
           // startUp($(".current").find(".startUp"));
            $(".playScreen").click();
        }

    } if (cmdType.indexOf("3009") >= 0) {
        
        timer = setInterval("getRate()", 1000);
    }
    if (cmdtype == 70) {
        clearInterval(timer);
    }
    if (cmdtype == 16) {
       
    }
}
//调节素材音量
function meterialSound(thisSound) {
    if ($(thisSound).parent().parent().next().css("display") == "block") {
        $(thisSound).parent().parent().next().css("display", "none");
       
    } else {
        $(thisSound).parent().parent().next().css("display", "block");
    }
}
//拖动滑动条获取到相应的值
function change(thisName) {
    var value2 = thisName.value;
    $(thisName).next().html(value2);
    docmd(3001, getSoundNumSlip(thisName.value), 0);
}
//淡入淡出
function getSoundNumSlip(num) {
    num = parseFloat(num);
    tempnum = num;
    if (tempnum <= 0) { tempnum = 0; }
    if (tempnum >= 255) { tempnum = 255; }
    return tempnum;
}
//音视频的暂停/继续按钮，更具点击时的状态切换图标和发送相应的指令
function pause(thismusic) {
    if ($(".start").attr("src") == "images/newSource/bofang.png") {
        docmd(3003, 0, 0);
        $(".start").attr("src", "images/newSource/zanting.png");
    } else {
      
        docmd(3002, 0, 0);
        $(".start").attr("src", "images/newSource/bofang.png");
    }
}
//滑动到音频的界面是，关闭音视频的所有声音，点击当前的一个音频，其他音频也全部关闭。
function musicPlay() {
    for (var i = 0; i < $(".music .musicContent").length; i++) {
        $("audio")[i].onplay = function () {
            var musics = $("audio");
            musics.removeClass("musicnowplay");//移除所有audio的class
            $(this).addClass("musicnowplay");//当前播放的audio添加class
            for (var j = 0; j < musics.length; j++) {
                if (!$(musics[j]).hasClass("musicnowplay")) {//非当前点击video播放停止
                    musics[j].pause();
                }
            }
        }//onplay
    }//f
}
//滑动到另一个选项卡时，关闭除了当前选项卡的所有音频、视频文件
function closeOther() {
    if ($(".swiper-slide-active").attr("class").indexOf("video") >= 0) {
        for (var i = 0; i < $("audio").length; i++) {
            $("audio")[i].pause();
        }
    } else if ($(".swiper-slide-active").attr("class").indexOf("music") >= 0) {
        for (var j = 0; j < $("video").length; j++) {
            $("video")[j].pause();
        }
    } else {
        for (var i = 0; i < $("audio").length; i++) {
            $("audio")[i].pause();
        }
        for (var j = 0; j < $("video").length; j++) {
            $("video")[j].pause();
        }
    }
}
//预览文件
function checkFile(thisImg) {
    var downLink = '';
    var URL = window.location.href;
    var URL = window.location.href.split("/");
    var url0 = URL[0];
    var urln = URL[URL.length - 2];
    var url = url0 + "//" + urln;
    downLink = $(thisImg).attr("imgSrc");
    if (downLink.indexOf("file:") < 0) {
        var urim = downLink.split("\\");
        downLink = urim.join("/");
    } else {
        downLink = baseAddress + "$$" + downLink;
    }
    var href = url + "/" + downLink + "?utf8=1";
    window.open(href, "_blank", "toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=400, height=400");
    //$(thisImg).attr("href",href);
}
//编辑网页模板时将模板中和cookie中的数据取出
function editNet(thisnet) {
    $(".addContent").html("");
    $(".shadowDiv").css("display", "block");

    $(".addContent").html("");
    $(".addUrlContent input[type=text]").val("");
    modelArray = [];
    contentArray = [];
    positions = [];
    var str = "";
    var j = 0;
    var selectStr = "<option></option>";
    var selecturlStr = "<option></option>";
    var taskID = "";
    var url = "";
    var contentName="";
    for (var i = 0; i < $(".swiper-slide-active li").length; i++) {
        if ($(".swiper-slide-active li").eq(i).find(".sdelectPlay img").attr("showflag") == "flag") {
            taskID = $(".swiper-slide-active li").eq(i).attr("taskid");
            url = $(".swiper-slide-active li").eq(i).find(".thumbnailImg").attr("imgsrc");
            contentName = $(".swiper-slide-active li").eq(i).find(".thumbnailImg").attr("imgsrc").split("$$")[1];
        }
    }
    $(".shadowContent").attr("taskID", taskID);    
    $(".shadowContent").attr("contentName", contentName);
    $.ajax({
        //url:"/"+url+"?utf8=1",
        url: "/" + url,
        dataType: "html",
        scriptCharset: 'GBK',
        type: "GET",
        success: function (data) {
            for (var i = 0; i < $(data).length; i++) {
                if ($($(data)[i]).html() != undefined) {
                    if ($($(data)[i]).html().indexOf("<!--($[0---@1@") >= 0) {
                        searchSubStr($($(data)[i]).html(), "<!--($[0---@1@");
                        for (; j < positions.length; j++) {
                            modelArray.push($($(data)[i]).html().indexOf(">", positions[j]));
                            contentArray.push($($(data)[i]).html().slice(parseInt(positions[j] + 15), modelArray[j]));
                            if (j == 0) {
                                str = "<p><span style='display:block;width:30%;float:left;'>" + contentArray[j] + "：</span><textarea type='text' class='inputText' tabindex ='0' rows='3' style='resize:none'></textarea><select style='height:32px;'></select><span class='cleartext' style='width:20px;display:none;'><img src='images/newSource/clear.png' /></span></p>";
                            } else {
                                str = "<p><span style='display:block;width:30%;float:left;'>" + contentArray[j] + "：</span><input type='text' class='inputText' tabindex ='0'/><select></select><span class='cleartext' style='width:20px;display:none;'><img src='images/newSource/clear.png' /></span></p>";
                            }
                            $(".addContent").append(str);
                            //将cookie中的数据取出并放在select中，窗口号和网址都是如此

                            getNetCookie(contentArray[j], j);
                        }
                    }
                }
            }
            $(".addContent").append("<p><span>窗口号：</span><input type='text' class='inputText windowsNum' tabindex ='0' placeholder='例：0-全屏窗口' style='width:43%;'/><select></select><span class='cleartext' style='width:20px;display:none;'><img src='images/newSource/clear.png' /></span></p>");
            styleContent();
            otherCookieName("窗口号", ".windowsNum", selectStr);
            otherCookieName("网址", ".inNetAddress", selecturlStr);
            $(".submitnet").val("提交");
            $(".yulanBtn").val("预览");
            $(".submiturl").val("提交网址");
            $(".yulanurl").val("预览网页");
            $(".inputText").keydown(function () {
                $(this).siblings(".cleartext").css("display", "block");
            })
            $(".inputText").keyup(function () {
                if ($($(this)).val() == "") {
                    $(this).siblings(".cleartext").css("display", "none");
                }

            })
            $(".cleartext").click(function () {
                $(this).siblings(".inputText").val("");
                if ($(this).siblings(".inputText").val() == "") {
                    $(this).css("display", "none");
                }
            })
            //点击select标签时将select的数据填充到当前的input中
            $("select").change(function () {
                changeWindows(this);
            })
            $(".shadowDiv").css("marginTop", ($("body").height() - $(".shadowDiv").height()) / 2);
            $(".urlContent").css("marginTop", ($(".shadowDiv").height() - 30 - $(".shadowDiv").height() * 0.5 - $(".urlContent").height()) / 2);
            $(".shadowDiv").css("marginLeft", ($("body").width() - $(".shadowDiv").width()) / 2);
        }
    })
}
//将查找到关键字所在的位置存储到cookie中
function searchSubStr(str, subStr) {
    var pos = str.indexOf(subStr);
    while (pos > -1) {
        positions.push(pos);
        pos = str.indexOf(subStr, pos + 1);
    }
}
//将数据从cookie中读取，并加入到select中
function getNetCookie(cookieName, i) {
    if ($.cookie("'" + encodeURI(cookieName + "：") + "'") != "" && $.cookie("'" + encodeURI(cookieName + "：") + "'") != null) {
        var cookiename = $.cookie("'" + encodeURI(cookieName + "：") + "'");
        var name = $.cookie("'" + encodeURI(cookieName + "：") + "'");
        var selectStr1 = "<option></option>";

        for (var h = 0; h < decodeURI(name).split(",").length; h++) {
            var newSelectStr = decodeURI(name).split(",")[h];
            if (i == 0) {
                if (decodeURI(name).split(",")[h].indexOf("<br>") >= 0) {
                    var reg = new RegExp('<br>', "g");
                    var newstr1 = decodeURI(name).split(",")[h].replace(reg, '\n');
                    newSelectStr = newstr1;
                }
            }
            selectStr1 += "<option value='" + newSelectStr + "'>" + newSelectStr + "</option>";
        }
        $(".inputText").eq(i).siblings("select").html(selectStr1);

    }
}
function otherCookieName(cookieName, className, selectStr1) {
    if ($.cookie("'" + encodeURI(cookieName) + "'") != "" && $.cookie("'" + encodeURI(cookieName) + "'") != null) {
        var windowsName = $.cookie("'" + encodeURI(cookieName) + "'");
        for (var i = 0; i < decodeURI(windowsName).split(",").length; i++) {

            selectStr1 += "<option value=" + decodeURI(windowsName).split(",")[i] + ">" + decodeURI(windowsName).split(",")[i] + "</option>";
        }
        $(className).siblings("select").html(selectStr1);

    }
}
//将所有的数据提交，并存入cookie
function submitnet() {
    var str = '';
    var taskID = $(".shadowContent").attr("taskID");
    var itemType = "1004";
    var contentName = $(".shadowContent").attr("contentName");
    var win = "";
    //存储各个关键词的cookie
    for (var i = 0; i < $(".addContent .inputText").length; i++) {
        var arrys = [];
        if ($.cookie("'" + encodeURI($(".addContent .inputText").eq(i).prev().html()) + "'") != null) {
            if ($.cookie("'" + encodeURI($(".addContent .inputText").eq(i).prev().html()) + "'").indexOf(",") >= 0) {
                var arrysx = $.cookie("'" + encodeURI($(".addContent .inputText").eq(i).prev().html()) + "'").split(",");
                //arrys.push(arrysx);
                arrys = arrysx;
            } else {
                arrys.unshift($.cookie("'" + encodeURI($(".addContent .inputText").eq(i).prev().html()) + "'"));
            }
        }
        //若当前关键词不是窗口号并且关键词不是null时就将当前关键词和关键词的value存入cookie,最多能保存三个值，多于三个值删时间最早的那一条
        if ($(".addContent .inputText").eq(i).val() !== "" && $(".addContent .inputText").eq(i).val() !== null) {
            if ($(".addContent .inputText").eq(i).prev().html() != "窗口号：") {
                //var arrys="arr"+i;
                if (i == 0) {
                    if ($(".addContent .inputText").eq(i).val().indexOf("\n") >= 0) {
                        var reg = new RegExp('\n', "g");
                        var newstr = $(".addContent .inputText").eq(i).val().replace(reg, '<br>');
                        $(".addContent .inputText").eq(i).val(newstr);
                    }
                }
                str += "<" + $(".addContent .inputText").eq(i).prev().html().split("：")[0] + ">" + $(".addContent .inputText").eq(i).val() + "</" + $(".addContent .inputText").eq(i).prev().html().split("：")[0] + ">";

                if ($.cookie("'" + encodeURI($(".addContent .inputText").eq(i).prev().html()) + "'") != null) {
                    if ($.cookie("'" + encodeURI($(".addContent .inputText").eq(i).prev().html()) + "'").indexOf(",") >= 0) {
                        if (arrys.length >= 5) {
                            arrys.pop();
                        }
                    }
                }
                if (arrys.includes(encodeURI($(".addContent .inputText").eq(i).val())) || $(".addContent .inputText").eq(i).val() == "") {
                } else {
                    if (i == 0) {
                        if ($(".addContent .inputText").eq(i).val().indexOf("\n") >= 0) {
                            var reg = new RegExp('\n', "g");
                            var newstr = $(".addContent .inputText").eq(i).val().replace(reg, '<br>');
                            $(".addContent .inputText").eq(i).val(newstr);
                        }
                    }
                    arrys.unshift(encodeURI($(".addContent .inputText").eq(i).val()));
                }
                $.cookie("'" + encodeURI($(".addContent .inputText").eq(i).prev().html()) + "'", arrys, { path: "/", expiress: 1, sucue: true });
            } else {
                win = $(".addContent .inputText").eq(i).val();
            }
        }
    }
    //关键和网址最多能存储10条数据，其余的方式同上
    if ($.cookie("'" + encodeURI("窗口号") + "'") != null) {
        if ($.cookie("'" + encodeURI("窗口号") + "'").indexOf(",") >= 0) {
            if (windowsArr.length >= 10) {
                windowsArr.pop();
            }
        }
    }
    if (windowsArr.includes(encodeURI(win)) || win == "") {
    } else {
        windowsArr.unshift(encodeURI(win));
    }
    $.cookie("'" + encodeURI("窗口号") + "'", windowsArr, { path: "/", expiress: 1, sucue: true });
    if (str != "") {
        $.ajax({
            url: "/wpsendclientmsg.asp?wpsendclientmsg=76_-starttemptask <id>" + taskID + "</id><sunt>99</sunt><des>" + str + "</des><url> -t</url><ttype>1004</ttype><dur>432000</dur><win>" + win + "</win><wstate>100</wstate><bpic>" + contentName + "</bpic>&utf8=1",
            dataType: "text",
            type: 'GET',
            success: function () {

            },
            error: function () {
            }
        });
    }
    $(".shadowDiv").css("display", "none");
}
//预览模板网页
function privewnet() {
    var str = '';
    var taskID = $(".shadowContent").attr("taskID");
    var itemType = "1004";
    var contentName = $(".shadowContent").attr("contentName"); for (var i = 0; i < $(".addContent input").length; i++) {
        if ($(".addContent input").eq(i).prev().html() != "窗口号：") {
            str += "<" + $(".addContent input").eq(i).prev().html().split("：")[0] + ">" + $(".addContent input").eq(i).val() + "</" + $(".addContent input").eq(i).prev().html().split("：")[0] + ">";
        } else {
            win = $(".addContent input").eq(i).val();
        }
    }
    var url = "allFile/net/wppreviewmodel.asp?wppreviewmodel=<id>" + taskID + "</id><des>" + str + "</des><url>" + contentName + "</url><ttype>1004</ttype><dur>30</dur><win>" + win + "</win><wstate>100</wstate>&utf8=1";
    window.open(url, "_blank", "toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=400, height=400");
}
//提交网址
function submiturl() {
    var str = '';
    var taskID = $(".shadowContent").attr("taskID");
    var itemType = "1004";
    var neturl = "";
    var urlWin = "";
    var netURL = $(".addUrlContent").find(".inputText").val();
    if ($.cookie("'" + encodeURI("网址") + "'") != null) {
        if ($.cookie("'" + encodeURI("网址") + "'").indexOf(",") >= 0) {
            if (urlArr.length >= 10) {
                urlArr.pop();
            }
        }
    }
    if (urlArr.includes(encodeURI(netURL))) {
    } else {
        urlArr.unshift(encodeURI(netURL));
    }

    $.cookie("'" + encodeURI("网址") + "'", urlArr, { path: "/", expiress: 1, sucue: true });
    if ($(".windowsNum").val() != "") {
        urlWin = $(".windowsNum").val();
    } else {
        urlWin = "0-全屏窗口";
    }
    if ($(".inputText").val().indexOf("://") >= 0) {
    } else {
        netURL = $('input:radio[name="prefix"]:checked').val() + $(".addUrlContent p input").val();
    }
    styleContent();
    //if(str!=""){
    $.ajax({
        url: "/wpsendclientmsg.asp?wpsendclientmsg=76_-starttemptask <id>" + taskID + "</id><sunt>99</sunt><des></des><url>" + netURL + " -t</url><ttype>1004</ttype><dur>432000</dur><win>" + urlWin + "</win><wstate>100</wstate>&utf8=1",
        dataType: "text",
        type: 'GET',
        success: function () {

        },
        error: function () {
        }
    });
    //}
    $(".shadowDiv").css("display", "none");

}
//预览网址
function privewurl() {
    window.location.href = $(".addUrlContent").find(".inputText").val();
}
//将select选择好的值添加到当前的input中
function changeWindows(thisWindows) {
    $(thisWindows).prev().val($(thisWindows).val());
    var options = $(thisWindows).find("option:selected");
    var optionsValue = options.val();
    if (optionsValue != "undefined" && optionsValue != "") {
        $(thisWindows).prev().val(optionsValue);
    } else {
        $(thisWindows).prev().val("");
    }

}
//点击获取文件夹中的内容
function clickFolder(thispath) {
    imagePath = $(".logo").attr("subpath") + $(thispath).attr("pathsrc");
   // $(thispath).siblings().removeClass("currentFolder");
    //$(thispath).addClass("currentFolder");
    saveCurrentCookie = imagePath;
    getData("", $(".classFloder").attr("typevalue"), imagePath);
}
//返回上一层目录
function gobefore(thisClass) {
    //目录的最后肯定带有"\"
   lastPath = $(".logo").attr("subpath");

    if (lastPath != "" && lastPath != undefined) {
        var firstPath = lastPath.split("\\");

        if (firstPath.length > 2) {
            lastPath = lastPath.substring(0, lastPath.length - firstPath[firstPath.length - 2].length - 1);
        } else {
            lastPath = "";
        }
        saveCurrentCookie = "";
        getData("", $(".classFloder").attr("typevalue"), lastPath);
    }

}
//点赞
function addBang(thisname, status) {
    var thisnameArr = $(thisname).parent().attr("bangTitle");
    thisnameArr = thisnameArr.replace("\\", "/");
    $.ajax({
        url: "wpgradeit.asp?wpgradeit=" + thisnameArr + "&utf8=1&xml=1&type=3&oper=" + status,
        type: "get",
        dataType: "xml",
        success: function (data) {
            var yesCount = 0;
            var noCount = 0;
            if ($(data).find("tdi").text().indexOf("200") >= 0) {
                var yesCountArr = $(data).find("tdi").text().split("_");
                yesCount = yesCountArr[1].split("yes")[1];
                noCount = yesCountArr[2].split("no")[1];
                if (status == "yes") {
                    $(thisname).find(".okCount").html(yesCount);
                    $(thisname).next().find(".noCount").html(noCount);
                } else if (status == "no") {
                    $(thisname).find(".noCount").html(noCount);
                    $(thisname).prev().find(".okCount").html(yesCount);
                }

            } else if ($(data).find("tdi").text().indexOf("302") >= 0) {
                alert("您已经评价过此内容！1天只可评论1次");
            }

        }, error: function (a, b, c) {
            console.log(a, b, c);
        }
    })
}

