
var server = require('../../utils/server');
var app = getApp();

//秒转成时分秒的时间
function secondToTimeStr(second) {
  if (second < 60) {
    var _s = second;
    return "00:00:" + (_s < 10 ? "0" + _s : _s);
  }
  if (second < 3600) {
    var _m = parseInt(second / 60);
    var _s = second % 60;
    return "00:" + (_m < 10 ? "0" + _m : _m) + ":" + (_s < 10 ? "0" + _s : _s);
  }
  if (second >= 3600) {
    var _h = parseInt(second / 3600);
    var _m = parseInt((second % 3600) / 60);
    var _s = second % 60;
    return (_h < 10 ? "0" + _h : _h) + ":" + (_m < 10 ? "0" + _m : _m) + ":" + (_s < 10 ? "0" + _s : _s);
  }
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    time_list: null,
    goods_list: null,
    page: 1,
    loading_more: false,
  },
  onLoad: function (options) {
    var that = this;
    getApp().setPageNavbar(this);
    server.getJSON("/Miaosha/GoodsLists", function (res) {
      //  console.log(res.data)
      if (res.data.status == 0) {
        wx.showModal({
          content: "暂无秒杀活动",
          showCancel: false,
          confirmText: "返回首页",
          success: function (e) {
            if (e.confirm) {
              wx.navigateTo({
                url: "../index/index",
              })
            }
          }
        });
        return;
      }
      that.setData({
        time_list: res.data.data,
      });
      console.log('秒杀时间');
      console.log(res.data.data)
      that.topBarScrollCenter();
      that.setTimeOver();
      that.loadGoodsList(false);
    });
  },
  /**
   *  加载商品列表
   */
  loadGoodsList: function (load_more) {
    var that = this;
    var time = false;
    console.log(that.data.time_list)
    for (var i in that.data.time_list) {
      if (that.data.time_list[i].active) {
        time = that.data.time_list[i].start_time + ':00';
        break;
      }
    }
    if (that.data.my_time != undefined) {
      time = that.data.my_time;
    }
    // console.log(time);
    if (!load_more) {
      that.setData({
        goods_list: null,
      });
    } else {
      that.setData({
        loading_more: true,
      });
    }
    // console.log('/time/'+time+'/page/'+ that.data.page)
    server.getJSON("/Default/goodsLists", { time: time, page: that.data.page }, function (res) {
      console.log(res);
      if (res.data.status == 1) {
        if (load_more) {
          that.data.goods_list = that.data.goods_list.concat(res.data.list)
        } else {
          that.data.goods_list = res.data.result;
        }
        that.setData({
          loading_more: false,
          goods_list: res.data.result,
          page: (!res.data.list || res.data.list.length == 0) ? -1 : (that.data.page + 1),
        });
      }
    });
  },

  /**
   * 设置倒计时
   */
  setTimeOver: function () {
    var page = this;
    // console.log("时间商品列表：" + page.data.time_list)

    function _init() {
      for (var i in page.data.time_list) {
        var begin_time_over = page.data.time_list[i].begin_time - page.data.time_list[i].now_time;
        var end_time_over = page.data.time_list[i].end_time - page.data.time_list[i].now_time;
        begin_time_over = begin_time_over > 0 ? begin_time_over : 0;
        end_time_over = end_time_over > 0 ? end_time_over : 0;

        page.data.time_list[i]['begin_time_over'] = secondToTimeStr(begin_time_over);
        page.data.time_list[i]['end_time_over'] = secondToTimeStr(end_time_over);
        page.data.time_list[i].now_time = page.data.time_list[i].now_time + 1;
      }
      //console.log(JSON.stringify(page.data.time_list[5]));
      page.setData({
        time_list: page.data.time_list,
      });
    }

    _init();
    page.setData({
      my_setInterval: setInterval(function () {
        _init();
      }, 1000)
    })

  },

  //顶部滚动条自动滚到当前时间段
  topBarScrollCenter: function () {
    var that = this;
    var index = 0;
    for (var i in that.data.time_list) {
      if (that.data.time_list[i].active) {
        index = i;
        break;
      }
    }
    that.setData({
      top_bar_scroll: (index - 2) * 64,
    });
  },
  topBarItemClick: function (op) {
    var that = this;
    var my_time = op.currentTarget.dataset['index'];
    if (that.data.my_time == my_time) {
      return false;
    }
    that.setData({
      my_time: my_time
    })
    server.getJSON("/Miaosha/GoodsLists", { my_time: my_time }, function (res) {
      //  console.log(res.data)
      if (res.data.status == 0) {
        wx.showModal({
          content: "暂无秒杀活动",
          showCancel: false,
          confirmText: "返回首页",
          success: function (e) {
            if (e.confirm) {
              wx.navigateTo({
                url: "../index/index",
              })
            }
          }
        });
        return;
      }
      that.setData({
        time_list: res.data.data,
      });
      clearInterval(that.data.my_setInterval)
      console.log('秒杀时间');
      console.log(res.data.data)
      //  that.topBarScrollCenter();
      that.setTimeOver();
      that.loadGoodsList(false);
    });

  }
})