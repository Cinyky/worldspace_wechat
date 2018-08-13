var app = getApp();
var server = require('../../../utils/server');
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var utils = require('../../../utils.js');
Page({

  data: {
    address: '定位中…',
    allcount: 0,
    keyWord: '',
    empty: false,
    flag: true,
    num: 1,
    minusStatus: 'disabled',
    textStates: ["", "redbg"],
    addData: "全部商品",
    tabs: ["全部商品"],
    currentTab: 0,
    thishid: true,
    sort: 0,
    sort_type: 0,
    class1: 0,
    goods_qrcode: "",
  },
  onLoad: function (options) {
    var that = this;
    var address = getApp().globalData.address;
    console.log(options);
    var store_id = options.store_id;
    that.get_class_num(store_id);//获取商家所有一级分类和相关商品个数
    if (address != undefined && address.length != 0) {
      that.setData({ address: address });
      that.setData({ store_id: options.store_id});
      var lat = getApp().globalData.lat;
      var lng = getApp().globalData.lng;
      var store_id = that.data.store_id;
      that.goodsList(store_id);
      that.storeList(store_id, lat, lng);  
    }else {
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          var latitude = res.latitude;
          var longitude = res.longitude;
          app.globalData.lat = latitude;
          app.globalData.lng = longitude;
          that.setData({ store_id: options.store_id });        
          // 实例划API核心类
          var map = new QQMapWX({
            key: 'Q7JBZ-5MXKP-EI3D3-L6SDL-JX4RF-Q3F7V' // 必填
          });
          ////address: res.result.address_component.city
          // 调用接口
          map.reverseGeocoder({
            location: {
              latitude: latitude,
              longitude: longitude
            },
            success: function (res) {
              if (res.result.address_reference.landmark_l2 == undefined || res.result.address_reference.landmark_l2.title.length == 0) {
                that.setData({

                  address: res.result.address_reference.landmark_l1.title
                });
                app.globalData.address = res.result.address_reference.landmark_l1.title;
              } else {
                that.setData({

                  address: res.result.address_reference.landmark_l2.title
                });
                app.globalData.address = res.result.address_reference.landmark_l2.title;
              }
              var lat = getApp().globalData.lat;
              var lng = getApp().globalData.lng;
              var store_id = that.data.store_id;
              that.goodsList(store_id);
              that.storeList(store_id, lat, lng);               
            },
            fail: function (res) {
              console.log(res);
            },
            complete: function (res) {
              console.log(res);
            }
          });
        }
      })
    }
  },
  onReady: function () {
  
  },
  onShow: function () {

  },
  onScroll: function (e) {
      if (e.detail.scrollTop > 100 && !this.data.scrollDown) {
          this.setData({
              scrollDown: true
          });
      } else if (e.detail.scrollTop < 100 && this.data.scrollDown) {
          this.setData({
              scrollDown: false
          });
      }
  },
  onShareAppMessage: function () {
    var shop_name = this.data.store.store_name;
    var store_id = this.data.store.store_id;
    var app = getApp()
    if (app.globalData.login)
      var user_id = app.globalData.userInfo.user_id;
    return {
      title: shop_name,
      path: '/pages/seller/seller/seller?store_id=' + store_id+'&uid=' + user_id,
    }
  },
  navigateToSearch: function () {
    wx.navigateTo({
      url: '../search/search'
    });
  },

  //获取商品列表
  goodsList: function (id) {
    var that = this;
    server.getJSON('/Store/getGoodsList', { id: id,class1: that.data.class1,sort: that.data.sort,sort_type: that.data.sort_type,keyWord: that.data.keyWord }, function (res)    {
      that.setData({ goodsList: res.data.result });
    });
  },
  get_class_num: function (store_id) {
    var that = this;
    server.getJSON('/Store/get_class_num', { store_id: store_id }, function (res) {
      that.setData({ tabs: res.data.data });
    });
  },
  //获取商铺信息
  storeList: function (store_id, lat, lng) {
    var that = this;
    server.getJSON('/Store/store_info', { store_id: store_id, la: lat, lo: lng }, function (res) {
      that.setData({ store: res.data.result });
    });
  },

  //搜索商品
  tapSearch: function (e) {
    var keyWord = e.detail.value;
    this.setData({ keyWord: keyWord });
    this.goodsList(this.data.store_id);
  },

  showGoods: function (e) {
    var goodsId = e.currentTarget.dataset.goodsId;
    wx.navigateTo({
      url: "../../goods/detail/detail?objectId=" + goodsId
    });
  },

  //弹出购物车框
  addtocart: function (e) {
    var that = this;
    var goods_id = e.target.dataset.goods;
    server.getJSON('/Goods/goodsInfo/id/' + goods_id, function (res) {
      var goodsInfo = res.data.result;
      console.log('goodsInfo');
      that.setData({
        goodsone: goodsInfo
      });
      that.checkPrice();
      that.setData({ flag: false, jgw: false, gm: true });
    });
  },

  b: function () {
    this.setData({ flag: true })
  },

  /* 点击减号 */
  bindMinus: function () {
    var num = this.data.num;
    // 如果大于1时，才可以减
    if (num > 1) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
    this.checkPrice();
  },

  /* 点击加号 */
  bindPlus: function () {
    var num = this.data.num;
    // 不作过多考虑自增1
    num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
    this.checkPrice();
  },

  /* 输入框事件 */
  bindManual: function (e) {
    // 将数值与状态写回
    this.setData({
      num: e.detail.value
    });
    this.checkPrice();
  },

  propClick: function (e) {
    var pos = e.currentTarget.dataset.pos;
    var index = e.currentTarget.dataset.index;
    var goods = this.data.goodsone
    for (var i = 0; i < goods.goods.goods_spec_list[index].length; i++) {

      if (i == pos)
        goods.goods.goods_spec_list[index][pos].isClick = 1;
      else
        goods.goods.goods_spec_list[index][i].isClick = 0;
    }

    this.setData({ goodsone: goods });
    this.checkPrice();
  },

  //更改价格信息
  checkPrice: function () {
    var goods = this.data.goodsone;
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
    } else {
      var price = this.data.price;
    }
    var num = this.data.num;
    var final_price = price * num;
    this.setData({ price: final_price, spec_price: price});
  },

  //加入购物车
  addCartdone: function () {
    var goods = this.data.goodsone;
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
    var goods_id = that.data.goodsone.goods.goods_id;
    var goods_spec = spec;
    var session_id = app.globalData.openid//that.data.goods.goods.spec_goods_price
    var goods_num = that.data.num;
    var user_id = "0"
    if (app.globalData.login)
      user_id = app.globalData.userInfo.user_id

    server.getJSON('/Cart/addCart', { goods_id: goods_id, goods_spec: goods_spec, session_id: session_id, goods_num: goods_num, user_id: user_id }, function (res) {
      if (res.data.status == 1)
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 1000
        });
      else
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 1000
        });
    });
    that.setData({ flag: true });
  },

  //立即购买
  buy: function () {
    var goods = this.data.goodsone;
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
    var goods_id = that.data.goodsone.goods.goods_id;
    var goods_spec = spec;
    var session_id = app.globalData.openid//that.data.goods.goods.spec_goods_price
    var goods_num = that.data.num;
    var user_id = "0"
    if (app.globalData.login)
      user_id = app.globalData.userInfo.user_id
    //立即购买先清空购物车
    server.getJSON('/Cart/emptyCart', { session_id: session_id, user_id: user_id });

    server.getJSON('/Cart/addCart', { goods_id: goods_id, goods_spec: goods_spec, session_id: session_id, goods_num: goods_num, user_id: user_id }, function (res) {
      if (res.data.status == 1) {
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 2000
        });
        // wx.switchTab({
        // url: '../cart/cart'
        // });
        wx.navigateTo({
          url: '../../order/ordersubmit/index?cartIds=' + goods_id + '&amount=' + goods_num * goods.goods.shop_price
        });
      }
      else
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 2000
        });
    });
    that.setData({ flag: true });
  },
  getAddress: function (e) {
    const d = e.currentTarget.dataset;
    const name = d.name;
    const address = d.address;
    var latitude = this.data.store.la;
    latitude = parseFloat(latitude);
    var longitude = this.data.store.lo;
    longitude = parseFloat(longitude);
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      scale: 18,
      name: d.name,
      address: address,
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      },
      success: function (res) {
        console.log(res);
      }
    })
  },
  tapSubMenu: function (t) {
    var a = this,
      e = t.currentTarget.dataset.sort,
      i = void 0 == t.currentTarget.dataset.default_sort_type ? -1 : t.currentTarget.dataset.default_sort_type,
      o = a.data.sort_type;
    if (a.data.sort == e) {
      if (- 1 == i) return;
      o = -1 == a.data.sort_type ? i : 0 == o ? 1 : 0
    } else o = i;
    a.setData({
      sort: e,
      sort_type: o
    })

    // console.log(this);
    this.goodsList(this.data.store_id);

  },
  addlistshow: function (event) {
    this.setData({
      thishid: false,
    })

  },
  thistap: function (event) {
    this.setData({
      thishid: true,
    })

  },
  swichtab: function (e) {
    var index = e.target.dataset.current;
    var tabs = this.data.tabs;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      this.setData({
        currentTab: e.target.dataset.current,
        addData: tabs[index]['name'],
        thishid: true,
        class1: tabs[index]['id'],
      })
    }
    this.goodsList(this.data.store_id);
  },
})