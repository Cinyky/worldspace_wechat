// pages/store/location/index.js
const requestUtil = require('../../../utils/requestUtil');
const util = require('../../../utils/util');
const _DgData = require('../../../utils/data');
import _dg from '../../../utils/dg';
import { Market } from '../model/market.model.js';
var market = new Market();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cityList:[],
    s_lat:0,
    s_lng:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var lat = _dg.getStorageSync('LATITUD');
    var lng = _dg.getStorageSync('LONGITUDE');
    this.setData({
      s_lat:lat,
      s_lng:lng
    })
    this._inits();
  },

  _inits:function(){
    this.getLocation();
  },

  //重新定位
  reLocation:function(){   
    this._zero();
    this.getLocation();
  },

  //选择行政区
  chooseAre:function(e){
    var that = this;
    var are = market.getDataSet(e, 'are');
    var addressToNum = that.data.city + are;
    market.addressToNum((info)=>{
      that.setData({
        address: addressToNum,
        latitude: info.location.lat,
        longitude: info.location.lng
      })
      _dg.setStorageSync('LATITUD', info.location.lat);
      _dg.setStorageSync('LONGITUDE', info.location.lng);
      _dg.setStorageSync('ADDRESS', are);
      _dg.navigateBack({
        delta:1
      })
    },addressToNum);
  },

    /**
 * 打开地图
 */
  onOpenMapTap: function (e) {
    var that = this;
    _dg.chooseLocation({
      success: (res) => {
        that.setData({
          is_show_getLocation: false,
          address: res.name
        });     
        that._zero();        
        _dg.setStorageSync('LATITUD', res.latitude);
        _dg.setStorageSync('LONGITUDE', res.longitude);      
        that.getAreaCity({ lat: res.latitude, lng: res.longitude});     
      },
      fail: (res) => {
        console.log(res);
      }
    });
  },

  //初始化
  _zero:function(){
    _dg.setStorageSync('LATITUD', 'undefined');
    _dg.setStorageSync('LONGITUDE', 'undefined');
    _dg.setStorageSync('ADDRESS', 'undefined');
    this.setData({
      address: '',
      city: '',
      cityList: []
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  _setPrivePage:function(){
    var pages = getCurrentPages();
    var that=this
    var currPage = pages[pages.length - 1];  //当前选择页面
    var prevPage = pages[pages.length - 2];  //上一个页面 
    prevPage.setData({
      is_change_location: true,
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      address: that.data.address
    })   
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this
    if (that.data.s_lat != that.data.latitude || that.data.s_lng != that.data.longitude) {
      that._setPrivePage();
    }
  },

  //获取定位
  getLocation: function () {
    var that = this;
    // 页面初始化 options为页面跳转所带来的参数
    var latitude = 0;
    var longitude = 0;

    var lat = _dg.getStorageSync('LATITUD')
    var lng = _dg.getStorageSync('LONGITUDE')
    var address = _dg.getStorageSync('ADDRESS')
    var city = _dg.getStorageSync('city')
    if (lat && lng && lat != 'undefined' && lng != 'undefined') {
      that.setData({
        latitude: lat,
        longitude: lng,
        address: address,
        city:city
      });
      that.getAreaCity({ lat: lat, lng: lng });   
    } else {
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
          that.getAreaCity({ lat: 39.90, lng: 116.38 });           
        },
        complete: function () {
          var lat = _dg.getStorageSync('LATITUD')
          var lng = _dg.getStorageSync('LONGITUDE')
          that.getAreaCity({ lat: lat, lng: lng });         
        }
      })
    }
  },

  getAreaCity:function(obj){
    var that=this  
    market.getCurrentCityArea((info, address) => {
      that.setData({
        address: address,
        latitude:obj.lat,
        longitude:obj.lng,
        city: _dg.getStorageSync('CITY'),
        cityList:info
      })
    }, obj)
  }

})