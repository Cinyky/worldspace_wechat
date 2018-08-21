// pages/tuan/tuan/extension-list/a.js
const _function = require('../../../../utils/functionData.js');
const requestUtil = require('../../../../utils/requestUtil');
const _DuoguanData = require('../../../../utils/data');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    this_page: 1,//当前页码
    pagesize: 10,//每页数量
    glo_is_load: true,//正在加载
    tuanlist: [],//团信息列表
    is_onbuttonload: true,//是否触底加载
    bottom_load:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/getTuanList.html", {
      pagenum: that.data.this_page,
      pagesize: that.data.pagesize,
    }, (data) => { that.initTuanData(data) }, this, {isShowLoading: false});
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
    var that = this;
    that.setData({
      this_page: 1,//当前页码
      pagesize: 10,//每页数量
      glo_is_load: true,//正在加载
      tuanlist: [],//团信息列表
      is_onbuttonload: true,//是否触底加载
      bottom_load: false,
    });
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/getTuanList.html", {
      pagenum: that.data.this_page,
      pagesize: that.data.pagesize,
    }, (data) => { that.initTuanData(data) }, this, { isShowLoading: false });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    if (that.data.is_onbuttonload) {
      that.setData({
        bottom_load: true
      })
      requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/getTuanList.html", {
        pagenum: that.data.this_page + 1,
        pagesize: that.data.pagesize,
      }, (data) => {
        that.setData({
          this_page: that.data.this_page + 1,
          bottom_load:false
        })
        console.log(that.data.bottom_load)
        that.initTuanData(data);
        }, this, { isShowLoading: false });
    }
  },
  initTuanData: function (data) {
    var that = this;
    if (data.length < that.data.pagesize || data == null) {
      that.setData({
        is_onbuttonload: false,
        bottom_load: false
      })
    }
    if (data != null) {
      that.setData({
        tuanlist: that.data.tuanlist.concat(data),
        bottom_load: false
      });
    }
    if (that.data.glo_is_load) {
      that.setData({
        glo_is_load: false,
        bottom_load: false
      });
    }
  },
  tuan_info_bind:function(e){
    var tid = e.target.id;
    wx.redirectTo({
      url: '/pages/tuan/join/join?tid='+tid,
    })
  },
  goods_info_bind:function(e){
    var tid = e.target.id;
    wx.redirectTo({
      url: '/pages/tuan/info/info?tid='+tid+'&chengtuan_id=0',
    })
  }
})