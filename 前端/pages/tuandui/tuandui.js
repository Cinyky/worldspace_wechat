// pages/tuandui/tuandui.js
var server = require('../../utils/server');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    team_member_num:0
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
    //团队人数
    var that = this //有这个才能使用setData
    var user_id = getApp().globalData.userInfo.user_id
    server.postJSON('/User/team_number_num/first_leader/first_leader/user_id/' + user_id, function (res) {
      that.setData({
        user_list: res.data.result
      });
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