// pages/login/login.js
var server = require('../../utils/server');
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
login:function(e){

  wx.showToast({
    title: '登录中...',
    icon: 'loading',
    duration: 2000
  })
  var app = getApp();
  app.getOpenId(function () {
    var openId = getApp().globalData.openid;
    server.getJSON("/User/validateOpenid", { openid: openId }, function (res) {
      if (res.data.code == 200) {
        if (res.data.data.mobile > 0) {
          getApp().globalData.is_phone = 0;
        }
        getApp().globalData.userInfo = res.data.data;
        getApp().globalData.login = true;
      }else {
        if (res.data.code == '400') {
          app.register(function () {
            getApp().globalData.login = true;
            var parent_id = getApp().globalData.parent_id;
            var goodsId = getApp().globalData.goodsId;
            if (parent_id) {
              server.getJSON("/User/updateparent/openid/" + openId + "/parent_id/" + parent_id, function (res) {
                var result = res.data.result.nick_name;
                if (result) {
                  wx.showToast({
                    title: '上级:' + result,
                    icon: 'success',
                    duration: 2000
                  })
                }
              });
            }
            if (goodsId) {
              app.redirectTo("../goods/detail/detail?objectId=" + goodsId);
            } else {
              app.redirectTo("../index/index");
            }
          });
        }
      }
    });
  });
},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

})