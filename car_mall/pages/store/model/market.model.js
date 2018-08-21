const requestUtil = require('../../../utils/requestUtil');
const util = require('../../../utils/util');
const _DgData = require('../../../utils/data');
import _dg from '../../../utils/dg';
import { Base } from 'base.js';

class Market extends Base {
  constructor() {
    super();
    this.baseRestUrl = _DgData.duoguan_host_api_url;
    this.lat = _dg.getStorageSync('LATITUD')
    this.lng = _dg.getStorageSync('LONGITUDE')
  }

  /**
   * 获取集市配置数据
   */
  getMarketInfo(callback) {
    var params = {};
    requestUtil.post(_DgData.duoguan_host_api_url + '/index.php?s=/addon/DgStore/StoreApi/getMarketInfo.html', params, (info) => {
      callback && callback(info);
    })
  }

  getMarketBanner(callback){
    var params = {}; 
    requestUtil.post(_DgData.duoguan_host_api_url + '/index.php?s=/addon/DgStore/ApiMarket/getMarketBanner.html', params, (info) => {      
      callback && callback(info);
    })
  }

  /**
   * 获取集市分类数据
   */
  getMarketCategory(callback) {
    var params = {};
    requestUtil.post(_DgData.duoguan_host_api_url + '/index.php?s=/addon/DgStore/StoreApi/getMarketGoodsCategorys.html', params, (info) => {
      callback && callback(info);
    })
  }

  /**
   * 按距离获取集市商品
   * 可以按主题 分类 关键字 筛选查询
   * sort_type：1:智能推荐，2销量
   */
  getMarketGoodsByStore(callback, params) {
    var that = this
    var obj = {
      page_index: params.page_index ? params.page_index : 1,
      page_size: params.page_size ? params.page_size : 20,
      cate_id: params.cate_id ? params.cate_id : '',
      //theme_id: params.theme_id ? params.theme_id : '',
      //keywords: params.keywords ? params.keywords : '',
      //sort_type: params.sort_type ? params.sort_type : 1,
      ws_lat: _dg.getStorageSync('LATITUD') ? _dg.getStorageSync('LATITUD') : 0,
      ws_lng: _dg.getStorageSync('LONGITUDE') ? _dg.getStorageSync('LONGITUDE') : 0,
    }
    requestUtil.get(_DgData.duoguan_host_api_url + '/index.php?s=/addon/DgStore/ApiMarket/getMarketGoodsByStore.html', obj, (info) => {
      callback && callback(info);
    })
  }

  /**
   * 获取集市商品
   * 可以按主题 分类 关键字 筛选查询
   * sort_type：1:智能推荐，2销量
   */
  getMarketGoods(callback, params) {
    var that = this
    var obj = {
      page_index: params.page_index ? params.page_index : 1,
      page_size: params.page_size ? params.page_size : 20,
      cate_id: params.cate_id ? params.cate_id : '',
      theme_id: params.theme_id ? params.theme_id : '',
      keywords: params.keywords ? params.keywords : '',
      sort_type: params.sort_type ? params.sort_type : 1,
      ws_lat: _dg.getStorageSync('LATITUD') ? _dg.getStorageSync('LATITUD') : 0,
      ws_lng: _dg.getStorageSync('LONGITUDE') ? _dg.getStorageSync('LONGITUDE') : 0,
    }
    requestUtil.get(_DgData.duoguan_host_api_url + '/index.php?s=/addon/DgStore/StoreApi/getMarketGoods.html', obj, (info) => {
      callback && callback(info);
    })
  }

  /**
   * 返回3个推荐专题下的商品
   */
  getThemeGoods(callback) {
    requestUtil.get(_DgData.duoguan_host_api_url + '/index.php?s=/addon/DgStore/ApiMarket/getThemesGoods.html', {}, (info) => {
      callback && callback(info);
    })
  }

  /**
   * 获取专题下的所有商品
   */
  getAllThemeGoods(callback, params) {
    var obj = {
      page_index: params.page_index ? params.page_index : 1,
      page_size: params.page_size ? params.page_size : 20,    
      theme_id: params.theme_id ? params.theme_id : ''     
    }
    requestUtil.get(_DgData.duoguan_host_api_url + '/index.php?s=/addon/DgStore/ApiMarket/getThemeAllGoods.html', obj, (info) => {
      callback && callback(info);
    })
  }

  /**
   * 获取当前城市列表
   */
  getCurrentCityArea(callback, params) {
 
    var that = this;
    var qqmapsdk = that.getMapSdk();    

    qqmapsdk.reverseGeocoder({
      location: {
        latitude: params.lat ? params.lat : that.lat,
        longitude: params.lng ? params.lng : that.lng
      },
      success: function(res) {              
        var city = res.result.address_component.city;
        var address = res.result.formatted_addresses.recommend;
  
        _dg.setStorageSync('CITY', city);
        _dg.setStorageSync('ADDRESS', address ? address:city);
        requestUtil.get(_DgData.duoguan_host_api_url + '/index.php/addon/DgStore/ApiMarket/getCityArea.html', {
          city: city
        }, (info) => {
          callback && callback(info, address ? address : city);
        })
      },
      fail: function(res) {
        console.log(res);
      },
      complete: function(res) {
        //console.log(res);
      }
    })
  }

  /**
   * 地址解析到坐标
   */
  addressToNum(callback,address){
    var that = this;
    var qqmapsdk = that.getMapSdk();    
    qqmapsdk.geocoder({
      address: address ? address:'北京市',
          success: function (res) {
                callback && callback(res.result)
          },
          fail: function (res) {
                console.log(res);
          },
          complete: function (res) {
                //console.log(res);
          }
    })
  }

  //返回map sdk
  getMapSdk(){
    return util.getMapSdk(); 
  }


  /**
   * 获取优惠券列表 
   * 通用：附近超值好券
   * 推荐优惠券
   * 分类过滤 区域过滤 category_id  region_id
   */
  getCouponShop(callback) {
    //category_id region_id  page  limit
    var params = {};
    requestUtil.post(_DgData.duoguan_host_api_url + '/index.php/addon/DgStore/ApiMarket/getCouponByNearShop.html', params, (info) => {
      callback && callback(info);
    })
  }


  /**
   * 领券动态播报 默认播报最近的10条
   * @return array
   */
  getDynamicNews(callback) {
    requestUtil.post(_DgData.duoguan_host_api_url + '/index.php/addon/DgStore/ApiMarket/getDynamicNews.html', {}, (info) => {
      callback && callback(info);
    })
  }

  /**
   * 获取店铺列表
   * sort_type :1-距离最近；2-销量最高；3-最新入住；4-智能排序
   * store_cate：门店分类
   */
  getStoreList(callback, page_index = 1, page_size = 8, sort_type = 1) {
    var that = this;
    var obj = {
      version: 2,
      page_index: page_index,
      page_size: page_size,
      ws_lat: that.lat,
      ws_lng: that.lng,
      store_cate: '',
      keywords: '',
      sort_type: sort_type
    }
    //获取门店列表
    requestUtil.get(_DgData.duoguan_host_api_url + '/index.php/addon/DgStore/Api/getStoreList.html', obj, (info) => {
      //如果是下拉加载时 先将评论数组清空 
      callback && callback(info)
    });
  }


  /**
   * 领取优惠券
   * 
   */
  receiveCoupon(id) {
    var that = this;
    requestUtil.get(_DgData.duoguan_host_api_url + "/index.php/addon/Card/CardApi/goCoupon.html", {
      id: id
    }, (data) => {

      _dg.showToast({
        title: '领取成功！',
        icon: 'success',
      });
    }, that, {
      isShowLoading: false
    });
  }

}

export {
  Market
};