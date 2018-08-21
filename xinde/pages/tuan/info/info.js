var app = getApp()
var _function = require('../../../utils/functionData');
var WxParse = require('../../../wxParse/wxParse.js');
var GetRTime = require('../../../utils/wxTimer.js');
const util = require('../../../utils/util');
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
const dg = require('../../../utils/dg');
Page({
  data: {
    goods_info: [],
    goods_specification: [],
    goods_tuan_list: [],
    wxParseData: '',
    this_goods_id: 0,
    this_chengtuan_id: 0,
    this_g_nav: 1,
    is_add_cart_view: false,
    cart_default_number: 1,
    goods_attr_select: {},
    btn_add_cart_disabled: false,
    submitIsLoading: false,
    glo_is_load: true,
    shengTime: '',
    goods_true_price: 0,
    is_add_cart_view: false,
    goods_attr_check_str: '',
    goods_tuan_status: true,
    buy_type: 1,//1为单买2为拼团
    is_show_tuan: false,
    is_join: false,//是否从分享进入本页面
    is_show: false,
    oid: 0,
    is_order: false,
    is_del: false,
    btn_submit_disabled: false,
    tiptext: {
      classText: ''
    },
    s_play: true,
    show_sharing: false,
    selectStandard: 0
  },
  show_more_tuan: function () {
    this.setData({
      is_show_tuan: !this.data.is_show_tuan
    })
  },
  join_bind: function (e) {
    wx.navigateTo({
      url: '../join/join?tid=' + e.currentTarget.id
    })
  },
  //回首页
  gohome_bind: function () {
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
  },
  onLoad: function (options) {
    var that = this
    if (options.is_show == 'true') {
      that.setData({
        is_show: true
      });
    }
    var post_id = options.tid ? options.tid : 0;
    console.log(decodeURIComponent(options.scene));
    if (decodeURIComponent(options.scene) != 'undefined') {
      post_id = decodeURIComponent(options.scene)
    }
    that.setData({
      this_goods_id: post_id,
      this_chengtuan_id: options.chengtuan_id
    })
    if (that.data.this_chengtuan_id > 0) {
      that.setData({
        is_join: true
      })
    }
    if (options.order_id > 0) {
      that.setData({
        is_order: true,
        oid: options.order_id
      })
    }
    //请求商品详情
    // _function.getTuanGoodsInfo(post_id,that.initGoodsInfoData,this)
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsInfo.html", { sid: post_id, tuan_id: that.data.this_chengtuan_id }, (data) => { that.initGoodsInfoData(data) }, this, { isShowLoading: false });
  },
  initGoodsInfoData: function (data) {
    var that = this
    //如果获取不到商品数据
    if (data == false) {
      that.setData({
        glo_is_load: false,
        is_del: true
      })
      return;
    }
    // 对商品评价的数据处理
    data.is_comment = true
    if (data.comment_list.length > 0) {
      data.is_comment = false
      data.comment_list.forEach(function (value, index, array) {
        array[index]['ctime'] = util.format(value.ctime * 1000, "yyyy-MM-dd")
        array[index]['p_fenshu'] = parseInt(value.p_fenshu)
        array[index]['is_show_comment_iamge'] = (value.imageArray && value.imageArray.length > 0) ? true : false;
      })
    }
    if (data.tuan_type == 2) {
      var arr = new Array();
      console.log(data.standard)
      for (var i = 0; i < data.standard.length; i++) {

        arr.push(data.standard[i].price*1);
      }
      console.log(Math.min.apply(Math, arr)*100, data.shop_price*1*100)
      data.maxSave = Number((data.shop_price * 100 - Math.min.apply(Math, arr) * 100) / 100).toFixed(2)
    }
    if(data.selectStandard>0){
      that.setData({
        selectStandard:data.selectStandard
      });
    }
    that.setData({
      goods_info: data,
      goods_specification: data.goods_specification,
      goods_tuan_list: data.tlist,
      glo_is_load: false
    })
    if (data.tuan_end_time != 0) {
      GetRTime.GetRTime(data.tuan_end_time, that);
    }
    //开团倒计时
    if (data.tlist != null) {
      var tdatas = that.data.goods_tuan_list
      for (var i = 0; i < tdatas.length; i++) {
        var this_end_time = tdatas[i].tuan_end_time
        that.getShengTime(this_end_time, i)
      }
    }
    if (that.data.this_chengtuan_id > 0) {
      if (that.data.is_show) {
        that.buy_tuan_bind();
      }
    }
    WxParse.wxParse('article', 'html', data.g_content, that, 0)
    //处理tip信息
    that.initTipData(data.o_list, 0)
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
  //获取倒计时时间
  getShengTime: function (endtime, i) {
    var that = this
    var tdatas = that.data.goods_tuan_list
    var EndTime = new Date(endtime);
    var NowTime = new Date();
    var t = EndTime.getTime() - NowTime.getTime();
    var d = 0;
    var h = 0;
    var m = 0;
    var s = 0;
    if (t >= 0) {
      d = Math.floor(t / 1000 / 60 / 60 / 24);
      h = Math.floor(t / 1000 / 60 / 60);
      m = Math.floor(t / 1000 / 60 % 60);
      s = Math.floor(t / 1000 % 60);
      tdatas[i].tuan_sheng_time = '剩余' + h + ':' + m + ':' + s + '结束'
      setTimeout(function () {
        that.getShengTime(endtime, i);
      }
        , 1000)
    } else {
      tdatas[i].tuan_sheng_time = '已结束'
    }
    that.setData({
      goods_tuan_list: tdatas
    })
  },
  //拼团购买操作
  buy_tuan_bind: function () {
    var that = this
    if (that.data.goods_tuan_status == false) {
      wx.showModal({
        title: '提示',
        content: '对不起，该商品拼团时间已结束',
        showCancel: false
      })
      return false
    }
    that.setData({
      is_add_cart_view: true,
      goods_true_price: that.data.goods_info.tuan_price,
      cart_default_number: 1,
      buy_type: 2
    })
  },
  //单独购买操作
  buy_one_bind: function () {
    var that = this
    that.setData({
      is_add_cart_view: true,
      goods_true_price: that.data.goods_info.shop_price,
      cart_default_number: 1,
      buy_type: 1
    })
  },
  //隐藏购物车
  add_cart_close_bind: function () {
    var that = this
    that.setData({
      is_add_cart_view: false
    })
  },
  //减少数量
  bind_cart_number_jian: function () {
    var that = this
    var this_default_number = parseInt(that.data.cart_default_number)
    if (this_default_number > 1) {
      that.setData({
        cart_default_number: this_default_number - 1
      })
    } else {
      that.setData({
        cart_default_number: 1
      })
    }
  },
  //增加数量
  bind_cart_number_jia: function () {
    var that = this
    var this_default_number = parseInt(that.data.cart_default_number)
    let g_number = parseInt(this.data.goods_info.g_number)
    if (this_default_number >= g_number) {
      wx.showToast({
        title: '购买数量不能超过库存！',
        icon: 'success',
        duration: 1500,
      })
    } else {
      that.setData({
        cart_default_number: this_default_number + 1
      })
    }
  },
  //属性选择
  select_attr_bind: function (e) {
    var that = this
    var this_attr_id = e.currentTarget.id
    var this_attr_name = e.currentTarget.dataset.type
    var datas = that.data.goods_specification
    var this_spec_price = 0;
    var a_datas = that.data.goods_attr_select
    var g_datas = that.data.goods_info
    for (var i = 0; i < datas.length; i++) {
      if (datas[i].name == this_attr_name) {
        a_datas[datas[i].name] = null
        for (var j = 0; j < datas[i].values.length; j++) {
          datas[i].values[j].ischeck = false
          if (datas[i].values[j].id == this_attr_id) {
            datas[i].values[j].ischeck = true
            a_datas[datas[i].name] = this_attr_id
            if (datas[i].values[j].format_price > 0) {
              g_datas.shop_price = datas[i].values[j].format_price
            }
          }
        }
      }
    }
    that.setData({
      goods_specification: datas,
      goods_attr_select: a_datas,
      goods_info: g_datas
    })
  },
  //进入支付页面
  goods_add_cart: function () {
    // 库存为零，不能购买
    let g_number = parseInt(this.data.goods_info.g_number)
    if (g_number < 1) {
      wx.showToast({
        title: '商品已售完！',
        icon: 'success',
        duration: 1500
      })
      return false
    }

    // 限制拼团购买数量为1件商品
    let buy_type = parseInt(this.data.buy_type)
    let cart_default_number = parseInt(this.data.cart_default_number)
    if ((cart_default_number > this.data.goods_info.tuan_max_num && this.data.goods_info.tuan_max_num > 0) && this.data.buy_type==2) {
      wx.showToast({
        title: '超过商品数量限制！',
        icon: 'success',
        duration: 1500
      })
      return false
    }
    var that = this
    that.setData({
      btn_add_cart_disabled: true,
      submitIsLoading: true
    })
    let option = {
      gid: that.data.this_goods_id,
      gnumber: that.data.cart_default_number,
      gattr: that.data.goods_attr_select,
      btype: that.data.buy_type,
      chengtuan_id: that.data.this_chengtuan_id,
    }
    if(that.data.goods_info.tuan_type==2){
      if (that.data.selectStandard < 1 && that.data.buy_type==2){
        wx.showToast({
          title: '请选择开团规格',
          icon:'none'
        })
        that.setData({
          btn_add_cart_disabled: false,
          submitIsLoading: false
        })
        return;
      }
      option.standard = that.data.selectStandard;
    }

    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/addGoodsCart.html", option, (data) => { that.initAddCartData(data) }, this, {
      isShowLogin: false, 'complete': () => {
        that.setData({
          btn_add_cart_disabled: false,
          submitIsLoading: false
        })
        wx.hideLoading()
        wx.hideToast()
      }
    });
  },
  initAddCartData: function (data) {
    var that = this
    that.setData({
      btn_add_cart_disabled: false,
      submitIsLoading: false
    })
    wx.redirectTo({
      url: '../order/order'
    })
  },
  buy_order_bind: function () {
    wx.redirectTo({
      url: '/pages/tuan/tuan/info/index?oid=' + this.data.oid
    })
  },
  onShareAppMessage: function () {
    var that = this
    that.setData({
      show_sharing: false
    });
    return {
      title: that.data.goods_info.g_name || '',
      desc: '',
      path: '/pages/tuan/info/info?tid=' + that.data.goods_info.id
    }
  },
  shareToFriendsCircle: function (e) {
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url,
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that = this
    //请求商品详情
    // _function.getTuanGoodsInfo(that.data.this_goods_id,that.initGoodsInfoData,that)
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsInfo.html", { sid: that.data.this_goods_id }, (data) => { that.initGoodsInfoData(data) }, this, { isShowLoading: false });

    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },
  // 跳转帮助
  bind_help: function () {
    wx.navigateTo({
      url: '/pages/tuan/rebate-rule/index',
    })
  },
  //返回首页
  bind_go_home: function (e) {
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
  },
  //拼团一键推广
  buy_extension_bind: function (e) {
    var that = this
    if (that.data.btn_submit_disabled) {
      return;
    }
    that.setData({
      btn_submit_disabled: true
    })
    if (that.data.goods_tuan_status == false) {
      wx.showModal({
        title: '提示',
        content: '对不起，该商品拼团时间已结束，暂无法推广',
        showCancel: false
      })
      that.setData({
        btn_submit_disabled: true
      })
      return false
    }
    var rid = e.target.dataset.id;
    wx.showLoading({
      title: '请稍后...',
    })
    //发送推广信息
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/addExtension.html", { gid: that.data.goods_info.id, rid: rid }, (data) => {
      wx.redirectTo({
        url: '/pages/tuan/join/join?tid=' + data.tid
      });
    }, this, {
        isShowLoading: false, completeAfter: function () {
          wx.hideLoading()
          that.setData({
            btn_submit_disabled: false
          })
        }
      });
  },
  swiperChange: function (e) {
    //监听当前轮播图的current
    var that = this;
    if (e.detail.current != 0) {
      wx.createVideoContext('myvideo').pause()
      that.setData({
        videoPlay: false
      })
    }
  },
  controlPlay: function (e) {
    var that = this;
    if (that.data.videoPlay) {
      wx.createVideoContext('myvideo').pause()
      that.setData({
        videoPlay: false
      })
    } else {
      wx.createVideoContext('myvideo').play()
      that.setData({
        videoPlay: true
      })
    }
  },
  //拨打电话
  bindCall: function (e) {
    var phone = e.currentTarget.dataset.id;
    //console.log(phone);
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: function (res) {
        //console.log(res);
      }
    })
  },
  //店铺的更多拼团
  moreStore: function (e) {
    var store_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/tuan/shop-center/index?sid=' + store_id,
    })
  },
  starPlay: function () {
    this.setData({
      s_play: false,
    })
  },
  endPlay: function () {
    this.setData({
      s_play: true,
    })
  },
  //隐藏分享方式弹窗
  bind_cancel_sharing: function () {
    var that = this
    that.setData({
      show_sharing: false
    });
  },
  //显示分享方式弹窗
  tuan_sharing_bind: function () {
    var that = this
    that.setData({
      show_sharing: true
    });
  },
  //生成海报
  bind_poster_sharing: function () {
    var that = this
    that.setData({
      show_sharing: false
    });
    var url = '/pages/tuan/share/share?gid=' + that.data.goods_info.id
    wx.redirectTo({
      url: url
    })
  },
  onUnload: function () {
    this.setData({
      s_play: false
    })
  },
  //选择拼团规格
  checkStandard: function (e) {
    var standard_id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var goods_info = this.data.goods_info;
    console.log(goods_info.standard,index);
    goods_info.tuan_price = goods_info.standard[index].price;
    goods_info.tuan_num = goods_info.standard[index].num;
    this.setData({
      selectStandard: standard_id,
      goods_info: goods_info
    })
  }
})