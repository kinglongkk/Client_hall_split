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
        app["rcwsk_PokerCard"] = require("rcwsk_PokerCard").GetModel;
        this.ComTool = app.ComTool();
        this.ShareDefine = app.ShareDefine();
        this.PokerCard = app.rcwsk_PokerCard();
    },
    ShowPlayerJieSuan() {

    },
    ShowPlayerHuaCard() {

    },
    ShowPlayerHuImg: function (huNode, huTypeName) {
       
    },

    onPlusScore(s) {
        if (s > 0) {
            return '+' + s;
        }
        return s;
    },

    ShowPlayerData: function (setEnd, playerAll, index) {
            let posResultList = setEnd["posResultList"];
            let posEnd = posResultList[index];
            let PlayerNode = this.node;
            let pos = posEnd.pos;
            let playerInfo = playerAll[index];
            //显示玩家姓名
            if(posEnd.ranksType==1){
                 PlayerNode.getChildByName('lb_rank').getComponent(cc.Label).string = "红方";
            }else{
                PlayerNode.getChildByName('lb_rank').getComponent(cc.Label).string = "蓝方";
            }
            PlayerNode.getChildByName('lb_name').getComponent(cc.Label).string = playerInfo["name"];
            PlayerNode.getChildByName('lb_id').getComponent(cc.Label).string = 'ID:' + this.ComTool.GetPid(playerInfo["pid"]);
            //头像  .children[0] 圆形遮罩
            let WeChatHeadImage = PlayerNode.getChildByName('head').getComponent("WeChatHeadImage");
            WeChatHeadImage.ShowHeroHead(playerInfo["pid"]);
            //显示头游
            let endType = posEnd.endType;//游数  0为默认值
            let finishOrder=0;
            if(endType=="ONE"){
                PlayerNode.getChildByName('lb_you').getComponent(cc.Label).string = "头科";
            }else if(endType=="TWO"){
                PlayerNode.getChildByName('lb_you').getComponent(cc.Label).string = "二科";
            }else if(endType=="THREE"){
                PlayerNode.getChildByName('lb_you').getComponent(cc.Label).string = "三科";
            }else if(endType=="FOUR"){
                PlayerNode.getChildByName('lb_you').getComponent(cc.Label).string = "四科";
            }else if(endType=="FIVE"){
                PlayerNode.getChildByName('lb_you').getComponent(cc.Label).string = "二落";
            }else if(endType=="SIX"){
                PlayerNode.getChildByName('lb_you').getComponent(cc.Label).string = "大落";
            }else{
                PlayerNode.getChildByName('lb_you').getComponent(cc.Label).string = "";
            }
            //显示得分
            if(posEnd.kaiDianPoint > 0){
                PlayerNode.getChildByName('lb_dian').getComponent(cc.Label).string = "+" + posEnd.kaiDianPoint;
            }else{
                PlayerNode.getChildByName('lb_dian').getComponent(cc.Label).string = posEnd.kaiDianPoint;
            }
            if(posEnd.menPoint > 0){
                PlayerNode.getChildByName('lb_men').getComponent(cc.Label).string = "+" + posEnd.menPoint;
            }else{
                PlayerNode.getChildByName('lb_men').getComponent(cc.Label).string = posEnd.menPoint;
            }
            if(posEnd.shaoPoint > 0){
                PlayerNode.getChildByName('lb_shao').getComponent(cc.Label).string = "+" + posEnd.shaoPoint;
            }else{
                PlayerNode.getChildByName('lb_shao').getComponent(cc.Label).string = posEnd.shaoPoint;
            }
            //输赢分
            if(posEnd.point > 0){
                PlayerNode.getChildByName('lb_point').getComponent(cc.Label).string = "+" + posEnd.point;
            }else{
                PlayerNode.getChildByName('lb_point').getComponent(cc.Label).string = posEnd.point;
            }
            //房间得分
            if(posEnd.roomPoint > 0){
                PlayerNode.getChildByName('lb_roompoint').getComponent(cc.Label).string = "+" + posEnd.roomPoint;
            }else{
                PlayerNode.getChildByName('lb_roompoint').getComponent(cc.Label).string =  posEnd.roomPoint;
            }
            //名次分
            if(posEnd.basePoint > 0){
                PlayerNode.getChildByName('lb_basepoint').getComponent(cc.Label).string = "+" + posEnd.basePoint;
            }else{
                PlayerNode.getChildByName('lb_basepoint').getComponent(cc.Label).string =  posEnd.basePoint;
            }

            //是否圈三户
            PlayerNode.getChildByName('quansanhu').active = posEnd.quanSanHu || false;

            if(posEnd.pid==app.HeroManager().GetHeroID()){
                PlayerNode.getChildByName('ziji').active=true;
            }else{
                PlayerNode.getChildByName('ziji').active=false;
            }
            //比赛分消耗
            let sportsPoint = posEnd["sportsPoint"];
            let lb_sportsPoint = PlayerNode.getChildByName("lb_sportsPoint");
            let tip9 = PlayerNode.getChildByName("tip9");
            if (typeof (sportsPoint) != "undefined") {
                if (sportsPoint > 0) {
                    lb_sportsPoint.getComponent(cc.Label).string = "+" + sportsPoint;
                } else {
                    lb_sportsPoint.getComponent(cc.Label).string = "" + sportsPoint;
                }
                lb_sportsPoint.active = true;
                tip9.active = true;
            } else {
                lb_sportsPoint.active = false;
                tip9.active = false;
            }
            PlayerNode.active=true;
    },
    
});
