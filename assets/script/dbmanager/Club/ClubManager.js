/*
 ClubManager 俱乐部管理器
 */
var app = require('app');

var ClubManager = app.BaseClass.extend({

    Init:function(){
        this.JS_Name = "ClubManager";
        this.bFirstLogin = true;
        this.NetManager = app.NetManager();
        this.FromManager = app.FormManager();
        this.OnReload();

        this.Enum_Nomarl = 0x00;//普通状态

        this.Enum_NotAgree = 0x01;//未批准
        this.Enum_NotAgreeOut = 0x50;//退出未批准
        this.Enum_RefuseOut = 0x42;//退出申请被拒绝

        this.Enum_OutRequest = 0x43;//退出申请

        this.Enum_Refuse = 0x02;//已拒绝
        this.Enum_Join = 0x04;//正式加入
        this.Enum_Kick = 0x08;//被踢
        this.Enum_Invite = 0x10;//已邀请
        this.Enum_RefuseInvite = 0x20;//已拒绝邀请
        this.Enum_Leave = 0x40;//退出
        this.Enum_Become_mgr = 0x90; //成为管理员
        this.Enum_cancel_mgr = 0x91; //取消管理员
        this.Enum_PLAYER_BECOME_BAN = 0x92; //禁止游戏
        this.Enum_PLAYER_CANCEL_BAN = 0x93; //取消禁止游戏

        this.Enum_RoomCfg_Nomarl = 0;//正常
        this.Enum_RoomCfg_Disable = 1;//禁用
        this.Enum_RoomCfg_Delete = 2;//解散
        this.Enum_RoomCfg_Revise = 3;//修改

        this.Enum_JoinClub_NotFind = 0x01;//没找到
        this.Enum_JoinClub_ClubFull = 0x02;//人数满了
        this.Enum_JoinClub_NumMax = 0x04;//加入的俱乐部数已达上限
        this.Enum_JoinClub_InList = 0x08;//已在申请列表
        this.Enum_JoinClub_JoinIng = 0x10;//加入成功等待审批
        this.Enum_JoinClub_ExistClub = 0x20;//已在俱乐部里

        this.Enum_Club_Manager = 0x94;//成为赛事管理员
     
        //是否管理员枚举
        this.Club_MINISTER_GENERAL = 0;//普通成员
        this.Club_MINISTER_MGR = 1, //管理者
        this.Club_MINISTER_MGRSS = 3, //赛事管理员
        this.Club_MINISTER_CREATER = 2, //创建者

        this.Club_MINISTER_DENY = -1, //受限成员
        //是否合伙人枚举
        this.Club_PARTNER_NULL = 0;//不是合伙人
        this.Club_PARTNER_ONE = 1, //是合伙人
        this.Club_PARTNER_CANCEL = 2, //合伙人已经被卸任
        //赛事枚举
        this.UNION_GENERAL = 0;//赛事普通成员
        this.UNION_CLUB = 1, //赛事亲友圈创造者
        this.UNION_MANAGE = 2, //赛事管理员
        this.UNION_CREATE = 3, //赛事创建者
        
        //俱乐部列表
        //this.NetManager.RegNetPack("club.CGetClubListMin", this.OnPack_ClubDatasMin, this);
        //this.NetManager.RegNetPack("club.CGetClubListMin2", this.OnPack_ClubDatasMin2, this);
        //this.NetManager.RegNetPack("club.CGetClubList", this.OnPack_ClubDatas, this);

        this.NetManager.RegNetPack("club.CGetClubListByClubId", this.OnPack_ClubDatasByClubId, this);
        //this.NetManager.RegNetPack("club.CGetClubListById", this.OnPack_ClubDatasById, this);
        //申请加入结果通知
        this.NetManager.RegNetPack('SClub_Join',this.OnPack_ReqJoin,this);
        //所有聊天数据
        this.NetManager.RegNetPack('club.CClubGetChatMsg',this.OnPack_ChatDatas, this);
        //聊天通知
        this.NetManager.RegNetPack('SClub_Chat',this.OnClubChatNtf,this);
        //房卡改变
        this.NetManager.RegNetPack('SClub_ClubRoomCard',this.OnClubRoomCardNtf,this);
        //俱乐部人员变动
        this.NetManager.RegNetPack('SClub_PlayerInfoChange',this.OnClubPlayerNtf,this);
        //房间列表
        this.NetManager.RegNetPack('SClub_GetAllRoomMin',this.OnRoomDatas,this);
        //赛事房间列表
        this.NetManager.RegNetPack('SUnion_GetAllRoomMin',this.OnRoomDatas,this);

        //中至的皮肤淘汰分变更
        this.NetManager.RegNetPack('SUnion_EliminatePoint',this.SetEliminatePoint,this);

        this.NetManager.RegNetPack('SUnion_ChangeRankedInfo',this.ChangeRankedInfo,this);

        //房间列表分批下发
        this.NetManager.RegNetPack('SClub_GetAllRoomGroup',this.OnRoomDatasGroup,this);
        //赛事房间列表分批下发
        this.NetManager.RegNetPack('SUnion_GetAllRoomGroup',this.OnRoomDatasGroup,this);



        //房间状态改变
        this.NetManager.RegNetPack('SClub_RoomStatusChange',this.OnClubRoomStateChange,this);
        //赛事房间状态改变
        this.NetManager.RegNetPack('SUnion_RoomStatusChange',this.OnUnionRoomStateChange,this);
        //房间玩家进出改变
        this.NetManager.RegNetPack('SClub_RoomPlayerChange',this.OnRoomPlayerChange,this);
        //赛事房间玩家进出改变
        this.NetManager.RegNetPack('SUnion_RoomPlayerChange',this.OnRoomPlayerChange,this);
        //房间局数改变通知
        this.NetManager.RegNetPack('SClub_RoomSetChange',this.OnRoomSetChange,this);
        //赛事房间局数改变通知
        this.NetManager.RegNetPack('SUnion_RoomSetChange',this.OnRoomSetChange,this);
        //房间开始改变通知
        this.NetManager.RegNetPack('SClub_RoomStartChange',this.OnRoomStartChange,this);
        //赛事房间开始改变通知
        this.NetManager.RegNetPack('SUnion_RoomStartChange',this.OnRoomStartChange,this);
        //赛事玩家的比赛分或者积分比例改变通知
        this.NetManager.RegNetPack('SUnion_MemberInfoChange',this.OnUnionMemberInfoChange,this);
        //赛事玩家的比赛分改变通知(只接收本人，用于大厅比赛分刷新)
        this.NetManager.RegNetPack('SUnion_SportsPoint',this.OnUnionSportsPoint,this);
        //亲友圈加入或者退出赛事通知
        this.NetManager.RegNetPack('SUnion_ClubChange',this.OnPack_UnionClubChange,this);
        
        //俱乐部所有房间配置
        this.NetManager.RegNetPack('SClub_GetCreateGameSet',this.OnRoomCfgs,this);
        this.NetManager.RegNetPack('SClub_CreateGameSetChange',this.OnRoomCfgChange,this);
        //邀请列表
        this.NetManager.RegNetPack('SClub_InvitedList',this.OnClubInviteList,this);
        this.NetManager.RegNetPack('SClub_Invited',this.OnClubInviteNtf,this);
        //赛事邀请列表
        this.NetManager.RegNetPack('SUnion_NotifyList',this.OnUnionInviteList,this);
        this.NetManager.RegNetPack('SUnion_Invited',this.OnUnionInviteNtf,this);
        //赛事状态改变通知
        this.NetManager.RegNetPack('SUnion_MatchState',this.OnUnionMatchState,this);
        //赛事状态改变通知(启用，停用，奖励不足)
        this.NetManager.RegNetPack('SUnion_StateChange',this.OnUnionStateChange,this);
        //赛事淘汰分改变
        this.NetManager.RegNetPack('SUnion_OutSportsPoint',this.OnOutSportsPoint,this);
        //赛事个人预警值改变
        this.NetManager.RegNetPack('SClub_PersonalWarnInfoChange',this.OnSportsPointWarning,this);
        //玩家赛事职位变化通知
        this.NetManager.RegNetPack('SUnion_PostTypeInfoChange',this.OnPostTypeInfoChange,this);
        //游戏内的房间邀请通知
        this.NetManager.RegNetPack('SBase_RoomInvitation',this.OnRoomInvitation,this);
        //推广员状态变化通知
        this.NetManager.RegNetPack('SClub_PromotionLevelPowerChange',this.OnPromotionLevelPowerChange,this);

        this.NetManager.RegNetPack('SClub_DiamondsNotEnough',this.OnPack_DiamondsNotEnough,this);

        this.NetManager.RegNetPack('SUnion_DiamondsNotEnough',this.OnPack_DiamondsNotEnough,this);

        this.NetManager.RegNetPack('SUnion_SkinInfo',this.OnPack_SkinInfo,this);
        //竞技动态消息请求通知
        this.NetManager.RegNetPack('SClub_UnionDynamic',this.OnPack_UnionDynamic,this);

        this.NetManager.RegNetPack('SUnion_HideStatusOpen',this.OnPack_HideStatusOpen,this);

        //事件
        app.Client.RegEvent("CodeError", this.Event_CodeError, this);
        //断线重连处理
        app.Client.RegEvent("ConnectSuccess", this.OnEvent_ConnectSuccess, this);
    },

    //切换账号
    OnReload:function(){
        //俱乐部列表数据
        this.isLoadClub=false;
        this.dataInfo = [];
        //邀请列表
        this.inviteList = [];
        //赛事邀请列表
        this.unionInviteList = [];
    },
    //------------事件------------------
    Event_CodeError:function(event){
        let argDict = event;
        let code = argDict["Code"];
        let EventName=argDict["EventName"];
        if(EventName=='room.cbaseroomconfig'){
            return;
        }
        if (code == 912) {
            app.SysNotifyManager().ShowSysMsg("保险箱比赛分不足够", [], 3);
        }else if (code == 910) {
            app.SysNotifyManager().ShowSysMsg("自身携带比赛分不足够", [], 3);
        }else if (code == 6001) {
            app.SysNotifyManager().ShowSysMsg("亲友圈创建配置达到最大值", [], 3);
        }else if (code == 6002) {
//            app.SysNotifyManager().ShowSysMsg("您不是管理员", [], 3);
        }else if (code == 6003) {
            app.SysNotifyManager().ShowSysMsg("您不是亲友圈成员", [], 3);
        }else if (code == 6004) {
            app.SysNotifyManager().ShowSysMsg("管理员已达上限", [], 3);
        }else if (code == 6005) {
            app.SysNotifyManager().ShowSysMsg("亲友圈成员不能创建房间", [], 3);
        }else if (code == 6006) {
            app.SysNotifyManager().ShowSysMsg("分组已达上限", [], 3);
        }else if (code == 6007) {
            app.SysNotifyManager().ShowSysMsg("亲友圈存在创建者", [], 3);
        }else if (code == 6008) {
//            app.SysNotifyManager().ShowSysMsg("未找到亲友圈ID,找会长或代理要ID号码", [], 3);
        }else if (code == 6009) {
            app.SysNotifyManager().ShowSysMsg("亲友圈不存在成员信息", [], 3);
        }else if (code == 6010) {
            app.SysNotifyManager().ShowSysMsg("亲友圈创建者不存在", [], 3);
        }else if (code == 6011) {
            app.SysNotifyManager().ShowSysMsg("推广员等级上限", [], 3);
        }else if (code == 6012) {
            app.SysNotifyManager().ShowSysMsg("该玩家已绑定合伙人", [], 3);
        }else if (code == 6013) {
            app.SysNotifyManager().ShowSysMsg("亲友圈合伙人和创建者不允许变更", [], 3);
        }else if (code == 6014) {
            app.SysNotifyManager().ShowSysMsg("不是亲友圈合伙人", [], 3);
        }else if (code == 6015) {
            app.SysNotifyManager().ShowSysMsg("不是亲友圈创建者", [], 3);
        }else if (code == 6016) {
            app.SysNotifyManager().ShowSysMsg("亲友圈邀请失败", [], 3);
        }else if (code == 6017) {
            app.SysNotifyManager().ShowSysMsg("成员被禁止游戏", [], 3);
        }else if (code == 6018) {
            app.SysNotifyManager().ShowSysMsg("不是亲友圈成员", [], 3);
        }else if (code == 6019) {
            app.SysNotifyManager().ShowSysMsg("已加入亲友圈", [], 3);
        }else if (code == 6020) {
            app.SysNotifyManager().ShowSysMsg("等待亲友圈管理员批准中", [], 3);
        }else if (code == 6021) {
            app.SysNotifyManager().ShowSysMsg("亲友圈人数已满", [], 3);
        }else if (code == 6022) {
            app.SysNotifyManager().ShowSysMsg("自己加入的亲友圈数达到上限", [], 3);
        }else if (code == 6023) {
            app.SysNotifyManager().ShowSysMsg("亲友圈比赛分系统错误", [], 3);
        }else if (code == 6024) {
            app.SysNotifyManager().ShowSysMsg("亲友圈比赛分系统关闭", [], 3);
        }else if (code == 6025) {
            app.SysNotifyManager().ShowSysMsg("比赛分太低了，无法进行游戏，请联系裁判进行处理", [], 3);
        }else if (code == 6026) {
            app.SysNotifyManager().ShowSysMsg("亲友圈比赛分系统关闭错误", [], 3);
        }else if (code == 6027) {
            app.SysNotifyManager().ShowSysMsg("亲友圈比赛分系统打开错误", [], 3);
        }else if (code == 6028) {
            app.SysNotifyManager().ShowSysMsg("亲友圈人员添加失败", [], 3);
        }else if (code == 6029) {
            app.SysNotifyManager().ShowSysMsg("亲友圈比赛分系统批量操作错误", [], 3);
        }else if (code == 6030) {
            app.SysNotifyManager().ShowSysMsg("亲友圈比赛分操作类型错误", [], 3);
        }else if (code == 6031) {
            app.SysNotifyManager().ShowSysMsg("亲友圈比赛分操作值错误", [], 3);
        }else if (code == 6032) {
            app.SysNotifyManager().ShowSysMsg("亲友圈已经加入赛事，重新打开亲友圈", [], 3);
        }else if (code == 6033) {
            app.SysNotifyManager().ShowSysMsg("亲友圈已经退出赛事，重新打开亲友圈", [], 3);
        }else if (code == 6034) {
            app.SysNotifyManager().ShowSysMsg("亲友圈操作权限不足", [], 3);
        }else if (code == 6035) {
            app.SysNotifyManager().ShowSysMsg("亲友圈没加入赛事", [], 3);
        }else if (code == 6036) {
            app.SysNotifyManager().ShowSysMsg("您的亲友圈为赛事创建者，当前不可解散", [], 3);
        }else if (code == 6037) {
            app.SysNotifyManager().ShowSysMsg("亲友圈名称错误", [], 3);
        }else if (code == 6038) {
            app.SysNotifyManager().ShowSysMsg("亲友圈名称存在重复", [], 3);
        }else if (code == 6039) {
            app.SysNotifyManager().ShowSysMsg("限制组不存在", [], 3);
        }else if (code == 6040) {
            app.SysNotifyManager().ShowSysMsg("限制组Id不存在", [], 3);
        }else if (code == 6041) {
            app.SysNotifyManager().ShowSysMsg("该玩家已经在限制组中", [], 3);
        }else if (code == 6042) {
            app.SysNotifyManager().ShowSysMsg("该玩家不在限制组中", [], 3);
        }else if (code == 6043) {
            app.SysNotifyManager().ShowSysMsg("该玩家不是推广员", [], 3);
        }else if (code == 6044) {
            app.SysNotifyManager().ShowSysMsg("该玩家已是推广员", [], 3);
        }else if (code == 6045) {
            app.SysNotifyManager().ShowSysMsg("该玩家不是推广员的下属成员", [], 3);
        }else if (code == 6046) {
            app.SysNotifyManager().ShowSysMsg("该下属成员已绑定推广员", [], 3);
        }else if (code == 6047) {
            app.SysNotifyManager().ShowSysMsg("该玩家是亲友圈推广员，无法踢出，请前往推广员界面使用删除功能", [], 3);
        }else if (code == 6048) {
            app.SysNotifyManager().ShowSysMsg("上级推广员不存在", [], 3);
        }else if (code == 6049) {
            app.SysNotifyManager().ShowSysMsg("成员在游戏中无法踢出亲友圈", [], 3);
        }else if (code == 6055) {
            app.SysNotifyManager().ShowSysMsg("每日0-2点时，系统数据统计中无法进行本操作");
        }else if (code == 6056) {
            app.SysNotifyManager().ShowSysMsg("没有邀请权限");
        }else if (code == 6057) {
            app.SysNotifyManager().ShowSysMsg("设置推广员的数据显示超过九项");
        }else if (code == 6058) {
            app.SysNotifyManager().ShowSysMsg("该日期已经审核过");
        }else if (code == 6059) {
            app.SysNotifyManager().ShowSysMsg("修改失败,上级系数类型与当前分支类型不一致,请联系上级", [], 3);
        }else if (code == 6060) {
            app.SysNotifyManager().ShowSysMsg("修改归属的时候固定值不能更小", [], 3);
        }else if (code == 6061) {
            app.SysNotifyManager().ShowSysMsg("正在退出申请审核中");
        }else if (code == 6062) {
            app.SysNotifyManager().ShowSysMsg("百分比不允许批量修改房间系数");
        }else if (code == 6063) {
            app.SysNotifyManager().ShowSysMsg("该推广员还有下级人员,不能取消推广", [], 3);
        }else if (code == 6065) {
            app.SysNotifyManager().ShowSysMsg("当前有人正在修改区间系数，请稍后再试", [], 3);
        }else if (code == 6067) {
            app.SysNotifyManager().ShowSysMsg("距离退出该亲友圈不到10分钟，无法加入");
        }else if (code == 6100) {
            app.SysNotifyManager().ShowSysMsg("赛事不存在", [], 3);
        }else if (code == 6101) {
            app.SysNotifyManager().ShowSysMsg("不是赛事副裁判或裁判", [], 3);
        }else if (code == 6102) {
            app.SysNotifyManager().ShowSysMsg("赛事成员信息不存在", [], 3);
        }else if (code == 6103) {
            app.SysNotifyManager().ShowSysMsg("该亲友圈已加入其它赛事", [], 3);
        }else if (code == 6104) {
            app.SysNotifyManager().ShowSysMsg("赛事成员状态不符合", [], 3);
        }else if (code == 6105) {
            app.SysNotifyManager().ShowSysMsg("加入赛事失败", [], 3);
        }else if (code == 6106) {
            app.SysNotifyManager().ShowSysMsg("已加入赛事", [], 3);
        }else if (code == 6107) {
            app.SysNotifyManager().ShowSysMsg("已申请加入赛事", [], 3);
        }else if (code == 6108) {
            app.SysNotifyManager().ShowSysMsg("赛事人数已满", [], 3);
        }else if (code == 6109) {
            app.SysNotifyManager().ShowSysMsg("自己加入的赛事数达到上限", [], 3);
        }else if (code == 6110) {
            app.SysNotifyManager().ShowSysMsg("赛事邀请失败", [], 3);
        }else if (code == 6111) {
            app.SysNotifyManager().ShowSysMsg("赛事房间配置ID不存在", [], 3);
        }else if (code == 6112) {
            app.SysNotifyManager().ShowSysMsg("赛事房间配置错误", [], 3);
        }else if (code == 6113) {
            app.SysNotifyManager().ShowSysMsg("赛事id错误", [], 3);
        }else if (code == 6114) {
            app.SysNotifyManager().ShowSysMsg("赛事操作权限不足", [], 3);
        }else if (code == 6115) {
            app.SysNotifyManager().ShowSysMsg("不是赛事创建者", [], 3);
        }else if (code == 6116) {
            app.SysNotifyManager().ShowSysMsg("比赛分低于加入房间的门槛值，无法加入房间", [], 3);
        }else if (code == 6117) {
            app.SysNotifyManager().ShowSysMsg("您已被禁止游戏", [], 3);
        }else if (code == 6118) {
            app.SysNotifyManager().ShowSysMsg("亲友圈房间创建达到上限", [], 3);
        }else if (code == 6119) {
            app.SysNotifyManager().ShowSysMsg("当前有玩家比赛分不为0，无法执行");
        }else if (code == 6120) {
            app.SysNotifyManager().ShowSysMsg("该玩家在游戏房间内，无法操作比赛分");
        }else if (code == 6121) {
            app.SysNotifyManager().ShowSysMsg("该房间为联盟房间，请通过亲友圈加入", [], 3);
        }else if (code == 6122) {
            app.SysNotifyManager().ShowSysMsg("填写的奖励数量错误", [], 3);
        }else if (code == 6123) {
            app.SysNotifyManager().ShowSysMsg("奖励类型错误", [], 3);
        }else if (code == 6124) {
            app.SysNotifyManager().ShowSysMsg("填写的排名错误", [], 3);
        }else if (code == 6125) {
            app.SysNotifyManager().ShowSysMsg("填写的裁判力度错误", [], 3);
        }else if (code == 6126) {
            app.SysNotifyManager().ShowSysMsg("填写的淘汰值错误", [], 3);
        }else if (code == 6127) {
            app.SysNotifyManager().ShowSysMsg("赛事当前还有其他亲友圈无法解散", [], 3);
        }else if (code == 6128) {
            app.SysNotifyManager().ShowSysMsg("赛事当前有房间正在进行，无法解散", [], 3);
        }else if (code == 6129) {
            app.SysNotifyManager().ShowSysMsg("赛事状态错误", [], 3);
        }else if (code == 6130) {
            app.SysNotifyManager().ShowSysMsg("赛事名称错误", [], 3);
        }else if (code == 6131) {
            app.SysNotifyManager().ShowSysMsg("赛事名称已存在", [], 3);
        }else if (code == 6132) {
            app.SysNotifyManager().ShowSysMsg("您已申请退赛，当前无法进行比赛，请取消退赛申请或联系赛事举办方", [], 4);
        }else if (code == 6133) {
            app.SysNotifyManager().ShowSysMsg("您的复赛申请等待审批中，请联系赛事举办方", [], 4);
        }else if (code == 6134) {
            app.SysNotifyManager().ShowSysMsg(argDict["Result"]["Msg"], [], 4);
        }else if (code == 6135) {
            app.SysNotifyManager().ShowSysMsg("赛事已停用，无法加入房间，请联系赛事举办方", [], 3);
        }else if (code == 6136) {
            app.SysNotifyManager().ShowSysMsg("限制组不存在", [], 3);
        }else if (code == 6137) {
            app.SysNotifyManager().ShowSysMsg("限制组Id不存在", [], 3);
        }else if (code == 6138) {
            app.SysNotifyManager().ShowSysMsg("该玩家已经在限制组中", [], 3);
        }else if (code == 6139) {
            app.SysNotifyManager().ShowSysMsg("该玩家不在限制组中", [], 3);
        }else if (code == 6140) {
            app.SysNotifyManager().ShowSysMsg("该玩家比赛进行中", [], 3);
        }else if (code == 6141) {
            app.SysNotifyManager().ShowSysMsg("该玩家复赛申请中", [], 3);
        }else if (code == 6142) {
            app.SysNotifyManager().ShowSysMsg("该玩家退赛申请中", [], 3);
        }else if (code == 6143) {
            app.SysNotifyManager().ShowSysMsg("该玩家游戏中无法操作", [], 3);
        }else if (code == 6144) {
            app.SysNotifyManager().ShowSysMsg("不能自己操作自己", [], 3);
        }else if (code == 6147) {
            app.SysNotifyManager().ShowSysMsg("没有开启保险箱功能", [], 3);
        }else if (code == 6148) {
            app.SysNotifyManager().ShowSysMsg("该玩家保险箱中比赛分不等于0", [], 3);
        }else if (code == 6152) {
            app.SysNotifyManager().ShowSysMsg("当前为自动审核，不能进行手动审核", [], 4);
        }else if (code == 6152) {
            app.SysNotifyManager().ShowSysMsg("该玩家处于赛事黑名单，无法加入亲友圈", [], 4);
        }else if (code == 6159) {
            app.SysNotifyManager().ShowSysMsg("该玩家处于亲友圈黑名单，无法加入亲友圈", [], 4);
        }else if (code == 6160) {
            app.SysNotifyManager().ShowSysMsg("颁奖功能仅在早上八点到晚上23点之间开放，且每日只能颁奖一次", [], 4);
        }else if (code == 5012) {
            app.SysNotifyManager().ShowSysMsg("您当前在游戏房间内无法操作保险箱", [], 3);
        }else if (code == 5013) {
            app.SysNotifyManager().ShowSysMsg("玩家id有误", [], 3);
        }else if (code == 900) {
            app.SysNotifyManager().ShowSysMsg("您设置的赛事奖励道具不足，请重新修改奖励数量", [], 3);
        }else if (code == 910) {
            app.SysNotifyManager().ShowSysMsg("比赛分不足", [], 3);
        }else if (code == 5131) {
            app.SysNotifyManager().ShowSysMsg("请联系客服申请创建赛事资格");
        }else if (code == 5024) {
            app.SysNotifyManager().ShowSysMsg("您所在的推广员队伍或上级队伍比赛分低于预警值，无法加入比赛，请联系管理");
        }else if (code == 5026) {
            app.SysNotifyManager().ShowSysMsg(argDict["Result"]["Msg"], [], 4);
        }else if (code == 5027) {
            app.SysNotifyManager().ShowSysMsg("当前赛事正在更换赛事主裁判，暂停游戏，请稍后再试！预计半小时");
        }else if (code == 5133) {
            app.SysNotifyManager().ShowSysMsg("您所在的亲友圈比赛分低于预警值，无法加入比赛，请联系管理");
        }else if (code == 6151) {
            app.SysNotifyManager().ShowSysMsg("亲友圈存在保险箱中比赛分不等于0的玩家", [], 4);
        }else if (code == 6153) {
            app.SysNotifyManager().ShowSysMsg("今日皮肤已经设定过", [], 3);
        }else if (code == 6154) {
            app.SysNotifyManager().ShowSysMsg("赛事权限不足", [], 3);
        }else if (code == 6155) {
            app.SysNotifyManager().ShowSysMsg("该玩家不属于您的亲友圈，无法查看", [], 3);
        }else if(code==6156){
            app.SysNotifyManager().ShowSysMsg("该玩家不属于您的分支，无法查看", [], 3);
        }
        else if(code==5134){
            app.SysNotifyManager().ShowSysMsg("您所在的亲友圈生存积分过低，无法加入比赛，请联系管理", [], 3);
        }
        else if(code==5136){
            app.SysNotifyManager().ShowSysMsg("您所在的推广员队伍或上级队伍比赛分低于生存积分，无法加入比赛，请联系管理，无法加入比赛，请联系管理", [], 3);
        }else if (code == 309) {
            app.SysNotifyManager().ShowSysMsg("游戏开始了，不能离开房间", [], 3);
        }
    },
    //断线重连处理
    OnEvent_ConnectSuccess:function(event){
        if(!this.bFirstLogin){
            //this.SendReqClubData();
            this.SendGetAllRoom();

            //现在都是强制拉玩家的，不用这个
            //this.SendGetClubInviteList();
            //this.SendGetUnionInviteList();

            //this.SendGetClubCardWarn();
            /*for(let i=0;i<this.dataInfo.length;i++){
                //this.SendGetChatData(this.dataInfo[i].id);
                this.SendGetRoomCfg(this.dataInfo[i].id);
            }*/
        }
        this.bFirstLogin = false;
    },
    AddClubMin2Data:function(serverPack){
        let loadIDS=[];
        for(let i=0;i<this.dataInfo.length;i++){
            loadIDS.push(this.dataInfo[i].id);
        }
        for(let i=0;i<serverPack.length;i++){
            if(loadIDS.indexOf(serverPack[i].id)==-1){
                loadIDS.push(serverPack[i].id);
                this.dataInfo.push(serverPack[i]);
            }
        }
        if(this.dataInfo.length>0){
            this.isLoadClub=true;
        }
    },
    //------------收包函数------------------
    OnPack_ClubDatasMin:function(serverPack){
        /*this.dataInfo = serverPack;
        this.isLoadClub=true;
        app.Client.OnEvent('OnAllClubData', serverPack);*/
    },
    
    OnPack_ClubDatas:function(serverPack){
        this.dataInfo = serverPack;
        this.isLoadClub=true;
        app.Client.OnEvent('OnAllClubData', serverPack);
    },
    GetIsLoadClub:function(){
        return this.isLoadClub;
    },
    SetIsLoadClub:function(){
        this.isLoadClub=true;
    },
    OnPack_ClubDatasByClubId:function(serverPack){
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == serverPack.id){
                this.dataInfo[i] = serverPack;
                break;
            }
        }
        app.Client.OnEvent('OnAllClubData', this.dataInfo);
    },

    OnPack_ClubDatasById:function(serverPack){
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == serverPack.id){
                this.dataInfo[i] = serverPack;
                break;
            }
        }
        app.Client.OnEvent('LoadClub',serverPack);
    },

    OnPack_UnionClubChange:function(serverPack){
        //直接重新获取亲友圈数据
        this.SendReqClubDataById(serverPack.clubId,true,true);
        // for(let i=0;i<this.dataInfo.length;i++){
        //     if(this.dataInfo[i].id == serverPack.clubId){
        //         this.dataInfo[i].unionId = serverPack.unionId;
        //         this.dataInfo[i].sportsPoint = serverPack.sportsPoint;
        //         this.dataInfo[i].unionName = serverPack.unionName;
        //         this.dataInfo[i].unionPostType = serverPack.unionPostType;
        //         this.dataInfo[i].unionSign = serverPack.unionSign;
        //         this.dataInfo[i].ownerClubName = serverPack.ownerClubName;
        //         break;
        //     }
        // }
        // app.Client.OnEvent('OnAllClubData', this.dataInfo);
    },
    OnPack_ChatDatas:function(serverPack){
        app.Client.OnEvent('OnClubChatData', serverPack);
    },
    OnPack_ReqJoin:function(serverPack){
        app.Client.OnEvent('OnReqJoinNtf', serverPack);
    },
    OnPack_DiamondsNotEnough:function(serverPack){
        app.Client.OnEvent('OnDiamondsNotEnough', serverPack);
    },
    OnPack_SkinInfo:function(serverPack){
        if (this.unionSendpackHead && this.unionSendpackHead.unionId == serverPack.unionId) {
            //如果还在亲友圈界面需要关闭重新进
            this.CloseClubFrom();
            app.SysNotifyManager().ShowSysMsg("盟主切换了赛事皮肤，请重新打开房间列表界面", [], 4);
        }else{
            //把新的皮肤数据刷新到this.dataInfo
            this.SetClubDataByClubID(serverPack.unionId, "skinType", serverPack.skinType);
        }
    },
    OnPack_UnionDynamic:function(serverPack){
        app.Client.OnEvent('OnUnionDynamic', serverPack);
    },
    OnPack_HideStatusOpen:function(serverPack){
        app.Client.OnEvent('HideStatusOpen', serverPack);
    },
    OnClubChatNtf:function(serverPack){
        app.Client.OnEvent('OnClubChatNtf', serverPack);
    },
    OnClubRoomCardNtf:function(serverPack){
        let datas = serverPack.roomCardAttentions;
        for(let i=0;i<this.dataInfo.length;i++){
            for(let j=0;j<datas.length;j++){
                if(this.dataInfo[i].id == datas[j].clubId){
                    this.dataInfo[i].roomcard = datas[j].roomcard;
                    break;
                }
            }
        }
        app.Client.OnEvent('OnClubRoomCardNtf', serverPack);
    },
    OnClubPlayerNtf:function(serverPack){
        let clubId = serverPack.clubId;
        let status = serverPack.clubPlayerInfo.status;
        let playerInfo = serverPack.clubPlayerInfo;
        let pid = playerInfo.shortPlayer.pid;
        let selfPid = app.HeroManager().GetHeroProperty("pid");
        this.MsgHandle(serverPack);
        if (selfPid == pid && this.Enum_Join == status) {
            this.SendReqClubDataByClubId(clubId);
            if (app.FormManager().GetFormComponentByFormName(app.FormManager().MainForm())) {
                app.FormManager().GetFormComponentByFormName(app.FormManager().MainForm()).ShowAddClubSprite();
            }
        }
        if(this.Enum_NotAgree == status){
            //未批准
            app.Client.OnEvent('OnClubPlayerNtfToManager', serverPack);
        }
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == clubId && selfPid == pid){
                if(this.Enum_NotAgree == status){//未批准

                }else if(this.Enum_Refuse == status){//已拒绝
                    app.SysNotifyManager().ShowSysMsg(this.dataInfo[i].name + " 拒绝您的申请",[],3);
                }else if(this.Enum_Join == status){//加入
                    app.SysNotifyManager().ShowSysMsg(this.dataInfo[i].name + " 通过了您的申请",[],3);
                }else if(this.Enum_Kick == status){//被踢
                    app.SysNotifyManager().ShowSysMsg(this.dataInfo[i].name + " 已将您移出亲友圈",[],3);
                    app.FormManager().CloseForm("ui/cluc/UIClub");
                    // app.FormManager().CloseForm("ui/club/UIClubMain");
                    this.CloseClubFrom();
                }else if(this.Enum_RefuseOut == status){//已拒绝
                    app.SysNotifyManager().ShowSysMsg(this.dataInfo[i].name + " 拒绝您的退出申请",[],3);
                }
                else if(this.Enum_OutRequest == status){//退出申请
                    app.SysNotifyManager().ShowSysMsg("您的退出申请已经提交",[],3);
                }
                 else if(this.Enum_Club_Manager == status){//成为赛事管理员
                    app.SysNotifyManager().ShowSysMsg("您已经成为赛事管理员",[],3);
                }
                else if(this.Enum_Leave == status){//离开
                    // app.SysNotifyManager().ShowSysMsg("您已离开了 " + this.dataInfo[i].name);
                }
                break;
            }
        }
        app.Client.OnEvent('OnClubPlayerNtf', serverPack);
    },
    OnRoomDatas:function(serverPack){
        app.Client.OnEvent('OnClubRoomData', serverPack);
    },
    ChangeRankedInfo:function(serverPack){
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == serverPack.clubId){
                this.dataInfo[i].rankedOpenZhongZhi=serverPack.rankedOpenZhongZhi;
                this.dataInfo[i].rankedOpenEntryZhongZhi=serverPack.rankedOpenEntryZhongZhi;
            }
        }
        app.Client.OnEvent('ChangeRankedInfo', serverPack);
    },

    SetEliminatePoint:function(serverPack){
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == serverPack.clubId){
                this.dataInfo[i].eliminatePoint=serverPack.eliminatePoint;
            }
        }
        app.Client.OnEvent('SetEliminatePoint', serverPack);
    },

    OnRoomDatasGroup:function(serverPack){
        app.Client.OnEvent('OnClubRoomDataGroup', serverPack);
    },

    OnClubRoomStateChange:function(serverPack){
        serverPack.clubId = serverPack.roomInfoItem.id;
        app.Client.OnEvent('OnRoomStateChange', serverPack);
    },
    OnUnionRoomStateChange:function(serverPack){
        serverPack.unionId = serverPack.roomInfoItem.id;
        app.Client.OnEvent('OnRoomStateChange', serverPack);
    },
    OnRoomPlayerChange:function(serverPack){
        app.Client.OnEvent('OnRoomPlayerChange', serverPack);
    },
    OnRoomSetChange:function(serverPack){
        app.Client.OnEvent('OnRoomSetChange', serverPack);
    },
    OnRoomStartChange:function(serverPack){
        app.Client.OnEvent('OnRoomStartChange', serverPack);
    },
    OnRoomCfgs:function(serverPack){
        app.Client.OnEvent('OnClubRoomCfgs', serverPack);
    },
    OnRoomCfgChange:function(serverPack){
        let selfPid = app.HeroManager().GetHeroProperty("pid");
        if(selfPid == serverPack.pid){
            if(serverPack.isCreate)
                app.SysNotifyManager().ShowSysMsg("MSG_CLUB_RoomCreateOk");
            else
                app.SysNotifyManager().ShowSysMsg("MSG_CLUB_RoomReviseOk");  
        }
        app.Client.OnEvent('OnClubRoomCfgChange', serverPack);
    },
    OnClubInviteList:function(serverPack){
        this.inviteList = serverPack.invitedList;
        if(0 != this.inviteList.length){
            let clubData = this.inviteList[this.inviteList.length - 1];
            let that = this;
            setTimeout(function(){
                that.SetWaitForConfirm("MSG_CLUB_INVITE_Join",app.ShareDefine().ConfirmYN,[clubData.clubName],[clubData.clubId]);
            },200);
        }
    },
    OnClubInviteNtf:function(serverPack){
        let clubData = serverPack.invitedInfo;
        this.inviteList.push(clubData);
        let that = this;
        setTimeout(function(){
            that.SetWaitForConfirm("MSG_CLUB_INVITE_Join",app.ShareDefine().ConfirmYN,[clubData.clubName],[clubData.clubId]);
        },200);
    },
    OnUnionInviteList:function(serverPack){
        this.unionInvitedList = serverPack.unionInvitedList;
        if(0 != this.unionInvitedList.length){
            let invitedData = this.unionInvitedList[this.unionInvitedList.length - 1];
            let that = this;
            setTimeout(function(){
                if (invitedData.execType == 1) {
                    //加入申请通过
                    that.SetWaitForConfirm("MSG_UNION_INVITE_JOIN",app.ShareDefine().ConfirmOK,[invitedData.clubName,invitedData.unionName]);
                }else if (invitedData.execType == 2) {
                    //退出申请通过
                    that.SetWaitForConfirm("MSG_UNION_INVITE_OUT",app.ShareDefine().ConfirmOK,[invitedData.clubName,invitedData.unionName]);
                }else if (invitedData.execType == 3) {
                    //被踢出
                    that.SetWaitForConfirm("MSG_UNION_INVITE_TICHU",app.ShareDefine().ConfirmOK,[invitedData.clubName,invitedData.execName,invitedData.unionName]);
                }else if (invitedData.execType == 4) {
                    //被邀请
                    that.SetWaitForConfirm("MSG_UNION_INVITE_YAOQING",app.ShareDefine().ConfirmYN,[invitedData.execName,invitedData.clubName,invitedData.unionName],[invitedData.unionSign,invitedData.clubId]);
                }else if (invitedData.execType == 5) {
                    //被邀请
                    app.SysNotifyManager().ShowSysMsg("您的亲友圈[" + invitedData.clubName + "]申请赛事["+invitedData.unionName+"]操作被["+invitedData.execName+"]拒绝");
                }
            },200);
        }
    },
    OnUnionInviteNtf:function(serverPack){
        if (serverPack.execType == 1) {
            //加入申请通过
            this.SetWaitForConfirm("MSG_UNION_INVITE_JOIN",app.ShareDefine().ConfirmOK,[serverPack.clubName,serverPack.unionName]);
        }else if (serverPack.execType == 2) {
            //退出申请通过
            this.SetWaitForConfirm("MSG_UNION_INVITE_OUT",app.ShareDefine().ConfirmOK,[serverPack.clubName,serverPack.unionName]);
        }else if (serverPack.execType == 3) {
            //被踢出
            this.SetWaitForConfirm("MSG_UNION_INVITE_TICHU",app.ShareDefine().ConfirmOK,[serverPack.clubName,serverPack.execName,serverPack.unionName]);
        }else if (serverPack.execType == 4) {
            //被邀请
            this.SetWaitForConfirm("MSG_UNION_INVITE_YAOQING",app.ShareDefine().ConfirmYN,[serverPack.execName,serverPack.clubName,serverPack.unionName],[serverPack.unionSign,serverPack.clubId]);
        }else if (serverPack.execType == 5) {
            //被邀请
            app.SysNotifyManager().ShowSysMsg("您的亲友圈[" + serverPack.clubName + "]申请赛事["+serverPack.unionName+"]操作被["+serverPack.execName+"]拒绝");
        }
    },
    OnUnionMemberInfoChange:function(serverPack){
        app.Client.OnEvent('OnUnionMemberInfoChange', serverPack);
    },
    OnUnionMatchState:function(serverPack){
        app.Client.OnEvent('OnUnionMatchState', serverPack);
    },
    OnUnionStateChange:function(serverPack){
        app.Client.OnEvent('OnUnionStateChange', serverPack);
    },
    OnOutSportsPoint:function(serverPack){
        app.Client.OnEvent('OnOutSportsPoint', serverPack);
    },
    OnSportsPointWarning:function(serverPack){
        app.Client.OnEvent('OnSportsPointWarning', serverPack);
    },
    OnPostTypeInfoChange:function(serverPack){
        let pid = serverPack.pid;
        let selfPid = app.HeroManager().GetHeroProperty("pid");
        if (pid == selfPid) {
            this.SendReqClubDataByClubId(serverPack.clubId);
            if (app.FormManager().GetFormComponentByFormName("ui/club/UIUnionManager")) {
                app.FormManager().GetFormComponentByFormName("ui/club/UIUnionManager").CloseForm();
            }
            if (app.FormManager().GetFormComponentByFormName("ui/club_2/UIUnionManager_2")) {
                app.FormManager().GetFormComponentByFormName("ui/club_2/UIUnionManager_2").CloseForm();
            }
            if (this.GetClubFormComponent()) {
                this.GetClubFormComponent().OnShow();
            }
        }
    },
    OnUnionSportsPoint:function(serverPack){
        //刷新本人的比赛分
        let selfPid = app.HeroManager().GetHeroProperty("pid");
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == serverPack.clubId && selfPid == serverPack.pid){
                this.dataInfo[i].sportsPoint = serverPack.sportsPoint;
                this.dataInfo[i].unionState = serverPack.unionState;
                app.Client.OnEvent('OnUnionStateChange', this.dataInfo[i]);
                break;
            }
        }
        app.Client.OnEvent('OnUnionSportsPoint', serverPack);
    },
    OnRoomInvitation:function(event){
        app.FormManager().ShowForm('UIRoomInvitation', event);
    },
    OnPromotionLevelPowerChange:function(serverPack){
        app.Client.OnEvent('OnPromotionLevelPowerChange', serverPack);
    },
    //------------发包函数------------------
    SendReqClubData:function(){
        let self=this;
        app.NetManager().SendPack("club.CGetClubListMin2",{},function(serverPack){
            if(serverPack.length>0){
                self.AddClubMin2Data(serverPack);
                app.Client.OnEvent('OnAllClubData',{});
            }
        }, function(){

        });
    },
    OutClubUI:function(){
        app.NetManager().SendPack("player.CPlayerSignInterface",{'sign':0});
    },
    SendReqClubDataByClubId:function(clubId){
        app.NetManager().SendPack("club.CGetClubListByClubId",{'clubId':clubId});
    },
    SendReqClubDataById:function(clubId,LoadClub=true,force=false){
        // let clubData=this.GetClubDataByClubID(clubId);
        // if(clubData['LoadAll']==true && force==false){
        //     if(LoadClub==true){
        //         app.Client.OnEvent('LoadClub',clubData);
        //     }
        // }else{
        //     let self=this;
        //     app.NetManager().SendPack("club.CGetClubListById",{'clubId':clubId},function(serverPack){
        //         self.UpdateClubData(serverPack);
        //         if(LoadClub==true){
        //             app.Client.OnEvent('LoadClub',serverPack);
        //         }
        //     },function(error){});
        // }
        let self=this;
        app.NetManager().SendPack("club.CGetClubListById",{'clubId':clubId},function(serverPack){
            self.UpdateClubData(serverPack);
            if(LoadClub==true){
                app.Client.OnEvent('LoadClub',serverPack);
            }
        },function(error){});
    
    },
    UpdateClubData:function(serverPack){
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == serverPack.id){
                this.dataInfo[i] = serverPack;
                //this.dataInfo[i].LoadAll=true;
                break;
            }
        }
    },
    SendReqJoinClub:function(clubSign){
        app.NetManager().SendPack("club.CClubJoin",{'clubSign':clubSign}, function(serverPack){
            app.SysNotifyManager().ShowSysMsg("成功申请加入，请等待管理员审核",[],3);
        }, function(){

        });
    },
    SendLeaveClub:function(){//竖版离开UI处理的
        app.NetManager().SendPack("club.CClubLeave",{});
    },
    SendGetChatData:function(clubId){//竖版
        app.NetManager().SendPack('club.CClubGetChatMsg',{'clubId':clubId});
    },
    SendChat:function(clubId,msg){//竖版
        app.NetManager().SendPack('club.CClubChat',{'clubId':clubId,'msg':msg});
    },
    SendGetAllRoom:function(clubId=0,pageNum=1){
        if (this.unionSendpackHead && this.unionSendpackHead.unionId > 0) {
            app.NetManager().SendPack('union.CUnionGetAllRoomMin',{'unionId':this.unionSendpackHead.unionId,'clubId':this.unionSendpackHead.clubId,'pageNum':pageNum});
        }else{
            if(clubId>0){
                app.NetManager().SendPack('club.CClubGetAllRoomMin',{'clubId':clubId,'pageNum':pageNum});
            }
        }
    },
    SendPlayerStateChange:function(clubId,pid,state,audit=false){
        let that = this;
        let sendPack = {'clubId':clubId,'pid':pid,'status':state,'audit':audit};
        app.NetManager().SendPack('club.CClubKickOutNeedConfirm',{'clubId':clubId,'pid':pid},function(event){
            if (event.type == 0) {
                app.NetManager().SendPack('club.CClubChangePlayerStatus',sendPack);
            }else if (event.type == 1) {
                //保险箱比赛分不为0，二次弹窗
                // that.SetWaitForConfirm("UNION_EXIST_CASE_SPORTS_POINT",app.ShareDefine().ConfirmYN,[],[sendPack], "该玩家保险箱中还有竞技点值，确认是否踢出玩家");
                app.SysNotifyManager().ShowSysMsg("您当前身上或保险箱有竞技点无法申请退出");
            }else{
                app.NetManager().SendPack('club.CClubChangePlayerStatus',sendPack);
            }
            app.Client.OnEvent('ReShowClubPlayer', {});
        },function(error){

        });
        
    },
    SendGetRoomCfg:function(clubId){
        app.NetManager().SendPack('club.CClubGetCreateGameSet',{'clubId':clubId},this.OnRoomCfgs.bind(this));
    },
    SendSetRoomCfg:function(clubId,roomIdx,state){
        app.NetManager().SendPack('club.CClubCreateGameSetChangge',{'clubId':clubId,'gameIndex':roomIdx,'status':state});
    },
    SendCloseClub:function(clubId){
        app.NetManager().SendPack('club.CClubClose',{'clubId':clubId});
    },
    SendGetClubInviteList:function(){
        app.NetManager().SendPack('club.CClubInvited',{});
    },
    SendGetUnionInviteList:function(){
        app.NetManager().SendPack('union.CUnionNotify',{});
    },
    SendGetClubCardWarn:function(){
        // app.NetManager().SendPack('club.CClubGetRoomCardAttention',{});
    },
    SendSetClubMinister:function(clubId,pid,minister){
        app.NetManager().SendPack('club.CClubSetMinister',{'clubId':clubId,'pid':pid,'minister':minister});
    },
    SendSetPromotionMinister:function(clubId,btnNode,minister){
        let pid=btnNode.parent.parent.name;
        app.NetManager().SendPack('club.CClubSetPromotionMinister',{'clubId':clubId,'pid':pid,'minister':minister},function(success){
            if(minister==1){
                btnNode.parent.getChildByName("btn_swtgygl").active=true;
            }else{
                btnNode.parent.getChildByName("btn_qxtgygl").active=true;
            }
            btnNode.active=false;
        },function(error){

        });
    },
    SendSetClubBanGame:function(clubId,pid,isBan){
        app.NetManager().SendPack('club.CClubBanGame',{'clubId':clubId,'banPid':pid,'isBan':isBan});
    },

    //------------大赛事消息发送------------
    SendCreateUnion:function(clubId,unionName){
        app.NetManager().SendPack('union.CUnionCreate',{'clubId':clubId,'unionName':unionName});
    },
    
    //------------其他------------------
    MsgHandle:function(serverPack){
        let clubId = serverPack.clubId;
        let clubName = serverPack.clubName;
        let status = serverPack.clubPlayerInfo.status;
        let playerInfo = serverPack.clubPlayerInfo;
        let playerName = playerInfo.shortPlayer.name;
        let pid = playerInfo.shortPlayer.pid;
        let selfPid = app.HeroManager().GetHeroProperty("pid");
        let bSelfIsMag = this.IsManager(clubId,selfPid);
        if(this.Enum_Refuse == status && selfPid == pid)
            app.SysNotifyManager().ShowSysMsg("MSG_CLUB_JOIN_Refuse",[clubName]);
        else if(this.Enum_Join == status && selfPid == pid){
            if (app.FormManager().GetFormComponentByFormName(app.FormManager().MainForm())) {
                app.FormManager().GetFormComponentByFormName(app.FormManager().MainForm()).ShowAddClubSprite();
            }
            app.SysNotifyManager().ShowSysMsg("MSG_CLUB_JOIN_Success",[clubName]);
        }
        else if(this.Enum_Kick == status && selfPid == pid)
            app.SysNotifyManager().ShowSysMsg("MSG_CLUB_KICK",[clubName]);
        else if(this.Enum_Invite == status && selfPid == pid)
            this.SetWaitForConfirm("MSG_CLUB_INVITE_Join",app.ShareDefine().ConfirmYN,[clubName][clubId]);
        else if(this.Enum_RefuseInvite == status && bSelfIsMag)
            app.SysNotifyManager().ShowSysMsg("MSG_CLUB_RefuseInvite",[playerName]);
        else if(this.Enum_Leave == status && selfPid == pid)
            app.SysNotifyManager().ShowSysMsg("MSG_CLUB_Leave",[clubName]);
        else if (this.Enum_NotAgree == status && selfPid == pid)
            app.SysNotifyManager().ShowSysMsg("MSG_CLUB_JOIN_InList");
        else if (this.Enum_Become_mgr == status && selfPid == pid){
            app.SysNotifyManager().ShowSysMsg("恭喜您成为[" + clubName + "]管理员", [], 3);
            this.SendReqClubDataByClubId(serverPack.clubId);
        }
        else if (this.Enum_cancel_mgr == status && selfPid == pid){
            app.SysNotifyManager().ShowSysMsg("您被[" + clubName + "]取消管理员权限", [], 3);
            this.SendReqClubDataByClubId(serverPack.clubId);
        }
        else if (this.Enum_PLAYER_BECOME_BAN == status && selfPid == pid)
            app.SysNotifyManager().ShowSysMsg("您被[" + clubName + "]禁止游戏", [], 3);
        else if (this.Enum_PLAYER_CANCEL_BAN == status && selfPid == pid)
            app.SysNotifyManager().ShowSysMsg("您被[" + clubName + "]取消禁止游戏", [], 3);
    },
    IsManager:function(clubId,pid){
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == clubId){
                let minister = this.dataInfo[i].minister;
                if (minister != this.Club_MINISTER_GENERAL) {
                    return true;
                }
            }
        }
        return false;
    },
    GetHasDataState:function(){
        return 0 != this.dataInfo.length;
    },
    AddClubData:function(clubData){
        let isExit = false;
        for (let i = 0; i < this.dataInfo.length; i++) {
            if (this.dataInfo[i].id == clubData.id) {
                isExit = true;
                this.dataInfo[i] = clubData;
                break;
            }
        }
        if (!isExit) {
            this.dataInfo.push(clubData);
        }
        return this.dataInfo;
    },
    GetClubData:function(){
        return this.dataInfo;
    },
    SetClubData:function(dataInfo){
        this.dataInfo = dataInfo;
    },
    GetClubDataByClubID:function(clubId){
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == clubId)
                return this.dataInfo[i];
        }
        return null;
    },

    GetUnionTypeByClubIDUnionID:function(clubId,unionId){
        if(!unionId){
            return 0;
        }
        if(unionId<=0){
            return 0
        }
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == clubId)
                return this.dataInfo[i].unionType;
        }
        return 0;
    },

    GetUnionTypeByLastClubData:function(){
        let lastClubData = this.GetLastClubData();
        if (lastClubData != null) {
            let clubData = this.GetClubDataByClubID(lastClubData.club_data.id);
            if (typeof(clubData.unionType) == "undefined") {
                return 0;
            }else{
                return clubData.unionType;
            }
        }else{
            return 0;
        }
    },

    GetClubShowLostConnect:function(clubId){
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == clubId)
                return this.dataInfo[i].showLostConnect;
        }
        return 0;
    },
    SetClubDataByClubID:function(clubId,key,value){
        for(let i=0;i<this.dataInfo.length;i++){
            if(this.dataInfo[i].id == clubId){
                if (typeof(this.dataInfo[i][key]) != "undefined") {
                    this.dataInfo[i][key] = value;
                    break;
                }
            }
        }
    },
    ChangeOrientationH:function(val,cb){
        if(this.FromManager._isOrientationH() == val)
            return;
        if(cc.sys.isBrowser){
            let frameSize = cc.view.getFrameSize();           
            cc.view.setFrameSize(frameSize.height,frameSize.width);        
        }
        else{
            let argList = [{"Name":"val","Value":val}];
            app.NativeManager().CallToNative("changeOrientationH", argList);
        }

        if(cb){
            setTimeout(function(){
                cb();
            },100);
        }
    },
    GetBottomStatusHeight:function(){
        if(cc.sys.isBrowser){
            return 0;   
        }
        else{
            return app.NativeManager().CallToNative("getBottomStatusHeight", [],'Number');
        }
    },
    //本地保存上次选择的亲友圈
    SetLastClubData:function(id,clubsign, name,showUplevelId=0,showClubSign=0){
        let selfPid = app.HeroManager().GetHeroProperty("pid");
        let club_data = {"id":id,"clubsign":clubsign, "name":name,"showUplevelId":showUplevelId,"showClubSign":showClubSign};
        let last_club_data_ob = {
            "pid":selfPid,
            "club_data":club_data
        }
        let last_club_data_arr = [];
        let last_club_data = cc.sys.localStorage.getItem('last_club_data');
        if (last_club_data) {
            last_club_data_arr = eval(last_club_data);
            let isExit = false;
            for (let i = 0; i < last_club_data_arr.length; i++) {
                if (last_club_data_arr[i].pid == selfPid) {
                    last_club_data_arr[i] = last_club_data_ob;
                    isExit = true;
                    break;
                }
            }
            if (!isExit) {
                last_club_data_arr.push(last_club_data_ob);
            }
        }else{
            last_club_data_arr.push(last_club_data_ob);
        }

        cc.sys.localStorage.setItem('last_club_data', JSON.stringify(last_club_data_arr));
    },
    GetLastClubData:function(){
        let selfPid = app.HeroManager().GetHeroProperty("pid");
        let last_club_data = cc.sys.localStorage.getItem('last_club_data');
        if (last_club_data) {
            let arr = eval(last_club_data);
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].pid == selfPid) {
                    return arr[i];
                }
            }
        }else{
            return null;
        }
    },
    //发送大赛事消息都必须带上unionId和clubId
    SetUnionSendPackHead:function(unionId, clubId){
        this.unionSendpackHead = {"unionId":unionId, "clubId":clubId};
    },

    GetUnionSendPackHead:function(){
        return {"unionId":this.unionSendpackHead.unionId, "clubId":this.unionSendpackHead.clubId};
    },
    //获取当前亲友圈皮肤
    GetCurClubSkinType:function(){
        let lastClubData = this.GetLastClubData();
        if (lastClubData != null) {
            let clubData = this.GetClubDataByClubID(lastClubData.club_data.id);
            return clubData.skinType;
        }else{
            return 0;
        }
    },

    GetCurClubShowUplevelId:function(){
        let lastClubData = this.GetLastClubData();
        if (lastClubData != null) {
            let clubData = this.GetClubDataByClubID(lastClubData.club_data.id);
            if(clubData){
                if(clubData['showUplevelId']==1){
                    return true;
                }
            }
        }else{
            let clubData2=this.GetClubData()[0];
            if(clubData2){
                if(clubData2['showUplevelId']==1){
                    return true;
                }
            }
        }
        return false;
    },
    GetCurClubShowClubSign:function(){
        let lastClubData = this.GetLastClubData();
        if (lastClubData != null) {
            let clubData = this.GetClubDataByClubID(lastClubData.club_data.id);
            if(clubData){
                if(clubData['showClubSign']==1){
                    return true;
                }
            }
        }else{
            let clubData2=this.GetClubData()[0];
            if(clubData2){
                if(clubData2['showClubSign']==1){
                    return true;
                }
            }
        }
        return false;
    },
    SetCurClubShowUplevelId:function(showUplevelId){
        let lastClubData = this.GetLastClubData();
        if (lastClubData != null) {
            let clubData = this.GetClubDataByClubID(lastClubData.club_data.id);
            clubData.showUplevelId=showUplevelId;
        }else{
            let clubData2=this.GetClubData();
            clubData2[0].showUplevelId=showUplevelId;
        }
        return false;
    },
    SetCurClubShowClubSign:function(showClubSign){
        let lastClubData = this.GetLastClubData();
        if (lastClubData != null) {
            let clubData = this.GetClubDataByClubID(lastClubData.club_data.id);
            clubData.showClubSign=showClubSign;
        }else{
            let clubdata2=this.GetClubData();
            clubdata2[0].showClubSign=showClubSign;
        }
    },

    //根据盟主选择的皮肤操作对应界面
    AddDefaultClubFrom:function(skinType){
        if (skinType == 0 || typeof(skinType) == "undefined") {
            app.FormManager().AddDefaultFormName("ui/club/UIClubMainDefault");
        }else{
            app.FormManager().AddDefaultFormName("ui/club_"+skinType+"/UIClubMain_"+skinType);
        }
    },
    ShowClubFrom:function(skinType = -1){
        if (skinType == -1) {
            skinType = this.GetCurClubSkinType();
        }
        if (skinType == 0 || typeof(skinType) == "undefined") {
            app.FormManager().ShowForm("ui/club/UIClubMainDefault");
            app.LocalDataManager().SetConfigProperty("SysSetting","preLoadClubForm","ui/club/UIClubMainDefault");
        }else{
            app.FormManager().ShowForm("ui/club_"+skinType+"/UIClubMain_"+skinType);
            app.LocalDataManager().SetConfigProperty("SysSetting","preLoadClubForm","ui/club_"+skinType+"/UIClubMain_"+skinType);
        }
    },
    CloseClubFrom:function(){
        app.FormManager().CloseForm("ui/club/UIClubMainDefault");
        app.FormManager().CloseForm("ui/club_1/UIClubMain_1");
        app.FormManager().CloseForm("ui/club_2/UIClubMain_2");
    },
    //为了防止切换的时候找不到组件，返回必须不能null，做一层遍历
    GetClubFormComponent:function(){
        let skinType = this.GetCurClubSkinType();
        if (skinType == 0 || typeof(skinType) == "undefined") {
            return app.FormManager().GetFormComponentByFormName("ui/club/UIClubMainDefault");
        }else{
            return app.FormManager().GetFormComponentByFormName("ui/club_"+skinType+"/UIClubMain_"+skinType);
        }
    },
    /**
     * 2次确认点击回调
     * @param curEventType
     * @param curArgList
     */
    SetWaitForConfirm:function(msgID,type,msgArg=[],cbArg=[],content = "", lbSure ="", lbCancle=""){
        let ConfirmManager = app.ConfirmManager();
        ConfirmManager.SetWaitForConfirmForm(this.OnConFirm.bind(this), msgID, cbArg);
        ConfirmManager.ShowConfirm(type, msgID, msgArg,content,lbSure,lbCancle);
    },
    OnConFirm:function(clickType, msgID, cbArgs){
        if('MSG_CLUB_INVITE_Join' == msgID){
            let state = 'Sure' == clickType ? this.Enum_Join : this.Enum_RefuseInvite;
            let clubId = cbArgs[0];
            let selfPid = app.HeroManager().GetHeroProperty("pid");
            this.SendPlayerStateChange(clubId,selfPid,state);
            let that = this;
            for(let i=0;i<this.inviteList.length;i++){
                if(clubId == this.inviteList[i].clubId){
                    this.inviteList.splice(i,1);
                    if(0 != this.inviteList.length){
                        let clubData = this.inviteList[this.inviteList.length - 1];
                        setTimeout(function(){
                            that.SetWaitForConfirm("MSG_CLUB_INVITE_Join",app.ShareDefine().ConfirmYN,[clubData.clubName],[clubData.clubId]);
                        },200); 
                    }
                    break;
                }
            }
        }else if ('MSG_UNION_INVITE_JOIN' == msgID) {
            if (this.GetClubFormComponent()) {
                this.GetClubFormComponent().OnShow();
            }
        }else if ('MSG_UNION_INVITE_OUT' == msgID) {
            if (app.FormManager().GetFormComponentByFormName("ui/club/UIUnionManager")) {
                app.FormManager().GetFormComponentByFormName("ui/club/UIUnionManager").CloseForm();
            }
            if (app.FormManager().GetFormComponentByFormName("ui/club_2/UIUnionManager_2")) {
                app.FormManager().GetFormComponentByFormName("ui/club_2/UIUnionManager_2").CloseForm();
            }
            if (this.GetClubFormComponent()) {
                this.GetClubFormComponent().OnShow();
            }
        }else if ('MSG_UNION_INVITE_TICHU' == msgID) {
            if (app.FormManager().GetFormComponentByFormName("ui/club/UIUnionManager")) {
                app.FormManager().GetFormComponentByFormName("ui/club/UIUnionManager").CloseForm();
            }
            if (app.FormManager().GetFormComponentByFormName("ui/club_2/UIUnionManager_2")) {
                app.FormManager().GetFormComponentByFormName("ui/club_2/UIUnionManager_2").CloseForm();
            }
            if (this.GetClubFormComponent()) {
                this.GetClubFormComponent().OnShow();
            }
        }else if ('MSG_UNION_INVITE_YAOQING' == msgID) {
            let unionSign = cbArgs[0];
            let clubId = cbArgs[1];
            let sendPack = {};
            sendPack.clubId = clubId;
            sendPack.unionSign = unionSign;
            if('Sure' == clickType){
                app.NetManager().SendPack("union.CUnionJoin",sendPack, function(serverPack){
                    if (serverPack == 1) {
                        app.SysNotifyManager().ShowSysMsg("申请加入成功",[],3);
                    }else{
                        //直接加入不需要申请
                        if (app.FormManager().GetFormComponentByFormName("ui/club/UIUnionNone")) {
                            app.FormManager().GetFormComponentByFormName("ui/club/UIUnionNone").CloseForm();
                        }
                        if (this.GetClubFormComponent()) {
                            this.GetClubFormComponent().OnShow();
                        }
                    }
                }, function(){
                    app.SysNotifyManager().ShowSysMsg("加入失败",[],3);
                });
            }else{
                app.NetManager().SendPack("union.CUnionRefuseInvitation",sendPack, function(serverPack){
                    app.SysNotifyManager().ShowSysMsg("拒绝加入赛事",[],3);
                }, function(){
                    
                });
            }
        }else if ('UNION_EXIST_CASE_SPORTS_POINT' == msgID) {
            if('Sure' == clickType){
                app.NetManager().SendPack('club.CClubChangePlayerStatus',cbArgs[0]);
            }
        }
    },
});


var g_ClubManager = null;

/**
 * 绑定模块外部方法
 */
exports.GetModel = function(){
    if(!g_ClubManager){
        g_ClubManager = new ClubManager();
    }
    return g_ClubManager;
}