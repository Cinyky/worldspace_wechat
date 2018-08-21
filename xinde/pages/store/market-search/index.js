const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const util = require('../../../utils/util');
const _DgData = require('../../../utils/data');
import _dg from '../../../utils/dg';
import { Store } from '../model/store.model.js';
var store = new Store();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search_type: 1 //1 店铺   2 集市商品
    , s_page_index: 1
    , g_page_index: 1
    , goodsArr: []
    , storeArr:[]
    , is_pull: false

    , keywords: ''
    , g_keywords: ''
    , s_keywords: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    var froms = options.froms;
    this.setData({
      search_type: froms
    })
    //this._inits();
  },

  _inits: function () {
    //this._loadGoodsList();
  },

  //捕获搜索关键字
  setCon: function (e) {
    var keywords = e.detail.value;
    if (keywords) {
      if (this.data.search_type == 1) {
        this.setData({
          keywords: keywords,
          //s_keywords: keywords
        })
      } else {
        this.setData({
          keywords: keywords,
          //g_keywords: keywords
        })
      }     
    }
  },

  //软键盘搜索
  searchCon: function (e) {
    var keywords = e.detail.value;
    if (keywords) {
      if (this.data.search_type == 1) {
        this.setData({
          keywords: keywords,
          //s_keywords: keywords,
        })
      } else {
        this.setData({
          keywords: keywords,
          //g_keywords: keywords,
        })
      }
    }
    this._startSearch();
  },

  //按钮搜索
  btnSearch: function (e) {
    var keywords = this.data.keywords;
    console.log(keywords)
    this._startSearch();
  },

  _startSearch: function () {
    if (this.data.keywords == '' || this.data.keywords==undefined){
      return
    }
    var search_type = this.data.search_type
    if (search_type==1){
      this.setData({
        is_pull: false
        , s_page_index: 1
        , storeArr: []
      })
    }else{
      this.setData({
        is_pull: false       
        , g_page_index: 1
        , goodsArr: []
    
      })
    }   
    this._loadGoodsList();
  },

  //切换搜索类型
  changeSearchType: function (e) {
    var search_type = store.getDataSet(e, 'stype');
    var that=this
    if (search_type == 1) {
      var keywords = that.data.s_keywords
      that.setData({
        //keywords: keywords,      
        search_type: search_type
      })
    } else {
      //var keywords = that.data.g_keywords
      that.setData({
        //keywords: keywords,    
        search_type: search_type
      })
    }
    that._startSearch();
  },

  //通用加载
  _loadGoodsList: function () {
    var that = this;
    var search_type = that.data.search_type;
    if (search_type == 1) {
      that.getStore();
    } else {   
      that.getGoods();
    }
  },

  /**
   * 搜索商品
   */
  getGoods: function () {
    var that = this;
    var current = that.data.g_page_index;    
    store.getGoodsList((info) => {   
      if (info.length > 0) {
        var source = that.data.goodsArr ? that.data.goodsArr : []
        var newData = source.concat(info)
        current++;
        that.setData({
          g_page_index: current,
          goodsArr: newData,
          is_pull: true
        })
      }
    }, { page_index: current, keywords: that.data.keywords })
  },

  /**
  * 搜索店铺
  */
  getStore: function () {
    var that = this;
    var current = that.data.s_page_index;
    store.getStoreList((info) => {    
      if (info.length > 0) {
        var source = that.data.storeArr ? that.data.storeArr : []
        var newData = source.concat(info)
        current++;
        that.setData({
          s_page_index: current,
          storeArr: newData,
          is_pull: true
        })
      }
    }, { page_index: current, keywords: that.data.keywords })
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    if (that.data.is_pull && that.data.keywords != '') {
      that._loadGoodsList();
    }
  },


  //跳转门店列详情页
  toStoreInfo: function (e) {
    var store_id = e.currentTarget.dataset.store_id;
    _dg.navigateTo({
      url: "/pages/store/store-info/index?store_id=" + store_id
    })
  },

  //跳转到门店商品列表页面  
  toStoreGoodsInfo: function (e) {
    var store_id = e.currentTarget.dataset.store_id;
    _dg.navigateTo({
      url: "/pages/store/store-goods-list/index?store_id=" + store_id
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})