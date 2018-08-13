const _function = require('../../../../utils/functionData.js');
const requestUtil = require('../../../../utils/requestUtil');
const _DuoguanData = require('../../../../utils/data');
const app = getApp()
Page({
  data: {
    postlist: [],
    this_weiba_id: 0,
    hasMore: false,
    showLoading: false,
    isScrollY: true,
    this_page: 1,//当前页码
    pagesize: 10,//每页数量
    this_nav_name: 'index',
    this_is_jinghua: 0,
    this_finish_page: 0,
    glo_is_load: true,
    group_val: 'all',
    is_loadmore: true
  },
  group_show: function (e) {
    var that = this
    that.setData({
      group_val: e.target.dataset.val,
      this_page: 1,
      postlist: []
    })
    that.data.postlist = []
    that.data.is_loadmore = true
    that.loaddata()
  },
  //订单详情
  user_orderinfo_bind: function (e) {
    var oid = e.currentTarget.id;
    wx.navigateTo({
      url: '../info/index?oid=' + oid
    })
  },
  go_share: function (e) {
    wx.navigateTo({
      url: '../../join/join?oid=' + e.currentTarget.id,
    })
  },
  //删除订单
  delete_user_order: function (e) {
    var that = this
    var oid = e.currentTarget.id;
    wx.showModal({
      title: '提示',
      content: "确认要删除该订单吗?",
      success: function (res) {
        if (res.confirm == true) {
          // _function.deleteTuanOrderInfo(wx.getStorageSync("utoken"),oid,that.initdeleteOrderInfoData,that)
          requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/deleteUserOrder.html", { oid: oid }, (data) => { that.initdeleteOrderInfoData(data) }, this, { isShowLoading: false });
        }
      }
    })
  },
  initdeleteOrderInfoData: function (data) {
    var that = this
    that.setData({
      this_page: 1
    })
    // _function.getUserTuanOrderList(wx.getStorageSync("utoken"),that.data.this_page,that.data.pagesize,that.initUserOrderListData,that)
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/getUserOrderList.html", {
      pagesize: that.data.this_page,
      pagenum: that.data.pagesize,
    }, (data) => { that.initUserOrderListData(data) }, this);

  },
  loaddata: function () {
    var that = this
    requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/OrderApi/getUserOrderList.html',
      { pagesize: that.data.this_page, pagenum: that.data.pagesize, group_val: that.data.group_val },
      (data) => {
        console.log(data);
        if (data == null) {
          that.setData({
            // postlist: [],
            glo_is_load: false,
            isScrollY: false,
            showLoading: false,
            is_loadmore: false
          })
          return
        } else {
          that.setData({
            postlist: that.data.postlist.concat(data),
            glo_is_load: false
          })
          if (data.length >= that.data.pagesize) {
            that.setData({
              isScrollY: true,
              showLoading: true
            })
          } else {
            that.setData({
              isScrollY: false,
              showLoading: false,
              is_loadmore: false
            })
          }
        }
      }, this, { isShowLoading: false });
  },
  onLoad: function () {
    var that = this
    that.setData({
      this_page: 1
    })
    that.data.this_page = 1
    that.data.group_val = 'all'
    that.data.postlist = []
    that.data.is_loadmore = true
    that.loaddata()
    // _function.getUserTuanOrderList(wx.getStorageSync("utoken"),that.data.this_page,that.data.pagesize,that.initUserOrderListData,this)
  },
  initUserOrderListData: function (data) {
    var that = this
    that.setData({
      postlist: data,
      glo_is_load: false
    })

    if (data == null) {
      that.setData({
        isScrollY: false,
        showLoading: false
      })
    } else {
      if (data.length >= that.data.pagesize) {
        that.setData({
          isScrollY: true,
          showLoading: true
        })
      } else {
        that.setData({
          isScrollY: false,
          showLoading: false
        })
      }
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this
    that.setData({
      this_page: 1
    })
    that.data.postlist = []
    that.data.is_loadmore = true
    that.loaddata()
    // _function.getUserTuanOrderList(wx.getStorageSync("utoken"),that.data.this_page,that.data.pagesize,that.initUserOrderListData,this)
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },
  initUserOrderListLoadData: function (data) {
    var that = this
    if (data.info == null) {
      that.setData({
        isScrollY: false,
        showLoading: false
      })
    } else {
      if (data.info.length >= that.data.pagesize) {
        that.setData({
          isScrollY: true,
          showLoading: true
        })
      } else {
        that.setData({
          isScrollY: false,
          showLoading: false
        })
      }
      that.setData({
        postlist: that.data.postlist.concat(data.info),
        this_page: that.data.this_page + 1
      })
    }
    that.setData({
      this_finish_page: that.this_finish_page + 1
    })
  },
  onReachBottom: function (e) {
    var that = this
    var this_target = this.data.this_items
    if (that.data.is_loadmore) {
      that.data.this_page += 1
      that.loaddata()
      // _function.getUserTuanOrderList(wx.getStorageSync("utoken"),that.data.this_page + 1,that.data.pagesize,that.initUserOrderListLoadData,this)
    }
  }
})