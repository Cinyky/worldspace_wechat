// pages/topic/topic.js
var app = getApp();
var WxParse = require('../../../wxParse/wxParse.js');
var server = require('../../../utils/server');
Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // app.pageOnLoad(this);
      getApp().setPageNavbar(this);
        this.setData({
          tid: options.id
        })
        var page = this;
        if (options.id == -1){//拼团须知
          server.getJSON('/pint/article', function (res) {
            if (res.data.code == 0) {
              page.setData(res.data.data);
              WxParse.wxParse("content", "html", res.data.data.content, page);
            } else {
              wx.showModal({
                title: "提示",
                content: '获取数据失败',

              });
            }

          });
        }else{
          server.getJSON('/Article/getarticleId/id/' + options.id, function (res) {
            if (res.data.code == 0) {
              page.setData(res.data.data);
              WxParse.wxParse("content", "html", res.data.data.content, page);
            } else {
              wx.showModal({
                title: "提示",
                content: '获取数据失败',

              });
            }

          });
        }
        

    },

    
    // favoriteClick: function (e) {
    //     var page = this;
    //     var action = e.currentTarget.dataset.action;
    //     app.request({
    //         url: api.user.topic_favorite,
    //         data: {
    //             topic_id: page.data.id,
    //             action: action,
    //         },
    //         success: function (res) {
    //             wx.showToast({
    //                 title: res.msg,
    //             });
    //             if (res.code == 0) {
    //                 page.setData({
    //                     is_favorite: action,
    //                 });
    //             }
    //         }
    //     });
    // },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        var id = page.data.article_id;
        var res = {
            title: page.data.title,
            path: "/pages/topic/topic?id="+id+"&user_id=" + user_info.id,
        };
        return res;
    }
});