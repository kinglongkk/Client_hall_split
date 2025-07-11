/*
 UICard01-04 牌局吃到的牌显示
 */

let app = require("app");

cc.Class({
	extends: require("BaseMJ_winlost_child"),

	properties: {},
	// use this for initialization
	OnLoad: function() {
		this.ComTool = app.ComTool();
		this.IntegrateImage = app.SysDataManager().GetTableDict("IntegrateImage");
		this.ShareDefine = app.ShareDefine();
	},
	ShowPlayerData: function(setEnd, playerAll, index) {
		console.log("单局结算数据", setEnd, playerAll, index);
		let jin1 = setEnd.jin;
		let jin2 = 0;
		if (setEnd.jin2 > 0) {
			jin2 = setEnd.jin2;
		}
		let dPos = setEnd.dPos;
		let posResultList = setEnd["posResultList"];
		let posHuArray = new Array();
		let posCount = posResultList.length;
		for (let i = 0; i < posCount; i++) {
			let posInfo = posResultList[i];
			let pos = posInfo["pos"];
			let posHuType = this.ShareDefine.HuTypeStringDict[posInfo["huType"]];
			posHuArray[pos] = posHuType;
		}
		let PlayerInfo = playerAll[index];
		this.node.active = true;
		this.UpdatePlayData(this.node, posResultList[index], PlayerInfo, jin1, jin2, setEnd.zhuaNiaoList || []);
		let huNode = this.node.getChildByName('jiesuan').getChildByName('hutype');
		this.ShowPlayerHuImg(huNode, posResultList[index]['huType']);

		if (dPos === index) {
			this.node.getChildByName("user_info").getChildByName("zhuangjia").active = true;
		} else {
			this.node.getChildByName("user_info").getChildByName("zhuangjia").active = false;
		}
		//显示头像，如果头像UI
		if (PlayerInfo["pid"] && PlayerInfo["iconUrl"]) {
			app.WeChatManager().InitHeroHeadImage(PlayerInfo["pid"], PlayerInfo["iconUrl"]);
		}
		let weChatHeadImage = this.node.getChildByName("user_info").getChildByName("head_img").getComponent("WeChatHeadImage");
		weChatHeadImage.ShowHeroHead(PlayerInfo["pid"]);
	},
	UpdatePlayData: function(PlayerNode, HuList, PlayerInfo, jin1 = 0, jin2 = 0, zhuaNiaoList) {
		this.showLabelNum = 1;
		this.ClearLabelShow(PlayerNode.getChildByName('jiesuan').getChildByName('label_lists'));
		this.ShowPlayerRecord(PlayerNode.getChildByName('record'), HuList);
		this.ShowPlayerJieSuan(PlayerNode.getChildByName('jiesuan'), HuList);
		this.ShowPlayerInfo(PlayerNode.getChildByName('user_info'), PlayerInfo);
		this.ShowPlayerDownCard(PlayerNode.getChildByName('downcard'), HuList.publicCardList, jin1, jin2);
		this.ShowPlayerShowCard(PlayerNode.getChildByName('showcard'), HuList.shouCard, HuList.handCard, jin1, jin2);
		// this.ShowPlayerHuaCard(PlayerNode.getChildByName('huacardscrollView'), HuList.huaList);
		this.ShowPlayerMaCard(PlayerNode.getChildByName('maimaList'), HuList);

		this.ShowOtherScore(PlayerNode.getChildByName('other'), HuList);
	},
	ShowOtherScore: function(ShowNode, huInfo) {
		let huPaiFen = huInfo["huPaiFen"] || 0;
		ShowNode.getChildByName('lb_hupaifen').getComponent("cc.Label").string = "胡牌分:" + this.ToUiScore(huPaiFen);

		let genZhuangFen = huInfo["genZhuangFen"] || 0;
		ShowNode.getChildByName('lb_genzhuang').getComponent("cc.Label").string = "跟庄:" + this.ToUiScore(genZhuangFen);

		let jiangMaFen = huInfo["jiangMaFen"];
		ShowNode.getChildByName('lb_jiangma').getComponent("cc.Label").string = "奖马分:" + this.ToUiScore(jiangMaFen);

		let maiMaFen = huInfo["maiMaFen"];
		ShowNode.getChildByName('lb_maima').getComponent("cc.Label").string = "买马分:" + this.ToUiScore(maiMaFen);
	},

	ToUiScore: function(score) {
		if (0 === score) return 0;
		if (!score) return "";

		let symbol = score > 0 ? "+" : "";

		return symbol + score;
	},

	ShowPlayerMaCard: function(ShowNode, huInfoAll) {
		for (let i = 1; i <= 2; i++) {
			ShowNode.getChildByName('card' + i).active = false;
			ShowNode.getChildByName('card' + i).getChildByName("img_sm2").active = false;
			ShowNode.getChildByName('card' + i).getChildByName("img_ym2").active = false;
		}
		let maiMaCardIdList = huInfoAll["maiMaCardIdList"];
		let maiMaYingMaCardIdList = huInfoAll["maiMaYingMaCardIdList"];
		let maiMaShuMaCardIdList = huInfoAll["maiMaShuMaCardIdList"];

		for (let i = 0; i < maiMaCardIdList.length; i++) {
			let cardId = maiMaCardIdList[i];
			let node = ShowNode.getChildByName("card" + (i + 1));
			this.ShowImage(node, 'EatCard_Self_', cardId);
			node.active = true;
			if (maiMaYingMaCardIdList.indexOf(cardId) > -1) {
				node.getChildByName("img_ym2").active = true;
			} else if (maiMaShuMaCardIdList.indexOf(cardId) > -1) {
				node.getChildByName("img_sm2").active = true;
			}
		}
	},

	ShowPlayerHuaCard: function(huacardscrollView, hualist) {
		// huacardscrollView.active = false;
		// return
		huacardscrollView.active = true;
		let view = huacardscrollView.getChildByName("view");
		let ShowNode = view.getChildByName("huacard");
		let UICard_ShowCard = ShowNode.getComponent("UIMJCard_ShowHua");
		UICard_ShowCard.Show24HuaList(hualist);
	},
	ShowPlayerRecord: function(ShowNode, huInfo) {
		let absNum = Math.abs(huInfo["point"]);
		if (absNum > 10000) {
			let shortNum = (absNum / 10000).toFixed(2);
			if (huInfo["point"] > 0) {
				ShowNode.getChildByName('tip_point').getChildByName('lb_point').getComponent("cc.Label").string = '+' + shortNum + "万";
			} else {
				ShowNode.getChildByName('tip_point').getChildByName('lb_point').getComponent("cc.Label").string = '-' + shortNum + "万";
			}
		} else {
			if (huInfo["point"] > 0) {
				ShowNode.getChildByName('tip_point').getChildByName('lb_point').getComponent("cc.Label").string = '+' + huInfo["point"];
			} else {
				ShowNode.getChildByName('tip_point').getChildByName('lb_point').getComponent("cc.Label").string = huInfo["point"];
			}
		}
		//显示比赛分
		if (typeof(huInfo.sportsPointTemp) != "undefined") {
			ShowNode.getChildByName('tip_sportspoint').active = true;
			if (huInfo.sportsPointTemp > 0) {
				ShowNode.getChildByName('tip_sportspoint').getChildByName('lb_sportspoint').getComponent("cc.Label").string = "+" + huInfo.sportsPointTemp;
			} else {
				ShowNode.getChildByName('tip_sportspoint').getChildByName('lb_sportspoint').getComponent("cc.Label").string = huInfo.sportsPointTemp;
			}
		} else if (typeof(huInfo.sportsPoint) != "undefined") {
			ShowNode.getChildByName('tip_sportspoint').active = true;
			if (huInfo.sportsPoint > 0) {
				ShowNode.getChildByName('tip_sportspoint').getChildByName('lb_sportspoint').getComponent("cc.Label").string = "+" + huInfo.sportsPoint;
			} else {
				ShowNode.getChildByName('tip_sportspoint').getChildByName('lb_sportspoint').getComponent("cc.Label").string = huInfo.sportsPoint;
			}
		} else {
			ShowNode.getChildByName('tip_sportspoint').active = false;
		}
	},
	ShowPlayerHuImg: function(huNode, huTypeName) {
		/*huLbIcon
		 *  0:单吊，1：点炮，2：单游，3：胡，4：六金，5：平胡，6:抢杠胡 7:抢金，8：三游，9：四金倒，10：三金倒，11：三金游，12：十三幺
		 *  13：双游，14：天胡，15：五金，16：自摸 17:接炮
		 */
		let huType = this.ShareDefine.HuTypeStringDict[huTypeName];
		//默认颜色描边
		huNode.color = new cc.Color(252, 236, 117);
		huNode.getComponent(cc.LabelOutline).color = new cc.Color(163, 61, 8);
		huNode.getComponent(cc.LabelOutline).Width = 2;
		if (typeof(huType) == "undefined") {
			huNode.getComponent(cc.Label).string = '';
		} else if (huType == this.ShareDefine.HuType_DianPao) {
			huNode.getComponent(cc.Label).string = '点炮';
			huNode.color = new cc.Color(192, 221, 245);
			huNode.getComponent(cc.LabelOutline).color = new cc.Color(31, 55, 127);
			huNode.getComponent(cc.LabelOutline).Width = 2;
		} else if (huType == this.ShareDefine.HuType_JiePao) {
			huNode.getComponent(cc.Label).string = '接炮';
		} else if (huType == this.ShareDefine.HuType_ZiMo) {
			huNode.getComponent(cc.Label).string = '自摸';
		} else if (huType == this.ShareDefine.HuType_QGH) {
			huNode.getComponent(cc.Label).string = '抢杠胡';
		} else if (huType == this.ShareDefine.HuType_GSKH) {
			huNode.getComponent(cc.Label).string = '杠开';
		} else {
			huNode.getComponent(cc.Label).string = '';
		}
	},
	ShowPlayerJieSuan: function(ShowNode, huInfoAll) {
		let huInfo = huInfoAll['endPoint'].huTypeMap;
		// this.ClearLabelShow(ShowNode.getChildByName('label_lists'));
		for (let huType in huInfo) {
			let huPoint = huInfo[huType];
			if (this.IsShowMulti2(huType)) {
				this.ShowLabelName(ShowNode.getChildByName("label_lists"), huTypeDict[huType] + "*2");
			} else if (this.IsShowNum(huType)) {
				this.ShowLabelName(ShowNode.getChildByName("label_lists"), this.LabelName(huType) + "x" + huPoint);
			} else {
				this.ShowLabelName(ShowNode.getChildByName("label_lists"), this.LabelName(huType) + "：" + huPoint);
			}
			console.log("ShowPlayerJieSuan", huType, huPoint);
		}
	},
	//分数
	IsShowScore: function(huType) {
		let multi2 = [];
		let isShow = multi2.indexOf(huType) != -1;
		return isShow;
	},
	//个数
	IsShowNum: function(huType) {
		let multi2 = ["AnGangShu", "PengGangShu", "ZhiGangShu", "DianGangShu"];
		let isShow = multi2.indexOf(huType) != -1;
		return isShow;
	},
	//倍数
	IsShowMulti2: function(huType) {
		let multi2 = ["WuGuiJiaBei"];
		let isShow = multi2.indexOf(huType) != -1;
		return isShow;
	},
	LabelName: function(huType) {
		let huTypeDict = {};
		huTypeDict["LianZhuangShu"]="连庄数";
		huTypeDict["JiHu"]="鸡胡";
		huTypeDict["PPHu"]="碰碰胡";
		huTypeDict["ZYS"]="字一色";
		huTypeDict["HYS"]="混一色";
		huTypeDict["QYS"]="清一色";
		huTypeDict["QiDui"]="七对";
		huTypeDict["HaoHuaQiDui"]="豪华七对";
		huTypeDict["ShuangHaoHuaQiDui"]="双豪华七对";
		huTypeDict["SanHaoHuaQiDui"]="三豪华七对";
		huTypeDict["Hun19"]="混幺九";
		huTypeDict["Chun19"]="纯幺九";
		huTypeDict["TianHu"]="天胡";
		huTypeDict["DiHu"]="地胡";
		huTypeDict["SSY"]="十三幺";
		huTypeDict["LuoHan18"]="十八罗汉";
		huTypeDict["WuGuiJiaBei"]="无鬼加倍";
		huTypeDict["AnGangShu"]="暗杠数";
		huTypeDict["PengGangShu"]="碰杠数";
		huTypeDict["ZhiGangShu"]="直杠数";
		huTypeDict["DianGangShu"]="点杠数";

		return huTypeDict[huType];
	},

	ShowImage: function(childNode, imageString, cardID) {
		let childSprite = childNode.getComponent(cc.Sprite);
		if (!childSprite) {
			                console.error("ShowOutCard(%s) not find cc.Sprite", childNode.name);
			return
		}
		//取卡牌ID的前2位
		let imageName = [imageString, Math.floor(cardID / 100)].join("");
		let imageInfo = this.IntegrateImage[imageName];
		if (!imageInfo) {
			                console.error("ShowImage IntegrateImage.txt not find:%s", imageName);
			return
		}
		let imagePath = imageInfo["FilePath"];
		if (app['majiang_' + imageName]) {
			childSprite.spriteFrame = app['majiang_' + imageName];
		} else {
			let that = this;
			app.ControlManager().CreateLoadPromise(imagePath, cc.SpriteFrame)
				.then(function(spriteFrame) {
					if (!spriteFrame) {
						that.ErrLog("OpenPoker(%s) load spriteFrame fail", imagePath);
						return
					}
					childSprite.spriteFrame = spriteFrame;
				})
				.catch(function(error) {
					that.ErrLog("OpenPoker(%s) error:%s", imagePath, error.stack);
				});
		}
	},

	ShowPlayerShowCard: function (ShowNode, cardIDList, handCard, jin1, jin2) {
        ShowNode.active = 1;
        let UICard_ShowCard = ShowNode.getComponent("UIMJCard_ShowCard");
        UICard_ShowCard.ShowDownCard(cardIDList, handCard, jin1, jin2);
    },
    ShowPlayerDownCard: function (ShowNode, publishcard, jin1 = 0, jin2 = 0) {
        ShowNode.active = 1;
        let UICard_DownCard = ShowNode.getComponent("UIMJCard_Down");
        UICard_DownCard.ShowDownCardByJinBg(publishcard, jin1, jin2);
    },
});