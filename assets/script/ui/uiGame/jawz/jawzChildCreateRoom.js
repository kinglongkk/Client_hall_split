/*
创建房间子界面
 */
var app = require("app");

var ctwskChildCreateRoom = cc.Class({
	extends: require("BaseChildCreateRoom"),

	properties: {},
	//需要自己重写
	CreateSendPack: function (renshu, setCount, isSpiltRoomCard) {
		let sendPack = {};
			let xianShi = this.GetIdxByKey('xianShi');
            let jiesan = this.GetIdxByKey('jiesan');

            let wanfa=this.GetIdxByKey("wanfa");
            let moshi=this.GetIdxByKey("moshi");
            let shuyingfenshu=this.GetIdxByKey("shuyingfenshu");
            if(moshi==1){
                wanfa=-1;
                shuyingfenshu=-1;
            }
            let jifen=this.GetIdxByKey("jifen");
            let kexuanwanfa = [];
            for (let i = 0; i < this.Toggles['kexuanwanfa'].length; i++) {
                if (this.Toggles['kexuanwanfa'][i].getChildByName('checkmark').active) {
                    kexuanwanfa.push(i);
                }
            }


            let gaoji = [];
            for (let i = 0; i < this.Toggles['gaoji'].length; i++) {
                if (this.Toggles['gaoji'][i].getChildByName('checkmark').active) {
                    gaoji.push(i);
                }
            }
            let fangjian = [];
            for (let i = 0; i < this.Toggles['fangjian'].length; i++) {
                if (this.Toggles['fangjian'][i].getChildByName('checkmark').active) {
                    fangjian.push(i);
                }
            }
            if (isSpiltRoomCard == 1) {
                isSpiltRoomCard = 2;
            }
            sendPack = {
                "playerMinNum": renshu[0],
                "playerNum": renshu[1],
                "setCount": setCount,
                "shuyingfenshu":shuyingfenshu,
                "moshi":moshi,
                "wanfa":wanfa,
                "jifen":jifen,
                "kexuanwanfa":kexuanwanfa,

                "paymentRoomCardType": isSpiltRoomCard,
                "xianShi": xianShi,
                "jiesan": jiesan,
                "gaoji": gaoji,
                "fangjian":fangjian,
            };

		return sendPack;
	},
	 OnToggleClick:function(event){
        this.FormManager.CloseForm("UIMessageTip");
        let toggles = event.target.parent;
        let toggle = event.target;
        let key = toggles.name.substring(('Toggles_').length,toggles.name.length);
        let toggleIndex = parseInt(toggle.name.substring(('Toggle').length,toggle.name.length)) - 1;
        let needClearList = [];
        let needShowIndexList = [];
        needClearList = this.Toggles[key];
        needShowIndexList.push(toggleIndex);
        if('renshu' == key){
            if(toggleIndex==0 || toggleIndex==1){
                    this.Toggles['moshi'][1].getChildByName('checkmark').active = true;
                    this.Toggles['moshi'][0].getChildByName('checkmark').active = false;
                    this.UpdateLabelColor(this.Toggles['moshi'][1].parent);
            }
        }
        
        if('jushu' == key || 'renshu' == key || 'fangfei' == key){
            this.ClearToggleCheck(needClearList,needShowIndexList);
            this.UpdateLabelColor(toggles);
            this.UpdateTogglesLabel(toggles, false);
            
            return;
        }else if('kexuanwanfa' == key){
            let putong=this.Toggles['moshi'][0].getChildByName('checkmark').active;
            if(putong==true){
                //普通模式，16分封顶,随机癞子,全托,换三张
                if(toggleIndex==8){
                     app.SysNotifyManager().ShowSysMsg('普通模式不能勾选16分封顶');
                    return;
                }
                if(toggleIndex==9){
                     app.SysNotifyManager().ShowSysMsg('普通模式不能勾选随机癞子');
                    return;
                }
                if(toggleIndex==10){
                     app.SysNotifyManager().ShowSysMsg('普通模式不能勾选全托');
                    return;
                }
                if(toggleIndex==11){
                     app.SysNotifyManager().ShowSysMsg('普通模式不能勾选换三张');
                    return;
                }
            }else{
                //比奖模式,可带510K,可宣战,解散算奖,不可暗包,自动边叫,显示手牌
                if(toggleIndex==0){
                     app.SysNotifyManager().ShowSysMsg('比奖模式不能勾选可带510K');
                    return;
                }
                if(toggleIndex==1){
                     app.SysNotifyManager().ShowSysMsg('比奖模式不能勾选可宣战');
                    return;
                }
                if(toggleIndex==2){
                     app.SysNotifyManager().ShowSysMsg('比奖模式不能勾选解散算奖');
                    return;
                }
                if(toggleIndex==3){
                     app.SysNotifyManager().ShowSysMsg('比奖模式不能勾选不可暗包');
                    return;
                }
                if(toggleIndex==4){
                     app.SysNotifyManager().ShowSysMsg('比奖模式不能勾选自动边叫');
                    return;
                }
                if(toggleIndex==5){
                     app.SysNotifyManager().ShowSysMsg('比奖模式不能勾选显示手牌');
                    return;
                }
                if(toggleIndex==6){
                     app.SysNotifyManager().ShowSysMsg('比奖模式不能勾选不叫边');
                    return;
                }
            }
            if(this.Toggles['kexuanwanfa'][6].getChildByName('checkmark').active==true){
                if(toggleIndex==1 || toggleIndex==3 || toggleIndex==4){
                     app.SysNotifyManager().ShowSysMsg('勾选“不叫边”，则不能勾选“可宣战”、“不可暗包”、“自动边叫”');
                    return;
                }
            }
            //10,11,12
            if(this.Toggles['kexuanwanfa'][10].getChildByName('checkmark').active==true && this.Toggles['kexuanwanfa'][11].getChildByName('checkmark').active==true){
                if(toggleIndex==12){
                    this.Toggles['kexuanwanfa'][12].getChildByName('checkmark').active=true;
                     app.SysNotifyManager().ShowSysMsg('同时勾选“全托”和“换三张”时，自动勾选“自动换牌”不能取消勾选');
                    return;
                }
            }
        }
        else if ('moshi' == key) {
            if(toggleIndex==0 && this.Toggles['renshu'][2].getChildByName('checkmark').active==false){
                 app.SysNotifyManager().ShowSysMsg('二三人只能玩比奖');
                return;
            }
        }
        if(toggles.getComponent(cc.Toggle)){//复选框
            needShowIndexList = [];
            for(let i=0;i<needClearList.length;i++){
                let mark = needClearList[i].getChildByName('checkmark').active;
                //如果复选框为勾选状态并且点击的复选框不是该复选框，则继续保持勾选状态
                if(mark && i != toggleIndex){
                    needShowIndexList.push(i);
                }
                //如果复选框为未勾选状态并且点击的复选框是该复选框，则切换为勾选状态
                else if(!mark && i == toggleIndex){
                    needShowIndexList.push(i);
                }
            }
        }
        this.ClearToggleCheck(needClearList,needShowIndexList);
        this.UpdateLabelColor(toggles,'fangfei' == key ? true : false);

        this.UpdateOnClickToggle();
    },

	UpdateOnClickToggle:function(){
        let putong=this.Toggles['moshi'][0].getChildByName('checkmark').active;
        if(putong==true){
            this.Toggles['wanfa'][0].parent.active=true;
            this.Toggles['shuyingfenshu'][0].parent.active=true;
            this.Toggles['kexuanwanfa'][8].getChildByName('checkmark').active=false;
            this.Toggles['kexuanwanfa'][9].getChildByName('checkmark').active=false;
            this.Toggles['kexuanwanfa'][10].getChildByName('checkmark').active=false;
            this.Toggles['kexuanwanfa'][11].getChildByName('checkmark').active=false;
            this.UpdateLabelColor(this.Toggles['kexuanwanfa'][8].parent);
        }else{
            //比赏模式
            this.Toggles['wanfa'][0].parent.active=false;
            this.Toggles['shuyingfenshu'][0].parent.active=false;
            this.Toggles['kexuanwanfa'][0].getChildByName('checkmark').active=false;
            this.Toggles['kexuanwanfa'][1].getChildByName('checkmark').active=false;
            this.Toggles['kexuanwanfa'][2].getChildByName('checkmark').active=false;
            this.Toggles['kexuanwanfa'][3].getChildByName('checkmark').active=false;
            this.Toggles['kexuanwanfa'][4].getChildByName('checkmark').active=false;
            this.Toggles['kexuanwanfa'][5].getChildByName('checkmark').active=false;
            this.Toggles['kexuanwanfa'][6].getChildByName('checkmark').active=false;
            this.UpdateLabelColor(this.Toggles['kexuanwanfa'][8].parent);
        }
        if(this.Toggles['kexuanwanfa'][10].getChildByName('checkmark').active==true && this.Toggles['kexuanwanfa'][11].getChildByName('checkmark').active==true){
            this.Toggles['kexuanwanfa'][12].getChildByName('checkmark').active=true;
            this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
        }
    },


	
});

module.exports = ctwskChildCreateRoom;