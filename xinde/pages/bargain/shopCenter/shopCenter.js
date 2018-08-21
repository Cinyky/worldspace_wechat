const app = getApp();
const util = require('../../../utils/util');
const requestUtil = require('../../../utils/requestUtil');
const $ = require('../../../utils/underscore');
const _DuoguanData = require('../../../utils/data');
const WxParse = require('../../../wxParse/wxParse.js');
import plugUtil from '../../../utils/plugUtil';
function GetDateDiff(DiffTime) {
  //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式   
  return DiffTime.replace(/\-/g, "/");
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 500,
    category: [],
    goods: [],
    page: 1,
    is_more: true,
    timeall: [],
    sec: 0,
    group_val: 'ing',
    store_info: [],
    sid: ''
  },
  setintvalid: null,
  shareInfo: {},
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    this.setData({ options: options});
    this.getStoreInfo(options);
    this.getgoodslist(options);
    this.shareinfo();
    plugUtil.popup(this, 'DuoguanBargain');
  },
  shareinfo: function () {
    requestUtil.get(_DuoguanData.duoguan_get_share_data_url, { mmodule: 'DuoguanBargain' }, (info) => {
      this.shareInfo = info;
      //显示分享按钮
      if (wx.showShareMenu) wx.showShareMenu();
    });
  },
  getStoreInfo: function (options) {
    let that = this;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Goods/getStoreInfo.html', { sid: options.sid }, (info) => {
      that.setData({ store_info: info})
    });
  },
  getgoodslist: function (options) {
    let that = this;
    options = $.extend({
      _p: that.data.page
    }, options)
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Goods/getStoreGoodsLists.html', options , (info) => {
      if (that.data.is_more) {
        let page = that.data.page;
        page = ++page;
        that.setData({
          page: page
        })
      }
      if (info.length > 0) {
        that.getmin(info, options._p);
        that.setData({
          goods: options._p == 1 ? info : that.data.goods.concat(info),
        })
        that.setintvalid = setInterval(function () {
          let sec = new Date().getSeconds();
          if (sec == 59) {
            that.getmin(info, options._p);
          }
          that.setData({
            sec: that.checkTime(59 - sec)
          })
        }, 1000);
      } else {
        that.setData({
          is_more: false
        })
      }
    });
  },
  getmin: function (info, opage) {
    let timeall = [];
    let that = this;
    let thistime = new Date().getTime();
    for (var i = 0; i < info.length; i++) {
      let end_time = Date.parse(GetDateDiff(info[i].end_time));
      let start_time = Date.parse(GetDateDiff(info[i].start_time));
      timeall.push({ end_time: end_time, start_time: start_time });
      that.start_goods(start_time, thistime, end_time, timeall[i]);
    }
    that.setData({
      timeall: opage == 1 ? timeall : that.data.timeall.concat(timeall),
    })
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
    info = $.extend(info, { cutdaowbefore: false });
    cha -= 1000;
    if (cha <= 0) {
      cha = 0;
      info = $.extend(info, { notcut: true });
      return;
    }
    that.time_meter(cha, info);
  },
  start_goods: function (start_time, thistime, end_time, info) {
    let cha = start_time - thistime;
    let that = this;
    info = $.extend(info, { cutdaowbefore: true });
    if (cha <= 0) {
      cha = 0;
      that.end_goods(end_time, thistime, info);
    }
    that.time_meter(cha, info);
  },
  time_meter: function (timer, info) {
    if (info.notcut || timer <= 0) {
      return;
    }
    let that = this;
    let dd = parseInt(timer / 1000 / 60 / 60 / 24, 10);//计算剩余的天数
    dd = that.checkTime(dd);
    let hh = parseInt(timer / 1000 / 60 / 60 % 24, 10);//计算剩余的小时数
    hh = that.checkTime(hh);
    let mm = parseInt(timer / 1000 / 60 % 60, 10);//计算剩余的分钟数
    mm = that.checkTime(mm);
    let cutdown = dd + '天' + hh + '时' + mm + '分';
    // var cutdown = {};
    // cutdown.dd = dd;
    // cutdown.hh = hh;
    // cutdown.mm = mm;
    info = $.extend(info, { cutdown: cutdown });
  },
  checkTime: function (i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },

  goodstype: function (e) {
    var that = this;
    if (e.currentTarget.dataset.goodstype == 1) {
      that.setData({ group_val: 'ing' })
    } else if (e.currentTarget.dataset.goodstype == 2) {
      that.setData({ group_val: 'end' })
    } else {
      that.setData({ group_val: 'preview' })
    }
  },

  toTop: function (e) {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },

  toadress: function () {
    wx.openLocation({
      latitude: parseFloat(this.data.store_info.store_gps_lat),
      longitude: parseFloat(this.data.store_info.store_gps_lng),
      scale: 28,
      name: this.data.store_info.store_address
    })
  },

  //电话
  bind_contant_phone: function () {
    var that = this
    wx.makePhoneCall({
      phoneNumber: that.data.store_info.store_con_mobile
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
    clearInterval(this.setintvalid);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    clearInterval(this.setintvalid);
    this.setData({
      page: 1
    });
    this.getgoodslist(this.data.options);
    this.shareinfo();
    plugUtil.popup(this, 'DuoguanBargain');
    wx.stopPullDownRefresh();

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getgoodslist(this.data.options);
    wx.stopPullDownRefresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this;
    let sharepath = 'pages/bargain/shopCenter/shopCenter?sid=' + that.data.store_info.id;
    return {
      title: '良心店铺，大家快来砍价吧',
      path: sharepath,
    }
  },



})