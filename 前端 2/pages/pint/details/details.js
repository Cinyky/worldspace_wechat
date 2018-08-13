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
    day: 0,
    hou: 0,
    min: 0,
    sec: 0,
    pint_num: 0,
    pint:[],
    friend_id:0
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
    var friend_id = options.pid;
    var parent_id = options.uid;
    var app = getApp();
    if (friend_id) {
      var that = this;
      that.setData({ friend_id: friend_id })
    }
    // console.log("options=>" + JSON.stringify(options));
    var scene = decodeURIComponent(options.scene);
    // console.log("scene string=>" + scene);
     if (scene != undefined) {
      // console.log("scene string=>" + scene);
      var scene_obj = utils.scene_decode(scene);
      // console.log("scene obj=>" + JSON.stringify(scene_obj));
      if (scene_obj.gid) {
         goodsId = scene_obj.gid;
      }
    }
     app.globalData.parent_id = parent_id;
     var openId = app.globalData.openid;
    var that=this;
    app.getOpenId(function () {

      var openId = app.globalData.openid;
      server.getJSON("/User/validateOpenid", { openid: openId }, function (res) {

        if (res.data.code == 200) {

          if (res.data.data.mobile > 0) {
            app.globalData.is_phone = 0;
          }
          app.globalData.userInfo = res.data.data;
          app.globalData.login = true;
        }
        else {
          if (res.data.code == '400') {
            app.register(function () {
              app.globalData.login = true;
            });
          }
        }
        if (parent_id) {
          server.getJSON("/User/updateparent/openid/" + openId + "/parent_id/" + parent_id, function (res) {
            if (res.data.status == 1) {
              var result = res.data.result.nick_name;
              wx.showToast({
                title: '上级:' + result,
                icon: 'success',
                duration: 2000
              })
            } else {

            }
          });
        }
        // console.log(that.data)
        that.getPintInfo(options.gid);
        that.getGoodsById(options.gid);
        that.addLiulan(options.gid);
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
    // console.log("ggg"+goodsId)
    var that = this;
    var user_id = getApp().globalData.userInfo.user_id;
    server.getJSON('/Goods/goodsInfo/id/' + goodsId + '/user_id/' + user_id, function (res) {
    // server.getJSON('/Goods/goodsInfo/id/190/user_id/' + user_id, function (res) {
      var goodsInfo = res.data.result;
      WxParse.wxParse('article', 'html', goodsInfo.goods.goods_content, that, 5)
      that.setData({
        goods: goodsInfo
      });
      if (goodsInfo.stop_time.stu>0){
        that.countDownRun(goodsInfo.stop_time.time);
      }
      that.checkPrice();
    });
  }, 
  getPintInfo:function(goodsId){
    var that = this;
    var user_id = getApp().globalData.userInfo.user_id;
    server.getJSON('/Pint/pintInfo/goods_id/' + goodsId + '/user_id/' + user_id, function (res) {
      if(res.data.num > 0){
        that.setData({
          pint_num: res.data.num,
          pint: res.data.data
        })       
      }
      // else{
      //   wx.showToast({
      //     title: '拼团数量已经没了',
      //     icon: 'error',
      //     duration: 2000
      //   })
      // }
    });
  },
  countDownRun: function (limit_time_ms) {
    var page = this;
    setInterval(function () {
      var leftTime = (new Date(limit_time_ms[0], limit_time_ms[1] - 1, limit_time_ms[2], limit_time_ms[3], limit_time_ms[4],  limit_time_ms[5])) - (new Date()); //计算剩余的毫秒数 
      var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
      var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
      var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
      var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 

      days = page.checkTime(days);
      hours = page.checkTime(hours);
      minutes = page.checkTime(minutes);
      seconds = page.checkTime(seconds);
      page.setData({
        day: days < 0 ? '00' : days,
        hou: hours < 0 ? '00' : hours,
        min: minutes < 0 ? '00' : minutes,
        sec: seconds < 0 ? '00' : seconds,
      });
    }, 1000);
  },
  /**
   * 时间补0
   */
  checkTime: function (i) { //将0-9的数字前面加上0，例1变为01
    if (i < 0) {
      return '00';
    }
    if (i < 10) {
      i = "0" + i;
    }
    return i;
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
  pint:function (op) {
    var a = this;
    var goods = this.data.goods;
    // console.log(goods.goods.pt_price)
    if (!a.data.show_attr_picker){
      this.setData({
        price: goods.goods.pt_price ,
        pint_id: op.currentTarget.dataset.index
      })
      // console.log(this.data.price)
      
      return a.setData({
        show_attr_picker: !0
      }), !0;
    }
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
    var pint_id = that.data.pint_id;
    // console.log(pint_id)
    var goods_spec = spec;
    var session_id = app.globalData.openid//that.data.goods.goods.spec_goods_price
    var goods_num = that.data.form.number;;

    var user_id = "0"
    if (app.globalData.login)
      user_id = app.globalData.userInfo.user_id
    //立即购买先清空购物车
    server.getJSON('/Cart/emptyCart', { session_id: session_id, user_id: user_id });

    server.getJSON('/Cart/addCart', { goods_id: goods_id, goods_spec: goods_spec, session_id: session_id, goods_num: goods_num, user_id: user_id, is_pint: '1', pint_id: pint_id }, function (res) {
      that.setData({
        show_attr_picker: !1
      })
      if (res.data.status == 1) {
        // console.log(status)
        wx.navigateTo({
          url: '../ordersubmit/index?cartIds=' + goods_id + '&amount=' + goods_num * goods.goods.pt_price
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
  bug: function () {
    var a = this;
    var goods = this.data.goods;
    if (!a.data.show_attr_picker)
      return a.setData({
        price: goods.goods.shop_price,
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
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 1000
        });
        that.setData({
          show_attr_picker: !1
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
  /**
   * 拼团规则
   */
  goArticle: function (e) {
    wx.navigateTo({
      url: '/pages/topic/topic?id=-1',
    });
  },

});