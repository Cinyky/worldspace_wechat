// pages/store/market-topics/index.js
import _dg from '../../../utils/dg';
import { Market } from '../model/market.model.js';
var market = new Market();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme_id:0,
    page_index:1,
    goods:[],
    is_pull: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {  
    var theme_id = options.theme_id   
    if (!theme_id){
      _dg.navigateBack({
        delta: 1
      })
    }
    this.setData({
      theme_id:theme_id
    })
    this._inits();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.is_pull){
      this.getGoods();
    }   
  },

  _inits: function () {
    var that=this;
    that.getGoods();
  },

  //商品加入购物车 并跳转商品页面
  push_to_store: function (e) {
    var store_id = e.currentTarget.dataset.store_id;
    var goods_id = e.currentTarget.dataset.goods_id;
    var cate_id = e.currentTarget.dataset.goods_category_id
    console.log(e.currentTarget.dataset);
    _dg.navigateTo({
      url: '/pages/store/store-goods-list/index?store_id=' + store_id + '&goods_id=' + goods_id + '&cate_id=' + cate_id
    });
  },

  //跳转到门店商品列表页面  
  toStoreGoodsInfo: function (e) {
    var store_id = e.currentTarget.dataset.store_id;
    var goods_id = e.currentTarget.dataset.goods_id;
    var cate_id = e.currentTarget.dataset.goods_category_id
    wx.navigateTo({
      url: '/pages/store/store-goods-list/index?store_id=' + store_id + '&goods_id=' + goods_id + '&cate_id=' + cate_id
    });  
  },


  getGoods:function(){
    var that=this
    var current = that.data.page_index;
    var theme_id=that.data.theme_id;
    market.getAllThemeGoods((info) => {
      if (info.length > 0) {
        var source = that.data.goods ? that.data.goods : []
        var newData = source.concat(info)
        current++;
        that.setData({
          page_index: current,
          goods: newData,
          is_pull: true
        })
      }
    }, { page_index:current,theme_id:theme_id})
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})