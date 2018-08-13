var app = getApp();
var server = require('../../../utils/server');
Page({
  data: {},
  onLoad: function (a) {
      this.loadData(a)
  },
  loadData: function (a) {
    var o = this;
    wx.showLoading({
      title: "正在加载"
    }),
      server.getJSON('/User/getShippingInfo', {order_id: a.id}, function(res) {
        wx.hideLoading();
        console.log(res.data);
        1 == res.data.status && o.setData({
          data: res.data.result
        }),
          -1 == res.data.status && wx.showModal({
            title: "提示",
            content: res.data.msg,
            showCancel: !1,
            success: function (e) {
              e.confirm && wx.navigateBack()
            }
          });
      })
  },
  onReady: function () { },
  onShow: function () { },
  onHide: function () { },
  onUnload: function () { },
  onPullDownRefresh: function () { },
  onReachBottom: function () { }
});