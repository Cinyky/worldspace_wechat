
var server = require('./utils/server');
var md5 = require('./utils/md5.js');
// 授权登录 
App({
  onLaunch: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.screenWidth = res.windowWidth;
        that.pixelRatio = res.pixelRatio;
      }
    });
  },
  getOpenId: function (cb) {
    wx.login({
      success: function (res) {
        if (res.code) {
          server.getJSON('/User/getopenId?js_code=' + res.code, function (response) {
            // 获取openId

            var openId = response.data.openid;

            // TODO 缓存 openId
            var app = getApp();
            var that = app;
            that.globalData.openid = openId;

            //验证是否关联openid

            typeof cb == "function" && cb()
          });
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  },
  register: function (cb) {
    var app = this;
    this.getUserInfo(function () {
      var openId = app.globalData.openid;
      var userInfo = app.globalData.userInfo;
      var country = userInfo.country;
      var city = userInfo.city;
      var gender = userInfo.gender;
      var nick_name = userInfo.nickName;
      var province = userInfo.province;
      var avatarUrl = userInfo.avatarUrl;
      var parent_id = app.globalData.parent_id;
      server.getJSON('/User/register?open_id=' + openId + "&country=" + country + "&gender=" + gender + "&nick_name=" + nick_name + "&province=" + province + "&city=" + city + "&head_pic=" + avatarUrl + "&parent_id=" + parent_id, function (res) {
        app.globalData.userInfo = res.data.res
        app.globalData.login = true;
        typeof cb == "function" && cb()
      });

    })
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({

            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            },
            fail: function (res) {
              that.redirectTo("../login/login");
            }
          })
        }
      })
    }
  },

  globalData: {
    'openid': null,
    'userInfo': null,
    'login': false,
    '_navbar': null,
    'parent_id': null,
    'goodsId': null,
  },
  setPageNavbar: function (page) {
    this.currentPage = page;
    var navbar = wx.getStorageSync('_navbar');
    if (navbar) {
      setNavbar(navbar);
    }
    var user_id1 = 0;
    user_id1 = getApp().globalData.userInfo ? getApp().globalData.userInfo.user_id : user_id1;
    var openid = '';
    openid = getApp().globalData.openid ? getApp().globalData.openid : openid;
    server.getJSON("/Index/gettab/session_id/" + openid, { user_id: user_id1 }, function (res) {
      if (res.data.code) {
        setNavbar(res.data.result);
        page.setData({ currentTab: 0 });
        wx.setStorageSync('_navbar', res.data.result);
        getApp().globalData._navbar = res.data.result;
      }
    });

    function setNavbar(navbar) {
      var route = page.route || (page.__route__ || null);
      for (var i in navbar) {
        if (navbar[i].url === "/" + route) {
          navbar[i].currentTab = i;
        } else {
          navbar[i].currentTab = 10000;
        }
      }
      page.setData({ _navbar: navbar });
    }
    this.currentPage.swichNav = function (e) {
      var page = this;

      if (page.data.currentTab === e.target.dataset.current) {
        return false;
      } else {
        var showMode = e.target.dataset.current == page.data.currentTab;
        page.setData({
          currentTab: e.target.dataset.current,
        })
      }
    }
  },
  redirectTo: function (e) {
    wx.redirectTo({
      url: e
    });
  },
})
