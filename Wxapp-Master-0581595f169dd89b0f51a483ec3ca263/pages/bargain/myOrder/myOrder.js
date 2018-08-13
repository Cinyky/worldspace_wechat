const app = getApp();
const util = require('../../../utils/util');
const requestUtil = require('../../../utils/requestUtil');
const $ = require('../../../utils/underscore');
const _DuoguanData = require('../../../utils/data');
const QR = require('../../../utils/qrcode');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderlist: {},
    page: 1,
    searstaus: 0,
    isExam: false,
    examid: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.syncWechatInfo();
    this.intigetmyorder();
  },
  intigetmyorder: function () {
    let that = this;
    let options = {};
    options.page = that.data.page;
    options.searstaus = that.data.searstaus;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Order/myorderlist.html', options, (info) => {
      if (info != null) {
        that.setData({
          orderlist: that.data.page == 1 ? info : that.data.orderlist.contact(info)
        })
      }
    });
  },
  getOrderList: function (e) {
    let that = this;
    let searstaus = e.currentTarget.dataset.id;
    that.setData({
      searstaus: searstaus
    })
    let options = {};
    options.page = 1;
    options.searstaus = searstaus;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Order/myorderlist.html', options, (info) => {
      that.setData({
        orderlist: that.data.page == 1 ? info : that.data.orderlist.contact(info)
      })
    });

  },
  toorder: function (e) {
    let orderid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/bargain/orderDetail/orderDetail?orderid=' + orderid,
    })
  },
  getExam: function (e) {
    let that = this;
    let dataset = e.currentTarget.dataset;
    let orderid = dataset.id;
    that.setData({
      isExam: true
    });
    let options = {};
    options.orderid = orderid;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Order/getExam.html', options, (info) => {
      that.setData({
        examid: info
      })
      that.createQrCode(that.data.examid, 'mycanvas');
    });
  },
  setHide: function () {
    this.setData({
      isExam: false
    });
  },
  //创建二维码
  createQrCode: function (url, canvasId) {
    //调用插件中的draw方法，绘制二维码图片
    QR.qrApi.init(url, canvasId, 0, 0, 150, 150);

  },
  delorder: function (e) {
    console.log(e);
    let options = {};
    let that = this;
    let orderid = e.currentTarget.dataset.id;
    options.orderid = orderid;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Order/delthisorder.html', options, (info) => {
      that.intigetmyorder();

    });
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
    this.setData({
      page: 1
    });
    util.syncWechatInfo();
    this.intigetmyorder();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
})