const AV = require('../../../utils/av-weapp.js')
var server = require('../../../utils/server');
var app = getApp()
var maxTime = 60
var interval = null
var currentTime = -1 //倒计时的事件（单位：s）  

Page({

  data: {
    login: false,
    time: '获取验证码',
    moneys:0,
    pay_point:0,
    is_phone:1,
    usercenter:{},
    nav_user:{}
  },
  onLoad: function (options) {
    var login = app.globalData.login;
    getApp().setPageNavbar(this);
    var that = this;
    //获取用户中心导航
    server.getJSON('/User/get_user_nav',function(res){
      if(res.data.code == 200) {
        that.setData({nav_user: res.data.res});
      } else {
        console.log(res.data.msg);
      }
    });
    wx.getSystemInfo({
      success: function (res) {
        that.setData({ height: res.windowHeight })
      }
    })
  },
  navigateToEvaluate: function (e) {
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../evaluate/evaluate?index=' + index
    });
  },
  navigateToOrder: function (e) {
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../../order/list/list?index=' + index
    });
  },

  onShow: function () {
    var that = this;
    var login = app.globalData.login;

    var that = this;
    this.setData({ login: login });
    var moneys = app.globalData.userInfo.user_money;
    var pay_point = app.globalData.userInfo.pay_points;
    this.getusercenter();
    this.setData({
      moneys: moneys,
      pay_point: pay_point
    });
    app.globalData.nickName = "11";

  },
  navigateToAddressAboutus: function () {
    wx.navigateTo({
      url: '/pages/member/aboutus/aboutus'
    });
  },
  getusercenter: function () {

    var that = this;
    var openid = app.globalData.openid;
    server.getJSON('/User/getusercenter?openid=' + openid, function (response) {

      if (response){
        that.setData({
          usercenter: response.data.result
        });
      }

    })

  },

  turnto_phone: function (e) {
    this.setData({
      ifphone: true,
    })
  },

  tap_logups(e) {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },
  inputNum: function (e) {
    this.data.num = e.detail.value;
  },
  quick_reguster_phone: function (e) {
    wx.navigateTo({
      url: '../../register/index'
    });
  },
  getPhoneNum: function (e) {
    this.setData({
      phoneNum: e.detail.value,
    });
  },
  input_num: function (e) {
    this.data.num = e.detail.value;
  },
  getPhoneNumber: function (e) {

    var openid = app.globalData.openid;
    var iv = e.detail.iv;
    var encryptedData = e.detail.encryptedData;
    var session_key ="";

    wx.login({
      success: function (res) {
        if (res.code) {
          server.getJSON('/User/getopenId?js_code=' + res.code, function (response) {
            // 获取openId
            session_key = response.data.session_key;
            server.getJSON('/User/getPhoneNumber?open_id=' + openid + "&iv=" + iv + "&encrypteddata=" + encryptedData + "&session_key=" + session_key, function (response1) {
              if (response1) {
                wx.showModal({
                  title: '恭喜',
                  showCancel: false,
                  content: "资料完善成功",
                  complete: function (response2) {
                    wx.redirectTo({
                      url: '../../member/index/index'
                    });
                  }
                })
              } else {
                wx.showModal({
                  title: '遗憾',
                  showCancel: false,
                  content: "获取手机号失败",
                  success: function (response2) {

                  }
                })
              }
            });
          });
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  } 

})



