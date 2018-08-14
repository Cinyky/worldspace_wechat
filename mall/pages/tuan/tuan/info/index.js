// mallcart.js
var _function = require('../../../../utils/functionData');
const requestUtil = require('../../../../utils/requestUtil');
const _DuoguanData = require('../../../../utils/data');
const QR = require('../../../../utils/qrcode');
var app = getApp()
Page({
  data: {
    this_order_id: 0,
    oinfo: [],
    submitIsLoading: false,
    buttonIsDisabled: false,
    glo_is_load: true,
    tuan_text: '',
    confirm_code_show: false,
    share_text: '查看拼团详情'

  },
  // quhuo: function () {
  //   var that = this
  //   wx.showModal({
  //     title: '提示',
  //     content: '确认已经到店取货？',
  //     success: function (res) {
  //       console.log(res)
  //       if (res.confirm) {
  //         requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/OrderApi/quhuoUserOrder.html',
  //           { oid: that.data.this_order_id },
  //           (data) => {
  //             wx.showToast({
  //               title: '取货成功',
  //               icon: 'success',
  //               duration: 2000
  //             })
  //             requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/Api/getTuanConfig.html',
  //               { tid: that.data.this_tuan_id },
  //               (data) => {
  //                 that.setData({
  //                   config: data
  //                 })
  //               }, that, { isShowLoading: false });
  //             //请求订单详情
  //             // _function.getTuanOrderInfo(wx.getStorageSync("utoken"), that.data.this_order_id, that.initgetOrderInfoData, that)
  //             requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/orderInfo.html", { oid: that.data.this_order_id }, (data) => { that.initgetOrderInfoData(data) }, this);


  //           }, that, { isShowLoading: false });
  //       }
  //     }
  //   })
  // },
  //查看物流
  wuliu_info_bind: function () {
    var that = this;
    if (that.data.oinfo.express_code == '' || that.data.oinfo.express_code == null) {
      wx.showModal({
        title: '提示',
        content: '对不起，该订单暂无物流信息',
        showCancel: false
      });
      return false;
    } else {
      wx.navigateTo({
        url: '../../../tuan/wuliu/index?oid=' + that.data.oinfo.id
      })
    }
  },
  onLoad: function (options) {
    var that = this
    var order_id = options.oid;
    that.setData({
      this_order_id: order_id,
    })
    requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/Api/getTuanConfig.html',
      { tid: that.data.this_tuan_id },
      (data) => {
        that.setData({
          config: data
        })
      }, this, { isShowLoading: false });
    //请求订单详情
    // _function.getTuanOrderInfo(wx.getStorageSync("utoken"),that.data.this_order_id,that.initgetOrderInfoData,that);
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/orderInfo.html", { oid: that.data.this_order_id }, (data) => { that.initgetOrderInfoData(data) }, this, { isShowLoading: false });
  },
  initgetOrderInfoData: function (data) {
    var that = this
    //计算订单金额
    console.log(data)
    if (data.handle_amount > 0 && (data.handle_amount != data.order_amount)){
      data.order_amount = data.handle_amount;
      console.log(data.handle_amount)
    }
    //判断是否生成核销二维码
    if (data.shipping_name == "到店自提" && data.txt_status == '002') {
      that.createQrCode(data.confirm_code, 'mycanvas');
      that.setData({
        confirm_code_show: true,
      })
    }
    //判断当前拼团的状态
    var tuan = '';
    if (data.btype == 2) {
      if (data.btype_status == 0) {
        tuan = "拼团中"
        that.setData({
          share_text: '找小伙伴凑单'
        })
      } else if (data.btype_status == 1) {
        tuan = "拼团成功"
      } else if (data.btype_status == 2) {
        tuan = "拼团失败"
      }
    }
    // 计算返佣金
    that.setData({
      oinfo: data,
      glo_is_load: false,
      tuan_text: tuan
    })

    if (that.data.oinfo.tuan_end_time != 0) {
      that.getShengTime(that.data.oinfo.tuan_end_time)
    }

  },
  //开始支付
  order_go_pay_bind: function () {
    var that = this
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000
    })
    that.setData({
      buttonIsDisabled: true,
      submitIsLoading: true
    })
    // _function.makeTuanOrderPayData(wx.getStorageSync("utoken"),that.data.this_order_id,that.initMakeOrderPayData,this)
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/makePay.html", { oid: that.data.this_order_id }, (data) => { that.initMakeOrderPayData(data) }, this, {
      'complete': () => {
        wx.hideToast();       
        that.setData({
          buttonIsDisabled: false,
          submitIsLoading: false
        })
      }});
  },
  initMakeOrderPayData: function (data) {
    var that = this
   
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': 'MD5',
      'paySign': data.paySign,
      'complete': function () {
        //支付完成 刷新
        wx.redirectTo({
          url: '/pages/tuan/tuan/info/index?oid=' + that.data.this_order_id
        })

      }
    })
  },
  //评论
  order_go_comment_bind: function () {
    var order_id = this.data.this_order_id
    wx.redirectTo({
      url: '../comment/index?order_id=' + order_id
    })
  },
  //确认收货
  order_go_shouhuo_bind: function () {
    var that = this
    var order_id = this.data.this_order_id
    wx.showModal({
      title: '提示',
      content: "确认收货吗?",
      success: function (res) {
        if (res.confirm == true) {
          // _function.shouhuoTuanOrderInfo(wx.getStorageSync("utoken"),order_id,that.initshouhuoOrderInfoData,this)
          requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/shouhuoUserOrder.html", { oid: order_id }, (data) => { that.initshouhuoOrderInfoData(data) }, this);
        }
      }
    })
  },
  initshouhuoOrderInfoData: function (data) {
    var that = this
    // _function.getTuanOrderInfo(wx.getStorageSync("utoken"),that.data.this_order_id,that.initgetOrderInfoData,this)
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/orderInfo.html", { oid: that.data.this_order_id }, (data) => { that.initgetOrderInfoData(data) }, this);

  },
  //创建二维码
  createQrCode: function (url, canvasId) {
    //调用插件中的draw方法，绘制二维码图片
    QR.qrApi.init(url, canvasId, 0, 0, 150, 150);

  },
  //获取倒计时时间
  getShengTime: function (endtime) {
    var that = this
    var tdatas = that.data.oinfo
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
      tdatas.tuan_sheng_time = '剩余' + h + ':' + m + ':' + s + '结束'
      setTimeout(function () {
        that.getShengTime(endtime);
      }
        , 1000)
    } else {
      tdatas.tuan_sheng_time = '已结束'
      that.setData({
        tuan_text: '拼团失败',
        share_text: '查看拼团详情'
      });
    }
    that.setData({
      oinfo: tdatas
    })
  },
  //拼团详情
  go_share: function () {
    var tid = this.data.oinfo['chengtuan_id'];
    wx.navigateTo({
      url: '../../join/join?tid=' + tid
    })
  },
  // 跳转帮助
  bind_help: function () {
    wx.navigateTo({
      url: '/pages/tuan/rebate-rule/index',
    })
  },
  //跳转福包
  bind_award: function () {
    wx.navigateTo({
      url: '/pages/user/red-packet/records/index?type=tuan_record',
    })
  },
  mapNavigation: function (e) {
    var that = this
    console.log(typeof (that.data.oinfo.quaddress.store_gps_lat))
    wx.openLocation({
      latitude: parseFloat(that.data.oinfo.site_id > 0 ? that.data.oinfo.site_info.latitude:that.data.oinfo.quaddress.store_gps_lat),
      longitude: parseFloat(that.data.oinfo.site_id > 0 ? that.data.oinfo.site_info.longitude:that.data.oinfo.quaddress.store_gps_lng)
    })
  },
  //店铺的更多拼团
  moreStore: function (e) {
    var store_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/tuan/shop-center/index?sid=' + store_id,
    })
  }
})