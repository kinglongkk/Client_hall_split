var app = require("app");
cc.Class({
    extends: require("BaseForm"),

    properties: {

    },

    OnCreateInit: function () {

    },
    OnShow: function (data, clubId) {
        this.data = data;
        this.clubId = clubId;
        let lb_TargetActive = this.node.getChildByName("lb_TargetActive").getComponent(cc.RichText);
        lb_TargetActive.string = "<color=#705d52>授权</c><color=#f8772c>" + data.name.substr(0,9) + "（ID:" + data.pid + "）" + "</color><color=#705d52>活跃计算</c>";
        let lb_curActive = this.node.getChildByName("lb_curActive").getComponent(cc.Label);
        lb_curActive.string = "该玩家当前活跃计算：" + data.calcActiveValue;
        //初始化比赛分输入框
        this.node.getChildByName("ActiveEditBox").getComponent(cc.EditBox).string = "";
    },
    OnClick:function(btnName, btnNode){
        if(btnName == "btn_sure"){
            let percentStr = this.node.getChildByName("ActiveEditBox").getComponent(cc.EditBox).string;
            if (!isNaN(parseFloat(percentStr)) && app.ComTool().StrIsNum(percentStr) && parseFloat(percentStr) >= 0) {
                let sendPack = {};
                sendPack.clubId = this.clubId;
                sendPack.pid = this.data.pid;
                sendPack.value = parseFloat(percentStr);
                let self = this;
                app.NetManager().SendPack("club.CClubPromotionCalcActive",sendPack, function(serverPack){
                    app.FormManager().GetFormComponentByFormName("ui/club/UIPromoterManager").ClickLeftBtn("btn_PromoterList");
                    app.SysNotifyManager().ShowSysMsg("成功设置改玩家活跃计算",[],3);
                    self.CloseForm();
                }, function(){

                });
            }else{
                app.SysNotifyManager().ShowSysMsg("请输入大于0的纯数字", [], 3);
            }
        }else if(btnName == "btn_close"){
            this.CloseForm();
        }else if(btnName == "btn_detail"){
            app.FormManager().ShowForm('ui/club/UIPromoterSetActiveDetail',this.data, this.clubId);
            this.CloseForm();
        }else{
                            console.error("OnClick(%s) not find", btnName);
        }
    },
});
