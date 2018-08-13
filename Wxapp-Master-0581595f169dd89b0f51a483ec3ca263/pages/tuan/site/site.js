// pages/tuan/site/site.js
var app = getApp()
var _function = require('../../../utils/functionData');
var WxParse = require('../../../wxParse/wxParse.js');

import { _ }from '../../../utils/underscore';
const util = require('../../../utils/util');
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
const dg = require('../../../utils/dg');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    siteList: new Array(),
    storeId: 0,
    coordinate: {},
    pageNum: 1,
    pageSize: 10,
    isBottom: true,
    search_sites:'',
    searchsite:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.sid) {
      that.setData({
        storeId: options.sid
      })
    }
    var coordinate = wx.getStorageSync('coordinate');
    if (!coordinate) {
      wx.getLocation({
        type: 'wgs84',
        altitude: false,
        success: function (res) {
          console.log('定位成功', res);
          that.setData({
            coordinate: res
          })
          that.initData(res);
        },
        fail: function (res) {
          console.log('定位失败', res)
          console.log(res)
        },
        complete: function (res) {
          console.log("定位结束", res);
        }
      })
    } else {
      that.setData({
        coordinate: coordinate
      })
      that.initData(coordinate);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    // requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsInfo.html", { sid: post_id }, (data) => { that.initGoodsInfoData(data) }, this, { isShowLoading: false })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(this.data.coordinate)
  },
  initData: function (data) {
    var that = this;
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getStid.html", { store_id: that.data.storeId, lat: that.data.coordinate.latitude, lon: that.data.coordinate.longitude, pageSize: that.data.pageSize, pageNum: that.data.pageNum }, (data) => {
      that.setData({
        store: data.store
      })
      that.initSiteData(data)
    }, this, { isShowLoading: true })
  },
  initSiteData: function (data) {
    var that = this;
    if (data.slist == null || data.slist.length < that.data.pageSize) {
      that.setData({
        isBottom: false
      })
    }
    data = data.slist ? data.slist : new Array();
    var resu = _.sortBy(that.data.siteList.length > 0 ? that.data.siteList.concat(data) : data, 'distance');
    that.setData({
      siteList: resu
    })
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
  selectSite: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.id;
    console.log(this)
    wx.setStorageSync('site', that.data.siteList[index])
    wx.navigateBack({
      delta: 1
    })
  },
  defaultSite: function () {
    wx.setStorageSync('site', null)
    wx.navigateBack({
      delta: 1
    })
  },
  onReachBottom: function () {
    var that = this;
    if(that.data.isBottom!==true) {
      wx.showToast({
        title: '没有更多了',
        icon:'none'
      })
      return
    };
    that.setData({
      pageNum:that.data.pageNum+1
    })
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getStid.html", { store_id: that.data.storeId, lat: that.data.coordinate.latitude, lon: that.data.coordinate.longitude, pageSize: that.data.pageSize, pageNum: that.data.pageNum, searchsite:that.data.searchsite }, (data) => {
      that.initSiteData(data)
    }, this, { isShowLoading: true })
  },
  //获取搜索框的值
  write_site:function(e){     
    let val = e.detail.value;
    this.setData({ search_sites: val, isBottom: true})
  },
  //搜索site
  search_site:function(e){      
      let val = e.currentTarget.dataset.site;
      let that = this;
      let option = {};
      that.setData({ pageNum: 1, searchsite: val, isBottom: true});
      
      option.store_id = that.data.storeId;
      option.lat = that.data.coordinate.latitude;
      option.lon = that.data.coordinate.longitude;
      option.pageSize = that.data.pageSize;
      option.pageNum = that.data.pageNum;
      option.searchsite = that.data.searchsite;
      requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getStid.html",option, (data) => {
        that.consite(data)
      }, this, { isShowLoading: true })
  },
  consite: function (data) {   
    let that = this;
    if (data.slist == null ||data.slist.length < that.data.pageSize) {
      that.setData({
        isBottom: false
      })
    }
    data = data.slist ? data.slist : new Array();
    let resus = _.sortBy(data, 'distance');
    that.setData({
      siteList: resus
    })
  },

})