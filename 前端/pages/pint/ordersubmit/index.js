// pages/order/ordersubmit/index.js
var server = require('../../../utils/server');
var tp;
var pay_points;
var points_rate;
Page({
  data: { use_money: 0, express_price: 0, use_point: 0, check: ['true', ''], "coupon": [], cv: '请选择优惠劵', cpos: -1, "couponCode": '', "pay_type_list": '', "payment": 'weixin' },
  bindChange: function (e) {

    var use_money = e.detail.value;

    this.setData({
      use_money: use_money,
    });
  },
  bindChangeOfcoupon: function (e) {
    var couponCode = e.detail.value;

    this.setData({
      couponCode: couponCode,
    });
  },
  bindChangeOfPoint: function (e) {
    var use_point = e.detail.value;
    this.setData({
      use_point: use_point,
    });
  },
  bindPickerChange: function (e) {
    var value = e.detail.value;
    var cv = this.data.coupon[value];
    this.setData({ cv: cv, cpos: value });
    this.useCoupon();
  },
  useCoupon: function () {
    if (this.data.cpos == -1)
      return;
    var money = this.data.couponList[this.data.cpos].money;
    var totalObj = this.data.totalPrice;
    var m = tp - money;
    totalObj.total_fee = m
    if (totalObj.total_fee < 0)
      totalObj.total_fee = 0;
    this.setData({ totalPrice: totalObj });
  },
  use: function () {
    //totalPrice:
    var user_money = getApp().globalData.userInfo.user_money;
    var use_money = this.data.use_money;
    user_money = parseFloat(user_money)
    use_money = parseFloat(use_money)
    if (user_money < use_money) {
      var totalObj = this.data.totalPrice;

      var use_point = this.data.use_point;
      var use_point = parseInt(use_point)
      use_point = use_point - use_point % parseInt(points_rate);
      var m = tp - use_point / parseInt(points_rate)
      totalObj.total_fee = m
      this.setData({ totalPrice: totalObj });

      this.useCoupon();

      this.setData({ use_money: 0 });
      wx.showToast({
        title: '请输入小余当前余额',
        duration: 1000
      });
      return;
    }
    var use_point = this.data.use_point;
    var use_point = parseInt(use_point)
    use_point = use_point - use_point % parseInt(points_rate);
    var m = tp - use_point / parseInt(points_rate)

    var totalPrice = m - use_money;
    if (totalPrice < 0)
      totalPrice = 0;
    var totalObj = this.data.totalPrice;
    totalObj.total_fee = totalPrice
    this.setData({ totalPrice: totalObj });

    this.useCoupon();
  },
  use_point: function () {
    //totalPrice:
    var user_point = pay_points;
    var use_point = this.data.use_point;
    use_point = parseInt(use_point)
    use_point = use_point - use_point % parseInt(points_rate);
    if (parseInt(user_point) < use_point) {
      var totalObj = this.data.totalPrice;
      var m = tp - this.data.use_money
      totalObj.total_fee = m
      this.setData({ totalPrice: totalObj });

      this.setData({ use_point: 0 });
      this.useCoupon();
      wx.showToast({
        title: '请输入小余当前积分',
        duration: 1000
      });
      return;
    }
    var m = tp - this.data.use_money;
    var totalPrice = m - (use_point / parseInt(points_rate));
    if (totalPrice < 0)
      totalPrice = 0;
    var totalObj = this.data.totalPrice;
    totalObj.total_fee = totalPrice
    this.setData({ totalPrice: totalObj });
    this.useCoupon();
  },
  onShow: function () {
    var app = getApp();
    var cartIds = app.globalData.cartIds;
    var amount = app.globalData.amount;
    this.setData({ cartIds: cartIds, amount: amount });
    this.getCarts(cartIds);
    // 页面初始化 options为页面跳转所带来的参数
  },
  initData: function () {
    var app = getApp();
    pay_points = app.globalData.userInfo.pay_points;
    var user_money = app.globalData.userInfo.user_money;
    this.setData({ freemoney: user_money, pay_points: pay_points });
  },
  formSubmit: function (e) {
    if (this.data.address == null) {
      wx.showToast({
        title: "请选择收货地址",
        duration: 2000
      });
      return;
    } else {

      var address_id = this.data.address.address_id;
    }

    var user_id = getApp().globalData.userInfo.user_id
    var use_money = this.data.use_money
    var pay_points = this.data.use_point
    var that = this;
    var app = getApp();
    var couponTypeSelect = this.data.check[0] == "true" ? 1 : 2;
    var coupon_id = 0;
    if (this.data.cpos != -1) {
      coupon_id = this.data.couponList[this.data.cpos].id;
    }
    var couponCode = this.data.couponCode;
    var pay_code = this.data.payment;
    server.getJSON('/Cart/cart3/act/submit_order/user_id/' + user_id + "/address_id/" + address_id + "/user_money/" + use_money + "/pay_points/" + pay_points + "/couponTypeSelect/" + couponTypeSelect + "/coupon_id/" + coupon_id + "/pay_code/" + pay_code + "/couponCode/" + couponCode, function (res) {
      var pint_id = res.data.order[0].order_prom_id;

      if (res.data.status != 1) {
        wx.showToast({
          title: res.data.msg,
          duration: 2000
        });
        return;
      }
      if (res.data.data.pay_money == 0) {
        wx.showToast({
          title: "订单提交成功",
          duration: 2000
        });
        setTimeout(function () {
          wx.redirectTo({
            url: "../group/details?pint_id=" + pint_id
          });
        }, 2000);
        return;
      }
      app.globalData.wxdata = res.data.data
      var wxdata = app.globalData.wxdata.wdata
      var timeStamp = wxdata.timeStamp + "";
      var nonceStr = wxdata.nonceStr + "";
      var package1 = wxdata.package
      var sign = wxdata.sign;
      wx.requestPayment({
        'nonceStr': nonceStr,
        'package': package1,
        'signType': 'MD5',
        'timeStamp': timeStamp,
        'paySign': sign,
        'success': function (res) {
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function () {
            wx.redirectTo({
              url: "/pages/pint/group/details?pint_id=" + pint_id
            });
          }, 2000);
        },
        'fail': function (res) {
          wx.showToast({
            title: '支付失败',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function () {
            wx.redirectTo({
              url: "../../index/index"
            });
          }, 1000);
        }
      })
    });
  },

  getCarts: function (cartIds) {
    var user_id = getApp().globalData.userInfo.user_id
    var that = this
    var app = getApp()

    server.getJSON('/Cart/cart2/user_id/' + user_id, function (res) {
      var user_data = app.globalData.userInfo;

      if (res.data.result) {
        user_data.user_money = res.data.result.userInfo.user_money;
        user_data.pay_points = res.data.result.userInfo.pay_points;
        app.globalData.userInfo = user_data
        var address = res.data.result.addressList
        var cartList = res.data.result.cartList
        var userInfo = res.data.result.userInfo
        var totalPrice = res.data.result.totalPrice
        var express_price = res.data.result.express_price
        var pay_type_list = res.data.result.paymentList
        tp = totalPrice.total_fee
        points_rate = res.data.result.points
        that.setData({ address: address, cartList: cartList, userInfo: userInfo, totalPrice: totalPrice, express_price: express_price, pay_type_list: pay_type_list });

        var couponList = res.data.result.couponList
        var ms = that.data.coupon
        for (var i in couponList) {
          ms.push(couponList[i].name);
        }
        that.setData({ coupon: ms, couponList: couponList });
        that.initData();
      } else {
        wx.redirectTo({
          url: "../../member/index/index"
        });
        return;
      }
    })
  },
  check1: function () {
    this.setData({ check: ['true', ''] });
  },
  check2: function () {
    this.setData({ check: ['', 'true'] });
  },

  showCouponPicker: function () {
    var t = this;
    t.data.couponList && t.data.couponList.length > 0 && t.setData({
      show_coupon_picker: !0
    })
  },
  pickCoupon: function (t) {
    var a = this,
      e = t.currentTarget.dataset.index;
    "-1" == e || -1 == e ? a.setData({
      picker_coupon: !1,
      show_coupon_picker: !1
    }) : a.setData({
      picker_coupon: a.data.couponList[e].money,
      cpos: e,
      show_coupon_picker: !1
    }),
      a.useCoupon()
  },
  showPayment: function () {
    this.setData({
      show_payment: !0
    })
  },
  payPicker: function (t) {
    var a = t.currentTarget.dataset.index;
    this.setData({
      payment: a
    })
  },
  payClose: function () {
    this.setData({
      show_payment: !1
    })
  },
  onLoad: function (options) {
    var exit = false;
    var that = this
    var app = getApp();
    var cartIds = options.cartIds;
    var amount = options.amount;

    app.globalData.cartIds = cartIds;
    app.globalData.amount = amount;
    this.setData({ cartIds: cartIds, amount: amount });
    if (!app.globalData.login) {
      exit = true;
      wx.redirectTo({
        url: '/pages/member/index/index'
      });

    }
  }
})