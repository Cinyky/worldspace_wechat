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
    goods: {},
    page: 1,
    category: [],
    group_val:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getgoodslist(options);
    this.getcategorylist(options);
  },
  getcategorylist: function(){
    let that = this;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Category/getcate.html', {}, (info) => {
      that.setData({
        category: info
      })
    });
  },
  getgoodslist: function (options) {
    let that = this;
    that.setData({ group_val: options.cate_id, goods: {}, page: 1})
    options = $.extend({
      _p: that.data.page
    }, options)
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Goods/lists.html', options, (info) => {
      if (that.data.is_more) {
        let page = that.data.page;
        page = ++page;
        that.setData({
          page: page
        })
      }
      if (info.length > 0) {
        if (typeof that.setintvalid != 'undefined'){
          clearInterval(that.setintvalid);
          console.log('clear')
        }
        that.setintvalid = setInterval(function () {
          for (var i = 0; i < info.length; i++) {
            let thistime = new Date().getTime();
            let end_time = new Date(info[i].end_time.replace(/\s/, 'T')).getTime();
            let start_time = new Date(info[i].start_time.replace(/\s/, 'T')).getTime();
            if (thistime <= start_time) {
              that.start_goods(start_time, thistime, end_time, info[i]);
            } else if (thistime < end_time) {
              that.end_goods(end_time, thistime, info[i]);
            } else {
              info[i].notcut = true
            }
          }
          that.setData({
            goods: options._p == 1 ? info : that.data.goods.cantact(info)
          })
        }, 1000);
      } else {
        that.setData({
          is_more: false
        })
      }
    });
  },
  cutgoods: function (e) {
    let goods_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/bargain/commdityDetail/commdityDetail' + '?goods_id=' + goods_id,
    })
  },
  tocatecut: function (e) {
    let cate_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/bargain/commdityList/commdityList' + '?cate_id=' + cate_id,
    })
  },
  end_goods: function (end_time, thistime, info) {
    let cha = end_time - thistime;
    let that = this;
    info.cutdaowbefore = false
    if (cha <= 0) {
      cha = 0;
      info.notcut = true;//活动已开始
      return;
    }
    that.time_meter(cha, info);
  },
  start_goods: function (start_time, thistime, end_time, info) {
    let cha = start_time - thistime;
    let that = this;
    info.cutdaowbefore = true;//活动未开始
    cha -= 1000;
    if (cha <= 0) {
      cha = 0;
      that.end_goods(end_time, thistime, info);
    }
    that.time_meter(cha, info);
  },
  time_meter: function (timer, info) {
    let that = this;
    let dd = parseInt(timer / 1000 / 60 / 60 / 24, 10);//计算剩余的天数
    let hh = parseInt(timer / 1000 / 60 / 60 % 24, 10);//计算剩余的小时数
    let mm = parseInt(timer / 1000 / 60 % 60, 10);//计算剩余的分钟数
    let ss = parseInt(timer / 1000 % 60, 10);//计算剩余的秒数
    dd = that.checkTime(dd);
    hh = that.checkTime(hh);
    mm = that.checkTime(mm);
    ss = that.checkTime(ss);
    let cutdown = dd + '天' + hh + '时' + mm + '分' + ss + '秒'
    info.cutdown = cutdown
  },
  checkTime: function (i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  selectCategory:function(e){
    var that = this;
    that.setData({ group_val: e.currentTarget.dataset.category })
    var options;
    options = {cate_id: e.currentTarget.dataset.category};
    that.getgoodslist(options)
  },
  jumpHome: function(){
    var that = this;
    wx.switchTab({
      url: '../index/index'
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

  // /**
  //  * 页面相关事件处理函数--监听用户下拉动作
  //  */
  // onPullDownRefresh: function () {

  // },

  // /**
  //  * 页面上拉触底事件的处理函数
  //  */
  // onReachBottom: function () {

  // },

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function () {

  // }
})