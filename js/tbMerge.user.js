// ==UserScript==
// @name        贴吧合并功能增强
// @namespace   https://github.com/52fisher/tbMerge
// @author      投江的鱼
// @version     3.0.9
// @description 适用于贴吧合并吧标准申请格式,兼容部分非标准格式内容
// @include     http://tieba.baidu.com/p/*
// @include     https://tieba.baidu.com/p/*
// @updateURL    https://gitee.com/fisher52/tbMerge/raw/master/js/tbMerge.meta.js
// @downloadURL    https://gitee.com/fisher52/tbMerge/raw/master/js/tbMerge.user.js
// @supportURL  https://gitee.com/fisher52/tbMerge/issues
// @grant       GM_addStyle
// ==/UserScript==
;
(function() {
    var tbMerge = {
        isDebug: false,
        initOK: false,
        init: function() {
            if (PageData.forum.forum_name !== '贴吧合并' || !PageData.is_thread_admin) return this.initOK = false;
            try {
                GM_addStyle('.tbyuhb{font-weight:400;color:#000;font-size:14px;line-height:20px;} .alert{min-height: 60px;max-width: 800px;margin: 0 auto;text-align: left;padding: 10px;background: #d9edf7;border-color: #bce8f1;} .attention{font-weight: 600;color: #D9534F;} .alert::-webkit-scrollbar{display:none} .attention{width:100%;text-align:left;padding:10px;overflow-y:scroll}.tbyuhb .alert{width:60%;overflow:hidden}.tbyuhb .attention:before{content:"注意";font-weight:600;color:#D9534F}.tbyuhb .close-tip{float:right;display:inline;margin-top:-14px;border:1px solid #09C;border-radius:18px;font-size:15px;margin-right:-14px;color:#fff;width:20px;background:#09C;cursor:default;text-indent:0;text-align:center}.green{color:#0c9}.tb_agree,.tb_move{font-size:16px}.left{text-align:left!important}.tbyuhb table{margin:1em auto;table-layout:fixed;border:1px solid #cad9ea;border-spacing:0;width:100%}.tbyuhb td{border-left:1px solid #cad9ea;padding:10px;text-align:center}.tbyuhb table tr{border-top:1px solid #cad9ea}.tbyuhb table tr th{text-align:center;font-weight:400;width:60px}.tbyuhb table tr:nth-child(odd){background:#EAF4F6}.tbyuhb table tr:nth-child(even){background:#FFF}.tbyuhb ._tip{color:#000;width:50%;margin-top:1em;margin-left:1em}.tbyuhb .cx_tip{color:#fff;padding:.5em;width:5em;font-size:1em;background:#2D2B2B;border:1px solid #B0A6A7;box-shadow:1px 1px 1px #A2A0A0;border-radius:.3em;text-align:center}.tbyuhb .manager a{display:block}.tbyuhb .barname{display:inline-block;margin:0 4px}.tbyuhb .red{color:red}.tbyuhb img{width:60px;height:60px}.tbyuhb .manager{display:inline-block;height:70px;overflow:hidden;margin:5px}.tbyuhb .user_name{color:#A652D9;font-size:.8em;text-decoration:none;border:1px solid rgba(0,0,0,.2);background:#fff;position:relative;bottom:22px;padding:2px 4px;text-align:center;width:52px;height:16px}.tbyuhb .sign_info{color:#55A2CE;float:left;padding-top:.5em;padding-left:8%;text-align:left}.tbyuhb .count{font-size:.8em;color:#000!important}@media screen and (min-width:960px) and (max-width:1199px){.tbyuhb td,.tbyuhb th{font-size:1em}}@media screen and (min-width:768px) and (max-width:959px){.tbyuhb td,.tbyuhb th{font-size:.8em}.tbyuhb .cx_tip{width:5em;font-size:.8em}}@media only screen and (min-width:480px) and (max-width:767px){.tbyuhb .cx_tip{width:5em;font-size:.8em}}@media only screen and (max-width:479px){.tbyuhb td,.tbyuhb th{font-size:12px!important}.tbyuhb .cx_tip{margin-top:1em;width:5em;font-size:.8em}}');
            } catch (e) {
                console.log("GM_addStyle未生效：" + e.message + "加载B方案");
                $("head").append('<link rel="stylesheet" type="text/css" href="https://raw.githubusercontent.com/52fisher/tbMerge/master/css/tbMerge.css" />');
            }
            $('#lzonly_cntn').before('<a href="javascript:void(0);" id="tbMerge" class="btn-sub btn-small">合并查询</a>');
            $(".p_content:eq(0) cc").prepend('<p id="check-tips" style="display:none;color:red;font-size:18px;">查询中，请稍候！</p><p id="done-tips" style="display:none;color:red;font-size:18px;">查询成功，请<a href=\'javascript:void(0);\' onclick=\'$(document).scrollTop($(".tbyuhb").offset().top-120)\'>查看结果！</a></p><p id="err-tips" style="display:none;color:red;font-size:18px;"></p>').append('<div id="check-result"></div>');
            $(document).on("click", "#tbMerge", function() {
                tbMerge.check();
            });
            return this.initOK = true;
        },
        check: function() {
            //show check tips
            $("#done-tips").hide();
            $("#err-tips").empty().hide();
            $("#check-tips").show();
            // remove tb_*
            $("span[class^=tb]").remove();
            //rule of regex
            var regexRule = /(?:申?请(?!合并)[将把]?|[将把])+(.{1,90}?)吧?合并[至到入](.*?吧?.*?)吧/,
                delBar = /吧[、 ,，;和及与 ]+/ug,
                delSign = /(?:[^0-9a-zA-Z\u4e00-\u9fa5](?=合并))+|["“”\*　【】「」]+|(?:([^吧])[\f\v\t]+)/g,
                barlistsRule = /以下贴?|等.个贴?吧|等吧/,
                rm = {
                    rmsucc: "<span class=\"tb_agree green\">[通过]</span>",
                    rmfailed: "<span class=\"tb_agree red\">[未通过]</span>"
                },
                formatCheck = {
                    isAgreed: {
                        name: "吧主同意检测",
                        pattern: /是否.{1,10}达成一致.{0,8}[：:].{0,8}/,
                        rule: /是[^否]/,
                        must: true
                    },
                    isMoved: {
                        name: "贴子转移检测",
                        pattern: /是否.{0,6}转移.{1,9}[：:].{0,8}/,
                        rule: /是[^否]/,
                        must: true
                    },
                    isMailed: {
                        name: "校园邮件检测",
                        pattern: /是否[有已]?发送(?:相关)?文件.*?(?:<a.*?a>.*?)?[：:].{0,8}/,
                        rule: /是[^否]/,
                        must: false
                    }
                };
            // get content or title
            try {
                var contentText = $('.d_post_content:eq(0)').text().replace(delSign, '$1').toLowerCase(),
                    contentHTML = $('.d_post_content:eq(0)').html(),
                    titleText = $("h3.core_title_txt").text().replace(delSign, '$1').toLowerCase(),
                    strRegex = contentText.match(regexRule) || titleText.match(regexRule);
            } catch (e) {
                var strRegex = '';
                console.log("合并规则产生名单错误:\n" + e.message + "\n");
                $.dialog.assert("合并规则产生名单错误:\n" + e.message + "\n", {
                    title: "警告"
                });
            }
            //format check
            if (tbMerge.isEmpty(strRegex)) {
                $("#check-tips").hide();
                tbMerge.showerr();
                return;
            }
            //title should keep pace with content
            try {
                if (strRegex[0].match(barlistsRule)) {
                    tbMerge.showerr('被合并吧未正确填写');
                    return;
                }
                var tmp = titleText.match(regexRule);
                if (strRegex[1] != tmp[1] || strRegex[2] != tmp[2]) {
                    if (!titleText.match(barlistsRule)) {
                        tbMerge.isDebug ? console.log('标题: \n被合并吧:' + tmp[1] + '  保留吧:  ' + tmp[2]) : null;
                        tbMerge.isDebug ? console.log('申请: \n被合并吧:' + strRegex[1] + '  保留吧:  ' + strRegex[2]) : null;
                        tbMerge.showerr('该申请标题与内容不一致');
                        return;
                    }
                }
            } catch (e) {
                tbMerge.showerr('该申请标题不符合格式要求');
                tbMerge.isDebug ? console.log(e.message) : null;
            }
            if (PageData.power.reply_private_flag != 1) {
                tbMerge.showerr('申请人设置了评论权限', true);
            }
            var merge = strRegex[1].trim().replace(delBar, ','),
                keep = strRegex[2].trim();
            tbMerge.isDebug ? console.group("debug") : null
            tbMerge.isDebug ? console.log("被合并吧:" + merge + "\n保留吧:" + keep) : null;
            //format check
            for (var i in formatCheck) {
                var sub_match = contentHTML.match(formatCheck[i].pattern);
                if (!sub_match) {
                    tbMerge.isDebug ? console.log(formatCheck[i].name + ":未匹配") : null;
                    formatCheck[i]["must"] ? tbMerge.showerr() : null;
                    continue;
                }
                if (sub_match[0].match(formatCheck[i].rule)) {
                    contentHTML = contentHTML.replace(sub_match[0], rm.rmsucc + sub_match[0]);
                    tbMerge.isDebug ? console.log(formatCheck[i].name + ":通过") : null;
                    $('.d_post_content:eq(0)').html(contentHTML);
                    continue;
                }
                contentHTML = contentHTML.replace(sub_match[0], rm.rmfailed + sub_match[0]);
                $('.d_post_content:eq(0)').html(contentHTML);
                tbMerge.isDebug ? console.log(formatCheck[i].name + ":拒绝") : null;
                continue;
            }
            tbMerge.postData(merge, keep);
            // manager check
            var bz = '',
                flag = false;
            $.getJSON('/home/get/panel', {
                un: PageData.thread.author,
                ie: 'utf-8',
                _: Math.random() //nocache to get newest data of manager
            }, function(e) {
                if (e.no) {
                    tbMerge.isDebug ? console.warn('获取申请人吧主信息出错:Method first') : null;
                    return;
                }
                try {
                    for (var i in e.data.honor.manager.manager.forum_list) {
                        if (strRegex[0].match(e.data.honor.manager.manager.forum_list[i])) {
                            flag = true;
                            break;
                        }
                        bz = e.data.honor.manager.manager.forum_list.join(' ');
                    }
                    if (!flag && e.data.honor.manager.manager.count != e.data.honor.manager.manager.forum_list.length) {
                        //if count is inconsistent with length , Method second Starts
                        $.getJSON('/pmc/tousu/getRole', {
                            manager_uname: PageData.thread.author
                        }, function(e) {
                            if (e.errno) {
                                tbMerge.isDebug ? console.warn('获取申请人吧主信息出错:Method second') : null;
                                return;
                            }
                            for (var i in e.data.roles) {
                                flag = e.data.roles[i].forum_role == 'manager' && Boolean(strRegex[0].match(e.data.roles[i].forum_name));
                                if (flag) {
                                    bz = bz + ' ' + e.data.roles[i].forum_name;
                                    bz = bz + '(Method second)';
                                    tbMerge.isDebug ? console.log('申请人吧主检测:' + (flag ? '通过' : '拒绝')) : null;
                                    tbMerge.isDebug ? console.log('申请人所担任吧主:' + bz) : null;
                                    tbMerge.isDebug ? console.groupEnd() : null;
                                    !flag ? tbMerge.showerr('发贴人非相关贴吧吧主', true) : null;
                                    break;
                                }
                            }
                        });
                        return;
                    }
                    tbMerge.isDebug ? console.log('申请人吧主检测:' + (flag ? '通过' : '拒绝')) : null;
                    tbMerge.isDebug ? console.log('申请人所担任吧主:' + bz) : null;
                    tbMerge.isDebug ? console.groupEnd() : null;
                    !flag ? tbMerge.showerr('发贴人非相关贴吧吧主', true) : null;
                } catch (err) {
                    bz = '无';
                    tbMerge.isDebug ? console.warn(err.message) : null;
                }
            });
        },
        fastReply: function() {
            if (tbMerge.initOK === false) return;
            var e = ['楼主好，初审通过，请耐心等待第二次审核，谢谢', '楼主好，请您联系申请贴吧合并中涉及到的贴吧吧主（非实习吧主）来本吧按照格式发贴申请，谢谢', '楼主好，请您联系吧主 来此贴表明同意合并，谢谢', '楼主好，您申请合并的贴吧贴吧名称含义不一致，故不能合并，抱歉', '楼主好，您申请合并的贴吧贴吧名称属性不单一，故不能合并，抱歉', '楼主好，由网友或吧友自行组建的具有俱乐部性质的贴吧，不予合并，抱歉', '楼主好，具有人身攻击、商业、黄色等性质的贴吧，不开放合并，抱歉', '楼主好，您申请合并的 吧贴吧UV较高，故不能合并，抱歉', '楼主好，个人贴吧不开放贴吧合并功能，抱歉', '楼主好，请提供相应的官方网站链接来证明一下申请中的贴吧名称含义相同，百度百科和贴子论坛不能证明，谢谢', '楼主好，为了避免误伤其它姓氏的姓名，姓名全称和去掉姓氏的简称不开放贴吧合并功能，抱歉。', '您好，您的申请此前已处理，请查看上贴工作人员回复结果，勿重复发帖，谢谢', '您好，请您先将  吧发展好再来申请，如多在该吧发些利于建设的贴子，成功提交贴吧分类并开通贴吧功能，谢谢', '您好， 吧尚有候选吧主待处理，待候选吧主完成审批后才可进行下一步的合并。如候选吧主上任，请您联系该吧主来此帖表明同意合并，请问是否候选吧主处理完成?跟帖回复即可', '楼主好，由于您的标题较长无法显示完整建议您用“以下贴吧”等字眼概括，但是内容需要清楚详细，请修改资料后重新发贴申请，谢谢', '楼主好，由于您的申请较多，请您用“以下贴吧”等字眼概括所有内容至同一贴内，但是内容需要清楚详细，请修改资料后重新发贴申请，谢谢', '楼主好，由于您的申请标题与内容不一致，故请修改资料后重新发贴申请，谢谢', '楼主好，由于 吧贴子数量较多并且贴子质量较高、贴吧发展比较完善，故需要进行反向合并，将 吧合并至 吧。如果您不同意反向合并，那请先把 吧发展好，如多在该吧发些利于建设的贴子，成功提交贴吧分类并开通贴吧功能，谢谢', '楼主好，由于  吧的贴吧名称为最优的贴吧名称，故需要进行反向合并，抱歉。', '楼主好，如果已经与所有现任吧主意见达成一致，请在“是否已与现任吧主达成一致意见”后填写“是”，这样才可以进行下一步的合并。请问是否已与现任吧主达成一致意见？跟帖回复即可。', '楼主好，如果没有需要保留的贴子或已经转移完需要保留的贴子，请在“是否已转移需要保留的内容”后填写“是”，这样才可以进行下一步的合并。请问保留内容工作是否已经完成？跟帖回复即可。', '楼主好，如果已经发送相关文件至官方邮箱，请您在“是否有发送相关文件至百度官方邮箱”下回复“是”，这样才可以进行下一步的合并，请问是否有发送相关文件至百度官方邮箱？跟贴回复即可', '楼主好，请您按照正确的格式重新发贴申请：<br>贴子标题：<br>【申请合并】申请将 吧合并至 吧（申请将“以下贴吧”合并至xx吧）<br>贴子内容：<br>申请将 吧合并至 吧。(此处请填写具体吧名，多吧申请请用分隔符、，等隔开)<br>是否已与各吧吧主协商达成一致意见：（是或否）<br>是否已经转移需要保留的内容：（是或否）<br>申请贴吧合并的原因：（此项为必填写项，填写此项有助于提高您的申请处理进度）<br>被合并贴吧链接：（此项为必填写项，填写此项有助于提高您的申请处理进度 ）<br>合并保留贴吧链接：（此项为必填写项，填写此项有助于提高您的申请处理进度 ）', '楼主好，不同版本的游戏、电影等事物的贴吧不开放贴吧合并功能，抱歉', '楼主好，如需要修改申请资料，请您重新按照格式发贴，谢谢', '楼主好，学校类贴吧简称不开放合并。', '楼主好，学校类贴吧合并规则变更，请您根据最新要求发送相关材料至官方邮箱，如您已经发送相关文件，请您在“是否有发送相关文件至百度官方邮箱”后填写“是”，这样才可以进行下一步的合并.请问是否有发送相关文件至百度官方邮箱？跟帖回复即可。详情请查阅：<br>标题：【公告】关于学校类贴吧合并拆分申请要求须知（2018最新版）<br>链接：https://tieba.baidu.com/p/5655980155', "亲爱的吧友，我们已经收到您反馈的信息，并在下次二审时反馈至相关管理员处，在此期间请您耐心等候，为您带来不便请您谅解，谢谢."];
            // vip check
            if (PageData.user.vipInfo.v_status == 0) {
                var r = {};
                r[PageData.user.id] = e;
                var n = $.json.encode(r);
                //localStorage
                $.tb.Storage.set("user_quick_reply_data", n);
                tbMerge.isDebug ? console.log("fastReply Method First start") : null;
                return;
            }
            //vip compatible
            var b = '<div class="fast-quick-reply" style="height:300px;overflow-y:scroll"><div class="fast-reply-item">' + e.join('</div><div class="fast-reply-item">') + '</div></div>';
            $(".tbui_fbar_post").after('<li class="tbui_aside_fbar_button tbui_fbar_fast"><a href="javascript:void 0;">快速回贴</a></li>');
            $(document).on("click", '.tbui_fbar_fast', function() {
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
            tbMerge.isDebug ? console.log("fastReply Method Second start") : null;
        },
        postData: function(merge, keep) {
            $.ajax({
                url: 'https://hb.52fisher.cn/api-merge',
                data: {
                    merge: merge,
                    keep: keep
                },
                type: "POST",
                timeout: "10000",
                error: function(xhr, textStatus) {
                    tbMerge.isDebug ? console.log('error:' + textStatus) : null;
                    if (textStatus == 'timeout') {
                        $.dialog.confirm("好像网络有些拥堵，导致访问超时，是否再试一次?", {
                            width: 300,
                            title: '访问超时',
                            modal: 0
                        }).bind('onaccept', function() {
                            tbMerge.postData(merge, keep);
                        });
                        return;
                    }
                    $.dialog.alert("服务器打了个盹：" + textStatus);
                },
                success: function(e) {
                    $('#check-result').html(e);
                    $("#check-tips").hide();
                    $('#done-tips').show();
                }
            });
        },
        isEmpty: function(e) {
            return e === null || e === undefined || e == '';
        },
        debug: function() {
            console.log("debug start")
            return this.isDebug = true;
        },
        showerr: function(e = '该贴不符合申请格式要求', add = false) {
            $("#check-tips").hide();
            if ($("#err-tips").html() == '') {
                $("#err-tips").show().html(e);
                return;
            }
            add ? $("#err-tips").show().append(',' + e) : $("#err-tips").show().html(e);
        },
        copy: function() {
            $(".l_posts_num:first").after('<button id="copy" class="ui_btn ui_btn_m">复制</button>');
            $("#copy").click(function() {
                var e = '<textarea id="c2c"onmouseover="this.select()" style="outline:none;resize:none;width:100%;height:80px;border: none;">' + '标题：' + PageData.thread.title + '\n链接：' + location.href.split(/[#\?$]/)[0] + '</textarea>';
                $.dialog.confirm(e, {
                    width: 300,
                    padding: 10,
                    title: "点击确定或者使用CTRL+C"
                }).bind("onaccept", function() {
                    $("#c2c").select();
                    document.execCommand("Copy");
                    $.dialog.close();
                    $.dialog.assert("复制成功");
                });
            });
            tbMerge.isDebug ? console.log("copy start") : null;
        }
    };
    tbMerge.init();
    //tbMerge.debug();
    tbMerge.fastReply();
    tbMerge.copy()
})()