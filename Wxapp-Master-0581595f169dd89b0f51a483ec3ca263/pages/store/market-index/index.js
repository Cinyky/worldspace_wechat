const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const util = require('../../../utils/util');
const _DgData = require('../../../utils/data');
import _dg from '../../../utils/dg';
import {Market} from '../model/market.model.js';
var market=new Market();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    categorys: []
    ,market_info:[]
    ,coupons:[]
    ,news:[]
    , page_index: 1    //智能推荐,2-销量
    ,goodsArr: []   
    ,sort_type: 1 //1-智能推荐,2-销量,3-距离
    ,is_pull:true   //触底加载
    , cate_id:0 //分类 0推荐
    ,latitude: 0
    ,longitude: 0
    ,keywords: ''
    ,is_show_cates_v: false   //是否显示分类
    , bannerArr:[]
    ,shareBtn: false //是否显示分享按钮
    ,is_change_location:false
   
    ,is_show_load_bg: true//控制整个界面显示，没有加载好则显示默认背景
    ,hostPrifix: 'http://www.ixiaochengxu.cc/resource/images/store'

    ,toView:"d0"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.froms =='share'){
      this.setData({
        shareBtn:true
      })
    }
    this._inits();
  },

  onShow:function(){   
    if (this.data.is_change_location){
      this._inits();
    }    
  },

  _zero:function(){
    this.setData({
      categorys: []
      , market_info: []
      , coupons: []
      , news: []
      , page_index: 1    //智能推荐,2-销量
      , goodsArr: []
      , sort_type: 1 //1-智能推荐,2-销量,3-距离
      , is_pull: true   //触底加载
      , cate_id: 0 //分类 0推荐
      , latitude: 0
      , longitude: 0
      , keywords: ''
      , is_show_cates_v: false   //是否显示分类
      , is_show_load_bg: true
      , bannerArr: []
      , toView:"d0"
    })
  },

  _inits:function(){
    var that = this;
    that._zero();
    that.getLocation();     
  },

  _loadData:function(){
   
    var that=this;

    //门店配置
    market.getMarketInfo((info)=>{
      that.setData({
        market_info: info
      })

      if (info.config_info.is_show_coupon==true){
        //优惠券
        market.getCouponShop((info) => {
          that.setData({
            coupons: info.list          
          })
        })
      }

      market.getMarketBanner((info)=>{
        that.setData({
          bannerArr: info
        })
      })

    })

    //动态播报
    market.getDynamicNews((info)=>{
      that.setData({
        news: info
      })
    })

    //热门商店
    market.getStoreList((info)=>{
      that.setData({
        hotStore:info
      })
    }, 1,4,4)

    //集市分类
    market.getMarketCategory((info)=>{
      that.setData({
        categorys:info,
        is_show_load_bg: false
      })
    })

    //推荐专题
    market.getThemeGoods((info)=>{
      that.setData({
        theme_goods:info
      })
    })

    //集市商品 销量和智能推荐使用此方法
    that._loadGoodsList();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this._inits();     
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (that.data.is_pull) {
      that._loadGoodsList();
    }   
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {   
      path: '/pages/store/market-index/index?froms=share'
    }
  },

  jumpStore:function(e) {
    var that=this
    _dg.navigateTo({
      url: '..//store-home/index',     
      fail: function (e) {       
        _dg.switchTab({
          url: '../store-home/index'
        })
      },
      complete:function(e){
        that.setData({
          shareBtn:false
        })
      }
    }); 
  },

  //选择排序方式
  changeSort:function(e){
    var that=this;
    var sort = market.getDataSet(e,'sort');
    that.setData({
      sort_type:sort,
      goodsArr: [],
      page_index: 1,
      is_pull:false     
    })
    that._loadGoodsList();
  },

  //选择查看的分类
  setCate:function(e){
    var that = this;
    var cate_id = market.getDataSet(e, 'cate_id');
    that.setData({     
      goodsArr: [],
      cate_id: cate_id,
      page_index: 1,
      is_pull: false
    })
    that._loadGoodsList();
  },
 
  //选择显示全部分类
  selectCategory: function (e) {
    var that = this;
    var cate_id = e.currentTarget.dataset.id;
    var cate_title = e.currentTarget.dataset.title;
    var cateArr = that.data.categorys
    var index = e.currentTarget.dataset.index;
    that.setData({
      goodsArr: [],
      cate_id: cate_id,   
      is_show_load_bg: false,
      page_index: 1,
      is_pull: false,
      toView:"d"+index
    });
    that.show_or_hide_cate_v();
    that._loadGoodsList();
  },

  /**
   * 通用触底加载
   */
  _loadGoodsList:function(){
    var that = this;
    var sort = that.data.sort_type;    
    if (sort != 3) {
      that.getGoodsList();
    } else {
      that.getStoreGoods();
    }
  },

  /**
 * 加载智能推荐和销量商品
 */
  getGoodsList: function () {
    var that = this;
    var current = that.data.page_index;
    var cate_id=that.data.cate_id;
    var sort_type = that.data.sort_type == 3 ? 1 : that.data.sort_type;
    market.getMarketGoods((info) => {
      if (info.length > 0) {
        var source = that.data.goodsArr ? that.data.goodsArr : []
        var newData = source.concat(info)
        current++;
        that.setData({
          page_index: current,
          goodsArr: newData,
          is_pull: true   
        })
      }
    }, { page_index: current, sort_type: sort_type,cate_id: cate_id})
  },

  /**
  * 距离展示
  */
  getStoreGoods: function () {
    var that = this;
    var current = that.data.page_index;
    var cate_id = that.data.cate_id;
    market.getMarketGoodsByStore((info) => {
      if (info.length > 0) {
        var source = that.data.goodsArr ? that.data.goodsArr : []
        var newData = source.concat(info)
        current++;
        that.setData({
          page_index: current,
          goodsArr: newData,
          is_pull: true   
        })
      }
    }, { page_index: current, cate_id: cate_id})
  },

  //领取优惠券
  receiveCoupon: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    requestUtil.get(_DgData.duoguan_host_api_url + "/index.php/addon/Card/CardApi/goCoupon.html", { id: id }, (data) => {
      market.getCouponShop((info) => {
        that.setData({
          coupons: info.list
        })
      })
      _dg.showToast({ title: '领取成功！', icon: 'success', });
    }, that, { isShowLoading: false });
  },

  //跳转到定位页面
  toLocation:function(e){  
    _dg.navigateTo({
      url: "/pages/store/location/index"
    })
  },

  jumpToUrl:function(e){
    var url = market.getDataSet(e,'url')
    _dg.navigateTo({
      url: url
    })
  },

  //跳到搜索
  toSearch: function (e) {
    _dg.navigateTo({
      url: "/pages/store/market-search/index?froms="+2
    })
  },

  //跳转门店列表页面
  toStoreList:function(e){
    _dg.navigateTo({
      url:"/pages/store/store-list/index"
    })
  },

  //跳转门店列详情页
  toStoreInfo: function (e) {
    var store_id = e.currentTarget.dataset.store_id;
    _dg.navigateTo({
      url: "/pages/store/store-info/index?store_id="+store_id
    })
  },

  //跳转到门店商品列表页面  
  toStoreGoodsInfo: function (e) {
    var store_id = e.currentTarget.dataset.store_id;
    _dg.navigateTo({
      url: "/pages/store/store-goods-list/index?store_id=" + store_id
    })
  },

  //商品加入购物车 并跳转商品页面
  push_to_store: function (e) {
    var store_id = e.currentTarget.dataset.store_id;
    var goods_id = e.currentTarget.dataset.goods_id;
    var cate_id = e.currentTarget.dataset.goods_category_id
    wx.navigateTo({
      url: '/pages/store/store-goods-list/index?store_id=' + store_id + '&goods_id=' + goods_id + '&cate_id=' + cate_id
    });
  },

  //跳转专题列表页
  toThemeList: function (e) {
    var theme_id = e.currentTarget.dataset.theme_id;
  
    _dg.navigateTo({
      url: "/pages/store/market-topics/index?theme_id=" + theme_id
    })
  },



  //获取定位
  getLocation: function () {
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    var latitude = 0;
    var longitude = 0;

    var lat = _dg.getStorageSync('LATITUD')
    var lng = _dg.getStorageSync('LONGITUDE')
    if (lat && lng && lat != 'undefined' && lng != 'undefined') {
      that.setData({
        latitude: lat,
        longitude: lng
      });
      market.getCurrentCityArea((info, address) => {
        that.setData({
          address: address
        })
        that._loadData();
      }, { lat: lat, lng: lng })
    }else {
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {          
          that.data.latitude = res.latitude
          that.data.longitude = res.longitude
          _dg.setStorageSync('LATITUD', res.latitude);
          _dg.setStorageSync('LONGITUDE', res.longitude);
          that.setData({
            latitude: res.latitude,
            longitude: res.longitude           
          }) 
        },
        fail: function () {
          _dg.setStorageSync('LATITUD', 39.90);
          _dg.setStorageSync('LONGITUDE', 116.38);
          _dg.setStorageSync('ADDRESS', '北京市');
         
          that.setData({
            latitude: _dg.getStorageSync('LATITUD'),
            longitude: _dg.getStorageSync('LONGITUDE')
          })

          market.getCurrentCityArea((info, address) => {
            that.setData({
              address: address
            })
            that._loadData();
          }, { lat: 39.90, lng: 116.38 })
          
        },
        complete: function () {
          var lat = _dg.getStorageSync('LATITUD')
          var lng = _dg.getStorageSync('LONGITUDE')
         
          market.getCurrentCityArea((info, address) => {
            that.setData({
              address: address
            })
            that._loadData();
          }, { lat: lat, lng: lng })
        }
      })
    }
  },

  openMap: function () {
    var that = this;
    _dg.chooseLocation({
      success: (res) => {
        that.setData({
          is_show_getLocation: false,
          address: res.name
        });
        _dg.setStorageSync('LATITUD', res.latitude);
        _dg.setStorageSync('LONGITUDE', res.longitude);
        _dg.setStorageSync('ADDRESS', res.name);
        that._inits();
      },
      fail: (res) => {
        console.log(res);
      }
    });
  },

  toTop: function (e) {
    _dg.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },
  
  //显示所有集市分类
  show_or_hide_cate_v: function () {
    var that = this;
    that.setData({ is_show_cates_v: !that.data.is_show_cates_v });
  }

 

})