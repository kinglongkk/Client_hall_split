/*
 TalkingDataManager.js 统计数据管理器
 */
var app = require('app');

var TalkingDataManager = app.BaseClass.extend({

	Init:function(){
		this.JS_Name = "TalkingDataManager";

		this.ShareDefine = app.ShareDefine();

		app.Client.RegEvent("PlayerLoginOK", this.OnEvent_PlayerLoginOK, this);
		app.Client.RegEvent("HeroProperty", this.OnEvent_HeroProperty, this);

		//如果存在全局sdk对象
		this.sdk = window.TDGA;

		this.OnReload();
		this.Log("Init");
	},

	OnReload:function(){

	},

	OnEvent_PlayerLoginOK:function(){
		let accountInfo = app.HeroAccountManager().GetAccountInfo();
		let heroInfo = app.HeroManager().GetHeroInfo();
		let heroID = app.HeroManager().GetHeroID();
		this.RecordAccount(accountInfo["AccountID"], accountInfo["AccountType"], heroID, heroInfo["lv"]);
	},

	OnEvent_HeroProperty:function(event){
		let argDict = event;
		let property = argDict["Property"];
		if(property == "lv"){
			this.RecordHeroLv(argDict["Value"]);
		}

	},

	//记录登录的玩家账号数据
	RecordAccount:function(accountID, accountType, heroID, heroLv){
		if(!this.sdk){
			return
		}

		let channel = app.Client.GetClientConfigProperty("Channel");

		this.sdk.Account({
							//必须使用heroID作为唯一ID,因为orderServer没有accountID数据
							"accountId":heroID,
							"level":heroLv,
							"gameServer":channel,
							"accountType ":accountType,
							"age":1,
							"accountName":accountID,
							"gender":1,
						})
	},

	//记录玩家等级
	RecordHeroLv:function(heroLv){
		if(!this.sdk){
			return
		}
		this.sdk.Account.setLevel(heroLv);
	},

	//记录发起付费
	RecordStartPay:function(orderID, apptype, appID, appPrice){
		if(!this.sdk){
			return
		}
		let channel = app.Client.GetClientConfigProperty("Channel");

		this.sdk.onChargeRequest({
									"orderId":orderID,
									"iapId" : [apptype, appID].join("_"),
									"appID": appID,
									"currencyType":"CNY",
									"virtualCurrencyAmount":appPrice,
									"paymentType": channel,
								});
	},

	RecordEndPay:function(orderID, apptype, appID, appPrice){
		if(!this.sdk){
			return
		}
		let channel = app.Client.GetClientConfigProperty("Channel");

		this.sdk.onChargeSuccess({
			"orderId":orderID,
			"iapId" : [apptype, appID].join("_"),
			"appID": appID,
			"currencyType":"CNY",
			"virtualCurrencyAmount":appPrice,
			"paymentType": channel,
		});
	},

	//记录赠送获得的钻石
	RecordDiamondReward:function(diamond, reason){
		if(!this.sdk){
			return
		}
		this.sdk.onReward(diamond, reason);
	},

	//记录塔层开始
	RecordStartTowerLv:function(towerLv){
		if(!this.sdk){
			return
		}
		this.sdk.onMissionBegin(towerLv);
	},
	//记录塔层通关结束
	RecordEndTowerLv:function(towerLv){
		if(!this.sdk){
			return
		}
		this.sdk.onMissionCompleted(towerLv);
	},

	RecordEndFailTowerLv:function(towerLv){
		if(!this.sdk){
			return
		}
		this.sdk.onMissionFailed(towerLv, "FightBossFail");
	},


});

var g_TalkingDataManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
	if(!g_TalkingDataManager){
		g_TalkingDataManager = new TalkingDataManager();
	}
	return g_TalkingDataManager;
}