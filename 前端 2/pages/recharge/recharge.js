var server = require('../../utils/server');
Page({

  data: {
    'user_money': 0.00
  },
  onLoad: function (options) {
    var that = this;
    var user_money = getApp().globalData.userInfo.user_money;
    that.setData({user_money: user_money});
  },

  formSubmit: function (e) {
    var money = e.detail.value.money;
    var user_id = getApp().globalData.userInfo.user_id;
    if(money == '') {
      wx.showToast({
        title: '请输入金额',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    server.getJSON('/User/user_recharge', {user_id: user_id, account: money}, function (res) {
      var wxdata = res.data.result.wdata;
      var timeStamp = wxdata.timeStamp + "";
      var nonceStr = wxdata.nonceStr + "";
      var package1 = wxdata.package
      var sign = wxdata.sign;
      wx.requestPayment({
        'nonceStr': nonceStr,
        'package': package1,
        'signType': 'MD5',
        'timeStamp': timeStamp,
        'paySign': sign,
        'success': function (res) {
          wx.showToast({ title: '支付成功', icon: 'success', duration: 2000 })
          setTimeout(function doHandler() {
            wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
              success: function (res) {
                // success
              },
              fail: function () {
                // fail
              },
              complete: function () {
                // complete
              }
            })
          }, 2000);
        },
        'fail': function (res) {
          console.log(res);
          wx.showToast({ title: '支付失败', icon: 'success', duration: 2000 })
          setTimeout(function doHandler() {
            wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
              success: function (res) {
                // success
              },
              fail: function () {
                // fail
              },
              complete: function () {
                // complete
              }
            })
          }, 2000);
        }
      })
    });
  },
  
})