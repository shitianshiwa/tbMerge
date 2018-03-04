// ==UserScript==
// @name        贴吧合并功能增强
// @namespace   https://github.com/52fisher/tbMerge
// @author		投江的鱼
// @version     2.7.3
// @description 适用于贴吧合并吧标准申请格式,兼容部分非标准格式内容
// @include     http://tieba.baidu.com/p/*
// @include     https://tieba.baidu.com/p/*
// @updateURL    https://github.com/52fisher/tbMerge/raw/master/js/tbMerge.user.js
// @downloadURL    https://github.com/52fisher/tbMerge/raw/master/js/tbMerge.user.js
// @supportURL	https://github.com/52fisher/tbMerge/issues
// @grant       GM_addStyle
// ==/UserScript==
;(function() {
    var tbMerge={
        isDebug:false,
        initOK:false,
        init:function(){
            if(PageData.forum.forum_name !== '贴吧合并' || !PageData.is_thread_admin) return tbMerge.initOK=false;
            try{
                GM_addStyle('.tbyuhb{font-weight:400;color:#000} .alert{min-height: 60px;max-width: 800px;margin: 0 auto;text-align: left;padding: 10px;background: #d9edf7;border-color: #bce8f1;} .attention{font-weight: 600;color: #D9534F;} .alert::-webkit-scrollbar{display:none} .attention{width:100%;text-align:left;padding:10px;overflow-y:scroll}.tbyuhb .alert{width:60%;overflow:hidden}.tbyuhb .attention:before{content:"注意";font-weight:600;color:#D9534F}.tbyuhb .close-tip{float:right;display:inline;margin-top:-14px;border:1px solid #09C;border-radius:18px;font-size:15px;margin-right:-14px;color:#fff;width:20px;background:#09C;cursor:default;text-indent:0;text-align:center}.green{color:#0c9}.tb_agree,.tb_move{font-size:16px}.left{text-align:left!important}.tbyuhb table{margin:1em auto;table-layout:fixed;border:1px solid #cad9ea;border-spacing:0}.tbyuhb td{border-left:1px solid #cad9ea;padding:10px;text-align:center}.tbyuhb table tr{border-top:1px solid #cad9ea}.tbyuhb table tr th{text-align:center;font-weight:400;width:60px}.tbyuhb table tr:nth-child(odd){background:#EAF4F6}.tbyuhb table tr:nth-child(even){background:#FFF}.tbyuhb ._tip{color:#000;width:50%;margin-top:1em;margin-left:1em}.tbyuhb .cx_tip{color:#fff;padding:.5em;width:5em;font-size:1em;background:#2D2B2B;border:1px solid #B0A6A7;box-shadow:1px 1px 1px #A2A0A0;border-radius:.3em;text-align:center}.tbyuhb .manager a{display:block}.tbyuhb .barname{display:inline-block;margin:0 4px}.tbyuhb .red{color:red}.tbyuhb img{width:60px;height:60px}.tbyuhb .manager{display:inline-block;height:70px;overflow:hidden;margin:5px}.tbyuhb .user_name{color:#A652D9;font-size:.8em;text-decoration:none;border:1px solid rgba(0,0,0,.2);background:#fff;position:relative;bottom:22px;padding:2px 4px;text-align:center;width:52px;height:16px}.tbyuhb .sign_info{color:#55A2CE;float:left;padding-top:.5em;padding-left:8%;text-align:left}.tbyuhb .count{font-size:.8em;color:#000!important}@media screen and (min-width:960px) and (max-width:1199px){.tbyuhb td,.tbyuhb th{font-size:1em}}@media screen and (min-width:768px) and (max-width:959px){.tbyuhb td,.tbyuhb th{font-size:.8em}.tbyuhb .cx_tip{width:5em;font-size:.8em}}@media only screen and (min-width:480px) and (max-width:767px){.tbyuhb .cx_tip{width:5em;font-size:.8em}}@media only screen and (max-width:479px){.tbyuhb td,.tbyuhb th{font-size:12px!important}.tbyuhb .cx_tip{margin-top:1em;width:5em;font-size:.8em}}');
            }catch(e){
                console.log("GM_addStyle未生效："+e.message+"加载B方案");
                $("head").append('<link rel="stylesheet" type="text/css" href="https://raw.githubusercontent.com/52fisher/tbMerge/master/css/tbMerge.css" />');
            }
            $('#lzonly_cntn').before('<a href="javascript:void(0);" id="tbMerge" class="btn-sub btn-small">合并查询</a>');
            $('.d_post_content:eq(0)').prepend('<p id="checkTips" style="display:none;color:red;font-size:18px;">查询中，请稍候！</p><p id="doneTips" style="display:none;color:red;font-size:18px;">查询成功，请<a href=\'javascript:void(0);\' onclick=\'$(document).scrollTop($(".tbyuhb").offset().top-120)\'>查看结果！</a></p><p id="errTips" style="display:none;color:red;font-size:18px;">该贴不符合贴吧合并吧申请格式要求！</p>').append('<div id="checkResult"></div>');
            $(document).on("click","#tbMerge",function(){
                tbMerge.check();
            });
            return tbMerge.initOK=true;
        },check:function(){
            //show check tips
            $("#doneTips").hide();
            $("#errTips").hide();
            $("#checkTips").show();
            // remove tb_*
            $("span[class^=tb]").remove();
            //rule of regex
            var regexRule=/将(.*?)吧?合并[至到入][ ]*?(\S+?)[ ]*?吧/,
                delBar = /吧[、 ,，;和及]/ug,
                delSign = /["“”　【】「」]+/g,
                formatCheck = {
                isAgreed:{
                    name:"吧主",
                    pattern:"是否已与各吧吧主",
                    rule :/是否.*?达成一致意见[：:].{0,8}是[^否]/,
                    rmsucc:"<span class=\"tb_agree green\">[通过]</span>是否已与各吧吧主",
                    rmfailed:"<span class=\"tb_agree red\">[未通过]</span>是否已与各吧吧主"
                },
                isMoved:{
                    name:"转移",
                    pattern:"是否已经转移",
                    rule:/是否.*?转移需要保留的内容[：:].{0,8}是/,
                    rmsucc:"<span class=\"tb_move green\">[通过]</span>是否已经转移",
                    rmfailed:"<span class=\"tb_move red\">[未通过]</span>是否已经转移"
                }};

            // get content or title
            try{
                var contentText = $('.d_post_content:eq(0)').text().replace(delSign,''),
                    contentHTML = $('.d_post_content:eq(0)').html(),
                    titleText = $("h3.core_title_txt").text().replace(delSign,''),
                    strRegex = contentText.match(regexRule)||titleText.match(regexRule);
            }catch(e){
                var strRegex ='';
                console.log("合并规则产生名单错误:\n"+e.message+"\n");
                $.dialog.assert("合并规则产生名单错误:\n"+e.message+"\n",{
                    title:"警告"
                });
            }
            //format check
            if(tbMerge.isEmpty(strRegex)){
                $("#checkTips").hide();
                $("#errTips").show();
                return ;
            }
            var merge = strRegex[1].replace(delBar,',').trim(),
                keep = strRegex[2].trim();
            tbMerge.isDebug?console.log("被合并吧："+merge+", 保留吧："+keep):null;
            //format check
            for ( var i in formatCheck){
                if(contentHTML.match(formatCheck[i].rule)){
                    contentHTML = contentHTML.replace(formatCheck[i].pattern, formatCheck[i].rmsucc);
                    tbMerge.isDebug?console.log(formatCheck[i].name + "通过"):null;
                    $('.d_post_content:eq(0)').html(contentHTML);
                    continue;
                }
                if(contentHTML.match(i.pattern)){
                    contentHTML = contentHTML.replace(formatCheck[i].pattern, formatCheck[i].rmfailed);
                    $('.d_post_content:eq(0)').html(contentHTML);
                    tbMerge.isDebug?console.log(formatCheck[i].name+"拒绝"):null;
                    continue;
                }
                $("#errTips").show();
            }
            tbMerge.postData(merge,keep);
        },fastReply:function(){
            if(tbMerge.initOK === false) return ;
            var e= ['楼主好，初审通过，请耐心等待第二次审核，谢谢', '楼主好，请您联系申请贴吧合并中涉及到的贴吧吧主（非实习吧主）来本吧按照格式发贴申请，谢谢', '楼主好，请您联系吧主 来此贴表明同意合并，谢谢', '楼主好，您申请合并的贴吧贴吧名称含义不一致，故不能合并，抱歉', '楼主好，您申请合并的贴吧贴吧名称属性不单一，故不能合并，抱歉', '楼主好，由网友或吧友自行组建的具有俱乐部性质的贴吧，不予合并，抱歉', '楼主好，具有人身攻击、商业、黄色等性质的贴吧，不开放合并，抱歉', '楼主好，您申请合并的 吧贴吧UV较高，故不能合并，抱歉', '楼主好，个人贴吧不开放贴吧合并功能，抱歉', '楼主好，请提供相应的官方网站链接来证明一下申请中的贴吧名称含义相同，百度百科和贴子论坛不能证明，谢谢', '楼主好，为了避免误伤其它姓氏的姓名，姓名全称和去掉姓氏的简称不开放贴吧合并功能，抱歉。', '您好，您的申请此前已处理，请查看上贴工作人员回复结果，勿重复发帖，谢谢', '您好，请您先将 吧发展好再来申请，谢谢', '您好， 吧尚有候选吧主待处理，待候选吧主完成审批后才可进行下一步的合并。如候选吧主上任，请您联系该吧主来此帖表明同意合并，请问是否候选吧主处理完成?跟帖回复即可', '楼主好，由于您的标题较长无法显示完整建议您用“以下贴吧”等字眼概括，但是内容需要清楚详细，请修改资料后重新发贴申请，谢谢','楼主好，由于您的申请较多，请您用“以下贴吧”等字眼概括所有内容至同一贴内，但是内容需要清楚详细，请修改资料后重新发贴申请，谢谢', '楼主好，由于您的申请标题与内容不一致，故请修改资料后重新发贴申请，谢谢', '楼主好，由于 吧贴子数量较多并且贴子质量较高、贴吧发展比较完善，故需要进行反向合并，将 吧合并至 吧。如果您不同意反向合并，那请先把 吧发展好，如多在该吧发些利于建设的贴子，成功提交贴吧分类并开通贴吧功能，谢谢', '楼主好，如果已经与所有现任吧主意见达成一致，请在“是否已与现任吧主达成一致意见”后填写“是”，这样才可以进行下一步的合并。请问是否已与现任吧主达成一致意见？跟帖回复即可。', '楼主好，如果没有需要保留的贴子或已经转移完需要保留的贴子，请在“是否已转移需要保留的内容”后填写“是”，这样才可以进行下一步的合并。请问保留内容工作是否已经完成？跟帖回复即可。', '楼主好，如果已经发送相关文件至官方邮箱，请您在“是否有发送相关文件至百度官方邮箱”下回复“是”，这样才可以进行下一步的合并，请问是否有发送相关文件至百度官方邮箱？跟贴回复即可', '楼主好，请您按照正确的格式重新发贴申请：<br>贴子标题：<br>[]申请将 吧合并至 吧（申请将“以下贴吧”合并至xx吧）<br>贴子内容：<br>申请将 吧合并至 吧。<br>是否已与各吧吧主协商达成一致意见：（是或否）<br>是否已经转移需要保留的内容：（是或否）<br>申请贴吧合并的原因：（此项为必填写项，填写此项有助于提高您的申请处理进度）<br>被合并贴吧链接：（此项为必填写项，填写此项有助于提高您的申请处理进度 ）<br>合并保留贴吧链接：（此项为必填写项，填写此项有助于提高您的申请处理进度 ）', '楼主好，不同版本的游戏、电影等事物的贴吧不开放贴吧合并功能，抱歉', '楼主好，如需要修改申请资料，请您重新按照格式发贴，谢谢', '楼主好，学校类贴吧简称不开放合并。','楼主好，学校类贴吧合并规则变更，请您根据最新要求发送相关材料至官方邮箱，如您已经发送相关文件，请您在“是否有发送相关文件至百度官方邮箱”后填写“是”，这样才可以进行下一步的合并.请问是否有发送相关文件至百度官方邮箱？跟帖回复即可。详情请查阅：<br>标题：【公告】关于学校类贴吧合并拆分申请要求须知<br>链接：https://tieba.baidu.com/p/5252738431',"亲爱的吧友，我们已经收到您反馈的信息，并在下次二审时反馈至相关管理员处，在此期间请您耐心等候，为您带来不便请您谅解，谢谢."];
            if (PageData.user.vipInfo.v_status == 0){
                var r={};
                r[PageData.user.id] = e;
                n = $.json.encode(r);
                //localStorage
                $.tb.Storage.set("user_quick_reply_data", n);
                console.log("fastReply Method First start");
                return ;
            }
            var b= '<div class="fast-quick-reply" style="height:300px;overflow-y:scroll"><div class="fast-reply-item">'+e.join('</div><div class="fast-reply-item">')+'</div></div>';
            $(".tbui_fbar_post").after('<li class="tbui_aside_fbar_button tbui_fbar_fast"><a href="javascript:void 0;">快速回贴</a></li>');
            $(document).on("click",'.tbui_fbar_fast',function() {
                $.dialog.open(b, {
                    width: 610,
                    height: 300,
                    modal: 0,
                    title: '快速回贴',
                    scrollable: true
                });
                $('.fast-reply-item').css({
                    width: '520px',
                    border: '1px solid #ccc',
                    padding: '15px 20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    wordWrap: 'break-word',
                    marginBottom: "10px"
                }).hover(function() {
                    $(this).css("backgroundColor", "#e8e8fd");
                }, function() {
                    $(this).css("backgroundColor", "#fff");
                }).click(function() {
                    $("#ueditor_replace").append($(this).text());
                    $.dialog.close();
                });
            });
            console.log("fastReply Method Second start");
        },postData: function (merge,keep){
            $.ajax({
                url:'https://hb.52fisher.cn/api-hb',
                data:{
                    merge: merge,
                    keep: keep
                },
                type:"POST",
                timeout:"10000",
                error : function(xhr,textStatus){
                    tbMerge.isDebug?console.log('error:'+textStatus):null;
                    if(textStatus=='timeout'){
                        $.dialog.confirm("好像网络有些拥堵，导致访问超时，是否再试一次?",{
                            width: 300,
                            title: '访问超时',
                            modal: 0
                        }).bind('onaccept', function () {
                            tbMerge.postData(merge,keep);
                        });
                        return;
                    }
                    $.dialog.alert("服务器打了个盹："+ extStatus);
                },success:function(e){
                    $('#checkResult').html(e);
                    $("#checkTips").hide();
                    $('#doneTips').show();
                }
            });
        },
        isEmpty:function(e){
            return e === null || e === undefined || e == '';
        },debug:function(){
            return this.isDebug = true;
        },copy:function(){
            $(".l_posts_num:first").after('<button id="copy" class="ui_btn ui_btn_m">复制</button>');
            $(document).on("hover","#c2c",function(){
                var e = document.getElementById("c2c");
                if (document.selection) {
                    // for IE
                    var r = document.body.createTextRange();
                    r.moveToElementText(e);
                    r.moveEnd("character");
                    r.select();
                } else {
                    // For others
                    var s = window.getSelection();
                    var r = document.createRange();
                    r.selectNode(e);
                    s.addRange(r);
                }
            });
            $("#copy").click(function(){
                var e = '<textarea onmouseover="this.select()" style="outline:none;resize:none;width:100%;height:80px;border: none;">'+'标题：'+PageData.thread.title+'\n链接：'+location.href.split(/[#\?$]/)[0]+'</textarea>';
                $.dialog.alert(e,{
                    width:300,
                    padding:10,
                    title: "请按 CTRL+C 复制"
                });
            });
            tbMerge.isDebug?console.log("copy start"):null;
        }
    };
    tbMerge.init();

})()
