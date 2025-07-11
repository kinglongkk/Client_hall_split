/*
 创建房间子界面
 */
var app = require("app");

var ddaChildCreateRoom = cc.Class({
    extends: require("BaseChildCreateRoom"),

    properties: {},
    //需要自己重写
    CreateSendPack: function (renshu, setCount, isSpiltRoomCard) {
        let sendPack = {};
        let difen = this.GetIdxByKey('difen');
        let shoupaishuliang = this.GetIdxByKey('shoupaishuliang');
        let kexuanwanfa = this.GetIdxsByKey('kexuanwanfa');
        let fangjian = this.GetIdxsByKey('fangjian');
        let xianShi = this.GetIdxByKey('xianShi');
        let jiesan = this.GetIdxByKey('jiesan');
        let gaoji = this.GetIdxsByKey('gaoji');

        sendPack = {
            "difen": difen,
            "shoupaishuliang": shoupaishuliang,
            "kexuanwanfa": kexuanwanfa,
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
            this.ClearToggleCheck(needClearList, needShowIndexList);
            this.UpdateLabelColor(toggles);
            this.UpdateTogglesLabel(toggles, false);
            return;
        } else if ('kexuanwanfa' == key) {
            /*if (toggleIndex == 3) {
             let mark = needClearList[0].getChildByName('checkmark').active;
             if (!mark) {
             this.ShowSysMsg("未勾选平胡时，不可选择抢杠胡");
             return;
             }
             } else if (toggleIndex == 0 && needClearList[toggleIndex].getChildByName('checkmark').active) {
             needClearList[1].getChildByName('checkmark').active = false;
             }*/
            // “箍三家”和“只箍红桃”不能同时勾选。
            if (this.Toggles['kexuanwanfa'][3].getChildByName('checkmark').active && toggleIndex == 6) {
                this.Toggles['kexuanwanfa'][3].getChildByName('checkmark').active = false;
                this.UpdateLabelColor(this.Toggles['kexuanwanfa'][2].parent);
            } else if (this.Toggles['kexuanwanfa'][6].getChildByName('checkmark').active && toggleIndex == 3) {
                this.Toggles['kexuanwanfa'][6].getChildByName('checkmark').active = false;
                this.UpdateLabelColor(this.Toggles['kexuanwanfa'][3].parent);
            }
        } else if ("fangjian" == key) {
            // “小局托管解散”和“托管2小局解散”不能同时勾选。
            if (this.Toggles["fangjian"][1].getChildByName('checkmark').active && toggleIndex == 2) {
                this.Toggles["fangjian"][1].getChildByName('checkmark').active = false;
                this.UpdateLabelColor(this.Toggles["fangjian"][0].parent);
            } else if (this.Toggles["fangjian"][2].getChildByName('checkmark').active && toggleIndex == 1) {
                this.Toggles["fangjian"][2].getChildByName('checkmark').active = false;
                this.UpdateLabelColor(this.Toggles["fangjian"][0].parent);
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
});

module.exports = ddaChildCreateRoom;