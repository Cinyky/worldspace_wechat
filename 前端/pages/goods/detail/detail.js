var server = require('../../../utils/server');
var WxParse = require('../../../wxParse/wxParse.js');
var utils = require('../../../utils.js');
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
// 实例化API核心类
var demo = new QQMapWX({
  key: '3PYBZ-C5KWU-VLUVJ-4Q4YP-EJ25J-BQFCL' // 必填
});
Page({
  data: {
    goods: {},
    current: 0,
    tabStates: [true, false, false],
    tabClasss: ["text-select", "text-normal", "text-normal"],
    galleryHeight: getApp().screenWidth,
    tab: 0,
    goods_num: 1,
    textStates: ["view-btns-text-normal", "view-btns-text-select"],
    parent_id: 0,
    shop_name: '',
    show_attr_picker: !1,
    form: {
      number: 1
    },
    tab_detail: "active",
    tab_comment: "",
    goods_qrcode:"",
    xiajia: 0,
  },
  //点击不同的属性进行切换
  propClick: function (e) {
    var pos = e.currentTarget.dataset.pos;
    var index = e.currentTarget.dataset.index;
    var goods = this.data.goods
    for (var i = 0; i < goods.goods.goods_spec_list[index].length; i++) {

      if (i == pos)
        goods.goods.goods_spec_list[index][pos].isClick = 1;
      else
        goods.goods.goods_spec_list[index][i].isClick = 0;
    }
    this.setData({ goods: goods });
    this.checkPrice();
  },
  //加入收藏
  addCollect: function (e) {
    var goods_id = e.currentTarget.dataset.id;
    var user_id = getApp().globalData.userInfo.user_id;
    var ctype = 0;
    var t = this;
    server.getJSON('/Goods/collectGoods/user_id/' + user_id + "/goods_id/" + goods_id + "/type/" + ctype, function (res) {
      wx.showToast({
        title: res.data.msg,
        icon: 'success',
        duration: 2000
      });
      var o = t.data.goods;
      o.goods.is_favorite = 1,
        t.setData({
          goods: o
        })
    });
  },
  //取消收藏
  RemoveCollect: function (e) {
    var goods_id = e.currentTarget.dataset.id;
    var user_id = getApp().globalData.userInfo.user_id;
    var ctype = 1;
    var t = this;
    server.getJSON('/Goods/collectGoods/user_id/' + user_id + "/goods_id/" + goods_id + "/type/" + ctype, function (res) {
      wx.showToast({
        title: res.data.msg,
        icon: 'success',
        duration: 2000
      });
      var o = t.data.goods;
      o.goods.is_favorite = 0,
        t.setData({
          goods: o
        })
    });
  },
  onLoad: function (options) {
    var goodsId = options.objectId;
    var parent_id = options.uid;
    var app = getApp();

    var scene = decodeURIComponent(options.scene);
     if (scene != undefined) {
      var scene_obj = utils.scene_decode(scene);
      if (scene_obj.uid && scene_obj.gid) {
        parent_id = scene_obj.uid;
        goodsId = scene_obj.gid;
      }
    }
     
     var _navbar = app.globalData._navbar;
     this.setData({
       _navbar: _navbar
     });
     if (parent_id) {
      app.globalData.parent_id = parent_id;
     }
     if (goodsId){
       app.globalData.goodsId = goodsId;
     }
     var openId = app.globalData.openid;
    var that=this;
    app.getOpenId(function () {

      var openId = app.globalData.openid;
      server.getJSON("/User/validateOpenid", { openid: openId }, function (res) {

        if (res.data.code == 200) {
          app.globalData.userInfo = res.data.data;
          app.globalData.login = true;
        }
        else {
          if (res.data.code == '400') {
	  
		          app.redirectTo("../../login/login");

          }
        }
        that.getGoodsById(goodsId);
        that.addLiulan(goodsId);
      });

    });
  },
  addLiulan: function (goodsId) {
    var goods_id = goodsId;
    var user_id = getApp().globalData.userInfo.user_id;
    var ctype = 0;
    var t = this;
    server.getJSON('/Goods/liulanGoods/user_id/' + user_id + "/goods_id/" + goods_id + "/type/" + ctype, function (res) {});
  },
  onShareAppMessage: function () {
    var goods_name = this.data.goods.goods.goods_name;
    var objectId = this.data.goods.goods.goods_id;
    var app = getApp()
    if (app.globalData.login)
      var user_id = app.globalData.userInfo.user_id;
    return {
      title: goods_name,
      //path: '/pages/index/index?uid=' + user_id + '&objectId=' + objectId,
      path: '/pages/goods/detail/detail?objectId=' + objectId + '&uid=' + user_id,
    }
  },
  tabClick: function (e) {
    var index = e.currentTarget.dataset.index
    var classs = ["text-normal", "text-normal", "text-normal"]
    classs[index] = "text-select"
    this.setData({ tabClasss: classs, tab: index })
  },
  getGoodsById: function (goodsId) {
    var that = this;
    var user_id = getApp().globalData.userInfo.user_id;
    server.getJSON('/Goods/goodsInfo/id/' + goodsId + '/user_id/' + user_id, function (res) {
      var goodsInfo = res.data.result;
      WxParse.wxParse('article', 'html', goodsInfo.goods.goods_content, that, 5);
      var is_on_sale = res.data.result.goods.is_on_sale;
      if (is_on_sale==0){
        that.setData({
          xiajia: 1
        });
      }
      that.setData({
        goods: goodsInfo
      });
      that.checkPrice();
    });
  },

  showDianpu: function (e) {
    var store_id = e.currentTarget.dataset.store_id;
    wx.navigateTo({
      url: '../../seller/seller/seller?store_id=' + store_id
    })
  },

  checkPrice: function () {
    var goods = this.data.goods;
    var spec = ""
    this.setData({ price: goods.goods.shop_price });
    if (goods.goods.goods_spec_list != null) {
      for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {

        for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
          if (goods.goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "")
              spec = goods.goods.goods_spec_list[i][j].item_id
            else
              spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
          }
        }
      }
      var specs = spec.split("_");
      for (var i = 0; i < specs.length; i++) {
        specs[i] = parseInt(specs[i])
      }
      specs.sort(function (a, b) { return a - b });
      spec = ""
      for (var i = 0; i < specs.length; i++) {
        if (spec == "")
          spec = specs[i]
        else
          spec = spec + "_" + specs[i]
      }
      var price = goods['spec_goods_price'][spec].price;
      this.setData({ price: price });
    }
  },

  bug: function () {
    var a = this;
    if (!a.data.show_attr_picker)
      return a.setData({
        show_attr_picker: !0
      }), !0;
    var goods = this.data.goods;
    var spec = ""
    if (goods.goods.goods_spec_list != null)
      for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {

        for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
          if (goods.goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "")
              spec = goods.goods.goods_spec_list[i][j].item_id
            else
              spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
          }
        }
      }
    var app = getApp()
    var that = this;
    var goods_id = that.data.goods.goods.goods_id;
    var goods_spec = spec;
    var session_id = app.globalData.openid//that.data.goods.goods.spec_goods_price
    var goods_num = that.data.form.number;;

    var user_id = "0"
    if (app.globalData.login)
      user_id = app.globalData.userInfo.user_id
    //立即购买先清空购物车
    server.getJSON('/Cart/emptyCart', { session_id: session_id, user_id: user_id });

    server.getJSON('/Cart/addCart', { goods_id: goods_id, goods_spec: goods_spec, session_id: session_id, goods_num: goods_num, user_id: user_id }, function (res) {
      that.setData({
        show_attr_picker: !1
      })
      if (res.data.status == 1) {
        wx.navigateTo({
          url: '../../order/ordersubmit/index?cartIds=' + goods_id + '&amount=' + goods_num * goods.goods.shop_price
        });
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 2000
        });
      }
    });
    return;
  },
  addCart: function () {
    var a = this;
    if (!a.data.show_attr_picker)
      return a.setData({
        show_attr_picker: !0
      }), !0;
    var goods = this.data.goods;
    var spec = ""
    if (goods.goods.goods_spec_list != null)
      for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {

        for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
          if (goods.goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "")
              spec = goods.goods.goods_spec_list[i][j].item_id
            else
              spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
          }
        }
      }
    var app = getApp()
    var that = this;
    var goods_id = that.data.goods.goods.goods_id;
    var goods_spec = spec;
    var session_id = app.globalData.openid//that.data.goods.goods.spec_goods_price
    var goods_num = that.data.goods_num;
    var user_id = "0"
    if (app.globalData.login)
      user_id = app.globalData.userInfo.user_id
    server.getJSON('/Cart/addCart', { goods_id: goods_id, goods_spec: goods_spec, session_id: session_id, goods_num: goods_num, user_id: user_id }, function (res) {
      if (res.data.status == 1) {
        if (res.data.shopExist == 0) {
        var _navbar = getApp().globalData._navbar;
        for (var i = 0; i < _navbar.length; i++) {
          if (_navbar[i].url == "/pages/cart/cart") {
            _navbar[i].is_shownum = parseInt(_navbar[i].is_shownum) + 1;
          }
        };
        that.setData({
          _navbar: _navbar
        })
        }
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 1000
        });
        that.setData({
          show_attr_picker: !1,
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 1000
        });
        that.setData({
          show_attr_picker: !1
        })
      }
    });
  },
  previewImage: function (e) {
    wx.previewImage({
      //从<image>的data-current取到current，得到String类型的url路径
      current: this.data.goods.get('images')[parseInt(e.currentTarget.dataset.current)],
      urls: this.data.goods.get('images') // 需要预览的图片http链接列表
    })
  },
  hideAttrPicker: function () {
    this.setData({
      show_attr_picker: !1
    })
  },
  showAttrPicker: function () {
    this.setData({
      show_attr_picker: !0
    })
  },
  numberSub: function () {
    var t = this,
      a = t.data.form.number;
    if (a <= 1) return !0;
    a-- ,
      t.setData({
        form: {
          number: a
        }
      })
  },
  numberAdd: function () {
    var t = this,
      a = t.data.form.number;
    a++ ,
      t.setData({
        form: {
          number: a
        }
      })
  },
  numberBlur: function (t) {
    var a = this,
      o = t.detail.value;
    o = parseInt(o),
      isNaN(o) && (o = 1),
      o <= 0 && (o = 1),
      a.setData({
        form: {
          number: o
        }
      })
  },
  showShareModal: function () {
    this.setData({
      share_modal_active: "active",
      no_scroll: !0
    })
  },
  shareModalClose: function () {
    this.setData({
      share_modal_active: "",
      no_scroll: !1
    })
  },
  tabSwitch: function (t) {
    var a = this;
    "detail" == t.currentTarget.dataset.tab ? a.setData({
      tab_detail: "active",
      tab_comment: ""
    }) : a.setData({
      tab_detail: "",
      tab_comment: "active"
    })
  },
  getGoodsQrcode: function () {
    var page = this;
    page.setData({
      goods_qrcode_active: "active",
      share_modal_active: "",
    });
    if (page.data.goods_qrcode)
      return true;
    var goods_id = page.data.goods.goods.goods_id;
    var user_id = getApp().globalData.userInfo.user_id;
    server.getJSON('/Goods/goodsQrcode', { goods_id: goods_id,user_id:user_id }, function (res) {
      if (res.data.code == 0) {
        page.setData({
          goods_qrcode: res.data.data.pic_url,
        });
      }
      if (res.data.code == 1) {
        page.goodsQrcodeClose();
        wx.showModal({
          title: "提示",
          content: res.data.msg,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {

            }
          }
        });
      }
    });
  },
  goodsQrcodeClose: function () {
    var page = this;
    page.setData({
      goods_qrcode_active: "",
      no_scroll: false,
    });
  },

  saveGoodsQrcode: function () {
    var page = this;
    if (!wx.saveImageToPhotosAlbum) {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
        showCancel: false,
      });
      return;
    }

    wx.showLoading({
      title: "正在保存图片",
      mask: false,
    });

    wx.downloadFile({
      url: page.data.goods_qrcode,
      success: function (e) {
        wx.showLoading({
          title: "正在保存图片",
          mask: false,
        });
        wx.saveImageToPhotosAlbum({
          filePath: e.tempFilePath,
          success: function () {
            wx.showModal({
              title: '提示',
              content: '商品海报保存成功',
              showCancel: false,
            });
          },
          fail: function (e) {
            wx.showModal({
              title: '图片保存失败',
              content: e.errMsg,
              showCancel: false,
            });
          },
          complete: function (e) {
            wx.hideLoading();
          }
        });
      },
      fail: function (e) {
        wx.showModal({
          title: '图片下载失败',
          content: e.errMsg + ";" + page.data.goods_qrcode,
          showCancel: false,
        });
      },
      complete: function (e) {
        wx.hideLoading();
      }
    });

  },

  goodsQrcodeClick: function (e) {
    var src = e.currentTarget.dataset.src;
    wx.previewImage({
      urls: [src],
    });
  },

  gotoshop:function (){
    var store_id = this.data.goods.goods.store_id;
    wx.navigateTo({
      url: '../../seller/seller/seller?store_id=' + store_id
    })
  },
  
  kefu:function (){
    var store_phone = this.data.goods.store.store_phone;
    wx.makePhoneCall({
      phoneNumber: store_phone //仅为示例，并非真实的电话号码
    })
  },
  getAddress: function (e) {
    const d = e.currentTarget.dataset;
    const name = d.name;
    const address = d.address;
    var latitude=this.data.goods.store.la;
    latitude = parseFloat(latitude);
    var longitude = this.data.goods.store.lo;
    longitude = parseFloat(longitude);
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 18,
      name: d.name,
      address: address,
      success: function (res) {

      },
      fail: function (res) {

      },
      success: function (res) {

      }
    })
  },

});