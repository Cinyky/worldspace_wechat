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
    orderid: null,
    changedis: true,
    refundinfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      orderid: options.orderid
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
  refund: function (e) {
    let that = this;
    let options = {};
    options.refund = that.data.refundinfo;
    options = $.extend({
      orderid: that.data.orderid
    }, options);
    that.setData({
      changedis: true
    });
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Order/applyRefund.html', options, (info) => {
      if (info == "success") {
        wx.navigateTo({
          url: '../orderDetail/orderDetail?orderid=' + options.orderid,
        })
      }
    });
  },
  checkboxChange: function (e) {
    let refundinfo = e.detail.value;
    if (refundinfo.length == 0) {
      this.setData({
        changedis: true
      })
    } else {
      this.setData({
        changedis: false,
        refundinfo: refundinfo
      })

    }
  }
})