var server = require('../../../utils/server');
var cPage = 0;
var ctype = "NO";
Page({
  data: {
    orders: [],
    tabClasss: ["text-select", "text-normal", "text-normal", "text-normal"],
    tab: 0,
    length:0,
    time:[],
  },
  onLoad: function () {
    // 页面显示
    var cPage = 0;
    var ctype = 0;
    this.getOrderLists(ctype, cPage);
  },
  group:function(op){
    var pint_id = op.currentTarget.dataset.pint_id;
    console.log(pint_id)
    wx.navigateTo({
      url: '../group/details?pint_id=' + pint_id
    });
  },
  onPullDownRefresh: function () {
    setTimeout(function () {
        wx.stopPullDownRefresh()
    },1000)
  },
  getOrderLists: function (ctype, page) {
    var that = this;
    var user_id = getApp().globalData.userInfo.user_id
    var ctype = ctype
    var page = page
    server.getJSON('/Pint/pintList/user_id/' + user_id + '/ctype/' + ctype + '/page/' + page, function (res) {
      console.log(res);
      if (res.data.code == 0) {
        return;
      } else {
        var datas = res.data.pint;

        // var ms = that.data.orders
        var ms = [];
        var mms = [];
        var now = Date.parse(new Date())/1000;
        for (var i in datas) {
          ms.push(datas[i]);
          if (datas[i].pint_status == 0){
            mms[datas[i].pint_id] = datas[i].pint_stop_time - now;
          }
        }
        that.setData({
          orders: ms,
          length: res.data.length,
          
        });
      }
    });
  },

  details: function (e) {
    var index = e.currentTarget.dataset.index;
    console.log(index)
    wx.navigateTo({
      url: '../../order/details/index?order_id=' + index
    });
  },
  tabClick: function (e) {
    var index = e.currentTarget.dataset.index
    // console.log(index)
    if(index == this.data.tab){
      return;
    }
    var classs = ["text-normal", "text-normal", "text-normal", "text-normal"]
    classs[index] = "text-select"
    this.setData({ tabClasss: classs, tab: index })
    this.getOrderLists(index,0);
  },
  onShareAppMessage: function (e) {
    console.log(e)
    var gid = e.target.dataset.goods_id;
    var pid = e.target.dataset.pint_id;

    var article_id = wx.getStorageSync('current_article_id');
    var path = '/pages/pint/details/details?gid=' + gid + '&pid=' + pid;
    return {
      title: '拼团',
      path: path
    }
  },
});