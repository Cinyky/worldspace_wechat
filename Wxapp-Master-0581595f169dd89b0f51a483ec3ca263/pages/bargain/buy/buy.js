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
    fDate: [],
    tpart1: [],
    tpart2: [],
    selected: 0,
    multiIndex: [0, 0, 0],
    goodsinfo: {},
    myaddress: "",
    real_name: '',
    mobile: '',
    dis:1,
    allinfo:{},
    all_address: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.removeStorageSync('bargain_all_info');
    util.syncWechatInfo();
    this.setData({options: options});
    this.getbuyinfo(options);
  },
  nameInput:function(e){
    wx.setStorage({ key: "bargain_wx_ziti_real_name", data: e.detail.value })
  },
  mobileInput: function (e) {
    wx.setStorage({ key: "bargain_wx_ziti_mobile", data: e.detail.value })
  },
  getbuyinfo: function (options) {
    let that = this;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Record/getbuyinfo.html', options, (info) => {
      var allinfo = info;
      console.log(wx.getStorageSync('bargain_wx_myaddress'))
      allinfo.myaddress = wx.getStorageSync('bargain_wx_myaddress');
      allinfo.real_name = wx.getStorageSync('bargain_wx_real_name');
      allinfo.mobile = wx.getStorageSync('bargain_wx_mobile');
      that.setData({
        goodsinfo: info,
        allinfo: allinfo,
        myaddress: wx.getStorageSync('bargain_wx_myaddress'),
        real_name: wx.getStorageSync('bargain_wx_real_name'),
        mobile: wx.getStorageSync('bargain_wx_mobile'),
      })
      if (allinfo.get_type==3){
        that.setData({
          dis:3,
        })
      }
      
      
    });
  },
  myaddress: function () {
    let that = this;
    util.chooseAddress(function (res) {
      that.setData({
        myaddress: res.all_address,
        real_name: res.name,
        mobile: res.mobile,
        allinfo: $.extend(that.data.allinfo, {
          myaddress: res.all_address,
          real_name: res.name,
          mobile: res.mobile,
        })
      })
      wx.setStorage({ key: "bargain_wx_myaddress", data: that.data.myaddress })
      wx.setStorage({ key: "bargain_wx_real_name", data: that.data.real_name })
      wx.setStorage({ key: "bargain_wx_mobile", data: that.data.mobile })
    });
  },
  toadress:function(){
    wx.openLocation({
      latitude: parseFloat(this.data.goodsinfo.goods_lat),
      longitude: parseFloat(this.data.goodsinfo.goods_lng),
      scale: 28,
      name: this.data.goodsinfo.goods_adress
    })
  },
  tomobile:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.allinfo.goods_mobile
    })
  },
  buygoods: function (e) {
    let that = this;
    let options = e.detail.value;
    options = $.extend({ formid: e.detail.formId }, options);
    if (that.data.goodsinfo.store_id > 0) {
      options = $.extend({ self_address: JSON.stringify(that.data.all_address) }, options);
    }
    wx.setStorage({ key: "bargain_wx_allinfo", data: that.data.allinfo })
    wx.setStorage({ key: "bargain_wx_ziti_real_name", data: e.detail.value.real_name })
    wx.setStorage({ key: "bargain_wx_ziti_mobile", data: e.detail.value.mobile })
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Order/payinfo.html', options, (info) => {
      switch (info.type) {
        case 1:
          info.data = $.extend({
            success: function (res) {
              wx.redirectTo({
                url: '../myOrder/myOrder',
              });
            },
            complete:function(){
              wx.redirectTo({
                url: '../myOrder/myOrder',
              });
            }
          }, info.data);
          wx.requestPayment(info.data);
          break;
      }
    });
  },
  radioChange:function(e){
    var that = this;
    let radio_id=e.detail.value;
    if (radio_id == 1) {
      if (that.data.myaddress) {
        console.log(11111)
      } else {
        console.log(22222)
        if (wx.getStorageSync('bargain_wx_allinfo') != ''){
          var allinfo = wx.getStorageSync('bargain_wx_allinfo');
          allinfo.get_type = 0;
          allinfo.all_address = that.data.all_address;
          that.setData({
            allinfo: allinfo
          })
        }
      }
    }
    if (radio_id == 3) {
      console.log(wx.getStorageSync('bargain_wx_ziti_real_name'))
      var arr = that.data.allinfo;
      arr.ziti_real_name = wx.getStorageSync('bargain_wx_ziti_real_name')
      arr.ziti_mobile = wx.getStorageSync('bargain_wx_ziti_mobile')
      that.setData({
        allinfo: arr
      })
    }
    this.setData({
      dis:radio_id
    })
  },
  selectSelfAddress: function () {
    var that = this;
    var allinfo = that.data.allinfo;
    allinfo.ziti_real_name = wx.getStorageSync('bargain_wx_ziti_real_name');
    allinfo.ziti_mobile = wx.getStorageSync('bargain_wx_ziti_mobile');
    that.setData({
      allinfo: allinfo,
    });
    wx.setStorage({ key: "bargain_wx_allinfo", data: allinfo })
    wx.navigateTo({
      url: '../business-address/index?store_id=' + that.data.goodsinfo.store_id + '&goods_id=' + that.data.goodsinfo.goods_id
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log(this.data.goodsinfo)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      var that = this;
      wx.getSetting({
        success: (res) => {
          console.log('getSetting.success')
          console.log(res)
        },
        fail: (res) => {
          console.log('getSetting.fail')
          wx.openSetting({
            success: (res) => {
              console.log('openSetting.success')
              console.log(res)
            },
            fail: (res) => {
              console.log('openSetting.fail')
              console.log(res)
            }
          })
        }
      });
      if (wx.getStorageSync('bargain_all_info')) {
        var allinfo = that.data.allinfo;
        allinfo.all_address = wx.getStorageSync('bargain_all_info');
        that.setData({ all_address: wx.getStorageSync('bargain_all_info'), allinfo: allinfo})
      } else {
        wx.getLocation({
          type: 'wgs84',
          success: function (res) {
            that.setData({
              latitude: res.latitude,
              longitude: res.longitude
            })
            requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Record/getSelfAddress.html', { lat: that.data.latitude, lng: that.data.longitude, goods_id: that.data.options.goods_id, store_id: that.data.options.store_id}, (info) => {
              var allinfo = that.data.allinfo;
              allinfo.all_address = info[0];
              allinfo.ziti_real_name = wx.getStorageSync('bargain_wx_ziti_real_name');
              allinfo.ziti_mobile = wx.getStorageSync('bargain_wx_ziti_mobile');
              that.setData({ 
                all_address: info[0], 
                allinfo: allinfo,
              })
              console.log(that.data.allinfo)
            }, that, { isShowLoading: false });
          }
        })
      }

      
  },

  //电话
  bind_contant_phone: function () {
    var that = this
    wx.makePhoneCall({
      phoneNumber: that.data.all_address.mobile
    })
  },

  to_self_adress: function () {
    wx.openLocation({
      latitude: parseFloat(this.data.all_address.latitude),
      longitude: parseFloat(this.data.all_address.longitude),
      scale: 28,
      name: this.data.all_address.address
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  // onPullDownRefresh: function () {

  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function () {

  // },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})