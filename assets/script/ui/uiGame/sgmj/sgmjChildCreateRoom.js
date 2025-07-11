/*
创建房间子界面
 */
var app = require("app");

var fzmjChildCreateRoom = cc.Class({
	extends: require("BaseChildCreateRoom"),

	properties: {},
	//需要自己重写
	CreateSendPack: function (renshu, setCount, isSpiltRoomCard) {
		let sendPack = {};
		let mapai = this.GetIdxByKey("mapai");
		let jiesan = this.GetIdxByKey("jiesan");
		let xianShi = this.GetIdxByKey("xianShi");
		let fangjian = [];
		for (let i = 0; i < this.Toggles['fangjian'].length; i++) {
			if (this.Toggles['fangjian'][i].getChildByName('checkmark').active) {
				fangjian.push(i);
			}
		}
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
		sendPack = {
			"mapai": mapai,
			"jiesan": jiesan,
			"xianShi": xianShi,
			"fangjian": fangjian,
			"playerMinNum": renshu[0],
			"playerNum": renshu[1],
			"setCount": setCount,
			"paymentRoomCardType": isSpiltRoomCard,
			"gaoji": gaoji,
			"kexuanwanfa": kexuanwanfa,
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
        if('jushu' == key || 'renshu' == key || 'fangfei' == key){
            this.ClearToggleCheck(needClearList,needShowIndexList);
            this.UpdateLabelColor(toggles);
            this.UpdateTogglesLabel(toggles, false);
            return;
        } else if('kexuanwanfa' == key){
        	if(toggleIndex == 19 && needClearList[23].getChildByName('checkmark').active){
                app.SysNotifyManager().ShowSysMsg("已勾选不可鸡胡时，不可取消庄家不可鸡胡");
                return;
            }else if(toggleIndex == 23 && !needClearList[toggleIndex].getChildByName('checkmark').active){
            	needClearList[19].getChildByName('checkmark').active = true;
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
		this.UpdateToggleXuanZhong(toggleIndex);
        this.UpdateLabelColor(toggles,'fangfei' == key ? true : false);
    },
	UpdateToggleXuanZhong: function (toggleIndex) {
		if (toggleIndex == 24) {
			if (this.Toggles['kexuanwanfa'][24].getChildByName('checkmark').active == false) {
				if (this.Toggles['kexuanwanfa'][25].getChildByName('checkmark').active == true) {
					this.Toggles['kexuanwanfa'][20].getChildByName('checkmark').active = true;
					this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
				}
			}
			if (this.Toggles['kexuanwanfa'][24].getChildByName('checkmark').active == true) {
				this.Toggles['kexuanwanfa'][20].getChildByName('checkmark').active = false;
				this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
			}
		}
		if (toggleIndex == 20) {
			if (this.Toggles['kexuanwanfa'][20].getChildByName('checkmark').active == true) {
				this.Toggles['kexuanwanfa'][24].getChildByName('checkmark').active = false;
				this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
			}
			if (this.Toggles['kexuanwanfa'][20].getChildByName('checkmark').active == false) {
				this.Toggles['kexuanwanfa'][25].getChildByName('checkmark').active = false;
				this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
			}
		}
		if (toggleIndex == 25) {
			if (this.Toggles['kexuanwanfa'][25].getChildByName('checkmark').active == true) {
				if (this.Toggles['kexuanwanfa'][24].getChildByName('checkmark').active == false) {
					this.Toggles['kexuanwanfa'][20].getChildByName('checkmark').active = true;
				}
				this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
			}
		}
	},
});


module.exports = fzmjChildCreateRoom;