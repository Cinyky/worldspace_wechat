var app = getApp(),
  share_count = 0;
var server = require('../../../utils/server');
Page({
  data: {},
  onLoad: function (t) {
    var o = this;
    var user_id = app.globalData.userInfo.user_id;
    wx.showLoading({
      mask: !0
    });
    server.getJSON('/User/getReceiveCoupon',{user_id:user_id},function(res){
      if(res.data.status == 1) {
        o.setData({coupon_list: res.data.result});
      }
      wx.hideLoading();
    })
    getApp().setPageNavbar(this);
  },
  onReady: function () { },
  onShow: function () { },
  onHide: function () { },
  onUnload: function () { },
  onPullDownRefresh: function () { },
  onReachBottom: function () { },
  receive: function (t) {
    var o = this,
      user_id = app.globalData.userInfo.user_id,
      n = t.target.dataset.index;
    wx.showLoading({
      mask: !0
    }),
      o.hideGetCoupon || (o.hideGetCoupon = function (t) {
        var n = t.currentTarget.dataset.url || !1;
        o.setData({
          get_coupon_list: null
        }),
          n && wx.navigateTo({
            url: n
          })
      }),
      server.getJSON('/User/receiveCoupon', {id: n, user_id: user_id}, function(res) {
        wx.hideLoading();
        if(res.data.status == 1) {
          o.setData({
            get_coupon_list: res.data.list
          });
          server.getJSON('/User/getReceiveCoupon', { user_id: user_id }, function (res) {
            if (res.data.status == 1) {
              wx.hideLoading();
              o.setData({ coupon_list: res.data.result });
            }
          });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      })
  },
  closeCouponBox: function (e) {
    this.setData({
      get_coupon_list: ""
    });
  },
});