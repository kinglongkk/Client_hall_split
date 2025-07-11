var app = require("app");
cc.Class({
    extends: require("BaseForm"),

    properties: {
        prefab_gameBtn: cc.Prefab,
        prefab_ChildCreateRoom: cc.Prefab,

        node_LeftLayout:cc.Node,

        scroll_Left:cc.ScrollView,

        node_Right:cc.Node,
    },

    //初始化
    OnCreateInit:function(){
        this.roomcostConfig = this.SysDataManager.GetTableDict("roomcost");
        this.gameCreateConfig = this.SysDataManager.GetTableDict("gameCreate");
        this.LocalDataManager = app.LocalDataManager();
        this.FormManager = app.FormManager();
        this.ComTool = app.ComTool();

        this.RedColor1 = new cc.Color(0, 155, 46);
        this.RedColor2 = new cc.Color(182, 64, 12);
        this.WhiteClolor = new cc.Color(79,79,79);

        this.gameType = '';
        this.lastParentBtnIcon = null;
        this.lastChildBtnIcon = null;
        this.Toggles = {};

        this.addPrefabWidth = 200;   
    },
    InitGameBtnList:function(serverPack){
         console.log("当前时间06:"+ (new Date().getTime()));
        //this.node_LeftLayout.removeAllChildren();
        this.DestroyAllChildren(this.node_LeftLayout);
        let gameList={};
        if(undefined == serverPack.gameList ||
            '' == serverPack.gameList || 
            'null' == serverPack.gameList){
            gameList = {
                
            };
            if('' == this.gameType){
                for(let key in gameList){
                    this.gameType = key;
                    break;
                }
            }
        }else{
            let gameIDList=serverPack.gameList;
            for(let i=0;i<gameIDList.length;i++){
                //如果是自由扑克，有两种玩法，需要自行增加
                if (gameIDList[i] == 1) {
                    gameList["sss_zz"] = "庄家扑克";
                    gameList["sss_dr"] = "多人扑克";
                } else if (gameIDList[i] == 4) {//如果是双十扑克，有六种玩法，需要自行增加
                    gameList["zyqz_nn"] = "自由抢庄";
                    gameList["nnsz_nn"] = "双十上庄";
                    gameList["gdzj_nn"] = "固定庄家";
                    gameList["mpqz_nn"] = "明牌抢庄";
                    gameList["tbnn_nn"] = "通比双十";
                    gameList["lz_nn"] = "轮庄双十";
                }else if (gameIDList[i] == 18) {//如果是三公，有5种玩法，需要自行增加
                    gameList["zyqz_sg"] = "三公自由抢庄",
                    gameList["sgsz_sg"] = "三公上庄",
                    gameList["gdzj_sg"] = "三公固定庄家",
                    gameList["mpqz_sg"] = "三公明牌抢庄",
                    gameList["tb_sg"] = "通比三公"
                }else{
                    let gamePinYin=this.ShareDefine.GametTypeID2PinYin[gameIDList[i]];
                    let gameName=this.ShareDefine.GametTypeID2Name[gameIDList[i]];
                    gameList[gamePinYin]=gameName;
                    if(i==0){
                        if('' == this.gameType){
                            this.gameType=gamePinYin;
                        }
                    }
                }
                
            }
        }
        let j=0;
        let enableStr = '';
        if(this.clubData)
            enableStr = this.clubData.enableGameType;
        for(let key in gameList){
            let node = cc.instantiate(this.prefab_gameBtn);
            node.name = key;
            node.active = true;
            let btn = node.getChildByName('btn_game');
            btn.name = 'btn_' + key;
            node.getChildByName('icon_off').getComponent(cc.Label).string = gameList[key];
            node.getChildByName('icon').getChildByName('icon_on').getComponent(cc.Label).string = gameList[key];
            btn.on('click',this.OnGameBtnClick,this);
            node.getChildByName('icon').active = false;
            
            let lastColor = node.color;
            if('' != enableStr){
                this.SetBtnInteractable(btn,false);
            }

            // if ('pdk' ==key) {
            //     //如果是跑得快需要修改跑得快按钮名字，之后获取配置表是根据按钮名字来获取，坑！！大坑！！！
            //     btn.name = 'btn_pdk_lyfj';    
            // }
            this.node_LeftLayout.addChild(node);
            
        }
         console.log("当前时间07:"+ (new Date().getTime()));
        this.scroll_Left.scrollToTop();
         console.log("当前时间08:"+ (new Date().getTime()));
        this.ShowGame();
    },
    SetBtnInteractable:function(btnNode,bEnable){
        let btn = btnNode.getComponent(cc.Button);
        if(btn)
            btn.interactable = bEnable;
    },
    //--------------显示函数-----------------
    OnShow:function(serverPack,gamename='',clubData=null,unionData=null){
	    this.clubWinnerPayConsume=0;
	    this.gdToggleIndex = -1;
        this.gameType='';
        this.clubData = clubData;
        this.unionData = unionData;
        if('' != gamename){
            this.gameType=gamename;
        }else{
            this.gameType=this.LocalDataManager.GetConfigProperty("SysSetting","LastGameType");
        }
        
        if(clubData && '' != clubData.enableGameType){
            this.gameType = clubData.enableGameType;
        }
        let self = this;
        //如果是亲友圈或者联盟取对应的游戏
        console.log("当前时间02:"+ (new Date().getTime()));
        if (clubData != null) {
            app.NetManager().SendPack('club.CClubGameList',{"clubId":clubData.clubId},function(data){
                console.log("当前时间03:"+ (new Date().getTime()));
                self.InitGameIdList(serverPack,data.split(","));
            });
        }else if (unionData != null) {
            app.NetManager().SendPack('union.CUnionGameList',{"unionId":unionData.unionId},function(data){
                console.log("当前时间04:"+ (new Date().getTime()));
                self.InitGameIdList(serverPack,data.split(","));
            });
        }else{
            this.InitGameIdList(serverPack,serverPack.gameList);
        }
//        this.ShowShiMing();
    },
    InitGameIdList(serverPack,gameIDList){
        console.log("当前时间05:"+ (new Date().getTime()));
        //判断下本地保存的gameType是否存在列表中
        serverPack.gameList = gameIDList;
        this.allGameType = [];
        for(let i=0;i<gameIDList.length;i++){
            let gamePinYin=this.ShareDefine.GametTypeID2PinYin[gameIDList[i]];
            this.allGameType.push(gamePinYin);
        }
        if (this.allGameType.indexOf(this.gameType) < 0) {
            //本地保存的gameType不在列表中，切换城市引起的，需要处理下
            this.gameType = "";
        }
        let isShowQuanKa = false;
        if (this.clubData) {
            isShowQuanKa = true;
        }
        this.FormManager.ShowForm('UITop', "UICreatRoom", isShowQuanKa);
        this.InitGameBtnList(serverPack);
    },
    OnClose:function(){
        let scroll_Left_layout=this.GetWndNode('sp_room/leftFrame/mark/layout');
        //scroll_Left_layout.removeAllChildren();
        this.DestroyAllChildren(scroll_Left_layout);
    },
    ShowGame:function(gameType){
        let path = '';
        let path2 = '';
        let needParentName = '';
        if(!gameType){
            gameType = this.gameType;
        }
        needParentName = gameType;

        //如果是跑得快需要修改跑得快按钮名字，之后获取配置表是根据按钮名字来获取，坑！！大坑！！！
        // if (gameType == 'pdk') {
        //     gameType = 'pdk_lyfj';
        // }
        // if (needParentName == 'pdk_lyfj') {
        //     needParentName = 'pdk';
        // }
        if (gameType == 'sss') {
            needParentName = 'sss_zz';
            gameType = 'sss_zz';
        }

        path = 'sp_room/leftFrame/mark/layout/' + needParentName + '/btn_' + gameType; 
        let node = this.GetWndNode(path);
        if(node){
            node.emit('click', {"node":node});
        }
    },

    OnGameBtnClick:function(event){
        this.scroll_Left.stopAutoScroll();
        let btnName = event.node.name;
        let parentNode = event.node.parent;
        if('childs' != parentNode.name){
            if(this.lastParentBtnIcon)
                this.lastParentBtnIcon.active = false;
            let icon = parentNode.getChildByName('icon');
            this.lastParentBtnIcon = icon;
            this.lastParentBtnIcon.active = true;

            if(this.lastChildBtnIcon){
                this.lastChildBtnIcon.active = false;
            }
        }

        if(btnName.startsWith('btn_')){
            //this.node_Right.removeAllChildren();
            this.DestroyAllChildren(this.node_Right);
            let curType = btnName.substring(('btn_').length,btnName.length);
            this.gameType = curType;
            if (curType == "sss_zz" || curType == "sss_dr") {
                curType = "sss";
            }
            if (curType == "zyqz_nn" || curType == "nnsz_nn" ||
	            curType == "gdzj_nn" || curType == "mpqz_nn" ||
	            curType == "tbnn_nn" || curType == "lz_nn") {
                curType = "nn";
            }
            if (curType == "zyqz_sg" ||
                curType == "sgsz_sg" ||
                curType == "gdzj_sg" ||
                curType == "tb_sg" ||
                curType == "mpqz_sg") {
                curType = "sg";
            }
            let childCreateRoom = cc.instantiate(this.prefab_ChildCreateRoom);
            let componentName = curType + "ChildCreateRoom";
            childCreateRoom.addComponent(componentName);
            let baseComponent = childCreateRoom.getComponent(componentName);
            if (!baseComponent) {
                this.ErrLog('OnGameBtnClick no find component : ' + curType);
                return;
            }
            this.node_Right.addChild(childCreateRoom);
            baseComponent.InitBase(this.clubData, this.unionData, this.gameType);
            baseComponent.RefreshAllToggles(this.gameType);
            this.FormManager.CloseForm("UIMessageTip");
        }
        else{
            this.ErrLog('OnGameBtnClick click error btnName : ' + btnName);
            return;
        }
    },
    OnClick:function(btnName, btnNode){
        if('btn_gdyx' == btnName){
            this.FormManager.ShowForm('UIMoreGame',this.clubData, this.unionData);
        }
    },

    close:function(){
        
        this.FormManager.CloseForm("UICreatRoom");
    },
    Click_btn_buy:function () {
        let clientConfig = app.Client.GetClientConfig();
        if (app.PackDefine.APPLE_CHECK == clientConfig["appPackType"]) return
        this.FormManager.ShowForm("UIStore");
    },
    OnConFirm:function(clickType, msgID, backArgList){
        if(clickType != "Sure"){
            return
        }
        if("goBuyCard" == msgID){
            let clientConfig = app.Client.GetClientConfig();
            if (app.PackDefine.APPLE_CHECK == clientConfig["appPackType"]) return
            app.FormManager().ShowForm("UIStore");
            return;
        }
    }
});