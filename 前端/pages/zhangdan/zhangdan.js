// pages/zhangdan/zhangdan.js
var server = require('../../utils/server');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    all_amount: 0,
    list:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //总收入
    var that = this //有这个才能使用setData
    var user_id = getApp().globalData.userInfo.user_id
    server.postJSON('/User/all_amount/user_id/' + user_id, function (res) {
      var amount = res;
      console.log(res);
      that.setData({
        all_amount: amount.data
      });
    });

    //收益记录
    server.postJSON('/User/my_bill/user_id/' + user_id, function (res) {
      that.setData({
        list: res.data
      });
      console.log(res);
      
    });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})