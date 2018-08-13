// pages/shop/business-address/index.js
const app = getApp();
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
const util = require('../../../utils/util');
const listener = require('../../../utils/listener');
import _ from '../../../utils/underscore';
import Form from '../../../utils/form';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: 0,
    longitude: 0,
    all_address: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSetting({
      success: (res) => {
        console.log(res)
      },
      fail: (res) => {
        wx.openSetting({
          success: (res) => {

          },
          fail: (res) => {

          }
        })
      }
    });
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log(res)
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Record/getSelfAddress.html', { lat: that.data.latitude, lng: that.data.longitude, store_id: options.store_id, goods_id: options.goods_id }, (info) => {
          that.setData({ all_address: info})
        }, that, { isShowLoading: false });
      }
    })
  },

  selectAddress:function(e){
    var all_info = e.currentTarget.dataset;
    wx.setStorage({ key: 'bargain_all_info', data: all_info });
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})