var app = require("app");
cc.Class({
    extends: require("BaseForm"),

    properties: {
        
    },
    //---------点击函数---------------------
    OnClick:function(btnName, btnNode){
        if(btnName == "btn") {
        }
        else{
                            console.error("OnClick(%s) not find",btnName);
        }
    },
});