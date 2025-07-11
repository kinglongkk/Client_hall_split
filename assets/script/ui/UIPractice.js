var app = require("app");
cc.Class({
    extends: require("BaseForm"),

    properties: {
        btnNodeGroup:cc.Node,
        RightNode:cc.Node,
        game_name:cc.Node,

        pafabItem:cc.Node,
    },
    OnCreateInit: function () {
        this.practiceConfig = app.SysDataManager().GetTableDict("practice");
        this.FormManager = app.FormManager();
        this.NetManager=app.NetManager();
        this.curType = {
            'mahjong':0,
            'poker':1,
            'other':2
        };
        this.gameType = '';
        this.playerNumList = [];
        this.practiceId = 0;
        this.lastGameSelect = null;
        this.lastSelect = null;
        this.curGameType = this.curType.other;
        this.RegEvent("GetCurRoomID", this.Event_GetCurRoomID, this);
        this.RegEvent("CodeError", this.Event_CodeError, this);
    },
    //-----------------显示函数------------------
    OnShow: function (gameType='') {
        //非常规切换可能导致配表丢失
        if (!this.practiceConfig) {
            this.practiceConfig = app.SysDataManager().GetTableDict("practice");
        }
        if (!this.practiceConfig) {
            app.SysNotifyManager().ShowSysMsg('游戏配置丢失，请重启游戏');
            this.CloseForm();
        }
        this.FormManager.ShowForm('UITop', "UIPractice");
        //this.btnNodeGroup.removeAllChildren();
        this.DestroyAllChildren(this.btnNodeGroup);
        this.lastTag = null;
        this.gameType=gameType;
        app.Client.SetGameType('');
        this.curRoomID = 0;
        this.curGameTypeStr = '';
        app.GameManager().SetGetRoomIDByUI(true);
        app.NetManager().SendPack("game.C1101GetRoomID", {});
        app.GameManager().SetAutoPlayIng(false);
        this.FormManager.CloseForm("UIAutoPlay");
        this.InitgameBtns({"gameList":app.Client.GetAllGameId()})
    },
    InitgameBtns:function(serverPack){
        this.gameList = {};
        if(undefined == serverPack.gameList ||
            '' == serverPack.gameList ||
            'null' == serverPack.gameList){
            this.gameList = {

            };
            if('' == this.gameType){
                for(let key in this.gameList){
                    this.gameType = key;
                    break;
                }
            }
       }else{
           let gameIDList=serverPack.gameList;
            for(let i=0;i<gameIDList.length;i++){
                let gamePinYin=this.ShareDefine.GametTypeID2PinYin[gameIDList[i]];
                let gameName=this.ShareDefine.GametTypeID2Name[gameIDList[i]];
                
                this.gameList[gamePinYin]=gameName;
                if(i==0){
                    if('' == this.gameType){
                        this.gameType=gamePinYin;
                    }
                }
            }
       }
        for(let key in this.gameList){
            if (key == "sss" || key == "hbmj") {
                continue;
            }
            let node = cc.instantiate(this.pafabItem);
            node.active = true;
            node.name = 'btn_' + key;
            node.getChildByName('icon_off').getComponent(cc.Label).string = this.gameList[key];
            node.getChildByName('icon').getChildByName('icon_on').getComponent(cc.Label).string = this.gameList[key];
            this.btnNodeGroup.addChild(node);
        }
        this.sendGameType();
    },
    sendGameType:function(){
        if(this.gameType == 'pdk_lyfj'){
            this.gameType = this.gameType.substring(0,3);
        }
        let sendPack = {
            'gameType':app.ShareDefine().GametTypeNameDict[this.gameType.toUpperCase()]
        }
        if(this.lastTag!=null){
            this.lastTag.active=false;
        }
        let tag=this.btnNodeGroup.getChildByName('btn_'+this.gameType).getChildByName('icon');
        tag.active=true;
        this.lastTag=tag;
        app.NetManager().SendPack('room.CBaseGoldList', sendPack, this.OnSuccessInitData.bind(this));
    },
    OnSuccessInitData:function(serverPack){
        //获取服务端传过来的数据
        let list = serverPack.gameLists;
        if(this.playerNumList && this.playerNumList.length){
            this.playerNumList.splice(0, this.playerNumList.length);
        }
        for(let idx = 0; idx < list.length; idx++){
            this.playerNumList.push(list[idx]);
        }
        this.UpdatePractice();
    },
    UpdatePractice:function(){
        let gameId = app.ShareDefine().GametTypeNameDict[this.gameType.toUpperCase()];
        this.game_name.getComponent(cc.Label).string=app.ShareDefine().GametTypeID2Name[gameId];
        
        let refreshList = []; 
        for(let key in this.practiceConfig){
            if(this.gameType == this.practiceConfig[key]['gameType'])
                refreshList.push(this.practiceConfig[key]);
        }
        for(let i=0;i<refreshList.length;i++){
            if(i>3){
                break;
            }
            let childNode=this.RightNode.children[i];
            let baseNum = refreshList[i]['baseMark'];
            let baseMark = '';
            if(baseMark >= 10000)
                baseMark = (baseNum / 10000).toFixed(1) + '万';
            else if(baseMark > 1000)
                baseMark = (baseNum / 1000).toFixed(1) + '千';
            else
                baseMark = baseNum.toString();
            childNode.getChildByName('lb_difen').getComponent(cc.Label).string = "底分:"+baseMark;
            if(this.playerNumList.length){
                childNode.getChildByName('lb_renshu').getComponent(cc.Label).string = (this.playerNumList[i].playerNum).toString() + '人';
            }
            let min = refreshList[i]['min'];
            let max = refreshList[i]['max'];
            let needStr = '';
            if(0 == max){
                if(min < 1000)
                    needStr = min.toString();
                else if(min >= 10000)
                    needStr = parseInt(min / 10000).toString() + '万以上';
                else
                    needStr = parseInt(min / 1000).toString() + '千以上';
            }
            else{
                if(min < 1000)
                    needStr = min.toString() + '-';
                else if(min >= 10000)
                    needStr = parseInt(min / 10000).toString() + '万-';
                else
                    needStr = parseInt(min / 1000).toString() + '千-';

                if(max < 1000)
                    needStr += max.toString();
                else if(max >= 10000)
                    needStr += parseInt(max / 10000).toString() + '万';
                else
                    needStr += parseInt(max / 1000).toString() + '千';
            }
            childNode.getChildByName('lb_zhunru').getComponent(cc.Label).string = "准入:"+needStr;
        }
    },
    Event_GetCurRoomID:function(event){
        let serverPack = event;
        this.curRoomID = serverPack.roomID;
        if(0 != this.curRoomID){
            this.curGameTypeStr = serverPack.gameType.toLowerCase();
        }
    },
    Event_CodeError:function(event){
        let codeInfo = event;
        let code = codeInfo["Code"];
        if(code == this.ShareDefine.NotFind_Room){
            app.SysNotifyManager().ShowSysMsg('DissolveRoom');
            this.curRoomID = 0;
            this.curGameTypeStr = '';
        }else if(code == this.ShareDefine.NotEnoughCoin){
            this.WaitForConfirm("MSG_NOTROOMCOIN", [], [], this.ShareDefine.Confirm);
        }
        else if(code == this.ShareDefine.MuchCoin){
            this.WaitForConfirm("MSG_TOOMUCHCOIN", [], [], this.ShareDefine.ConfirmOK);
        }
    },
    OnClose:function(){
    },
    //---------点击函数---------------------
    SetWaitForConfirm:function(msgID,type,msgArg=[],cbArg=[]){
        let ConfirmManager = app.ConfirmManager();
        ConfirmManager.SetWaitForConfirmForm(this.OnConFirm.bind(this), msgID, cbArg);
        ConfirmManager.ShowConfirm(type, msgID, msgArg);
    },
    OnConFirm:function(clickType, msgID, backArgList){
        if(clickType != "Sure"){
            return
        }
        if('MSG_GO_ROOM' == msgID){
            this.Click_btn_goRoom();
        }
        else if('MSG_NOTROOMCOIN'== msgID){
            this.FormManager.ShowForm("UIStore",'btn_table0');
        }
        else if('MSG_CLUB_RoomCard_Not_Enough' == msgID){
            let clubId = backArgList[0];
            for(let i=0;i<this.clubCardNtfs.length;i++){
                if(this.clubCardNtfs[i].clubId == clubId){
                    this.clubCardNtfs.splice(i,1);
                    break;
                }
            }
            if(0 != this.clubCardNtfs.length){
                let data = this.clubCardNtfs[0];
                setTimeout(function(){
                    app.SysNotifyManager().ShowSysMsg('MSG_CLUB_RoomCard_Not_Enough',[data.clubName,data.roomcardattention]);
                },200);
            }
        }
    },
    GetCfgByGameName:function(gameName){
        let cfgList = [];
        for(let key in this.practiceConfig){
            if(gameName == this.practiceConfig[key].gameType)
                cfgList.push(this.practiceConfig[key]);
        }
        return cfgList;
    },
    sendPracticeId:function(){
        var argList = Array.prototype.slice.call(arguments);
        let idx = 0;
        if(typeof argList[0] == 'string'){
             idx = Math.floor(argList[0].substring(('item').length));
        }
        else if(typeof argList[0] == 'number'){
            idx = argList[0];
        }
        this.practiceId = idx;
        app.Client.PracticeRoomCheckSubGame(this.gameType, this.practiceId);
        // let sendPack = {
        //     practiceId:idx
        // }
        // app.NetManager().SendPack('room.CBaseGoldRoom', sendPack, this.OnSuccess.bind(this), this.OnEnterRoomFailed.bind(this));
    },
    OnClick:function(btnName, btnNode){
        let needCfgList=[];
        if('btn_close' == btnName){
            let isShow=this.FormManager.IsFormShow(this.FormManager.MainForm());
            if(isShow==false){
                this.FormManager.ShowForm(this.FormManager.MainForm());
            }
            this.CloseForm();
        }else if('btn_gdyx' == btnName){
            this.FormManager.ShowForm('UIMoreGame');
        }
        else if('btn_xsc' == btnName){
            needCfgList = this.GetCfgByGameName(this.gameType);
            this.sendPracticeId(needCfgList[0].id);
        }else if('btn_cjc' == btnName){
            needCfgList = this.GetCfgByGameName(this.gameType);
            this.sendPracticeId(needCfgList[1].id);
        }else if('btn_zjc' == btnName){
            needCfgList = this.GetCfgByGameName(this.gameType);
            this.sendPracticeId(needCfgList[2].id);
        }else if('btn_gjc' == btnName){
            needCfgList = this.GetCfgByGameName(this.gameType);
            this.sendPracticeId(needCfgList[3].id);
        }else if('btn_go' == btnName){
            let gold = app.HeroManager().GetHeroProperty('gold');
            needCfgList = this.GetCfgByGameName(this.gameType);
            if(0 == needCfgList.length){
                this.ErrLog('needCfgList Error curGameName :' + this.gameType);
                return;
            }
            if(gold < needCfgList[0].min){
                this.WaitForConfirm("MSG_NOTROOMCOIN", [], [], this.ShareDefine.Confirm);
                return;
            }
            let needId = -1;
            for(let i=0;i<needCfgList.length;i++){
                if(gold >= needCfgList[i].min && 
                    (gold <= needCfgList[i].max || 0 == needCfgList[i].max)){
                    needId = needCfgList[i].id;
                    break;
                }
            }
            if(-1 == needId){
                this.ErrLog('CfgError needId = -1');
                return;
            }
            this.sendPracticeId(needId);
        }else if(btnName.startsWith("btn_")){
            this.gameType = btnName.replace('btn_','');
            this.sendGameType();
        }
        else{
                            console.error("OnClick(%s) not find",btnName);
        }
        
    },

    OnSuccess:function(serverPack){
        app.ShareDefine().practiceId = this.practiceId;
    },

    OnEnterRoomFailed:function(serverPack){
        console.log('OnEnterRoomFailed serverPack', serverPack);
    },
});