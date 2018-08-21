const app = getApp();
const util = require('../../../utils/util');
const requestUtil = require('../../../utils/requestUtil');
const $ = require('../../../utils/underscore');
const _DuoguanData = require('../../../utils/data');
const WxParse = require('../../../wxParse/wxParse.js');

function GetDateDiff(DiffTime) {
  //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式   
  return DiffTime.replace(/\-/g, "/");
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderinfo: {},
    real_name: '',
    mobile: '',
    pay_address: '',
    lose: true,
    cutdown: {
      'dd': '00',
      'hh': '00',
      'mm': '00',
      'ss': '00'
    },
    notpay: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    util.syncWechatInfo();
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Order/orderinfo.html', options, (info) => {
      if (info == 'success') {
        that.setData({
          lose: false,
        })
      } else if (info != null) {
        this.setData({
          orderinfo: info,
          real_name: info.real_name,
          mobile: info.mobile,
          pay_address: info.pay_address
        })


        let order_time = Date.parse(GetDateDiff(info.pay_time));
        let thistime = new Date().getTime();
        let cha = order_time + 1000 * 60 * 15 - thistime;

        setInterval(function() {
          cha -= 1000;
          if (cha <= 0) {
            that.setData({
              notpay: false
            });
            clearInterval(that.setintvalid);
            cha = 0;
          }
          that.time_meter(cha);
        }, 1000);
      }
    })
  },
  gogoodsdetail: function () {
    let that = this;
    wx.navigateTo({
      url: '/pages/bargain/commdityDetail/commdityDetail?goods_id=' + that.data.orderinfo.goods_id
    })
  },
  time_meter: function(timer) {
    let that = this;
    let dd = parseInt(timer / 1000 / 60 / 60 / 24, 10); //计算剩余的天数
    let hh = parseInt(timer / 1000 / 60 / 60 % 24, 10); //计算剩余的小时数
    let mm = parseInt(timer / 1000 / 60 % 60, 10); //计算剩余的分钟数
    let ss = parseInt(timer / 1000 % 60, 10); //计算剩余的秒数
    dd = that.checkTime(dd);
    hh = that.checkTime(hh);
    mm = that.checkTime(mm);
    ss = that.checkTime(ss);
    // let cutdown = dd + '天' + hh + ':' + mm + ':' + ss
    var cutdown = {};
    cutdown.dd = dd;
    cutdown.hh = hh;
    cutdown.mm = mm;
    cutdown.ss = ss;
    that.setData({
      cutdown: cutdown
    })
  },
  checkTime: function(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  myaddress: function() {
    let that = this;
    if (that.data.orderinfo.pay_status == 0) {
      util.chooseAddress(function(res) {
        that.setData({
          pay_address: res.all_address,
          real_name: res.name,
          mobile: res.mobile,
        })
      });
    } else {
      return;
    }
  },
  tomobile: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.orderinfo.buyinfo.goods_mobile
    })
  },
  updateorder: function(e) {
    let options = e.detail.value;
    options = $.extend({
      formid: e.detail.formId
    }, options);
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Order/payinfo.html', options, (info) => {
      switch (info.type) {
        case 1:
          info.data = $.extend({
            success: function(res) {
              wx.navigateTo({
                url: '../myOrder/myOrder',
              });
            },
          }, info.data);
          wx.requestPayment(info.data);
          break;
      }
    });
  },
  delorder: function(e) {
    let options = {};
    options.orderid = e.currentTarget.dataset.id;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Order/delorder.html', options, (info) => {
      switch (info) {
        case 'success':
          wx.redirectTo({
            url: '../myOrder/myOrder',
          });
          break;
      }
    });
  },
  tomyorder: function() {
    wx.redirectTo({
      url: '../myOrder/myOrder',
    });
  },
  refund: function(e) {
    let orderid = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: '../refund/refund?orderid=' + orderid,
    });
  },
  getgoods: function(e) {
    let goods_id = e.currentTarget.dataset.id;
    let options = {};
    options.goods_id = goods_id;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Order/getorder.html', options, (info) => {
      switch (info) {
        case 'success':
          wx.navigateTo({
            url: '../myOrder/myOrder',
          });
          break;
      }
    });
  },
  toadress: function() {
    let that = this;
    wx.openLocation({
      latitude: parseFloat(that.data.orderinfo.buyinfo.goods_lat),
      longitude: parseFloat(that.data.orderinfo.buyinfo.goods_lng),
      scale: 28,
      name: that.data.orderinfo.buyinfo.goods_adress
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },
})