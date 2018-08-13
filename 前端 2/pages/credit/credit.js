//index.js
//获取应用实例
const app = getApp()
var server = require('../../utils/server');
Page({
  data: {
      tabs: ["全部", "酒类", "特产", "旅游", "宾馆", "餐饮"],
      currentTab: 0,
      jifen:0,
      page : 0,
      goods:[],
  },
  swichNav: function (e) {
      if (this.data.currentTab === e.target.dataset.current) {
          return false;
      } else {
          var showMode = e.target.dataset.current == this.data.currentTab;
          this.setData({
              currentTab: e.target.dataset.current,
          })
          var tid = e.currentTarget.dataset.current;
          var that = this;
          var type_id = that.data.tabs[tid].type_id;
          
          server.getJSON("/Jifen/getGoods", { type_id: type_id,page:0}, function (res) {
            if (res.data.status>0){
              console.log(res.data.goods)
              that.setData({
                goods: res.data.goods,
                page: 0
              })
            }else{
              that.setData({
                goods:[]
              })
            }
          })
      }
  },
  onLoad: function () {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    var user_id = getApp().globalData.userInfo.user_id;
    getApp().setPageNavbar(this);
    server.getJSON("/Jifen/jifenShop", { user_id: user_id }, function (res) {

      if (res.data.bj == 1) {
        that.setData({
          jifen: res.data.jifen,
          images: res.data.images,
          goods: res.data.goods,
          tabs: res.data.type,
        })
      }
      else {
        app.redirectTo("../login/login");
      }
    })
  },
})
