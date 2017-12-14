// ==UserScript==
// @name        贴吧合并功能增强
// @namespace   https://github.com/52fisher/tbMerge
// @author		投江的鱼
// @version     2.1
// @description 仅适用于贴吧合并吧标准申请格式
// @include     http://tieba.baidu.com/p/*
// @include     https://tieba.baidu.com/p/*
// @updateURL    https://github.com/52fisher/tbMerge/raw/master/js/tbMerge.user.js
// @supportURL	https://github.com/52fisher/tbMerge/issues
// @grant       none
// ==/UserScript==
;(function() {
    var tbMerge={
        init:function(){
            if(PageData.forum.forum_name !== '贴吧合并'&& !PageData.is_thread_admin) return ;
            GM_addStyle('.tbyuhb td{border-left:1px solid #cad9ea;padding:10px 10px}.tbyuhb table tr td:nth-child(1){background:#444;color:#fff;border-top:#BEBFC3;text-align:center;width:10%}.tbyuhb table tr:nth-child(odd){background:#EAF4F6}.tbyuhb table tr:nth-child(even){background:#FFF}.tbyuhb .tab{margin:1em auto;table-layout:fixed;border:1px solid #cad9ea}.tbyuhb ._tip{color:#000;width:50%;margin-top:1em;margin-left:1em}.tbyuhb .cx_tip{color:#fff;padding:.5em;width:5em;font-size:1em;background:#2D2B2B;border:1px solid #B0A6A7;box-shadow:1px 1px 1px #A2A0A0;border-radius:.3em;text-align:center}.tbyuhb a{display:block;margin-left:5%;margin-right:5%}.tbyuhb .barname{display:inline-block;margin:0 4px}.tbyuhb .red{color:red}.tbyuhb img{display:block;width:60px;height:60px}.tbyuhb .member_wrap.clearfix{margin-top:1em}.tbyuhb .member{display:inline-block}.tbyuhb .user_name{color:#A652D9;font-size:.8em;text-decoration:none;border:1px solid #fff;box-shadow:1px 1px 5px #000;background:#fff;position:relative;bottom:22px;padding:2px 4px;left:4px}.tbyuhb .copy{left:190px;background:#5cb85c none repeat scroll 0 0;color:#fff;padding:2px 8px;border-radius:5px;box-shadow:2px 2px 4px rgba(0,0,0,.2);margin-top:-10px;margin-bottom:10px;position:relative}.good,.tbyuhb .num{text-align:left;margin-left:25%}.tbyuhb .info{color:#55A2CE;float:left;padding-top:.5em;padding-left:8%;text-align:left}.tbyuhb .count{font-size:.8em;color:#000!important}@media screen and (min-width:960px) and (max-width:1199px){.tbyuhb .user_name{font-size:.8em}}@media screen and (min-width:768px) and (max-width:959px){.tbyuhb img{padding-left:1em}.tbyuhb .user_name{font-size:.8em}.tbyuhb .cx_tip{width:5em;font-size:.8em}}@media only screen and (min-width:480px) and (max-width:767px){.tbyuhb .user_name{font-size:.8em}.tbyuhb .cx_tip{width:5em;font-size:.8em}}@media only screen and (max-width:479px){.tbyuhb .user_name{font-size:.7em}.tbyuhb .info{font-size:.7em}.num,.tbyuhb .good{font-size:.7em}.advice,.tbyuhb .dir{font-size:.9em}.tbyuhb .count{font-size:.7em}.tbyuhb .cx_tip{margin-top:1em;width:5em;font-size:.8em}}');
            tbMerge.isFastReply?$(".tbui_fbar_post").after('<li class="tbui_aside_fbar_button tbui_fbar_fast"><a href="javascript:void 0;">快速回贴</a></li>'):null;
            $('#lzonly_cntn').before('<a href="javascript:void(0);" id="tbMerge" class="btn-sub btn-small">合并查询</a>');
            $('.d_post_content:eq(0)').prepend('<p id="checkTips" style="display:none;color:red;font-size:18px;">查询中，请稍候！</p><p id="doneTips" style="display:none;color:red;font-size:18px;">查询成功，请<a href=\'javascript:void(0);\' onclick=\'$(document).scrollTop($(".tbyuhb").offset().top-120)\'>查看结果！</a></p><p id="errTips" style="display:none;color:red;font-size:18px;">该贴不符合贴吧合并吧申请格式要求！</p>').append('<div id="checkResult"></div>');
            $(document).on("click","#tbMerge",function(){
                tbMerge.check();
            });
        },check:function(){
            //show check tips
            $("#checkTips").show();

            var regexRule=/将(.*?)吧?合并[至到入][ ]*?(\S+?)[ ]*?吧/,
                isAgreed = /是否已与各吧吧主协商达成一致意见[：:].{0,8}是/,
                isMoved = /是否已经转移需要保留的内容[：:].{0,8}是/,
                delBar = /(?:吧[、 ,，;])|[和及]/ug,
                delSign = /["“”【】]+/g;

            // get content or title
            var contentText = $('.d_post_content:eq(0)').text().replace(delSign,''),
                contentHTML = $('.d_post_content:eq(0)').html(),
                titleText = $("h3.core_title_txt").text().replace(delSign,''),
                strRegex = contentText.match(regexRule)||titleText.match(regexRule);

            //format check
            if(tbMerge.isEmpty(strRegex)){
                tbMerge.isDebug?console.log(strRegex):null;
                $("#checkTips").hide();
                $("#errTips").show();
            }else{
                var merge = strRegex[1].replace(delBar,',').replace(/\s+/g,''),
                    keep = strRegex[2];
                //(contentHTML.match(isAgreed)||contentHTML.macth(isMoved))?$("#errTips").show():null;
                tbMerge.isDebug?console.log("被合并吧："+merge+", 保留吧："+keep):null;
                if(contentHTML.match(isAgreed)){
                    contentHTML = contentHTML.replace(/是否已与各吧吧主/, '<span style="color:#0C9;font-size:16px;">[通过]</span>是否已与各吧吧主');
                    $('.d_post_content:eq(0)').html(contentHTML);
                }else{
                    if(contentHTML.match(/是否已与各吧吧主/)){
                        contentHTML = contentHTML.replace(/是否已与各吧吧主/, '<span style="color:red;font-size:16px;">[未通过]</span>是否已与各吧吧主');
                        $('.d_post_content:eq(0)').html(contentHTML);
                    }else{
                        $("#errTips").show();
                    }
                }
                if(contentHTML.match(isMoved)){
                    contentHTML = contentHTML.replace(/是否已经转移/, '<span style="color:#0C9;font-size:16px;">[通过]</span>是否已经转移');
                    $('.d_post_content:eq(0)').html(contentHTML);
                }else{
                    if(contentHTML.match(/是否已经转移/)){
                        contentHTML = contentHTML.replace(/是否已经转移/, '<span style="color:red;font-size:16px;">[未通过]</span>是否已经转移');
                        $('.d_post_content:eq(0)').html(contentHTML);
                    }else{
                        $("#errTips").show();
                    }
                }
                tbMerge.postData(merge,keep);
            }
        },fastReply:function(){
            var reply = ['楼主好，初审通过，请耐心等待第二次审核，谢谢', '楼主好，请您联系申请贴吧合并中涉及到的贴吧吧主（非实习吧主）来本吧按照格式发贴申请，谢谢', '楼主好，请您联系吧主 来此贴表明同意合并，谢谢', '楼主好，您申请合并的贴吧贴吧名称含义不一致，故不能合并，抱歉', '楼主好，您申请合并的贴吧贴吧名称属性不单一，故不能合并，抱歉', '楼主好，由网友或吧友自行组建的具有俱乐部性质的贴吧，不予合并，抱歉', '楼主好，具有人身攻击、商业、黄色等性质的贴吧，不开放合并，抱歉', '楼主好，您申请合并的贴吧UV较高，故不能合并，抱歉', '楼主好，个人贴吧不开放贴吧合并功能，抱歉', '楼主好，请提供相应的官方网站链接来证明一下申请中的贴吧名称含义相同，百度百科和贴子论坛不能证明，谢谢', '楼主好，为了避免误伤其它姓氏的姓名，姓名全称和去掉姓氏的简称不开放贴吧合并功能，抱歉。', '您好，您的申请已处理，请勿重复发帖，谢谢', '您好，请您先将贴吧发展好再来申请，谢谢', '您好， 吧尚有候选吧主待处理，待候选吧主完成审批后才可进行下一步的合并。如候选吧主上任，请您联系该吧主来此帖表明同意合并，请问是否候选吧主处理完成?跟帖回复即可', '楼主好，由于您的标题较长无法显示完整建议您用“以下贴吧”等字眼概括，但是内容需要清楚详细，请修改资料后重新发贴申请，谢谢', '楼主好，由于您的申请标题与内容不一致，故请修改资料后重新发贴申请，谢谢', '楼主好，由于 吧贴子数量较多并且贴子质量较高、贴吧发展比较完善，故需要进行反向合并，将 吧合并至 吧。如果您不同意反向合并，那请先把 吧发展好，如多在该吧发些利于建设的贴子，成功提交贴吧分类并开通贴吧功能，谢谢', '楼主好，如果已经与所有现任吧主意见达成一致，请在“是否已与现任吧主达成一致意见”后填写“是”，这样才可以进行下一步的合并。请问是否已与现任吧主达成一致意见？跟帖回复即可。', '楼主好，如果没有需要保留的贴子或已经转移完需要保留的贴子，请在“是否已转移需要保留的内容”后填写“是”，这样才可以进行下一步的合并。请问保留内容工作是否已经完成？跟帖回复即可。', '楼主好，如果已经发送相关文件至官方邮箱，请您在“是否有发送相关文件至百度官方邮箱”下回复“是”，这样才可以进行下一步的合并，请问是否有发送相关文件至百度官方邮箱？跟贴回复即可', '楼主好，请您按照正确的格式重新发贴申请：<br>贴子标题：<br>[]申请将 吧合并至 吧（申请将“以下贴吧”合并至xx吧）<br>贴子内容：<br>申请将 吧合并至 吧。<br>是否已与各吧吧主协商达成一致意见：（是或否）<br>是否已经转移需要保留的内容：（是或否）<br>申请贴吧合并的原因：（此项为必填写项，填写此项有助于提高您的申请处理进度）<br>被合并贴吧链接：（此项为必填写项，填写此项有助于提高您的申请处理进度 ）<br>合并保留贴吧链接：（此项为必填写项，填写此项有助于提高您的申请处理进度 ）', '楼主好，不同版本的游戏、电影等事物的贴吧不开放贴吧合并功能，抱歉', '楼主好，如需要修改申请资料，请您重新按照格式发贴，谢谢', '楼主好，学校类贴吧简称不开放合并。','楼主好，学校类贴吧合并规则变更，请您根据最新要求发送相关材料至官方邮箱，详情请查阅：<br>标题：【公告】关于学校类贴吧合并拆分申请要求须知<br>链接：https://tieba.baidu.com/p/5252738431'],
                fast_reply = '<div class="fast-quick-reply" style="height:300px;overflow-y:scroll"><div class="fast-reply-item">'+reply.join('</div><div class="fast-reply-item">')+'</div></div>';
            //localStorage
            localStorage.user__quick__reply__data = '1513259839405|{"916452051":' + JSON.stringify(reply) + '}';
            $('.tbui_fbar_fast').click(function() {
                $.dialog.open(fast_reply, {
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
            return this.isFasetReply = true;
        },postData: function (merge,keep){
            $.ajax({
                url:'https://t.52fisher.cn/api/hb',
                data:{
                    merge: merge,
                    keep: keep
                },
                type:"POST",
                timeout:"8000",
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
                    }else{
                        $.dialog.alert("服务器打了个盹："+ extStatus);
                    }
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
        },isDebug:"false",isFastReply:"false"
    };
    tbMerge.init();
    tbMerge.fastReply();
})()
