var app = require("app");
cc.Class({
    extends: cc.Component,

    properties: {
        chazhaoEditBox:cc.EditBox,
        img_wxnc:cc.Node,
        allToggle:cc.Toggle,
        typeLabel:cc.Label,
    },
    onLoad:function(){
        this.wechatName = true;
    	let rankScrollView = this.node.getChildByName("rankScrollView").getComponent(cc.ScrollView);
        rankScrollView.node.on('scroll-to-bottom',this.GetNextPage,this);
        app.Client.RegEvent("UpdateChangeAliveNodeData", this.Event_UpdateChangeAliveNodeData, this);
    },
    InitData:function (clubId, unionId, unionPostType,myisminister, unionName, unionSign) {
        this.clubId = clubId;
        this.unionId = unionId;
        this.unionPostType = unionPostType;
        this.myisminister = myisminister;
        this.unionName = unionName;
        this.unionSign = unionSign;
        this.curPage = 1;
        this.type = 0;
        this.node.getChildByName("selectType").active = false;
        this.ShowTypeBtnLabel();
        this.GetClubChangeAlivePointList(true);
    },
    ShowTypeBtnLabel:function(){
        let img_zddi = this.node.getChildByName("selectType").getChildByName("img_zddi");
        for (let i = 0; i < img_zddi.children.length; i++) {
            let btnType = img_zddi.children[i].name.replace('btn_type_','');
            if (btnType == this.type) {
                img_zddi.children[i].getChildByName("img_zjxz").active = true;
            }else{
                img_zddi.children[i].getChildByName("img_zjxz").active = false;
            }
        }
        let strObj = ["所有成员","最近一天无战绩","最近三天无战绩","最近七天无战绩"];
        this.typeLabel.string = strObj[this.type];
    },
    Event_UpdateChangeAliveNodeData:function(event){
        this.curPage = 1;
        this.GetClubChangeAlivePointList(true);
    },
    GetClubChangeAlivePointList:function(isRefresh) {
        let sendPack = {};
        sendPack.clubId = this.clubId;
        sendPack.pageNum = this.curPage;
        if (this.wechatName) {
            sendPack.query = this.chazhaoEditBox.string;
        }else{
            sendPack.query = app.ComTool().GetBeiZhuID(this.chazhaoEditBox.string);
        }
        sendPack.type = this.type;
        let sendPackName = "Club.CClubChangeAlivePointList";
        let self = this;
        app.NetManager().SendPack(sendPackName,sendPack, function(serverPack){
            self.UpdateScrollView(serverPack, isRefresh);
        }, function(){

        });
    },
    GetNextPage:function(){
    	this.curPage++;
    	this.GetClubChangeAlivePointList(false);
    },
    UpdateScrollView:function(serverPack, isRefresh){
    	let rankScrollView = this.node.getChildByName("rankScrollView");
    	let content = rankScrollView.getChildByName("view").getChildByName("content");
    	if (isRefresh) {
    		rankScrollView.getComponent(cc.ScrollView).scrollToTop();
    		content.removeAllChildren();
    	}
        let demo = this.node.getChildByName("demo");
    	demo.active = false;
    	for (let i = 0; i < serverPack.length; i++) {
            let matchItem = serverPack[i];
    		let child = cc.instantiate(demo);
    		if (i%2 == 0) {
    			child.getComponent(cc.Sprite).enabled = true;
    		}else{
    			child.getComponent(cc.Sprite).enabled = false;
    		}
            let headImageUrl = matchItem.shortPlayer.iconUrl;
            if(headImageUrl){
                app.WeChatManager().InitHeroHeadImage(matchItem.pid, headImageUrl);
                let WeChatHeadImage = child.getChildByName('head').getComponent("WeChatHeadImage");
                WeChatHeadImage.OnLoad();
                WeChatHeadImage.ShowHeroHead(matchItem.shortPlayer.pid,headImageUrl);
            }
            child.wechatName = matchItem.shortPlayer.name;
            child.playerInfo = matchItem.shortPlayer;
            child.beizhu = app.ComTool().GetBeiZhuName(matchItem.shortPlayer.pid,matchItem.shortPlayer.name);
            if (this.wechatName) {
                child.getChildByName("lb_name").getComponent(cc.Label).string =matchItem.shortPlayer.name;
            }else{
                child.getChildByName("lb_name").getComponent(cc.Label).string =child.beizhu;
            }
            child.pid = matchItem.shortPlayer.pid;
            child.data = matchItem;
            child.getChildByName("lb_name").getComponent(cc.Label).string =matchItem.shortPlayer.name
            child.getChildByName("lb_id").getComponent(cc.Label).string = matchItem.shortPlayer.pid;
            child.getChildByName("lb_upPlayerName").getComponent(cc.Label).string = matchItem.upPlayerName;
            child.getChildByName("lb_eliminatePoint").getComponent(cc.Label).string = matchItem.eliminatePoint;
            child.getChildByName("lb_alivePoint").getComponent(cc.Label).string = matchItem.gameTicket;
            child.getChildByName("lb_sportsPoint").getComponent(cc.Label).string = matchItem.sportsPoint;
    		child.active = true;
    		content.addChild(child);
    	}
    },
    SwitchWechatName:function(){
        let rankScrollView = this.node.getChildByName("rankScrollView");
        let content = rankScrollView.getChildByName("view").getChildByName("content");
        for (let i = 0; i < content.children.length; i++) {
            if (this.wechatName) {
                content.children[i].getChildByName("lb_name").getComponent(cc.Label).string =content.children[i].wechatName;
            }else{
                content.children[i].getChildByName("lb_name").getComponent(cc.Label).string =content.children[i].beizhu;
            }
        }
    },
    GetSelectPidList:function(){
        let rankScrollView = this.node.getChildByName("rankScrollView");
        let content = rankScrollView.getChildByName("view").getChildByName("content");
        let pidList = [];
        for (let i = 0; i < content.children.length; i++) {
            let toggle = content.children[i].getChildByName("selectNode").getChildByName("toggle");
            if (toggle.getComponent(cc.Toggle).isChecked) {
                pidList.push(content.children[i].pid);
            }
        }
        return pidList;
    },
    //控件点击回调
    OnClick_BtnWnd:function(eventTouch, eventData){
        try{
            app.SoundManager().PlaySound("BtnClick");
            let btnNode = eventTouch.currentTarget;
            let btnName = btnNode.name;
            this.OnClick(btnName, btnNode);
        }
        catch (error){
            console.log("OnClick_BtnWnd:"+error.stack);
        }
    },
    OnClick:function(btnName, btnNode){
        if ("btn_search" == btnName) {
            this.curPage = 1;
            this.GetClubChangeAlivePointList(true);
        }else if('btn_allPlayer'==btnName){
            this.node.getChildByName("selectType").active = true;
        }else if('selectType'==btnName){
            this.node.getChildByName("selectType").active = false;
        }else if(btnName.startsWith("btn_type_")){
            this.node.getChildByName("selectType").active = false;
            this.type = parseInt(btnName.replace('btn_type_',''));
            this.ShowTypeBtnLabel();
            this.curPage = 1;
            this.GetClubChangeAlivePointList(true);
        }else if('btn_changeAlivePoint'==btnName){
            let data = {
                "clubId":this.clubId,
                "name":btnNode.parent.data.shortPlayer.name,
                "pid":app.ComTool().GetPid(btnNode.parent.data.shortPlayer.pid),
                "eliminatePoint":btnNode.parent.data.eliminatePoint,
                "isPersonal":true,
            }
            app.FormManager().ShowForm("ui/club_2/UIChangeSportsPointWarning_2",data);
        }else if('btn_GetGameTicket'==btnName){
            let data = {
                "clubId":this.clubId,
            }
            app.FormManager().ShowForm("ui/club_2/UIChangeGameTicket_2",data);
        }else if('btn_changeMulti'==btnName){
            let pidList = this.GetSelectPidList();
            if (pidList.length == 0) {
                app.SysNotifyManager().ShowSysMsg("请至少选择一个玩家",[],3);
                return;
            }
            let data = {
                "clubId":this.clubId,
                "pidList":pidList,
                "isPersonal":true,
            }
            app.FormManager().ShowForm("ui/club_2/UIChangeSportsPointWarning_2",data);
        }else if('btn_record'==btnName){
            app.FormManager().ShowForm('ui/club/UIClubUserMessageNew',this.clubId,this.unionId,this.unionName,this.unionSign,0,0,"btn_ChooseType_9");
        }else if ("img_qmp" == btnName) {
            if (this.wechatName) {
                this.wechatName = false;
                this.img_wxnc.x = -36;
                this.img_wxnc.getChildByName("lb_2_3").getComponent(cc.Label).string = "群名片";
            }else{
                this.wechatName = true;
                this.img_wxnc.x = 36;
                this.img_wxnc.getChildByName("lb_2_3").getComponent(cc.Label).string = "微信昵称";
            }
            this.SwitchWechatName();
        }
    },
    OnClickAllToggle:function(event){
        // if (this.clickChildToggle) {
        //     this.clickChildToggle = false;
        //     return;
        // }
        let rankScrollView = this.node.getChildByName("rankScrollView");
        let content = rankScrollView.getChildByName("view").getChildByName("content");
        for (let i = 0; i < content.children.length; i++) {
            let toggle = content.children[i].getChildByName("selectNode").getChildByName("toggle");
            toggle.getComponent(cc.Toggle).isChecked = event.isChecked;
        }
    },
    // OnClickChildToggle:function(event){
    //     if (!event.isChecked) {
    //         this.clickChildToggle = true;
    //         this.allToggle.isChecked = false;
    //     }
    // },
});