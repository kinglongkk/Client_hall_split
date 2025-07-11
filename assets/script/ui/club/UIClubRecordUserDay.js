/*
小傅最新修改 2017-10-13 
 */
var app = require("app");
cc.Class({
    extends: require("BaseForm"),

    properties: {
        layout: cc.Node,
    },

    OnCreateInit: function() {
        this.WeChatManager = app.WeChatManager();
        this.FormManager = app.FormManager();
        this.ComTool = app.ComTool();
        this.NetManager = app.NetManager();
        this.HeroManager = app.HeroManager();
        this.heroID = app.HeroManager().GetHeroProperty("pid");

        let messageScrollView = this.node.getChildByName("mask").getComponent(cc.ScrollView);
        messageScrollView.node.on('scroll-to-bottom', this.GetNextPage, this);
    },
    OnShow: function(clubId = 0, unionId = 0) {
        this.node.getChildByName("mask").getComponent(cc.ScrollView).scrollToTop();
        this.DestroyAllChildren(this.layout);
        this.clubId = clubId;
        this.unionId = unionId;
        this.clubData=app.ClubManager().GetClubDataByClubID(clubId);
        this.sort = 1;
        this.type = 0;
        this.page = 1;
        this.GetData();
        this.InitLeftLb();
        this.InitLeft();
    },
    GetData: function() {
        if (this.page == 1) {
            this.DestroyAllChildren(this.layout);
            this.GetCount();
        }
        this.NetManager.SendPack("club.CClubMemberRoomRecord", {
            "clubId": this.clubId,
            'gameType': -1,
            'pageNum': this.page,
            'sort': this.sort,
            "getType": this.type
        }, this.OnPack_CPlayerRoomRecord.bind(this), this.OnPack_CPlayerRoomRecordFail.bind(this));
    },
    GetCount: function() {
        let self = this;
        app.NetManager().SendPack("club.CClubPlayerRecordCount", {
            "clubId": this.clubId,
            "unionId": this.unionId,
            "getType": this.type
        }, function(serverPack) {
            if(self.clubData["showRecordCount"]>0){
                self.node.getChildByName("lb_jushu").getComponent(cc.Label).string = "对局数：" + serverPack.size;
            }else{
                self.node.getChildByName("lb_jushu").getComponent(cc.Label).string = "对局数：*";
            }
            
            self.node.getChildByName("lb_dayingjia").getComponent(cc.Label).string = "大赢家：" + serverPack.winner;
            if (self.unionId > 0) {
                self.node.getChildByName("lb_shuyingfen").getComponent(cc.Label).string = "比赛分：" + serverPack.sumPoint;
            } else {
                self.node.getChildByName("lb_shuyingfen").getComponent(cc.Label).string = "输赢分：" + serverPack.sumPoint;
            }

        }, function() {
            self.node.getChildByName("lb_jushu").getComponent(cc.Label).string = "";
            self.node.getChildByName("lb_dayingjia").getComponent(cc.Label).string = "";
            self.node.getChildByName("lb_shuyingfen").getComponent(cc.Label).string = "";
        });
    },
    GetNextPage: function() {
        this.page++;
        this.GetData();
    },
    SortRecodeByTime: function(a, b) {
        return b.endTime - a.endTime;
    },
    OnPack_CPlayerRoomRecord: function(serverPack) {
        if (serverPack.hasOwnProperty('pRoomRecords')) {
            let recodelist = serverPack.pRoomRecords;
            this.ShowData(recodelist);
        } else {

            return;
        }

    },
    ShowData: function(data) {
        let demo = this.node.getChildByName("demo");
        let demo_user = demo.getChildByName("mask").getChildByName("user_demo");
        for (let i = 0; i < data.length; i++) {
            let child = cc.instantiate(demo);
            let record = data[i];
            child.getChildByName("lb_configName").getComponent(cc.Label).string = record.configName;
            child.getChildByName("lb_game").getComponent(cc.Label).string = this.ShareDefine.GametTypeID2Name[record.gameType];
            child.getChildByName("lb_roomkey").getComponent(cc.Label).string = record.roomKey;
            child.getChildByName("lb_setcount").getComponent(cc.Label).string = this.GetJuString(record.setCount, record.gameType);
            let endTime = this.ComTool.GetDateYearMonthDayHourMinuteString(record.endTime);
            child.getChildByName("lb_time").getComponent(cc.Label).string = endTime;

            //玩家
            let datainfo = JSON.parse(record.dataJsonRes);
            let winnerInfo = null;
            let winPoint = 0;
            if (datainfo) {
                let myPoint = 0;
                let mySportPoint = 0;
                let isChangePoint = false;//是否有普通场分数赋值
                let isChangeSportPoint = false;//是否有比赛场分数赋值
                let playerList = JSON.parse(record.playerList);
                let user_layout = child.getChildByName("mask").getChildByName("layout");
                for (let j = 0; j < playerList.length; j++) {
                    let user = cc.instantiate(demo_user);
                    let pid = playerList[j]["pid"];
                    let headImageUrl = playerList[j]["iconUrl"];
                    let name = playerList[j]["name"];
                    user.getChildByName("lb_name").getComponent(cc.Label).string = name;
                    let playerPoint = this.GetRecord(pid, datainfo.resultsList);

                    if(pid==this.heroID){
                        myPoint=playerPoint;
                        isChangePoint = true;
                    }

                    let lb_point = user.getChildByName("lb_point");
                    if (playerPoint > 0) {
                        lb_point.color = new cc.Color(212, 54, 42);
                        lb_point.getComponent(cc.Label).string = "+" + playerPoint;
                    } else {
                        lb_point.color = new cc.Color(45, 167, 95);
                        lb_point.getComponent(cc.Label).string = playerPoint;
                    }
                    if (winnerInfo == null) {
                        winnerInfo = playerList[j];
                        winPoint = playerPoint;
                    } else {
                        if (playerPoint > winPoint) {
                            winnerInfo = playerList[j];
                            winPoint=playerPoint;
                        }
                    }
                    if (this.unionId > 0) {
                        let sportsPoint = 0;
                        if (datainfo.resultsList) {
                            sportsPoint = this.GetSportsPoint(pid, datainfo.resultsList);
                        } else {
                            sportsPoint = this.GetSportsPoint(pid, datainfo.countRecords);
                        }
                        if(pid==this.heroID){
                            mySportPoint=sportsPoint;
                            isChangeSportPoint = true;
                        }
                        let lb_sportPoint = user.getChildByName("lb_sportPoint");
                        if (sportsPoint > 0) {
                            lb_sportPoint.color = new cc.Color(212, 54, 42);
                            lb_sportPoint.getComponent(cc.Label).string = "赛:+" + sportsPoint;
                        } else {
                            lb_sportPoint.color = new cc.Color(45, 167, 95);
                            lb_sportPoint.getComponent(cc.Label).string = "赛:" + sportsPoint;
                        }
                        lb_sportPoint.x = 20;
                        lb_point.active = false;
                    } else {
                        lb_point.x = 20;
                        user.getChildByName("lb_sportPoint").getComponent(cc.Label).string = "";
                    }
                    user.active = true;
                    user_layout.addChild(user);
                }
                if (winnerInfo != null) {
                    child.getChildByName("lb_winname").getComponent(cc.Label).string = winnerInfo.name;

                    child.getChildByName("lb_winid").getComponent(cc.Label).string = "ID:" + this.ComTool.GetIDByIndex(winnerInfo.pid.toString(), 3);
                } else {
                    child.getChildByName("lb_winname").getComponent(cc.Label).string = "";
                    child.getChildByName("lb_winid").getComponent(cc.Label).string = "";
                }
                if (this.unionId > 0) {
                    //分数没赋值过 那就不显示输赢贴图
                    if(!isChangeSportPoint){
                        child.getChildByName("img_win").active = false;
                        child.getChildByName("img_lost").active = false;
                    }else{
                        child.getChildByName("img_win").active = mySportPoint>0;
                        child.getChildByName("img_lost").active = mySportPoint<=0;
                    }
                } else {
                    //分数没赋值过 那就不显示输赢贴图
                    if(!isChangePoint){
                        child.getChildByName("img_win").active = false;
                        child.getChildByName("img_lost").active = false;
                    }else{
                        child.getChildByName("img_win").active = myPoint>0;
                        child.getChildByName("img_lost").active = myPoint<=0;
                    }
                }

                child.getChildByName("btn_djxq").record = record;
            }

            child.active = true;
            this.layout.addChild(child);
        }
    },
    GetJuString: function(setCount, gameType) {
        let ju = "";
        if (gameType == 57) {
            if (setCount == 30 || setCount == 50 || setCount == 100) {
                return setCount + '锅';
            }
            return setCount;
        }
        if (setCount == 100) {
            //厦门麻将1考服务端下发100局
            ju = '1考';
        } else if (setCount == 201) {
            //福鼎麻将1考服务端下发201局
            ju = '1拷';
        } else if (setCount == 40) {
            ju = '打捆40分';
        } else if (setCount == 50) {
            ju = '打捆50分';
        } else if (setCount > 100 && setCount < 200) {
            //保定易县麻将
            ju = setCount % 100 + '圈';
        } else if (setCount == 310) {
            //南安麻将1课服务端下发310局
            ju = '1课:10分';
        } else if (setCount == 311) {
            //泉州麻将1课服务端下发310局
            ju = '1课:100分';
        } else if (setCount == 312) {
            //衢州麻将局麻服务端下发312局
            ju = '局麻';
        } else if (setCount == 401) {
            //江西抚州关牌服务端下发401局
            ju = '1次';
        } else if (setCount >= 400 && gameType == this.ShareDefine.GameType_GD) {
            setCount = setCount % 400;
            if (setCount == 14) {
                ju = "过A";
            } else {
                ju = "过" + setCount;
            }
        } else if (setCount >= 400 && gameType == this.ShareDefine.GameType_WHMJ) {
            ju = setCount % 400 + "底";
        } else if (setCount >= 600 && gameType == this.ShareDefine.GameType_MASMJ) {
            ju = setCount % 600 + "倒";
        } else if (setCount == 501 && gameType == this.ShareDefine.GameType_GLWSK) {
            ju = "";
        } else {
            ju = setCount;
        }
        return ju;
    },
    GetRecord: function(pid, resultsList) {
        let count = resultsList.length;
        for (let i = 0; i < count; i++) {
            if (resultsList[i]['pid'] == pid) {
                let sportsPoint = resultsList[i]['sportsPoint'];
                if (sportsPoint) {
                    return sportsPoint;
                }
                let point = resultsList[i]['point'];
                if (point) {
                    return point;
                }
                return 0;
            }
        }
        return 0;
    },
    GetSportsPoint: function(pid, resultsList) {
        let count = resultsList.length;
        for (let i = 0; i < count; i++) {
            if (resultsList[i]['pid'] == pid) {
                let sportsPoint = resultsList[i]['sportsPoint'];
                if (sportsPoint) {
                    return sportsPoint;
                }
            }
        }
        return 0;
    },
    OnPack_CPlayerRoomRecordFail: function(serverPack) {
        //this.ScrollViewData({});
        //this.Scrollow.removeAllChildren();
        this.DestroyAllChildren(this.Scrollow);
        return;
    },
    GameId2Name: function(gameId) {
        return this.ShareDefine.GametTypeID2Name[gameId];
    },
    InitLeft: function() {
        let tab = this.node.getChildByName("tab");
        for (let i = 0; i < tab.children.length; i++) {
            tab.children[i].getChildByName('off').active = i != this.type;
            tab.children[i].getChildByName('on').active = i == this.type;
        }
    },
    InitLeftLb: function() {
        let tab = this.node.getChildByName("tab");
        for (let i = 0; i < tab.children.length; i++) {
            if (i <= 2) {
                continue; //今天，昨天，前天
            }
            let lb = this.getDay(i);
            tab.children[i].getChildByName("on").getChildByName("lb").getComponent(cc.Label).string = lb;
            tab.children[i].getChildByName("off").getChildByName("lb").getComponent(cc.Label).string = lb;
        }
    },
    getDay: function(day) {    
        var today = new Date();    
        var targetday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24 * day;    
        today.setTime(targetday_milliseconds); //注意，这行是关键代码
            
        var tYear = today.getFullYear();    
        var tMonth = today.getMonth();    
        var tDate = today.getDate();    
        tMonth = this.doHandleMonth(tMonth + 1);    
        tDate = this.doHandleMonth(tDate);    
        return tMonth + "月" + tDate + "日";
    },
    doHandleMonth: function(month) {
        return month;
    },
    OnClick_ShowMore: function(btnNode) {
        let record = btnNode.record;
        if (this.ShareDefine.GameType_PYZHW == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_BP == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_CDP == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_DCTS == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_JDZTS == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_DD == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_WSBEA == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_JAWZ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_THBBZ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_GYZJMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_ASMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_GSMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_LPTS == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }if (this.ShareDefine.GameType_YFBS == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_GLWSK == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_WXZMMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_CP == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_JXYZ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_YCFXMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_PY == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_KLMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_QWWES == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_SGLK == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_SSE == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_XSDQ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_JYESSZ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_HSHHMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_DYKKFMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }

        if (this.ShareDefine.GameType_HZZMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_XLBBP == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_SDDMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_YXMDMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_KJMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_WXQWZMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_QXWQ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_GDCSMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        if (this.ShareDefine.GameType_GDYBZMJ == record.gameType) {
            let smallName = this.ShareDefine.GametTypeID2PinYin[record.gameType];
            let path = "ui/uiGame/" + smallName + "/UIRecordAllResult_" + smallName;
            this.FormManager.ShowForm(path, record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId);
            return;
        }
        this.FormManager.ShowForm("UIRecordAllResult", record.roomId, JSON.parse(record.playerList), record.gameType, this.unionId, record.roomKey);
    },
    OnClick: function(btnName, btnNode) {
        if ('btn_close' == btnName) {
            this.CloseForm();
        } else if (btnName.startsWith("btn_tian")) {
            this.type = parseInt(btnName.replace("btn_tian", ''));
            this.GetData();
            this.InitLeft();

        } else if ('btn_djxq' == btnName) {
            this.OnClick_ShowMore(btnNode);
        } else if (btnName == "btn_tongji") {
            this.FormManager.ShowForm("ui/club/UIClubPlayerRecord", this.clubId, this.unionId);
        } else if ("btn_shuaxin" == btnName) {
            this.page = 1;
            this.node.getChildByName("mask").getComponent(cc.ScrollView).scrollToTop();
            this.GetData();
        } else if ("btn_time_sort" == btnName) {
            this.page = 1;
            if (this.sort == 0) {
                this.sort = 1;
            } else {
                this.sort = 0;
            }
            this.GetData();
        } else {
                            console.error("OnClick(%s) not find btnName", btnName);
        }
    },
});