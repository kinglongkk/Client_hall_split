/*
 UICard01-04 牌局吃到的牌显示
 */

let app = require("app");

cc.Class({
    extends: require("BaseMJ_winlost_child"),

    properties: {
    },

    // use this for initialization
    OnLoad: function () {
        this.ComTool = app.ComTool();
        this.ShareDefine = app.ShareDefine();
    },
    ShowPlayerHuImg: function (huNode, huTypeName) {
        /*huLbIcon
        *  0:单吊，1：点炮，2：单游，3：胡，4：六金，5：平胡，6:抢杠胡 7:抢金，8：三游，9：四金倒，10：三金倒，11：三金游，12：十三幺
        *  13：双游，14：天胡，15：五金，16：自摸 17:接炮
        */
        let huType = this.ShareDefine.HuTypeStringDict[huTypeName];
        if (typeof (huType) == "undefined") {
            huNode.getComponent(cc.Label).string = '';
        } else if (huType == this.ShareDefine.HuType_DianPao) {
            huNode.getComponent(cc.Label).string = '点炮';
        } else if (huType == this.ShareDefine.HuType_JiePao) {
            huNode.getComponent(cc.Label).string = '接炮';
        } else if (huType == this.ShareDefine.HuType_ZiMo) {
            huNode.getComponent(cc.Label).string = '自摸';
        } else {
            huNode.getComponent(cc.Label).string = '';
        }
    },

    LabelName: function (huType) {
        return this.GetHuTypeDict()[huType];
    },

    // GetHuTypeDict -start-
    GetHuTypeDict: function () {
		let huTypeDict = {};
		huTypeDict["DDZ"] = "斗地主"; 
		huTypeDict["SanLongJiaBei"] = "三龙夹背"; 
		huTypeDict["ShuangLongJiaBei"] = "双龙夹背"; 
		huTypeDict["LongJiaBei"] = "龙夹背"; 
		huTypeDict["QD"] = "小七对"; 
		huTypeDict["QXYBG"] = "七星一般高"; 
		huTypeDict["YBG"] = "一般高"; 
		huTypeDict["QX"] = "七星"; 
		huTypeDict["LanPai"] = "烂牌"; 
		huTypeDict["PPHu"] = "大七对"; 
		huTypeDict["PingHu"] = "平胡"; 
		huTypeDict["Long"] = "一条龙"; 
		huTypeDict["GunDiLong"] = "滚地龙"; 
		huTypeDict["ShouKaLong"] = "手卡龙"; 
		huTypeDict["ShiLaoTou"] = "十老头"; 
		huTypeDict["TangZiLanPai"] = "塘子烂牌"; 
		huTypeDict["TangZiYBG"] = "塘子一般高"; 
		huTypeDict["TangZiQX"] = "塘子七星"; 
		huTypeDict["TangZiQXYBG"] = "塘子七星一般高"; 
		huTypeDict["TangZiQD"] = "塘子七小对"; 
		huTypeDict["TangZiSSY"] = "塘子十三幺"; 
		huTypeDict["GSKH4"] = "四杠花"; 
		huTypeDict["GSKH3"] = "三杠花"; 
		huTypeDict["GSKH2"] = "双杠花"; 
		huTypeDict["GSKH"] = "杠上花"; 
		huTypeDict["ZiMo"] = "自摸"; 
		huTypeDict["QiangGangHu"] = "抢杠胡"; 
		huTypeDict["GSP"] = "杠上炮"; 
		huTypeDict["DianPao"] = "点炮"; 
		huTypeDict["ZhuangJia"] = "庄家"; 
		huTypeDict["AnGang"] = "暗杠"; 
		huTypeDict["MingGang"] = "明杠"; 

		return huTypeDict;
	},
    // GetHuTypeDict -end-


});
