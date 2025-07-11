/*
创建房间子界面
 */
var app = require("app");

var bzqzmjChildCreateRoom = cc.Class({
	extends: require("BaseChildCreateRoom"),

	properties: {},
	//需要自己重写
	CreateSendPack: function(renshu, setCount, isSpiltRoomCard) {
		let sendPack = {};
		let kexuanwanfa=this.GetIdxsByKey('kexuanwanfa');
		let daxiaoqidui=this.GetIdxByKey('daxiaoqidui');
		let pinghu=this.GetIdxByKey('pinghu');
		let yipaoduoxiang=this.GetIdxByKey('yipaoduoxiang');
		let fangjian=this.GetIdxsByKey('fangjian');
		let xianShi=this.GetIdxByKey('xianShi');
		let jiesan=this.GetIdxByKey('jiesan');
		let gaoji=this.GetIdxsByKey('gaoji');

    	sendPack = {
			"kexuanwanfa":kexuanwanfa,
			"daxiaoqidui":daxiaoqidui,
			"pinghu":pinghu,
			"yipaoduoxiang":yipaoduoxiang,
			"fangjian":fangjian,
			"xianShi":xianShi,
			"jiesan":jiesan,
			"gaoji":gaoji,

        	"playerMinNum": renshu[0],
        	"playerNum": renshu[1],
        	"setCount": setCount,
        	"paymentRoomCardType": isSpiltRoomCard,

    	}
    	return sendPack;
	},
	AdjustSendPack: function (sendPack) {
        // 仅4人场有跟风分，局内立即结算；
		if (sendPack.kexuanwanfa.indexOf(0) == -1) {
			// this.RemoveMultiSelect(sendPack, "kexuanwanfa", 4);
			sendPack.daxiaoqidui = -1;
		}
		if(sendPack.daxiaoqidui != 1 && sendPack.pinghu != 1){
			sendPack.yipaoduoxiang = -1;
		}
		return sendPack;
    },
	OnToggleClick: function(event) {
		this.FormManager.CloseForm("UIMessageTip");
		let toggles = event.target.parent;
		let toggle = event.target;
		let key = toggles.name.substring(('Toggles_').length, toggles.name.length);
		let toggleIndex = parseInt(toggle.name.substring(('Toggle').length, toggle.name.length)) - 1;
		let needClearList = [];
		let needShowIndexList = [];
		needClearList = this.Toggles[key];
		needShowIndexList.push(toggleIndex);
		if ('jushu' == key || 'renshu' == key || 'fangfei' == key) {
			this.ClearToggleCheck(needClearList, needShowIndexList);
			this.UpdateLabelColor(toggles);
			this.UpdateTogglesLabel(toggles, false);
			return;
		} else if ('kexuanwanfa' == key) {
			//"同时勾选“大小七对只自摸胡”和“平胡只自摸胡”时，不可勾选“可抢杠胡”"
			if(toggleIndex == 1 && !needClearList[toggleIndex].getChildByName("checkmark").active){
				if(this.Toggles["daxiaoqidui"][0].getChildByName("checkmark").active && this.Toggles["pinghu"][0].getChildByName("checkmark").active
					|| !needClearList[0].getChildByName("checkmark").active){
			    	return	
				}
			}
		}
		if (toggles.getComponent(cc.Toggle)) { //复选框
			needShowIndexList = [];
			for (let i = 0; i < needClearList.length; i++) {
				let mark = needClearList[i].getChildByName('checkmark').active;
				//如果复选框为勾选状态并且点击的复选框不是该复选框，则继续保持勾选状态
				if (mark && i != toggleIndex) {
					needShowIndexList.push(i);
				}
				//如果复选框为未勾选状态并且点击的复选框是该复选框，则切换为勾选状态
				else if (!mark && i == toggleIndex) {
					needShowIndexList.push(i);
				}
			}
		}
		this.ClearToggleCheck(needClearList, needShowIndexList);
		this.UpdateLabelColor(toggles, 'fangfei' == key ? true : false);
		this.UpdateOnClickToggle();
	},
	UpdateOnClickToggle: function() {
		//勾选“有大小七对”时，才有该玩法可选，没勾选时需隐藏；
		if(this.Toggles["daxiaoqidui"]){
			if(this.Toggles["kexuanwanfa"][0].getChildByName("checkmark").active){
				this.Toggles['daxiaoqidui'][0].parent.active = true;
			}else{
				this.Toggles['daxiaoqidui'][0].parent.active = false;
			}
		}
		//选“大小七对可炮胡”和“平胡可炮胡”中任意时，才可勾选该玩法，否则隐藏不可选；
		if(this.Toggles["yipaoduoxiang"]){
			if(this.Toggles["daxiaoqidui"][1].getChildByName("checkmark").active || this.Toggles["pinghu"][1].getChildByName("checkmark").active){
				this.Toggles['yipaoduoxiang'][0].parent.active = true;
			}else{
				this.Toggles['yipaoduoxiang'][0].parent.active = false;
			}
		}
		//同时勾选“大小七对只自摸胡”和“平胡只自摸胡”时，不可勾选“可抢杠胡”；
		//勾选 “平胡只自摸胡”同时没有勾选“有大小七对”时，也不可勾选 “可抢杠胡”；
		if(this.Toggles["kexuanwanfa"]){
			if(!this.Toggles["kexuanwanfa"][1].getChildByName("checkmark").active){
				if(!this.Toggles["kexuanwanfa"][0].getChildByName("checkmark").active
					|| (this.Toggles["daxiaoqidui"][0].getChildByName("checkmark").active
					&& this.Toggles["pinghu"][0].getChildByName("checkmark").active)){
					this.Toggles['kexuanwanfa'][1].getChildByName("checkmark").active = false;
					this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
					//置灰
					if(this.Toggles['kexuanwanfa'][1].getChildByName("label")){
						this.Toggles['kexuanwanfa'][1].getChildByName("label").color = cc.color(180, 180, 180);
					}
				}else{
					this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
				}
			}else{
				this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
			}
		}
	},
});

module.exports = bzqzmjChildCreateRoom;