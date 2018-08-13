// pages/apply/apply.js
var interval = null;
var server = require('../../utils/server');
var WxParse= require('../../wxParse/wxParse.js');
Page({

  data: {
      xyshow:true,
      region: [' ', ' ', ' '],
      array: ['线下实体店', '电商商家（普通商家）', '生产厂家', '批发商（自营商家）'],
      time: '获取验证码',
      currentTime: 60,
      sub_btn: true
  },

  onLoad: function (options) {
    var that = this;
    var user_id = getApp().globalData.userInfo.user_id;
   
    server.getJSON("/Store/store_apply_judge", { user_id: user_id}, function (res) {
  
      if (res.data.status) {
        wx.showToast({
          title: res.data.msg,
          icon: 'success',
          duration: 1000
        });
        setTimeout(function(){
          wx.navigateBack({ delta: 1 });
        },1000)
      }
      
    });
    getApp().setPageNavbar(this);
  },

  onReady: function () {
  
  },

  onShow: function () {
  
  },
  hyxzboxshow: function (e) {
    var that = this;
    //拉取商家入驻协议内容
    server.getJSON('/Store/get_enter_agreement', function(res){
      that.setData({
        enter_title: res.data.title,
      });
      WxParse.wxParse('article', 'html', res.data.content, that, 0);
    });
        that.setData({
            xyshow: false
        })
  },
  hyxzboxhide: function (e) {
      this.setData({
          xyshow: true
      })
  },
  bindRegionChange: function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
          region: e.detail.value,
          cshide:true
      })
  },
  bindPickerChange: function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
          index: e.detail.value,
          fwhide: true
      })
  },
  getCode: function (options) {
      var that = this;
      var currentTime = that.data.currentTime
      interval = setInterval(function () {
          currentTime--;
          that.setData({
              time: currentTime + '秒后重新获取'
          })
          if (currentTime <= 0) {
              clearInterval(interval)
              that.setData({
                  time: '重新获取',
                  currentTime: 60,
                  disabled: false
              })
          }
      }, 1000)
  },

  read() {
    if (this.data.sub_btn) {
      this.setData({sub_btn: false})
    } else {
      this.setData({ sub_btn: true })
    }
  },

  getVerificationCode() {
    var that = this
    //获取手机号,发送验证码
    var phone = that.data.phone;
    var session_id = getApp().globalData.userInfo.open_id;
    if (phone) {
      if (that.checkMobile(phone)) {
        server.getJSON("/Aliyundysms/sendSms", { phone: phone, session_id: session_id}, function(res) {
          if (res.data.Code == 'OK') {
            wx.showToast({
              title: '已发送',
              icon: 'success',
              duration: 2000
            });
            //倒计时
            that.getCode();
            that.setData({
              disabled: true
            });
          } else {
            wx.showToast({
              title: '获取失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
      } else {
        wx.showToast({
          title: '手机号错误',
          icon: 'none',
          duration: 2000
        }) 
      }
    } else {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
    }
  },

  //输入手机号
  userPhoneInput(e) {
    this.setData({phone: e.detail.value});
  },

  checkMobile(tel) {
    var reg = /(^1[3|4|5|7|8][0-9]{9}$)/;
    if(reg.test(tel)) {
      return true;
    }else{
      return false;
    };
  },

  formSubmit: function (e) {
    var that = this;
    var user_id = getApp().globalData.userInfo.user_id;
    var session_id = getApp().globalData.userInfo.open_id;
    if (that.check_submit(e.detail.value)) {
      server.getJSON("/Store/store_apply_info", {user_id: user_id, session_id: session_id, data: e.detail.value}, function(res){
        if (res.data.status == 1) {
          wx.navigateBack({delta: 1});
        }
        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        });
      });
    }
  },

  check_submit: function (e) {
    if (e.code == '') {
      wx.showToast({
        title: '验证码不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (e.store_name == '') {
      wx.showToast({
        title: '名称不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (e.business_scope == '') {
      wx.showToast({
        title: '项目不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (e.contacts_name == '') {
      wx.showToast({
        title: '姓名不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (e.contacts_mobile == '') {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    return true;
  }

})