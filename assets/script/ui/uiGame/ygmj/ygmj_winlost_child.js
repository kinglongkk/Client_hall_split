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
        this.ShareDefine=app.ShareDefine();
	},
    ShowPlayerHuImg:function(huNode,huTypeName){
        /*huLbIcon
        *  0:单吊，1：点炮，2：单游，3：胡，4：六金，5：平胡，6:抢杠胡 7:抢金，8：三游，9：四金倒，10：三金倒，11：三金游，12：十三幺
        *  13：双游，14：天胡，15：五金，16：自摸 17:接炮
        */
        let huType=this.ShareDefine.HuTypeStringDict[huTypeName];
        if(typeof(huType)=="undefined"){
            huNode.getComponent(cc.Label).string = '';
        }else if(huType == this.ShareDefine.HuType_DianPao){
            huNode.getComponent(cc.Label).string = '点泡';
        }else if(huType == this.ShareDefine.HuType_JiePao){
            huNode.getComponent(cc.Label).string = '接炮';
        }else if(huType == this.ShareDefine.HuType_ZiMo){
            huNode.getComponent(cc.Label).string = '自摸';
        }else if(huType == this.ShareDefine.HuType_QGH){
            huNode.getComponent(cc.Label).string = '抢杠胡';
        }else {
            huNode.getComponent(cc.Label).string = '';
        } 
    },
    LabelName:function(huType){
        let LabelArray=[];
        LabelArray['Hu']='胡';
        LabelArray['DGQD']='德国七对';
        LabelArray['DBQD']='带宝七对';
        LabelArray['DGQXSSL']='德国七星十三烂';
        LabelArray['DBQXSSL']='带宝七星十三烂';
        LabelArray['DGSSL']='德国十三烂';
        LabelArray['DBSSL']='带宝十三烂';
        LabelArray['PTDD']='普通单吊';
        LabelArray['DBPH']='带宝平胡';
        LabelArray['DGPH']='德国平胡';
        LabelArray['DDPPH']='德国单吊碰碰胡';
        LabelArray['BPDD']='宝牌单吊';
        LabelArray['DGPPH']='德国碰碰胡';
        LabelArray['DBPPH']='带宝碰碰胡';
        LabelArray['TIANHU']='天胡';
        LabelArray['DIHU']='地胡';
        LabelArray['GSKH']='杠上开花';
        LabelArray['QGH']='抢杠胡';
        LabelArray['FB']='飞宝';
        LabelArray['SBFL']='四宝飞龙';
        LabelArray['FaFen']='罚分';
        LabelArray['GF']='杠分';
        LabelArray['DBDDPPH']='带宝单吊碰碰胡';
        LabelArray['DBDD']='带宝单吊';
        return LabelArray[huType];
    },
    ShowPlayerJieSuan: function (ShowNode, huInfoAll) {
        let huInfo = huInfoAll['endPoint'].huTypeMap;
        for (let huType in huInfo) {
            let huPoint = huInfo[huType];
            let JB = huInfoAll['endPoint'].JB;
            if (huType == "FB" && typeof(JB) != "undefined") {
                this.ShowLabelName(ShowNode.getChildByName('label_lists'), this.LabelName(huType) + "： " + huPoint + "+" + JB);
            }else{
                this.ShowLabelName(ShowNode.getChildByName('label_lists'), this.LabelName(huType) + "： " + huPoint);
            }
        }
    },
});
