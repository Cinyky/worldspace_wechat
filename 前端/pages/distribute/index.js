const AV = require('../../utils/av-weapp.js')
var server = require('../../utils/server');
var app = getApp()
var maxTime = 60 
var interval = null 
var currentTime = -1 //倒计时的事件（单位：s）  

Page({
	
	data: {
		login:false,
    time:'获取验证码',
    usercenter:{},
	},
	onLoad: function (options) {
		var login = app.globalData.login;
    var that = this;
    getApp().setPageNavbar(this);
    wx.getSystemInfo({
	success: function(res) {
    that.setData({height:res.windowHeight})
  }
})
	},
  my_team: function () {
    wx.navigateTo({
      url: '../tuandui/tuandui'
    });
  },
  my_bill: function () {
    wx.navigateTo({
      url: '../zhangdan/zhangdan'
    });
  },
   my_tixian: function () {
    wx.navigateTo({
      url: '../tixian/tixian'
    });
  },                                  
	onShow: function () {
		var that = this;
    var login = app.globalData.login;
    var that = this;
		this.setData({login:login});
    this.is_distribute();
    this.getusercenter();
	},
  getusercenter: function () {

    var that = this;
    var openid = app.globalData.openid;
    server.getJSON('/User/getusercenter?openid=' + openid, function (response) {

      if (response) {
        that.setData({
          usercenter: response.data.result
        });
      }

    })

  },
  is_distribute:function (){

    var openid = app.globalData.openid;
    server.getJSON('/User/is_distribut?openid=' + openid,        function (response) {
      if (response.data.status==0) {
        var goodsId = response.data.need;
        wx.showModal({
          title:"您还不是分销商",
          content:"请点击确认购买产品成为分销商",
          showCancel:false,
          confirmText:"确认",
          success: function (res) {
            wx.navigateTo({
              url: "../goods/detail/detail?objectId=" +      goodsId
            });

          }
        })
      }
    })
  }
})



