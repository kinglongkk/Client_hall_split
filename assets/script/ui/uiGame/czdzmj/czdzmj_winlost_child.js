/*
 UICard01-04 牌局吃到的牌显示
 */

let app = require("app");

cc.Class({
    extends: require("BaseMJ_winlost_child"),

    properties: {},

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
            huNode.getComponent(cc.Label).string = '点泡';
        } else if (huType == this.ShareDefine.HuType_JiePao) {
            huNode.getComponent(cc.Label).string = '接炮';
        } else if (huType == this.ShareDefine.HuType_ZiMo) {
            huNode.getComponent(cc.Label).string = '自摸';
        } else {
            huNode.getComponent(cc.Label).string = '';
        }
    },
    ShowPlayerJieSuan: function (ShowNode, huInfoAll) {
        let huInfo = huInfoAll['endPoint'].huTypeMap;
        for (let huType in huInfo) {
            let huPoint = huInfo[huType];
            if (this.IsShowMulti2(huType)) {
                this.ShowLabelName(ShowNode.getChildByName("label_lists"), this.LabelName(huType) + "*" + huPoint);
            } else {
                this.ShowLabelName(ShowNode.getChildByName("label_lists"), this.LabelName(huType) + "：" + huPoint);
            }
            console.log("ShowPlayerJieSuan", huType);
        }
    },

    IsShowMulti2: function (huType) {
        let multi2 = [];
        let isShow = multi2.indexOf(huType) != -1;
        return isShow;
    },

    LabelName: function (huType) {
        let huTypeDict = {
            PingHu: "平胡",
            QYS: "清一色",
            TianHu: "天胡",
            DiHu: "地胡",
            PPH: "碰碰胡",
            QDHu: "七对",
            SiJinDao: "精牌天胡",
            DanYou: "精吊跑风",
            SSL: "十三烂",
            QYSPPH: "清一色碰碰胡",
            QYSQD: "清一色七对",
            SSY: "全幺",
            JYSPPH: "全幺碰碰胡",
            QDJiaBei: "全幺七对",
            CCHDDHu: "双七对",
            SSLang: "无精十三烂",
            HDDHu: "无精七对",
            ShouZhuaYi: "无精手把一",
            QYSQG: "无精清一色",
            PPHu: "无精碰碰胡",
            AnGang: "暗杠",
            JieGang: "直杠",
            Gang: "续杠",
            Hua: "补花",
            WuJingHu: "无精",
            Zhuang: "庄",
            PaoFen: "跑分",
            FaFen: "发数"
        };
        if (!huTypeDict.hasOwnProperty(huType)) {
            console.error("huType = " + huType + "is not exist");
        }

        return huTypeDict[huType];
    },
});
