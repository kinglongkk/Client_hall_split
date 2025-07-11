var app = require("app");
cc.Class({
    extends: require("BaseForm"),

    properties: {
        step1:cc.Node,
        step2:cc.Node,
        step3:cc.Node,
        edit_name:cc.EditBox,
        edit_phone:cc.EditBox,
        edit_yzm:cc.EditBox,
        edit_jieshao:cc.EditBox,
        toggle:cc.Toggle,
        hint:cc.Node,
        lb_time:cc.Label,
        step2WeiXin:cc.Label,
        step2WeiXinRich:cc.RichText,
        step3WeiXinRich:cc.RichText,
        weixin:cc.Label,
    },
    OnCreateInit: function () {
        this.POSTURL="http://185.213.26.71/index.php?module=ApplicationAgent&action=setApply";
        this.GETURL="http://185.213.26.71/index.php?module=ApplicationAgent&action=getApply&playerID="+app.HeroManager().GetHeroProperty("pid");
        this.RegEvent("OnCopyTextNtf", this.OnEvt_CopyTextNtf,this);
    },
    OnShow: function () {
        this.step1.active=false;
        this.step2.active=false;
        this.step3.active=false;
        this.hint.active=false;
        //刷新客服号码
        if (!app['KeFuHao']) {
            app['KeFuHao'] = "请设置客服号"
        }
        this.weixin.string=app['KeFuHao'].toString();
        this.step2WeiXin.string="客服微信号:"+app['KeFuHao'].toString();
        this.step2WeiXinRich.string="<color=#512d0a>添加客服微信:</c><color=#da4130>"+app['KeFuHao'].toString()+"</color><color=#512d0a>加快审批</color>";
        this.step3WeiXinRich.string="<color=#512d0a>添加客服微信:</c><color=#da4130>"+app['KeFuHao'].toString()+"</color>";
        this.SendHttpRequest(this.GETURL, "", "GET",{});
        this.updateTime = new Date().getTime();
    },
    
    OnEvt_CopyTextNtf:function(event){
        if(0 == event.code)
            this.ShowSysMsg("已复制微信："+event.msg);
        else
            this.ShowSysMsg("复制失败");
    },

    SendHttpRequest:function(serverUrl, argString, requestType, sendPack){
        app.NetRequest().SendHttpRequest(serverUrl, argString, requestType, sendPack, 2000, 
            this.OnReceiveHttpPack.bind(this), 
            this.OnConnectHttpFail.bind(this),
            null,
            this.OnConnectHttpFail.bind(this),
        );
        
    //     var url = [serverUrl, argString].join("")

    //     var dataStr = JSON.stringify(sendPack);
    //   //  var dataStr=sendPack;
    //     //每次都实例化一个，否则会引起请求结束，实例被释放了
    //     var httpRequest = new XMLHttpRequest();

    //     httpRequest.timeout = 2000;


    //     httpRequest.open(requestType, url, true);
    //     //服务器json解码
    //     httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    //     var that = this;
    //     httpRequest.onerror = function(){
    //         that.ErrLog("httpRequest.error:%s", url);
    //         that.OnConnectHttpFail(serverUrl, httpRequest.readyState, httpRequest.status);
    //     };
    //     httpRequest.ontimeout = function(){
            
    //     };
    //     httpRequest.onreadystatechange = function(){
    //         //执行成功
    //         if (httpRequest.status == 200){
    //             if(httpRequest.readyState == 4){
    //                 that.OnReceiveHttpPack(serverUrl, httpRequest.responseText);
    //             }
    //         }
    //         else{
    //             that.OnConnectHttpFail(serverUrl, httpRequest.readyState, httpRequest.status);
    //             that.ErrLog("onreadystatechange(%s,%s)", httpRequest.readyState, httpRequest.status);
    //         }
    //     };
    //     httpRequest.send(dataStr);

    },
     /*
    *AppID  AppName AppPrice    DiamondNum  ExtraReward ImageName   goodsType   channelType
       12     金币     29          320000       3002    icon_card6       1           2
    */
    OnReceiveHttpPack:function(serverUrl, httpResText){
        try{
            let serverPack = JSON.parse(httpResText);
            if(serverUrl==this.GETURL){
                if(serverPack.code==301){
                    //申请存在或者失败
                    this.step1.active=false;
                    this.step2.active=true;
                    this.step3.active=false;
                    this.hint.active=true;
                }else if(serverPack.code==200){
                    //申请不存在
                    this.step1.active=true;
                    this.step2.active=false;
                    this.step3.active=false;
                    this.hint.active=false;
                }else if(serverPack.code==400){
                    //申请存在或者失败
                    this.step1.active=false;
                    this.step2.active=false;
                    this.step3.active=true;
                    this.hint.active=true;
                }
            }else if(serverUrl==this.POSTURL){
                if(serverPack.code==200){
                    this.step1.active=false;
                    this.step2.active=true;
                    this.step3.active=false;
                    this.hint.active=true;
                }else if(serverPack.code==300){
                    this.ShowSysMsg("手机格式错误");
                }else if(serverPack.code==301){
                    this.ShowSysMsg("姓名不能为空");
                }else if(serverPack.code==302){
                    this.ShowSysMsg("申请保存失败");
                }else if(serverPack.code==303){
                    this.ShowSysMsg("玩家id不存在");
                }else if(serverPack.code==304){
                    this.ShowSysMsg("未获取到数据");
                }
            }else if(this.yanzhengUrl==serverUrl){
                if(serverPack["code"] == 0){
                    let btn_yanzhengma=this.node.getChildByName('step1').getChildByName('content').getChildByName('code').getChildByName('btn_yzm');
                    btn_yanzhengma.active=false;
                    this.lb_times=60;
                    this.schedule(this.ShowYanZhengMaTime,1);
                    this.scheduleOnce(function(){
                        btn_yanzhengma.active=true;
                        this.lb_times=0;
                    },60);
                }else{
                    this.ShowSysMsg(serverPack.msg);
                }
            }
            this.mictime = serverPack.mictime;
            let timeString = app.ServerTimeManager().GetMictimeStringBySec(this.mictime, this.ShareDefine.ShowHourMinSec);
            this.lb_time.string = timeString;
        }
        catch (error){
            
        }
    },
    OnConnectHttpFail:function(serverUrl, readyState, status){
        
    },
      //---------刷新函数--------------------
    OnUpdate:function () {
        if(this.mictime){
            let time = new Date().getTime();
            if( time < this.updateTime){
                let timeString = app.ServerTimeManager().GetMictimeStringBySec(this.mictime, this.ShareDefine.ShowHourMinSec,1);
                // let num = parseInt(timeString);
                // if(!num){
                //     this.CloseForm();
                //     return;
                // }
                this.lb_time.string = timeString;
            }
            else{
                this.updateTime += 500;
            }
        }
    },

    CopyNumber:function(btnName, btnNode){
        let str = "";
        if("btn_fzwxh" == btnName.currentTarget.name){
            str = app["KeFuHao"];
        }else if("btn_fzgzh" == btnName.currentTarget.name){
            str = app["KeFuHao"];
        }
        if(cc.sys.isNative){
            let argList = [{"Name":"msg","Value":str.toString()}];
            app.NativeManager().CallToNative("copyText", argList);
        }
    },
    OnClick:function(btnName, btnNode){
        if('btn_close' == btnName){
            this.CloseForm();
        }
        else if('btn_xieyi' == btnName){
            app.FormManager().ShowForm('UIDaiLiXieYi');
        }else if('btn_tijiao'==btnName){
            /*
            edit_name:cc.EditBox,
            edit_phone:cc.EditBox,
            edit_jieshao:cc.EditBox,
             */
            if(this.toggle.isChecked){
                let name=this.edit_name.string;
                if(name==""){
                    this.ShowSysMsg("请输入姓名");
                    return;
                }
                let phone=this.edit_phone.string;
                if(phone==""){
                    this.ShowSysMsg("请输入手机号码");
                    return;
                }
                let jieshao=this.edit_jieshao.string;
                let unicode = 0;
                let zijie = 0;
                for (let i = 0; i < jieshao.length; i++) {
                    unicode = jieshao.charCodeAt(i);
                    if (unicode < 127) { //判断是单字符还是双字符
                        zijie += 1;
                    } else { //chinese
                        zijie += 2;
                    }
                }
                if(zijie < 30){
                    this.ShowSysMsg("最少为30个字符（15个汉字）");
                    return;
                }
                let SendPack = {
                                        "playerID":app.HeroManager().GetHeroProperty("pid"),
                                        "realName":name,
                                        "phone":phone,
                                        "beizhu":jieshao,
                                    };
                //开始请求客户端配置
                // key=md5('玩家id'.'wanzi'.date('Y-m-d'))
                let signString=app.HeroManager().GetHeroID()+'wanzi'+app.ComTool().GetNowDateDayStr();
                let sign = app.MD5.hex_md5(signString);
                let para="&playerID="+app.HeroManager().GetHeroProperty("pid")+"&realName="+encodeURI(name)+"&phone="+phone+"&beizhu="+encodeURI(jieshao)+"&key="+sign;
                this.SendHttpRequest(this.POSTURL, para, "GET",{});
            }else{
                this.ShowSysMsg("合作协议未同意");
            }
            
        }else if('btn_copy'==btnName){
            let str = this.weixin.string;
            if(cc.sys.isNative){
                let argList = [{"Name":"msg","Value":str.toString()}];
                let promisefunc = function(resolve, reject){
                    app.NativeManager().CallToNative("copyText", argList);
                };
                return new app.bluebird(promisefunc);
            }
        }else if(btnName=="btn_yzm"){
            this.click_btn_yzm();
        }
    },
    checkPhone:function(phone){ 
        if(!(/^1[3456789]\d{9}$/.test(phone))){ 
            return false; 
        }
        return true;
    },
   
    click_btn_yzm:function(){
        let node=this.node.getChildByName('step1').getChildByName('content').getChildByName('phone').getChildByName('editbox');
        let phone=node.getComponent(cc.EditBox).string;
        if(!phone){
            this.ShowSysMsg('请填写手机号码');
            return;
        }
        if(this.checkPhone(phone)==false){
            this.ShowSysMsg('电话号码有误');
            return;
        }
        this.yanzhengUrl="http://code.qicaiqh.com:88/SendCode";
        let SendPack = {

                                    "mobile":phone,
                                    "sms_temple":"SMS_154085055",
                                };

        this.SendHttpRequest(this.yanzhengUrl,"?mobile="+phone+"&sms_temple=SMS_154085055","GET",{});

    },
    ShowYanZhengMaTime:function(){
        let lb_time=this.node.getChildByName('step1').getChildByName('content').getChildByName('code').getChildByName('tip_yzm').getComponent(cc.Label);
        this.lb_times=this.lb_times-1;
        if(this.lb_times<=0){
            this.unschedule(this.ShowYanZhengMaTime);
            lb_time.string="";
            return;
        }
        lb_time.string=this.lb_times+"";
    },
    // Click_Toggle:function(){
    //     this.bent_tijiao.interactable = this.toggle.isChecked;
    // },
});
