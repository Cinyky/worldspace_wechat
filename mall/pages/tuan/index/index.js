//index.js
import plugUtil from '../../../utils/plugUtil';
var _function = require('../../../utils/functionData');
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
var app = getApp()
Page({
  data: {
    g_share_title: '',
    g_share_desc: '',
    cate_list: [],
    this_item: 0,
    this_cate_id: 0,
    goods_list: [],
    showLoading: false,
    this_page: 1,//当前页码
    pagesize: 10,//每页数量
    this_finish_page: 0,
    glo_is_load: true,
    pid: 0,
    tiptext:{}
  },
  detail: function (e) {
    wx.navigateTo({
      url: '../info/info?tid=' + e.currentTarget.id + '&chengtuan_id=0'
    })
  },
  //选项卡操作
  index_item_bind: function (e) {
    //获取分类id 然后动态加载所属分类商品
    var that = this
    var this_target = e.target.id;
    that.setData({
      this_item: this_target,
      this_page: 1,
      this_cate_id: this_target,
      pid: this_target
    })
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsList.html", { cid: this_target, pagesize: 1, pagenum: that.data.pagesize, pid: 0, versions: 20180523 }, (data) => { that.initGoodsListData(data) }, this, { isShowLoading: false });
  },
  index_item_bind1: function (e) {
    //获取分类id 然后动态加载所属分类商品
    var that = this
    var this_target = e.currentTarget.id;
    that.setData({
      this_item: this_target,
      this_page: 1,
      this_cate_id: this_target
    })
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsList.html", { cid: this_target, pagesize: 1, pagenum: that.data.pagesize, pid: that.data.pid, versions: 20180523 }, (data) => { that.initGoodsListData(data) }, this, { isShowLoading: false });
  },
  onLoad: function (options) {
    //大转盘
    plugUtil.popup(this, "DuoguanTuan");
    var that = this
    if (options.pid && options.cid) {
      that.setData({
        pid: options.pid,
        this_cate_id: options.cid,
        this_item: options.cid,
      });
    }
    //商品列表
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsList.html", { cid: that.data.this_cate_id, pagesize: 1, pagenum: that.data.pagesize, pid: this.data.pid, versions: 20180523 }, (data) => { that.initGoodsListData(data) }, this, { isShowLoading: false });
    //获取分享数据
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanUser/Api/getShareInfo.html", { mmodule: "duoguantuan" }, (data) => { that.initGetShareData(data) }, this, { isShowLoading: false });
    //获取分类信息
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getCateListNew.html", {}, (data) => { that.initTuanCateData(data) }, this, { isShowLoading: false });
    //获取配置信息
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getTuanConfig.html", {}, (data) => {
      that.setData({ config: data })
    }, this, { isShowLoading: false });
    //获取tipxinx
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getTuanSuccessOrder.html", {}, (data) => {
      that.initTipData(data,0)
    }, this, { isShowLoading: false });

  },
  initGetShareData: function (data) {
    var that = this
    that.setData({
      g_share_title: data.title,
      g_share_desc: data.desc
    })
  },
  initTuanCateData: function (data) {
    var that = this
    that.setData({
      cate_list: data,
      glo_is_load: false
    })
  },
  initGoodsListData: function (data) {
    var that = this
    that.setData({
      goods_list: data
    })
    if (data == null) {
      that.setData({
        showLoading: false
      })
    } else {
      if (data.length >= that.data.pagesize) {
        that.setData({
          showLoading: true
        })
      } else {
        that.setData({
          showLoading: false
        })
      }
    }
    wx.hideToast()
  },
  initGoodsListLoadData: function (data) {
    var that = this
    if (data == null) {
      that.setData({
        showLoading: false
      })
    } else {
      if (data.length >= that.data.pagesize) {
        that.setData({
          showLoading: true
        })
      } else {
        that.setData({
          showLoading: false
        })
      }
      that.setData({
        goods_list: that.data.goods_list.concat(data),
        this_page: that.data.this_page + 1
      })
    }
    that.setData({
      this_finish_page: that.this_finish_page + 1
    })
  },
  //当滚动到底部
  onReachBottom: function (e) {
    var that = this
    var this_target = this.data.this_item
    if (that.data.this_finish_page != that.data.this_page) {
      requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsList.html", { cid: this_target, pagesize: that.data.this_page + 1, pagenum: that.data.pagesize, pid: that.data.pid, versions: 20180523 }, (data) => { that.initGoodsListLoadData(data) }, this, { isShowLoading: false });


    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this
    plugUtil.popup(this, "DuoguanTuan");
    that.setData({
      this_page: 0,
      goods_list:[]
    })
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsList.html", { cid: that.data.this_cate_id, pagesize: that.data.this_page + 1, pagenum: that.data.pagesize, pid: that.data.pid, versions: 20180523 }, (data) => {that.setData({goods_list: []});that.initGoodsListLoadData(data) }, this, { isShowLoading: false });

    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },
  onShareAppMessage: function () {
    var that = this
    return {
      title: that.data.g_share_title || '',
      desc: that.data.g_share_desc || '',
      path: '/pages/tuan/index/index',
      success: function () {
        requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/MarketingLuckDraw/ApiShare/shareSetData", {}, () => { }, this, { isShowLoading: false });
      }
    }
  },
  initTipData: function (data, index) {
    if (!data) return;
    var that = this;
    var i = index;
    if (i >= data.length - 1) i = 0;
    var tiptext = that.data.tiptext;
    tiptext.classText = '';
    if (data[i].user == null) {
      var user = {
        nickname: '佚名',
        headimgurl: '/images/default.png'
      }
      data[i].user = user;
    }
    tiptext.nickname = data[i].user.nickname
    tiptext.headimgurl = data[i].user.headimgurl
    that.setData({
      tiptext: tiptext
    })
    setTimeout(function () {
      tiptext.classText = 'tips-show'
      that.setData({
        tiptext: tiptext
      })
      setTimeout(function () {
        that.initTipData(data, ++i);
      }, 5000);

    }, 300);
  },
})