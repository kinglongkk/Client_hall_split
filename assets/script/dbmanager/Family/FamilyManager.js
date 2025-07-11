/*
 FamilyManager 工会管理器
 */
var app = require('app');

var FamilyManager = app.BaseClass.extend({

	Init:function(){
		this.JS_Name = "FamilyManager";

		this.NetManager = app.NetManager();

		this.OnReload();

		this.NetManager.RegNetPack("family.C2117InitFamily", this.OnPack_InitData, this);

		//评论初始化工会最佳留言
		//this.NetManager.RegNetPack("family.C2118AddFamilyContent", this.OnPack_FamilyContent, this);
		//this.NetManager.RegNetPack("family.C2121InitFamilyContent", this.OnPack_FamilyContent, this);

		//服务器推送
		this.NetManager.RegNetPack("S2120_FamilyNewBest", this.OnPack_FamilyNewBest, this);

		this.Log("Init");
	},

	//切换账号
	OnReload:function(){

		//{
		//	"familyID":1000,
		//	"createTime":1000,
		//	...
		//}
		this.dataInfo = {}
		this.familyContentInfo = {}

		this.messageList = [];
		this.thumbsUpList = [];
	},

	//清除工会数据
	ClearFamilyInfo:function(){
		this.OnReload();
	},

	//------------封包函数------------------
	OnPack_InitData:function(serverPack){

		let publicCardListString = serverPack["yDayPublicCardListString"];

		let publicCardList = [];

		if(publicCardListString){
			try{
				publicCardList = JSON.parse(publicCardListString);
			}
			catch (error){
				                console.error("OnPack_InitData error:%s", error.stack);
				publicCardList = [];
			}
		}

		serverPack["yDayPublicCardList"] = publicCardList;
		this.dataInfo = serverPack;

		let pid = serverPack["yDayPid"];
		let headImageUrl = serverPack["yDayHeadImageUrl"];
		app.WeChatManager().InitHeroHeadImage(pid, headImageUrl);

		//收到工会信息请求工会最佳留言
		this.SendRequestFamilyContent();

		app.Client.OnEvent("GetFamilyInfo", {});
	},

	OnPack_FamilyContent:function(serverPack){
        let messageInfoList = serverPack["messageInfoList"];
        this.messageList = [];
        this.thumbsUpList = [];
		this.familyContentInfo = {};
		let headImageDict = {};
		if(messageInfoList!==""){
        let count = messageInfoList.length;
        for(let i = 0; i < count; i++){
	        let messageInfo = messageInfoList[i];
            let text = messageInfo["content"];
            let pid = messageInfo["pid"];
            let headImageUrl = messageInfo["headImageUrl"];
            if(text){
                this.messageList.push(pid);
            }
            else{
                this.thumbsUpList.push(pid);
            }

	        this.familyContentInfo[messageInfo["keyID"]] = messageInfo;

	        headImageDict[pid] = headImageUrl;
        }
    	}
		app.WeChatManager().InitHeroHeadImageByDict(headImageDict);

		app.Client.OnEvent("FamilyContent", {});
	},

	OnPack_FamilyNewBest:function(serverPack){
		if(this.dataInfo["familyID"] != serverPack["familyID"]){
			                console.error("OnPack_FamilyNewBest familyID error:", serverPack);
			return
		}
		//清空留言
		this.familyContentInfo = {};
		this.messageList = [];
		this.thumbsUpList = [];

		let publicCardListString = serverPack["yDayPublicCardListString"];
		let publicCardList = [];
		if(publicCardListString){
			try{
				publicCardList = JSON.parse(publicCardListString);
			}
			catch (error){
				                console.error("OnPack_FamilyNewBest error:%s", error.stack);
				publicCardList = [];
			}
		}
		serverPack["yDayPublicCardList"] = publicCardList;

		this.dataInfo.Update(serverPack);

		let pid = serverPack["yDayPid"];
		let headImageUrl = serverPack["yDayHeadImageUrl"];
		app.WeChatManager().InitHeroHeadImage(pid, headImageUrl);

		app.Client.OnEvent("FamilyNewBest", {});
	},
    
	//-------------设置接口---------------------
	SetFamilyProperty:function(property, value){
		if(!this.dataInfo.hasOwnProperty(property)){
			                console.error("SetFamilyProperty not find:%s",property);
			return
		}
		this.dataInfo[property] = value;
	},
	//--------------获取接口------------------------
	//获取点赞玩家人数
    HavePlayerClickLikeNumber:function () {
		return this.thumbsUpList.length;
    },

	HavePlayerClickLike:function(playerID){
		return this.thumbsUpList.InArray(playerID);
	},

	HavePlayerMessage:function(playerID){
		return this.messageList.InArray(playerID);
	},
	GetFamilyProperty:function(property){
		if(!this.dataInfo.hasOwnProperty(property)){
			                console.error("GetFamilyProperty not find:%s",property);
			return
		}
		return this.dataInfo[property];
	},
	GetFamilyDataInfo:function () {
        return this.dataInfo;
    },

	//获取工会留言
	GetFamilyContentInfo:function(){
		return this.familyContentInfo
	},

	//---------------发包接口------------------------


	//获取工会数据
	SendGetFamilyInfo:function(){
		//this.NetManager.SendPack("family.C2117InitFamily", {});
	},

	SendRequestFamilyContent:function(){
		this.NetManager.SendPack("family.C2121InitFamilyContent", {});
	},

	//发送留言
	SendAddFamilyContent:function(likeID, content){
		this.NetManager.SendPack("family.C2118AddFamilyContent", {"likeID":likeID, "content":content});
	},

});


var g_FamilyManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
	if(!g_FamilyManager){
		g_FamilyManager = new FamilyManager();
	}
	return g_FamilyManager;
}