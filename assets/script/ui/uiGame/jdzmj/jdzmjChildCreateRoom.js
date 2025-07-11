/*
创建房间子界面
 */
var app = require("app");

var fzmjChildCreateRoom = cc.Class({
    extends: require("BaseChildCreateRoom"),

    properties: {

    },
    //需要自己重写
    CreateSendPack: function (renshu, setCount, isSpiltRoomCard) {
        let sendPack = {};
            let xianShi = this.GetIdxByKey("xianShi");
            let jiesan = this.GetIdxByKey("jiesan");
            let lianmai = this.GetIdxByKey("lianmai");

            let kexuanwanfa = [];
            for (let i = 0; i < this.Toggles['kexuanwanfa'].length; i++) {
                if (this.Toggles['kexuanwanfa'][i].getChildByName('checkmark').active) {
                    kexuanwanfa.push(i);
                }
            }
            let fangjian = [];
            for (let i = 0; i < this.Toggles['fangjian'].length; i++) {
                if (this.Toggles['fangjian'][i].getChildByName('checkmark').active) {
                    fangjian.push(i);
                }
            }
            let gaoji = [];
            for (let i = 0; i < this.Toggles['gaoji'].length; i++) {
                if (this.Toggles['gaoji'][i].getChildByName('checkmark').active) {
                    gaoji.push(i);
                }
            }

            let jiefeng = this.GetIdxByKey("jiefeng");
            let heju = this.GetIdxByKey("heju");
            let suanshang = this.GetIdxByKey("suanshang");
            let wanfa = this.GetIdxByKey("wanfa");


            sendPack = {
                "xianShi": xianShi,
                "jiesan": jiesan,
                "fangjian": fangjian,
                "lianmai": lianmai,
                "playerMinNum": renshu[0],
                "playerNum": renshu[1],
                "setCount": setCount,
                "paymentRoomCardType": isSpiltRoomCard,
                "gaoji": gaoji,
                "kexuanwanfa": kexuanwanfa,
                "jiefeng":jiefeng,
                "heju":heju,
                "suanshang":suanshang,
                "wanfa":wanfa,
            };
        return sendPack;
    },

    UpdateOnClickToggle:function(){
        //选项置灰
        if(this.Toggles["kexuanwanfa"]){
            this.UpdateLabelColor(this.Toggles['kexuanwanfa'][0].parent);
            if(!this.Toggles["kexuanwanfa"][0].getChildByName("checkmark").active){
                this.Toggles['kexuanwanfa'][6].getChildByName("checkmark").active = false;
                //置灰
                if(this.Toggles['kexuanwanfa'][6].getChildByName("label")){
                    this.Toggles['kexuanwanfa'][6].getChildByName("label").color = cc.color(180, 180, 180);
                }
            }else{
                //恢复
                if(this.Toggles['kexuanwanfa'][6].getChildByName("label")){
                    this.Toggles['kexuanwanfa'][6].getChildByName("label").color = cc.color(158, 49, 16);
                }
            }
        }
    },
});

module.exports = fzmjChildCreateRoom;