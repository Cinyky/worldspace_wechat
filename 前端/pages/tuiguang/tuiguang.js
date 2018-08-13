var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imagewidth: 0,
    imageheight: 0,
    userInfo: {}
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    wx.getUserInfo({
      success: ({ userInfo }) => {
        that.setData({
          userInfo: userInfo
        });
        app.globalData.nickName = userInfo.nickName;
      }
    });
  },
})