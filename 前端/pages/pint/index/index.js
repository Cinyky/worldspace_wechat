var server = require('../../../utils/server');
Page({
  data: {
    cid:-1,
    cat: [],
    banner: [],
    goods: [],
    page: 0,
    page_count: 0,
  },


  onShow: function () {
    var _this = this;
    server.getJSON("/Pint/getPintTypeList", function (res) {
      if (res.data.isPint == 0) {
        wx.showModal({
          content: "暂无拼团活动",
          showCancel: false,
          confirmText: "返回首页",
          success: function (e) {
            if (e.confirm) {
              wx.navigateTo({
                url: "../../index/index",
              })
            }
          }
        });
        return;
      }
      if (res.statusCode == 200) {
        setTimeout(function () {
          // 延长一秒取消加载动画
          wx.hideLoading();
        }, 1000);
        _this.setData({
          cat: res.data.cat,
          cid: res.data.cat[0].id,
          banner: res.data.banner,
          ad: res.data.ad,
          goods: res.data.goods.list,
          page: res.data.goods.page,
          page_count: res.data.goods.page_count,
        });
        if (res.data.goods.row_count <= 0) {
          _this.setData({
            emptyGoods: 1,
          })
        }
      }
    });
  },
  onLoad: function () {
    
  },
  switchNav: function (option){
    this.changeGoodsList(option.currentTarget.dataset.id);
  },
  changeGoodsList:function(tid){
    var type_id = tid;
    var _this = this;
    server.getJSON("/Pint/getPintGoodsList", { type_id: type_id }, function (res) {
      wx.showLoading({
        title: "正在加载",
        mask: true,
      });
      if (res.statusCode == 200) {
        console.log(res);
        _this.setData({
          cid: type_id,
          goods: res.data.goods.list,
          page: 1,
          page_count: res.data.goods.page_count,
        });
        if (res.data.goods.row_count <= 0) {
          _this.setData({
            emptyGoods: 1,
          })
        }
        setTimeout(function () {
          // 延长一秒取消加载动画
          wx.hideLoading();
        }, 1000);
      }
    });
  },
  onPullDownRefresh: function(op){
    this.changeGoodsList(this.data.cid);
  },
  onReachBottom: function (op)  {
    this.changeGoodsList(this.data.cid);
  },
});