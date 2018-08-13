// pages/topic-list/topic-list.js
var server = require('../../utils/server');
var app = getApp();
Page({
    data: {
        backgrop:['navbar-item-active'],
        navbarArray: [],
        navbarShowIndexArray: 0,
        navigation:false,
        windowWidth: 375,
        scrollNavbarLeft: 0,
        currentChannelIndex: 0,
        articlesHide: false,
    },
    onLoad: function(options) {
        this.systemInfo = wx.getSystemInfoSync();
        // app.pageOnLoad(this);
        getApp().setPageNavbar(this);
        var page = this;
        page.loadTopicList({
            page: 0,
            reload: true,
        });
     
        let that = this;
      
        wx.getSystemInfo({
            success: (res) => {
                that.setData({
                    windowWidth: res.windowWidth
                });
            }
        });
        let navbarArray = this.data.navbarArray;   
        let navbarShowIndexArray = this.data.navbarShowIndexArray;
    },
  
    loadTopicList: function (args) {
        var page = this;
        if (page.data.is_loading)
            return;
        if (args.loadmore && !page.data.is_more)
            return;
        page.setData({
            is_loading: true,
        });
        server.getJSON('/Article/getnavLists', function (res) { 
                if (res.data.code == 0) {
                        page.setData({
                            navbarArray: res.data.list,
                            navbarShowIndexArray:Array.from(Array(res.data.list.length).keys()),
                            navigation: res.data.list=='' ?false: true,
                        });
                }
      
        });
        server.getJSON('/Article/getarticleLists/page/'+args.page, function (res) {
          if (res.data.code == 0) {
            if (args.reload) {
              page.setData({
                list: res.data.list,
                page: args.page,
                is_more: res.data.list.length > 0
              });
            }
            if (args.loadmore) {
              page.setData({
                list: page.data.list.concat(res.data.list),
                page: args.page,
                is_more: res.data.list.length > 0
              });
            }
              page.setData({
                is_loading: false,
              });
           
          }

        });
        
    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // app.pageOnShow(this);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        let currentChannelIndex = this.data.currentChannelIndex;
        this.switchChannel(parseInt(currentChannelIndex));
        this.sortTopic({
            page: 0,
            type: parseInt(currentChannelIndex),
            reload: true,
        });
        wx.stopPullDownRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let currentChannelIndex = this.data.currentChannelIndex;
        var _this = this;
        this.switchChannel(parseInt(currentChannelIndex));
        if(this.data.is_more){
          wx.showLoading({
            title: "正在加载",
            mask: true,
            duration: 1000,
            mask: true
          });

          this.sortTopic({
            page: _this.data.page + 1,
            type: parseInt(currentChannelIndex),
            loadmore: true,
          });
        }else{
          wx.showToast({
            title: '没有更多了',
            icon: 'succes',
            duration: 1000,
            mask: true
          })
        }
       
    },

    /**
     *菜单切换事件的处理函数
     */
    onTapNavbar: function(e) {
          var offsetLeft = e.currentTarget.offsetLeft
          var scrollLeft = this.data.scrollNavbarLeft;
  
          scrollLeft = offsetLeft -118;
  
          this.setData({
            scrollNavbarLeft:scrollLeft
            });
        
            wx.showLoading({
              title: "正在加载",
              mask: true,
            });
       
           
        //样式
        this.switchChannel(parseInt(e.currentTarget.id));

        this.sortTopic({
            page: 0,
            type: e.currentTarget.id,
            reload: true,
        });

    },
    /*
     * 查询专题分类下专题
     */
    sortTopic: function(args){
        var _this=this;

        server.getJSON('/Article/getarticleLists/page/' + args.page +'/type/' + args.type, function (res) {       
          if (res.data.code == 0) {
            if (args.reload) {
              _this.setData({
                list: res.data.list,
                page: args.page,
                is_more: res.data.list.length > 0
              });
            }
            if (args.loadmore) {
              _this.setData({
                list: _this.data.list.concat(res.data.list),
                page: args.page,
                is_more: res.data.list.length > 0
              });
            }
            wx.hideLoading();
          }

        })
        
    },

    switchChannel: function(targetChannelIndex) {
        let navbarArray = this.data.navbarArray;
        var backgrop = new Array();
        if(targetChannelIndex==-1){
            backgrop[1] = 'navbar-item-active';
        }else if(targetChannelIndex==0){
            backgrop[0] = 'navbar-item-active';
        }
     
        navbarArray.forEach((item, index, array) => {
            item.type = '';
            if (item['cat_id'] == targetChannelIndex) {
                item.type = 'navbar-item-active';
            }
        }); 
        this.setData({
            navbarArray: navbarArray,
            currentChannelIndex: targetChannelIndex,
            backgrop:backgrop,
        });
    },
});