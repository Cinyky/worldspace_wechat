const app = getApp();
const util = require('../../../utils/util');
const requestUtil = require('../../../utils/requestUtil');
const $ = require('../../../utils/underscore');
const _DuoguanData = require('../../../utils/data');
const WxParse = require('../../../wxParse/wxParse.js');
function GetDateDiff(DiffTime) {
  //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式   
  return DiffTime.replace(/\-/g, "/");
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 2000,
    duration: 500,
    proval: {},
    goods: {},
    record: null,
    is_my: false,
    is_help: false,
    mycutprice: null,
    is_helpuser: false,
    helpusrid: null,
    options: {},
    cutdown: '00天00:00:00',
    cutdaowbefore: false,
    closehide: false,
    notpay: false,
    hidemy: false,
    hidehlep: false,
    desinfo: true,
    rankinfo: false,
    rankpage: 1,
    ranklist: null,
    rankcount: 0,
    dmlist: [],
    echodm: null,
    sbg: false,
    goodsnum: false,
  },
  setintvalid: null,
  userinfo: {},
  setintvaldmid: null,
  settimedmid: null,


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    var scene = decodeURIComponent(options.scene);
    if (scene != 'undefined') {
      if (that.isContains(scene, "#")) {
        let strs = [];
        strs = scene.split("#");
        options.goods_id = strs[0];
        options.userid = strs[1];
      } else {
        let gindex = scene.indexOf("goods");
        let userindex = scene.indexOf("userid");
        let gindexs = parseInt(gindex) + 5;
        let userindexs = parseInt(userindex) + 6;
        options.goods_id = scene.substring(gindexs, userindex);
        options.userid = scene.substring(userindexs);
      }
    }
    that.setData({
      options: options
    })
  },
  isContains: function (str, substr) {
    return str.indexOf(substr) >= 0;
  },
  initgoods: function (options) {
    var that = this;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Goods/getinfoapi.html', options, (info) => {
      if (info != null) {
        clearInterval(this.setintvalid);
        that.setData({
          goods: info,
          notcut: info.notcut,
        })
        WxParse.wxParse('description', 'html', info.content, that);
        let thistime = new Date().getTime();
        let end_time = Date.parse(GetDateDiff(info.end_time));
        let start_time = Date.parse(GetDateDiff(info.start_time));
        if (thistime <= start_time) {
          that.start_goods(start_time, thistime, end_time);
        } else if (thistime < end_time) {
          that.end_goods(end_time, thistime);
        } else {
          that.setData({
            notcut: true
          });
        }
      }
    });
    if (options.userid) {//帮助好友砍价
      let that = this;
      let userinfo = that.userinfo;
      if (options.userid == userinfo.uid) {
        let goodsid = options.goods_id;
        let gindex = goodsid.indexOf("goods");
        if (gindex >= 0) {
          let gindexs = parseInt(gindex) + 5;
          let goodsid1 = goodsid.substring(gindexs);
          let options1 = {};
          options1.goods_id = goodsid1;
          that.mycutinfo(options1);
        } else {
          that.mycutinfo(options);
        }
      } else {
        that.setData({
          is_helpuser: true,
          helpusrid: options.userid
        });
        requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Record/helpcutinfo.html', options, (info) => {
          if (info != null) {
            that.setData({
              proval: info
            })
            console.log(11111)
            console.log(that.data.proval)
          }
        });
      }
    } else {//进入自己的砍价信息
      wx.redirectTo({
        url: '/pages/bargain/commdityDetail/commdityDetail?goods_id=' + that.data.options.goods_id
      })
      // that.mycutinfo(options);
    }
  },
  mycutinfo: function (options) {
    let that = this;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Record/mycutinfo.html', options, (info) => {
      if (info != null) {
        if (that.data.cutdaowbefore == false) {
          info.notcut = that.data.goods.notcut;
        }
        info.goods_num = that.data.goods.goods_num;
        that.setData({
          proval: info
        })
      }
    });
  },
  changehide: function () {
    this.setData({
      closehide: true
    });
  },
  end_goods: function (end_time, thistime) {
    let cha = end_time - thistime;
    let that = this;
    that.setData({
      cutdaowbefore: false
    })
    that.setintvalid = setInterval(function () {
      cha -= 1000;
      if (cha <= 0) {
        clearInterval(that.setintvalid);
        cha = 0;
        that.setData({
          notcut: true
        });
        return;
      } that.time_meter(cha)
    }, 1000);
  },
  start_goods: function (start_time, thistime, end_time) {
    let cha = start_time - thistime;
    let that = this;
    that.setData({
      cutdaowbefore: true
    })
    that.setintvalid = setInterval(function () {
      cha -= 1000;
      if (cha <= 0) {
        clearInterval(that.setintvalid);
        cha = 0;
        that.end_goods(end_time, thistime);
      }
      that.time_meter(cha);
    }, 1000);
  },
  cut: function (e) {
    var that = this;
    let options = {};
    let formid = e.detail.formId;
    requestUtil.pushFormId(formid);
    options.goods_id = that.data.goods.id;
    options.bargain_num = that.data.goods.bargain_num;
    options.const_price = that.data.goods.const_price;
    options.low_price = that.data.goods.low_price;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Record/mycut.html', options, (info) => {
      if (info != null) {
        that.setData({
          proval: info,
          mycutprice: info.my_price,
          record: 1,
          is_my: true
        })
      }
    });
  },
  tomyorder: function (e) {
    let orderid = e.currentTarget.dataset.id;
    let status = parseInt(e.currentTarget.dataset.status);
    switch (status) {
      case 0:
        wx.navigateTo({
          url: '/pages/bargain/orderDetail/orderDetail?orderid=' + orderid,
        })
        break;
      case 1:
        wx.navigateTo({
          url: '../myOrder/myOrder',
        })
        break;
    }
  },
  helpcut: function (e) {
    let formid = e.detail.formId;
    requestUtil.pushFormId(formid);
    this.setData({
      is_help: true
    })
  },
  helpcuthide: function () {
    this.setData({
      is_help: false,
      is_my: false
    })
  },
  helpbargain: function () {
    let that = this;
    let options = {};
    options.userid = that.data.helpusrid;
    options.goods_id = that.data.goods.id;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Record/helpcut.html', options, (info) => {
      if (info != null) {
        that.setData({
          proval: info,
          hidehelp: true
        })
      }
    });
  },
  gogoodsdetail: function () {
    let that = this;
    wx.navigateTo({
      url: '/pages/bargain/commdityDetail/commdityDetail?goods_id=' + that.data.goods.id
    })
  },
  gomycut: function () {
    let that = this;
    if (that.data.proval.goods_num > 0 || that.data.proval.my_record != 3) {
      wx.navigateTo({
        url: '/pages/bargain/commdityDetail/commdityDetail?goods_id=' + that.data.goods.id
      })
    } else {
      that.setData({
        notpay: true
      });
    }

  },
  time_meter: function (timer) {
    let that = this;
    let dd = parseInt(timer / 1000 / 60 / 60 / 24, 10);//计算剩余的天数
    let hh = parseInt(timer / 1000 / 60 / 60 % 24, 10);//计算剩余的小时数
    let mm = parseInt(timer / 1000 / 60 % 60, 10);//计算剩余的分钟数
    let ss = parseInt(timer / 1000 % 60, 10);//计算剩余的秒数
    dd = that.checkTime(dd);
    hh = that.checkTime(hh);
    mm = that.checkTime(mm);
    ss = that.checkTime(ss);
    // let cutdown = dd + '天' + hh + ':' + mm + ':' + ss
    var cutdown = {};
    cutdown.dd = dd;
    cutdown.hh = hh;
    cutdown.mm = mm;
    cutdown.ss = ss;
    that.setData({
      cutdown: cutdown
    })
  },
  checkTime: function (i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  },
  gobuy: function (e) {
    let that = this;
    let formid = e.detail.formId;
    requestUtil.pushFormId(formid);
    let goods_id = e.detail.value.goods_id;
    let options = {};
    options.goods_id = goods_id;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Goods/getinfoapi.html', options, (info) => {
      if (info.goods_num == 0) {
        that.setData({
          goodsnum: true,
        })
        return;
      } else {
        wx.navigateTo({
          url: '/pages/bargain/buy/buy?goods_id=' + goods_id,
        })
      }
    })
  },
  hidegnum: function () {
    let that = this;
    that.setData({
      goodsnum: false,
    }, function () {
      that.initgoods(that.data.options);
      that.getgoodsdm(that.data.options.goods_id);
    })
  },
  partic: function (e) {
    let goods_id = e.currentTarget.dataset.gid;
    let userid = e.currentTarget.dataset.uid;
    wx.navigateTo({
      url: '../participant/participant?goods_id=' + goods_id + '&userid=' + userid,
    })
  },
  hidemy: function () {
    this.setData({
      hidemy: true,
      hidehelp: false
    })
  },
  jumpHome: function () {
    var that = this;
    wx.switchTab({
      url: '../index/index'
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    util.syncWechatInfo(function (res, data, info) {
      that.userinfo = res;
      if (that.userinfo.uid == that.data.options.userid) {
        wx.redirectTo({
          url: '/pages/bargain/commdityDetail/commdityDetail?goods_id=' + that.data.options.goods_id
        })
      }
      that.initgoods(that.data.options);
      that.getgoodsdm(that.data.options.goods_id);
      that.getrank();
    });
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
    clearInterval(this.setintvalid);
  },
  showshare: function () {
    let that = this;
    let userid = that.data.proval.uid;
    let goods_id = that.data.goods.id;
    wx.navigateTo({
      url: '/pages/bargain/placard/placard?userid=' + userid + '&goods_id=' + goods_id,
    })
  },
  initplacard: function (options) {
    let that = this;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/DuoguanBargain/tickttest.html', options, (info) => {
      that.poster = info;
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this;
    let options = that.data.options;
    that.initgoods(options);
    that.getgoodsdm(that.data.options.goods_id);
    that.getrank();
    wx.stopPullDownRefresh();

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.type == 'submit') {
      let formid = res.detail.formId;
      requestUtil.pushFormId(formid);
    }
    let that = this;
    let userinfo = that.userinfo;
    let goods_name = that.data.goods.goods_name;
    let helpid = userinfo.uid;
    let nickname = userinfo.nickname;
    if (that.data.helpusrid != null) {
      helpid = that.data.helpusrid;
      nickname = that.data.proval.nick_name
    }
    let sharepath = '/pages/bargain/friendseeDetail/friendseeDetail?goods_id=' + that.data.goods.id + '&userid=' + helpid;
    if ($.isEmpty(that.data.proval)) {
      sharepath = '/pages/bargain/friendseeDetail/friendseeDetail?goods_id=' + that.data.goods.id;
    }
    return {
      title: nickname + '正在参加' + goods_name + '的砍价活动',
      path: sharepath,
      success: function (res) {
        that.setData({
          is_help: false,
          is_my: false
        })
      },
      fail: function (res) {
        // 转发失败
        that.setData({
          is_help: false,
          is_my: false
        })
      }
    }

  },
  gohome: function () {
    wx.navigateTo({
      url: '/pages/bargain/index/index',
      fail: wx.switchTab({
        url: '/pages/bargain/index/index',
      })
    })
  },
  getdesinfo: function () {
    let that = this;
    that.setData({
      desinfo: true,
      rankinfo: false
    })
  },
  getrankinfo: function () {
    let that = this;
    that.setData({
      desinfo: false,
      rankinfo: true
    }, function () {
      that.getrank();
    })
  },
  getrank: function () {
    let that = this;
    let options = {};
    options.page = 1;
    options.goods_id = that.data.options.goods_id;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanBargain/Record/ranklist.html', options, (info) => {
      that.setData({
        ranklist: info.rank,
        rankcount: info.rankcount
      })
    });
  },
  getgoodsdm: function (goodsid) {
    let that = this;
    let options = {};
    options.goods_id = goodsid;
    requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanBargain/Record/dmlist.html', options, (info) => {
      that.setData({
        dmlist: info
      }, function () {
        that.echodm();
      })
    });
  },
  echodm: function () {
    let that = this;
    clearInterval(that.settimedmid);
    if (!that.data.dmlist) {
      return;
    }
    let dmlength = that.data.dmlist.length;
    if (dmlength == 0) {
      return;
    }
    that.settimedmid = setInterval(function () {
      let rand = parseInt(Math.random() * (dmlength - 1), 10);
      that.setData({
        echodm: that.data.dmlist[rand]
      }, function () {
        clearInterval(that.setintvaldmid);
        that.setintvaldmid = setInterval(function () {
          that.setData({
            echodm: null
          })
        }, 6000);
      })
    }, 12000);
  }
})