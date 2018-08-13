var server = require('../../../utils/server');
var timeout = null
var exit;
Page({
  data: {
    amount: 0,
    carts: [],
    addressList: [],
    addressIndex: 0,
    height: 0
  },
  addressObjects: [],

  onLoad: function (options) {
    exit = false;
    var that = this
    var app = getApp();
    var cartIds = options.cartIds;
    var amount = options.amount;

    app.globalData.cartIds = cartIds;
    app.globalData.amount = amount;
    this.setData({ cartIds: cartIds, amount: amount });
      if (!app.globalData.login) {
        exit = true;
        wx.navigateTo({
          url: '/pages/member/index/index'
        });

      }
      else {
        var user_id = app.globalData.userInfo.user_id
        server.getJSON('/User/getAddressList/user_id/' + user_id, function (res) {
          var data = res.data
          exit = true;
          if (data.msg == "没有数据") {
            wx.navigateTo({
              url: '../../../../../../address/add/add?returnTo=1'
            });
          }
          else
          {
            wx.navigateTo({
              url: '../ordersubmit/index'
            });
          }
        });
      }
  },

})