/*
    UIMessage 模态消息界面
*/

var app = require("app");

cc.Class({
    extends: require("BaseForm"),

    properties: {
        bg_turn:cc.Node,
        daylist:cc.Node,
        loglist:cc.Node,
        turn_light:cc.Node,

        recordListDemo:cc.Node,
        logListContent:cc.Node,

        login_day:cc.Label,

        light1:cc.SpriteFrame,
        light2:cc.SpriteFrame,
        light3:cc.SpriteFrame,
        light4:cc.SpriteFrame,
        light5:cc.SpriteFrame,
        light6:cc.SpriteFrame,
        light7:cc.SpriteFrame,
        light8:cc.SpriteFrame,

        icon_card0:cc.SpriteFrame,  //再接再励
        icon_card1:cc.SpriteFrame,  //乐斗
        icon_card2:cc.SpriteFrame,  //话费
        icon_card6:cc.SpriteFrame, //鸭子
        icon_card7:cc.SpriteFrame, //ipro
        icon_card8:cc.SpriteFrame, //小米电视
        icon_card9:cc.SpriteFrame, //开始
        icon_card10:cc.SpriteFrame, //iphonex
    },
    //初始化
    OnCreateInit:function(){
        this.FormManager=app.FormManager();
        this.signin = this.SysDataManager.GetTableDict("signin");
        this.speed=0;
        this.FinishRoation=0;
        this.RegEvent("OnChouJiangLingQu", this.Event_LingQuNtf);
        this.RegEvent("CodeError", this.Event_CodeError, this);
    },
    Event_CodeError:function(event){
        let codeInfo = event;
        if(codeInfo["Code"] == 1502){
            app.SysNotifyManager().ShowSysMsg('抽奖活动暂未开启');
        }else if(codeInfo["Code"] == 626){
            app.SysNotifyManager().ShowSysMsg('抽奖次数不足，无法抽奖');
        }
    },
    //---------显示函数--------------------
    OnShow:function(luckDrawData,luckDrawSprs){
        this.setCount=0;
        let heroID = app.HeroManager().GetHeroProperty("pid");
        if (cc.sys.isNative) {
            this.getRecordUrl = "http://185.213.26.71/index.php?module=Api&action=GetLuckRecords&pid="+heroID;
            this.getRecordByTypeUrl = "http://185.213.26.71/index.php?module=Api&action=GetLuckRecords&pid="+heroID+"&type=8";
        }else{
            this.getRecordUrl = "http://185.213.26.71/index.php?module=Api&action=GetLuckRecords&pid="+heroID;
            this.getRecordByTypeUrl = "http://185.213.26.71/index.php?module=Api&action=GetLuckRecords&pid="+heroID+"&type=8";
        }
        this.SendHttpRequest(this.getRecordUrl, "","GET",{});
        // this.NewZhongJiang();
        this.LuckDrawList(luckDrawData,luckDrawSprs);
        this.FreeLuckDraw();
        // this.schedule(this.NewZhongJiang,5);
    },
    Turn:function(finish,isShiChou=false){
        this.chouing=1; //抽奖开始
        this.bg_turn.rotation=0;
        this.NowRotation=0;
        this.speed=1;
        if(isShiChou==true){
            this.FinishRoation=720*8+(360-finish*30)+30;
        }else{
            this.FinishRoation=720*2+(360-finish*30)+30;
        }
        this.Zhuang();

        this.linght=1;
        this.schedule(this.lightChange,0.2);
        
    },
    OnUpdate:function(){
        if(this.NowRotation>=this.FinishRoation){
            this.ShowJiang();
            return;
        }else if(this.NowRotation<this.FinishRoation){
            this.Zhuang();
        }
    },
    lightChange:function(){
            if(this.linght==0){
                return;
            }
            this.linght=this.linght+1;
            if(this.linght==9){
                this.linght=1;
            }
            if(this.linght==1){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light1;
            }else if(this.linght==2){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light2;
            }else if(this.linght==3){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light3;
            }else if(this.linght==4){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light4;
            }else if(this.linght==5){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light5;
            }else if(this.linght==6){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light6;
            }else if(this.linght==7){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light7;
            }else if(this.linght==8){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light8;
            }            
        
    },
    ShowJiang:function(){
        if(this.chouing==0){
            return;
        }
        this.SendHttpRequest(this.getRecordUrl, "","GET",{});
        this.FreeLuckDraw();
        this.chouing=0; //抽奖结束
        this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light1;
        this.bg_turn.rotation=this.FinishRoation;
        this.linght=0;
        this.ChouJiangResult();
        //this.SoundManager.StopSoundByAudioID('zhuanpan');
    },
    OnClose:function(){
        app.NetManager().SendPack("game.CPlayerLuckDraw",{"type":7});
    },
    Zhuang:function(){
        //this.SoundManager.PlaySound('zhuanpan');
        this.NowRotation=this.NowRotation+this.speed;
        if(this.NowRotation>this.FinishRoation){
            return;
        }
        /*if(this.speed){
            let id=parseInt(this.speed*10%9);
            if(id==1){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light1;
            }else if(id==2){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light2;
            }else if(id==3){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light3;
            }else if(id==4){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light4;
            }else if(id==5){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light5;
            }else if(id==6){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light6;
            }else if(id==7){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light7;
            }else if(id==8){
                this.turn_light.getComponent(cc.Sprite).spriteFrame=this.light8;
            }
        }*/
        if(this.FinishRoation-this.NowRotation<720){
            if(this.FinishRoation-this.NowRotation<15){
                this.speed=this.speed-0.1;
                if(this.speed<0.2){
                    this.speed=0.2;
                }
            }else if(this.FinishRoation-this.NowRotation<30){
                this.speed=this.speed-0.1;
                if(this.speed<0.6){
                    this.speed=0.6;
                }
            }else if(this.FinishRoation-this.NowRotation<60){
                this.speed=this.speed-0.1;
                if(this.speed<0.8){
                    this.speed=0.8;
                }
            }else if(this.FinishRoation-this.NowRotation<120){
                this.speed=this.speed-0.1;
                if(this.speed<1){
                    this.speed=1;
                }
            }else if(this.FinishRoation-this.NowRotation<240){
                this.speed=this.speed-0.1;
                if(this.speed<2){
                    this.speed=2;
                }

            }else{
                this.speed=this.speed-0.1;
                if(this.speed<3){
                    this.speed=3;
                }
            }
        }else{
            if(this.speed<8){
                this.speed=this.speed+0.1;
            }
        }
        this.bg_turn.rotation=this.NowRotation;
    },
    ShowJiangLi:function(type,num,j,day){

        if(type==6){
            //鸭子
            this.daylist.getChildByName('day'+j).getChildByName('icon').getComponent(cc.Sprite).spriteFrame=this.icon_card6;

        }else if(2 == type){
            this.daylist.getChildByName('day'+j).getChildByName('icon').getComponent(cc.Sprite).spriteFrame=this.icon_card2;
        }
        else if(type==1){
            //乐斗
            this.daylist.getChildByName('day'+j).getChildByName('icon').getComponent(cc.Sprite).spriteFrame=this.icon_card1;
        }
        if(this.loginnum>=day){
            this.daylist.getChildByName('day'+j).getChildByName('ling').active=true;
        }else{
            this.daylist.getChildByName('day'+j).getChildByName('ling').active=false;
        }
        this.daylist.getChildByName('day'+j).getChildByName('lb_num').getComponent(cc.Label).string='x'+num;
        this.daylist.getChildByName('day'+j).getChildByName('tian').getChildByName('lb_day').getComponent(cc.Label).string='第'+day+'天';
    },
    ReSetLingQu:function(loginNum){
        this.loginnum=loginNum;
        let j=1;
        for(let key in this.signin){
            let day = this.signin[key].Day;
            let type=this.signin[key].Type;
            if(type=='LoginIn'){
                let UniformitemId=this.signin[key].UniformitemId;
                let UniCount=this.signin[key].Count;
                this.ShowJiangLi(UniformitemId,UniCount,j,day);
                j++;
            }
        }
    },
    
    // NewZhongJiang:function(){
    //     if(this.chouing==1){
    //         return;
    //     }
    //     let that=this;
    //     app.NetManager().SendPack("game.CPlayerLuckDraw",{"type":2}, function(event){
    //            //console.log(event);
    //            that.NewZhongJiangData(event);
    //     }, function(){});
    // },
    // NewZhongJiangData:function(serverPack){
    //     //console.log(serverPack);
    //     let luckDraws=serverPack.luckDraws;
    //     for(let i=0;i<luckDraws.length;i++){
    //         this.ShowNewZhongJiangData(luckDraws[i],i+1);
    //     }
    // },
    // ShowNewZhongJiangData:function(data,i){
    //     let logNode=this.loglist.getChildByName('list'+i);
    //     let pName=data.pName;
    //     let prizeName=data.prizeName;
    //     logNode.getChildByName('rich_text').getComponent(cc.RichText).string='<color=#942e2e>●恭喜</color> <color=#8328c3>'+pName.substring(0,10)+'</color> <color=#942e2e>  摇到 '+prizeName+'</color> ';
    // },
    FreeLuckDraw:function(){
        let self = this;
        app.NetManager().SendPack("luckdraw.CLuckDrawQuery", {},function(event){
            let lb_num = self.GetWndNode('btn_choujiang/lb_num');
            lb_num.getComponent(cc.Label).string = event.value+"次";
            let tipStr = "";
            //时间段
            if (event.dateType == 0) {
                tipStr = "每天"+app.ComTool().GetDateHourMinuteString(event.startTime)+"到"+app.ComTool().GetDateHourMinuteString(event.endTime);
            }else if (event.dateType == 1) {
                if (event.timeSlot == 0) {
                    tipStr = "每周"+app.ComTool().GetDateDayString(event.startTime)+"到每周"+app.ComTool().GetDateDayString(event.endTime);
                }else if (event.timeSlot == 1) {
                    tipStr = "每周"+app.ComTool().GetDateDayString(event.startTime)+app.ComTool().GetDateHourMinuteString(event.startTime)+"到每周"+app.ComTool().GetDateDayString(event.endTime)+app.ComTool().GetDateHourMinuteString(event.endTime);
                }
            }else if (event.dateType == 2) {
                tipStr = "从"+app.ComTool().GetDateYearMonthDayHourMinuteString(event.startTime)+"到"+app.ComTool().GetDateYearMonthDayHourMinuteString(event.endTime);
            }
            //类型
            if (event.type == 0) {
                tipStr = "可免费抽奖"+event.luckDrawValue+"次，当前剩余"+event.value+"次";
            }else if (event.type == 1) {
                tipStr += "，累计消耗"+event.conditionValue+"钻石，可抽奖"+event.luckDrawValue+"次，当前剩余"+event.value+"次";
            }else if (event.type == 2) {
                tipStr += "，累计局数"+event.conditionValue+"局，可抽奖"+event.luckDrawValue+"次，当前剩余"+event.value+"次";
            }else if (event.type == 3) {
                tipStr += "，累计获得大赢家"+event.conditionValue+"次，可抽奖"+event.luckDrawValue+"次，当前剩余"+event.value+"次";
            }
            self.node.getChildByName('tip1').getComponent(cc.Label).string = tipStr;
        },function(error){
            
        });
    },
    LuckDrawList:function(luckDrawData,luckDrawSprs){
        for(let i=0;i<luckDrawData.length;i++){
            let luckData=luckDrawData[i];
            let luckSpr = null;
            for (let j = 0; j < luckDrawSprs.length; j++) {
                if (luckData.id == luckDrawSprs[j].id) {
                    luckSpr = luckDrawSprs[j].spriteFrame;
                }
            }
            this.ShowLuckData(luckData,i+1,luckSpr);
        }
        // app.NetManager().SendPack("game.CPlayerLuckDraw", {"type":1}, function(event){
        //      //console.log(event);
        //      that.setCount=event.setCount;
        //      that.node.getChildByName('tip1').getComponent(cc.Label).string='每天玩64局就送一次免费抽奖（当前'+that.setCount+'局）,不累加';
        //      let loginNum=event.loginNum;
        //      that.login_day.string=loginNum;
        //      that.ReSetLingQu(loginNum);
        //      let luckDraws=event.luckDraws;
        //      for(let i=0;i<luckDraws.length;i++){
        //         let luckData=luckDraws[i];
        //         that.ShowLuckData(luckData,i+1);
        //      }

        // }, function(){});


    },
    Event_LingQuNtf:function(event){
        // this.login_day.string=event.detail.loginNum;
        // this.ReSetLingQu(event.detail.loginNum);
    },
    ShowLuckData:function(luckData,i,luckSpr){
        let luckNode=this.bg_turn.getChildByName('jiang'+i);
        luckNode.id = luckData.id;
        let prizeName=luckData.prizeName;
        let prizeType=luckData.prizeType;
        let rewardNum=luckData.rewardNum;
        let iconNode=luckNode.getChildByName('icon');
        iconNode.getComponent(cc.Sprite).spriteFrame=luckSpr;
        //let BaseWidth=84.8;
        //let BaseHeight=97.6;
        let lb_num=luckNode.getChildByName('lb_num').getComponent(cc.Label);
        if(rewardNum>10000){
            lb_num.string=parseInt(rewardNum/10000).toString() + '万';;
        }else{
            lb_num.string=rewardNum;
        }
        if (prizeType == 0) {
            //谢谢参与没有数量
            lb_num.string="";
        }else if (prizeType == 8) {
            lb_num.string = lb_num.string + "元";
        }
        //iconNode.width=BaseWidth;
        //iconNode.height=BaseHeight;
    },
    OnClose:function(){

    },
    ChouJiangResult:function(){
    	if(this.luckyData!=null && this.luckyData!=''){
        	this.FormManager.ShowForm('UIChouJiangResult',this.luckyData);
    	}
    },
    //---------点击函数---------------------
	OnClick:function(btnName, eventData){
        if(btnName == "btn_choujiang"){
            if(this.chouing==1){
                return;
            }
            // this.Turn(5);return;
            this.luckyData=null;
            let that=this;
            app.NetManager().SendPack("luckdraw.CLuckDrawExec",{}, function(event){
               //console.log(event);
               //that.Turn(5);
               let prizeId=0;
               let luckSpr = null;
               for (let i = 0; i < 12; i++) {
                   let luckNode=that.bg_turn.getChildByName('jiang'+(i+1));
                   if (event.id == luckNode.id) {
                        let iconNode=luckNode.getChildByName('icon');
                        luckSpr = iconNode.getComponent(cc.Sprite).spriteFrame;
                        prizeId = i+1;
                        break;
                   }
               }
               if (prizeId > 0 && luckSpr != null) {
                    that.Turn(prizeId);
                   if(event.prizeType==0){
                        that.luckyData=null;
                   }else{
                        that.luckyData=event;
                        that.luckyData.luckSpr = luckSpr;
                   }
               }else{
                    console.log("找不到奖励");
                    app.SysNotifyManager().ShowSysMsg('找不到奖励：'+event.id);
               }
               
            }, function(){});

		}
		else if(btnName == "btn_jilu"){
            this.SendHttpRequest(this.getRecordByTypeUrl, "","GET",{});
		}
        else if(btnName == "btn_close"){
            this.CloseForm();
        }
		else{
			                console.error("OnClick:%s not find", btnName);
		}
	},

    SendHttpRequest:function(serverUrl, argString, requestType, sendPack){
        app.NetRequest().SendHttpRequest(serverUrl, argString, requestType, sendPack, 2000, 
            this.OnReceiveHttpPack.bind(this), 
            this.OnConnectHttpFail.bind(this),
            null,
            this.OnConnectHttpFail.bind(this),
		);
        // var url = [serverUrl, argString].join("")

        // var dataStr = JSON.stringify(sendPack);

        // //每次都实例化一个，否则会引起请求结束，实例被释放了
        // var httpRequest = new XMLHttpRequest();

        // httpRequest.timeout = 2000;


        // httpRequest.open(requestType, url, true);
        // //服务器json解码
        // httpRequest.setRequestHeader("Content-Type", "application/json");
        // var that = this;
        // httpRequest.onerror = function(){
        //     that.ErrLog("httpRequest.error:%s", url);
        //     that.OnConnectHttpFail(serverUrl, httpRequest.readyState, httpRequest.status);
        // };
        // httpRequest.ontimeout = function(){
            
        // };
        // httpRequest.onreadystatechange = function(){
        //     //执行成功
        //     if (httpRequest.status == 200){
        //         if(httpRequest.readyState == 4){
        //             that.OnReceiveHttpPack(serverUrl, httpRequest.responseText);
        //         }
        //     }
        //     else{
        //         that.OnConnectHttpFail(serverUrl, httpRequest.readyState, httpRequest.status);
        //         that.ErrLog("onreadystatechange(%s,%s)", httpRequest.readyState, httpRequest.status);
        //     }
        // };
        // httpRequest.send(dataStr);

    },
    OnReceiveHttpPack:function(serverUrl, httpResText){
        try{
            let serverPack = JSON.parse(httpResText);
            if(serverUrl==this.getRecordUrl){
                this.node.getChildByName("logList").getComponent(cc.ScrollView).scrollToTop();
                //this.logListContent.removeAllChildren();
                this.DestroyAllChildren(this.logListContent);
                for (let i = 0; i < serverPack.data.length; i++) {
                    let child = cc.instantiate(this.recordListDemo);
                    let timeStr = app.ComTool().GetDateYearMonthDayHourMinuteString(serverPack.data[i].timestamp);
                    let prizeStr = "";
                    if (serverPack.data[i].prizeType == 1) {
                        prizeStr = serverPack.data[i].rewardNum + "个乐豆";
                    }else if (serverPack.data[i].prizeType == 2) {
                        prizeStr = serverPack.data[i].rewardNum + "个钻石";
                    }else if (serverPack.data[i].prizeType == 8) {
                        prizeStr = serverPack.data[i].rewardNum + "元红包";
                    }
                    let logStr = '<color=#942e2e>●恭喜您于</color> <color=#8328c3>'+timeStr+'</color> <color=#942e2e>  摇到 '+prizeStr+'</color>';
                    child.getChildByName("rich_text").getComponent(cc.RichText).string = logStr;
                    child.active = true;
                    this.logListContent.addChild(child);
                }
            }else if(serverUrl==this.getRecordByTypeUrl){
                app.FormManager().ShowForm('UIChouJiangLog',serverPack.data);
            }
        }
        catch (error){
            
        }
    },
    OnConnectHttpFail:function(serverUrl, readyState, status){
        
    },
});
