const app = getApp();
const util = require('../../../utils/util');
const requestUtil = require('../../../utils/requestUtil');
const $ = require('../../../utils/underscore');
const _DuoguanData = require('../../../utils/data');
const WxParse = require('../../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists: {},
    page: 1,
    status: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.syncWechatInfo();
    this.initBargainList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  initBargainList: function () {
    let that = this;
    let options = {};
    options.status = that.data.status;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Record/myRecord.html', options, (info) => {
      that.setData({
        lists: info
      })
    });
  },
  setStatus1: function () {
    let that = this;
    that.setData({
      status: 1,
      lists:{}
    });
    that.initBargainList();
  },
  setStatus2: function () {
    let that = this;
    that.setData({
      status: 2,
      lists: {}
    });
    that.initBargainList();
  },
  tocommdity:function(e){
    console.log(e);
    let dataset=e.currentTarget.dataset;
    let goods_id=dataset.id;
    wx.redirectTo({
      url: '../commdityDetail/commdityDetail?goods_id=' + goods_id
    })
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