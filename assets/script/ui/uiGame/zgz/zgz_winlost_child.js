/*
 UICard01-04 牌局吃到的牌显示
 */

let app = require("app");

cc.Class({
    extends: require("BaseComponent"),

    properties: {
        img_endType: [cc.SpriteFrame]
    },

    // use this for initialization
    OnLoad: function () {

    },
    ShowPlayerData: function (setEnd, playerAll, index) {
        let player = setEnd.posResultList[index];

        let point = player.point;
        this.ranksType = -1;
        let posResultList = setEnd["posResultList"];
        let myPid = app["HeroManager"]().GetHeroProperty("pid");
        for (let i =0; i< posResultList.length;i++) {
            let posResult = posResultList[i];
            let pid = posResult["pid"];
            let ranksType = posResult["ranksType"];
            if (myPid == pid) {
                this.ranksType = ranksType;
                break;
            }
        }
        //玩家分数
        let winNode = this.node.getChildByName("lb_win_num");
        let loseNode = this.node.getChildByName("lb_lose_num");
        winNode.active = false;
        loseNode.active = false;

        if (point > 0) {
            winNode.active = true;
            winNode.getComponent(cc.Label).string = "+" + point;
        } else {
            loseNode.active = true;
            loseNode.getComponent(cc.Label).string = point;
        }

        //比赛分
        let lb_sportsPointTitle = this.node.getChildByName("lb_sportsPointTitle");
        if (player.sportsPoint) {
            if (player.sportsPoint > 0) {
                lb_sportsPointTitle.active = true;
                lb_sportsPointTitle.getChildByName("lb_sportsPoint").getComponent(cc.Label).string = "+" + player.sportsPoint;
            }
            else {
                lb_sportsPointTitle.active = true;
                lb_sportsPointTitle.getChildByName("lb_sportsPoint").getComponent(cc.Label).string = player.sportsPoint;
            }
        } else {
            lb_sportsPointTitle.active = false;
        }

        //倍数
        this.node.getChildByName("lb_beiShu").active = true;
        let beishu = this.node.getChildByName("lb_beiShu").getComponent(cc.Label);
        beishu.string = setEnd["beiShu"];
        //游数
        let youNumDict = {
            "ONE":1,
            "TWO":2,
            "THREE":3,
            "FOUR":4,
            "FIVE":5,
            "SIX":6
        }
        this.node.getChildByName("img_endType").active = true;
        let img_endType = this.node.getChildByName("img_endType").getComponent(cc.Sprite);
        img_endType.spriteFrame = this.img_endType[youNumDict[player["endType"]]];

        this.node.getChildByName("img_huoban").active = false;
        if (this.ranksType == player.ranksType) {
            this.node.getChildByName("img_huoban").active = true;
        }

        let playerInfo = null;
        for (let i = 0; i < playerAll.length; i++) {
            if (player.pid == playerAll[i].pid) {
                playerInfo = playerAll[i];
                break;
            }
        }

        let head = this.node.getChildByName("user_info").getChildByName("mask").getChildByName("head_img").getComponent("WeChatHeadImage");
        head.ShowHeroHead(playerInfo.pid);
        //玩家名字
        let playerName = "";
        playerName = playerInfo.name;
        if (playerName.length > 6) {
            playerName = playerName.substring(0, 6) + '...';
        }
        let name = this.node.getChildByName("user_info").getChildByName("lable_name").getComponent(cc.Label);
        name.string = playerName;

        let id = this.node.getChildByName("user_info").getChildByName("label_id").getComponent(cc.Label);
        id.string = "ID:" + app.ComTool().GetPid(playerInfo["pid"]);
    },
});
