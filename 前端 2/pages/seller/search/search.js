
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.min.js');
var WxNotificationCenter = require('../../../utils/WxNotificationCenter.js');
var that;
var qqmapsdk;
Page({
    data: {
        city:'洛阳市',
        inputdown: false
    },
    onLoad: function (options) {
        that = this;
        qqmapsdk = new QQMapWX({
            key: 'Q7JBZ-5MXKP-EI3D3-L6SDL-JX4RF-Q3F7V'
        });
        that.reloadCurrent();
    },
    keywordTyping: function (e) {
        // 键盘不断录入绑定取值
        var keyword = e.detail.value;
        // 向腾讯地图接口发送请求
        qqmapsdk.getSuggestion({
            keyword: keyword,
            region: that.data.city,
            success: function (res) {
                console.log(res);
                // 保存地址数组
                that.setData({
                    result: res.data,
                    inputdown:true
                });
            }, 
            fail: function(res) {
                that.reloadCur();
                that.setData({
                    region: that.data.city,
                    inputdown: false
                });
            },
            complete: function(res) {
                console.log(res);
            }
        });
    },
    addressTapped: function (e) {
        var title = e.currentTarget.dataset.title;
        getApp().globalData.address = e.currentTarget.dataset.title;
        getApp().globalData.lat = e.currentTarget.dataset.location.lat;
        getApp().globalData.lng = e.currentTarget.dataset.location.lng;
        // 取出点中的地址，然后使用WxNotification回传给首页
        //WxNotificationCenter.postNotificationName("addressSelectedNotification", title);
        wx.navigateBack({data: 1});

    },
    geoTapped: function () {
        var title = that.data.address;
        WxNotificationCenter.postNotificationName("addressSelectedNotification", title);
        wx.navigateBack();
        
    },
    reloadCurrent: function () {
        that.setData({
            address: '正在定位中...',
        });
        // 调用接口
        qqmapsdk.reverseGeocoder({
            poi_options: 'policy=2',
            get_poi: 1,
            success: function(res) {
            // 渲染给页面
                that.setData({
                    address: res.result.formatted_addresses.recommend,
                    result: res.result.pois,
                    city: res.result.address_component.city
                });
            },
            fail: function(res) {
        //         console.log(res);
            },
            complete: function(res) {
        //         console.log(res);
            }
        });
    },
    reloadCur: function () {
        that.setData({
            address: '正在定位中...',
        });
        // 调用接口
        qqmapsdk.reverseGeocoder({
            poi_options: 'policy=2',
            get_poi: 1,
            success: function (res) {
                // 渲染给页面
                that.setData({
                    address: res.result.formatted_addresses.recommend,
                    result: res.result.pois,
                });
            },
            fail: function (res) {
                //         console.log(res);
            },
            complete: function (res) {
                //         console.log(res);
            }
        });
    },
    switchcity: function () {
        wx.navigateTo({
            url: '../switchcity/switchcity'
        });
    },
})
