var app = getApp();
var server = require('../../../utils/server');
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var WxNotificationCenter = require('../../../utils/WxNotificationCenter.js');
var that;
var formatLocation = server.formatLocation
Page({
    data: {
        address: '定位中…',
        tabs: ["全部商家", "销量最高", "距离最近"],
        currentTab: 0,
        banner: [],
        bannerHeight: Math.ceil(290.0 / 750.0 * getApp().screenWidth),
        page: 1,
        stores: [],
        keyWord: '',
        term: 0
    },
    onLoad: function () {
        that = this;
        // 注册通知
        WxNotificationCenter.addNotification("addressSelectedNotification", that.getAddress, that);
        var address = getApp().globalData.address;
        var lat = getApp().globalData.lat;
        var lng = getApp().globalData.lng;

        var self = this;
        self.setData({ address: '定位中…' });
        if (address != undefined && address.length != 0) {
            this.setData({ address: address });
            return;
        }
        else {

            wx.getLocation({
                type: 'gcj02',
                success: function (res) {
                    var latitude = res.latitude;
                    var longitude = res.longitude;

                    app.globalData.lat = latitude;
                    app.globalData.lng = longitude;
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
                            //console.log(res);

                            if (res.result.address_reference.landmark_l2 == undefined || res.result.address_reference.landmark_l2.title.length == 0) {
                                self.setData({
                                    
                                    address: res.result.address_reference.landmark_l1.title
                                });
                                app.globalData.address = res.result.address_reference.landmark_l1.title;
                            } else{
                              self.setData({

                                address: res.result.address_reference.landmark_l2.title
                              });
                              app.globalData.address = res.result.address_reference.landmark_l2.title;
                            }    
                        },
                        fail: function (res) {
                            console.log(res);
                        },
                        complete: function (res) {
                            console.log(res);
                        }
                    });
                    //获取店铺分类
                    server.getJSON("/Store/getStoreClass", function (res) {
                      var store_class = res.data;
                      for (var i = 0; i < store_class.length; i++) {
                        if (i == 0) {
                          store_class[i].select = 1;
                          that.getStoreList(store_class[i].sc_id);
                          that.setData({ sc_id: store_class[i].sc_id });
                        }
                        else {
                          store_class[i].select = 0;
                        }
                      }
                      that.setData({ store_class: store_class });
                    });
                }
            })

        }
        getApp().setPageNavbar(this); 
    },

    getStoreList: function (sc_id) {
      var that = this;
      var la = getApp().globalData.lat;
      var lo = getApp().globalData.lng;
      var keyWord = that.data.keyWord;
      server.getJSON("/Store/getStores", { cid: sc_id, page: that.data.page, la: la, lo: lo, term: that.data.term, keyWord: keyWord }, function (res) {
        //判断是否有数据，有则取数据 
        var stores = res.data; 
        if (res.data != 0) {
          that.setData({
             stores: stores,
          }); 
        } else {
          wx.showToast({
            title: '没有更多商家了',
            icon: 'none'
          })
        } 
      });
    },

    onReachBottom: function() {
      console.log('jiazai');
      var that = this;
      that.setData({page: that.data.page + 1});
      that.getStoreList(that.data.sc_id);
    },

    onShow: function () {
      var address = getApp().globalData.address;
      if (address != undefined && address.length != 0) {
        //获取店铺分类
        server.getJSON("/Store/getStoreClass", function (res) {
          var store_class = res.data;
          for (var i = 0; i < store_class.length; i++) {
            if (i == 0) {
              store_class[i].select = 1;
              that.getStoreList(store_class[i].sc_id);
              that.setData({ sc_id: store_class[i].sc_id });
            }
            else {
              store_class[i].select = 0;
            }
          }
          that.setData({ store_class: store_class });
        });
      }
      //加载广告位
      that.loadBanner();
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
    swichNavtab: function (e) {
        if (this.data.currentTab === e.target.dataset.current) {
            return false;
        } else {
          if (e.target.dataset.current == 0) {
            this.setData({'term': 0});
          }
          if (e.target.dataset.current == 1){
            this.setData({ 'term': 'sales' });
          }
          if (e.target.dataset.current == 2) {
            this.setData({ 'term': 'dest' });
          }
          this.getStoreList(this.data.sc_id);
            this.setData({
                currentTab: e.target.dataset.current,
            })
        }
    },
    seller: function (e) {
        var store_id = e.currentTarget.dataset.store_id;
        wx.navigateTo({
            url: '../seller/seller?store_id='+ store_id
        })
    },
    navigateToSearch: function () {
        wx.navigateTo({
            url: '../search/search'
        });
    },
    getAddress: function (address) {
        that.setData({
            address: address
        });
    },

    loadBanner: function () {

      var that = this;

      server.getJSON("/Index/home", function (res) {
        var banner = res.data.result.ad;
        that.setData({
          banner: banner
        });
      });
    },

    onClickClass: function (e) {
      var class_id = e.currentTarget.dataset.id;
      var store_class = this.data.store_class;
      for (var i = 0; i < store_class.length; i++) {
        if (store_class[i].sc_id == class_id) {
          store_class[i].select = 1;
          this.getStoreList(store_class[i].sc_id);
          this.setData({ sc_id: store_class[i].sc_id });
        }
        else {
          store_class[i].select = 0;
        }
      }
      this.setData({ store_class: store_class });
    },

    //搜索商铺
    tapSearch: function(e) {
      var keyWord = e.detail.value;
      this.setData({keyWord: keyWord});
      this.getStoreList(this.data.sc_id);
    },

    showGoods: function (e) {
      var goodsId = e.currentTarget.dataset.goodsId;
      wx.navigateTo({
        url: "../../goods/detail/detail?objectId=" + goodsId
      });
    },
    clickBanner: function (e) {

      var goodsId = e.currentTarget.dataset.goodsId;
      wx.navigateTo({
        url: "../../goods/detail/detail?objectId=" + goodsId
      });
    },
})

