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
    this_store_id: 0,
    store_info: {},
    g_list: new Array(),
    this_page: 1,//当前页码
    pagesize: 10,//每页数量
    is_onbuttonload: true,//是否触底加载
    bottom_load: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var sid = options.sid;
    if (!sid) {
      wx.showModal({
        title: '提示',
        content: '店铺信息不存在!!!',
        success: function (res) {
          var url = '';
          if (_DuoguanData.duoguan_app_is_superhome == 0) {
            url += "/pages/tuan/index/index";
          } else {
            url += _DuoguanData.duoguan_app_index_path;
          }
          wx.switchTab({
            url: url,
            fail: () => {
              wx.navigateTo({
                url: url,
              })
            }
          })
        }
      })
    }
    that.setData({
      this_store_id: sid
    });
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getStoreInfo.html", { sid: sid }, (data) => {
      console.log(data);
      that.setData(
        {
          store_info: data
        })
    }, this, { isShowLoading: true });
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getStoreGoodsList.html", {
      sid: sid, pagenum: that.data.this_page,
      pagesize: that.data.pagesize,
    }, (data) => {
      that.setData({
        this_page: that.data.this_page + 1,
        bottom_load: false
      })
      that.initTuanData(data)
    }, this, { isShowLoading: true });
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
        g_list: that.data.g_list.concat(data),
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
  detail:function(e){
    wx.navigateTo({
      url: '../info/info?tid=' + e.currentTarget.id + '&chengtuan_id=0'
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
    var that = this;
    if (that.data.is_onbuttonload) {
      that.setData({
        bottom_load: true
      })
      requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/api/getStoreGoodsList.html", {
        sid: that.data.this_store_id, pagenum: that.data.this_page,
        pagesize: that.data.pagesize,
      }, (data) => {
        that.setData({
          this_page: that.data.this_page + 1,
          bottom_load: false
        })
        console.log(that.data.bottom_load)
        that.initTuanData(data);
      }, this, { isShowLoading: false });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that = this
    return {
      title: that.data.store_info.store_name,
      desc: '',
      path: '/pages/tuan/shop-center/index?sid=' + that.data.this_store_id
    }
  }
})