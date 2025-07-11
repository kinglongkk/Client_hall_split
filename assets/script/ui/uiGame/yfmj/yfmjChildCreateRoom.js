/*
创建房间子界面
 */
var app = require("app");

var jsnyzmjChildCreateRoom = cc.Class({
	extends: require("BaseChildCreateRoom"),

	properties: {

	},

	// 需要自己重写
	// CreateSendPack -start-
	CreateSendPack: function (renshu, setCount, isSpiltRoomCard) {
    	let sendPack = {};
		let zhuangjia = this.GetIdxByKey('zhuangjia');
		let zhigang = this.GetIdxByKey('zhigang');
		let dihu = this.GetIdxByKey('dihu');
		let kexuanwanfa = this.GetIdxsByKey('kexuanwanfa');
		let piaoshangxian = this.GetIdxByKey('piaoshangxian');
		let lianmai = this.GetIdxByKey('lianmai');
		let fangjian = this.GetIdxsByKey('fangjian');
		let xianShi = this.GetIdxByKey('xianShi');
		let jiesan = this.GetIdxByKey('jiesan');
		let gaoji = this.GetIdxsByKey('gaoji');

    	sendPack = {
			"zhuangjia": zhuangjia,
			"zhigang": zhigang,
			"dihu": dihu,
			"kexuanwanfa": kexuanwanfa,
			"piaoshangxian": piaoshangxian,
			"lianmai": lianmai,
			"fangjian": fangjian,
			"xianShi": xianShi,
			"jiesan": jiesan,
			"gaoji": gaoji,

        	"playerMinNum": renshu[0],
        	"playerNum": renshu[1],
        	"setCount": setCount,
        	"paymentRoomCardType": isSpiltRoomCard,

    	}
    	return sendPack;
	},
	// CreateSendPack -end-

	AdjustSendPack: function (sendPack) {
		if (sendPack.kexuanwanfa.indexOf(1) === -1) {
			this.RemoveRadioSelect(sendPack, "piaoshangxian");
		}

		return sendPack;
	},

	OnToggleClick: function (event) {
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
			if ('renshu' == key) {
				// 	二人场，隐藏“跟庄”玩法。
				if (toggleIndex == 0) {
					this.Toggles["kexuanwanfa"][7].active = false;
				} else {
					this.Toggles["kexuanwanfa"][7].active = true;
				}
			}
			this.ClearToggleCheck(needClearList, needShowIndexList);
			this.UpdateLabelColor(toggles);
			this.UpdateTogglesLabel(toggles, false);
			return;
		} else if ('kexuanwanfa' == key) {
			// 	未勾选“买”玩法时，隐藏“庄家必买”。
			// 	未勾选“买”玩法时，隐藏“庄家必买”、以及“必买”。（庄家必买和必买不可同时勾选）
			if (toggleIndex == 0) {
				if (!this.Toggles['kexuanwanfa'][0].getChildByName('checkmark').active) {
					this.Toggles['kexuanwanfa'][5].active = true;
					this.Toggles['kexuanwanfa'][10].active = true;
				} else {
					this.Toggles['kexuanwanfa'][5].active = false;
					this.Toggles['kexuanwanfa'][10].active = false;
				}
			}
			if (toggleIndex == 1) {
				if (!this.Toggles['kexuanwanfa'][1].getChildByName('checkmark').active) {
					this.Toggles['piaoshangxian'][0].parent.active = true;
				} else {
					this.Toggles['piaoshangxian'][0].parent.active = false;
				}
			}

			// （庄家必买和必买不可同时勾选）
			if (this.Toggles['kexuanwanfa'][5].getChildByName('checkmark').active && toggleIndex == 10) {
				this.Toggles['kexuanwanfa'][5].getChildByName('checkmark').active = false;
				this.UpdateLabelColor(this.Toggles['kexuanwanfa'][5].parent);
			} else if (this.Toggles['kexuanwanfa'][10].getChildByName('checkmark').active && toggleIndex == 5) {
				this.Toggles['kexuanwanfa'][10].getChildByName('checkmark').active = false;
				this.UpdateLabelColor(this.Toggles['kexuanwanfa'][10].parent);
			}
			// if('sss_dr' == this.gameType || 'sss_zz' == this.gameType){
			//     if(toggleIndex == 0){
			//         this.Toggles['kexuanwanfa'][1].getChildByName('checkmark').active = false;
			//         this.UpdateLabelColor(this.Toggles['kexuanwanfa'][1].parent);
			//     }
			//     else if(toggleIndex == 1){
			//         this.Toggles['kexuanwanfa'][0].getChildByName('checkmark').active = false;
			//         this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
			//     }
			// }
		}
		else if ("fangjian" == key) {
			// 小局托管解散,解散次数不超过5次,
			// 托管2小局解散,解散次数不超过3次",
			if (this.Toggles['fangjian'][4].getChildByName('checkmark').active && toggleIndex == 5) {
				this.Toggles['fangjian'][4].getChildByName('checkmark').active = false;
				this.UpdateLabelColor(this.Toggles['fangjian'][4].parent);
			} else if (this.Toggles['fangjian'][5].getChildByName('checkmark').active && toggleIndex == 4) {
				this.Toggles['fangjian'][5].getChildByName('checkmark').active = false;
				this.UpdateLabelColor(this.Toggles['fangjian'][5].parent);
			}

			// if (this.Toggles['fangjian'][2].getChildByName('checkmark').active && toggleIndex == 4) {
			// 	this.Toggles['fangjian'][2].getChildByName('checkmark').active = false;
			// 	this.UpdateLabelColor(this.Toggles['fangjian'][2].parent);
			// } else if (this.Toggles['fangjian'][4].getChildByName('checkmark').active && toggleIndex == 2) {
			// 	this.Toggles['fangjian'][4].getChildByName('checkmark').active = false;
			// 	this.UpdateLabelColor(this.Toggles['fangjian'][4].parent);
			// }

			// 小局托管解散, 托管2小局解散",
			if (this.Toggles['fangjian'][2].getChildByName('checkmark').active && toggleIndex == 3) {
				this.Toggles['fangjian'][2].getChildByName('checkmark').active = false;
				this.UpdateLabelColor(this.Toggles['fangjian'][2].parent);
			} else if (this.Toggles['fangjian'][3].getChildByName('checkmark').active && toggleIndex == 2) {
				this.Toggles['fangjian'][3].getChildByName('checkmark').active = false;
				this.UpdateLabelColor(this.Toggles['fangjian'][3].parent);
			}
		}
		if (toggles.getComponent(cc.Toggle)) {//复选框
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

	OnUpdateTogglesLabel: function (TogglesNode, isResetPos = true) {
		// 	未勾选“买”玩法时，隐藏“庄家必买”。
		// 	未勾选“买”玩法时，隐藏“庄家必买”、以及“必买”。（庄家必买和必买不可同时勾选）
		if (this.Toggles["kexuanwanfa"]) {
			if (!this.Toggles["kexuanwanfa"][0].getChildByName("checkmark").active) {
				this.Toggles["kexuanwanfa"][5].active = false;
				this.Toggles["kexuanwanfa"][10].active = false;
			} else {
				this.Toggles["kexuanwanfa"][5].active = true;
				this.Toggles["kexuanwanfa"][10].active = true;
			}
		}

		// 	二人场，隐藏“跟庄”玩法。
		if (this.Toggles["renshu"] && this.Toggles["kexuanwanfa"]) {
			if (this.Toggles["renshu"][0].getChildByName("checkmark").active) {
				this.Toggles["kexuanwanfa"][7].active = false;
			} else {
				this.Toggles["kexuanwanfa"][7].active = true;
			}
		}

		if (this.Toggles["kexuanwanfa"] && this.Toggles["piaoshangxian"]) {
			if (this.Toggles["kexuanwanfa"][1].getChildByName("checkmark").active) {
				this.Toggles["piaoshangxian"][0].parent.active = true;
			} else {
				this.Toggles["piaoshangxian"][0].parent.active = false;
			}
		}
	},

});

module.exports = jsnyzmjChildCreateRoom;