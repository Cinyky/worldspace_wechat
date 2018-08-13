var _function = require('../../../utils/functionData');
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
const dg = require('../../../utils/dg');
var app = getApp()
Page({
  data: {
    tuan_info: [],
    this_tuan_id: 0,
    glo_is_load: true,
    show_sharing: false,//分享弹窗是否显示
    replace: '/images/pay_dashang.png',
    is_join: false
  },
  //参团操作
  tuan_join_bind: function (e) {
    var that = this
    //检测当前操作
    var url = '';
    var is_show = e.currentTarget.dataset.val;//检测是否为按钮点击进入
    var tuan_info = that.data.tuan_info;
    //在团
    if (tuan_info.is_buy == 0) {
      url = '/pages/tuan/info/info?tid=' + tuan_info.goods_id + '&chengtuan_id=0';
    } else {
      //不在团中
      if (tuan_info.tuan_status == 1) {
        url = '/pages/tuan/info/info?tid=' + tuan_info.goods_id + '&chengtuan_id=' + that.data.this_tuan_id + '&is_show=' + is_show;
      } else {
        url = '/pages/tuan/info/info?tid=' + tuan_info.goods_id + '&chengtuan_id=0';
      }
    }
    wx.navigateTo({
      url: url
    })

  },

  go_index_bind: function () {
    var url = '';
    if (_DuoguanData.duoguan_app_is_superhome == 0) {
      url += "/pages/tuan/index/index";
    } else {
      url += _DuoguanData.duoguan_app_index_path;
    }
    wx.switchTab({
      url: url,
      fail: () => {
        wx.navigateTo({
          url: url,
        })
      }
    })
  },
  onLoad: function (options) {
    var that = this
    if (decodeURIComponent(options.scene) != 'undefined') {
      options.tid = decodeURIComponent(options.scene)
    }
    if (options.oid > 0) {
      requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/OrderApi/getTuanidByOrderid.html',
        { order_id: options.oid },
        (data) => {
          that.data.this_tuan_id = data.tid
          //获取拼团信息
          // _function.getTuanInfo(that.data.this_tuan_id, that.initTuanInfoData, this)
          requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/Api/getTuanInfo.html',
            { tid: that.data.this_tuan_id },
            (data) => {
              // data.is_buy=1;
              // data.tuan_status=3
              that.setData({
                tuan_info: data,
                glo_is_load: false
              })
              that.getShengTime(data.tuan_end_time)
            }, this, { isShowLoading: false });
        }, this, { isShowLoading: false });
    } else {
      that.setData({
        this_tuan_id: options.tid
      })
      //获取拼团信息
      // _function.getTuanInfo(that.data.this_tuan_id, that.initTuanInfoData, this)
      requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/Api/getTuanInfo.html',
        { tid: that.data.this_tuan_id },
        (data) => {
          console.log(data)
          that.setData({
            tuan_info: data,
            glo_is_load: false
          })
          that.getShengTime(data.tuan_end_time)
          if (data.tuan_status != 1) {
            that.setData({
              is_join: true
            })
          }
        }, this, { isShowLoading: false });
    }

  },
  // initTuanInfoData:function(data){
  //     var that = this
  //     if(data.code == 1){
  //         that.setData({
  //             tuan_info:data.info,
  //             glo_is_load:false
  //         })
  //         that.getShengTime(data.info.tuan_end_time)
  //     }else if(data.code == 5){
  //         wx.showModal({
  //             title: '提示',
  //             content: data.info,
  //             showCancel:false
  //         })
  //         return false;
  //     }
  // },
  //获取倒计时时间
  getShengTime: function (endtime) {
    var that = this
    var tdatas = that.data.tuan_info
    if (tdatas['tuan_status'] == 2) {
      tdatas.tuan_sheng_time = '拼团成功'
    } else if (tdatas['tuan_status'] == 3) {
      tdatas.tuan_sheng_time = '拼团拼团失败'
    } else if (tdatas['tuan_status'] == 1) {
      var EndTime = new Date(endtime);
      var NowTime = new Date();
      var t = EndTime.getTime() - NowTime.getTime();
      var d = 0;
      var h = 0;
      var m = 0;
      var s = 0;
      if (t >= 0) {
        d = Math.floor(t / 1000 / 60 / 60 / 24);
        h = Math.floor(t / 1000 / 60 / 60);
        m = Math.floor(t / 1000 / 60 % 60);
        s = Math.floor(t / 1000 % 60);
        tdatas.tuan_sheng_time = h + ':' + m + ':' + s
        setTimeout(function () {
          that.getShengTime(endtime);
        }, 1000)
      } else {
        tdatas.tuan_status = 3
      }
    }
    that.setData({
      tuan_info: tdatas
    })
  },
  onShareAppMessage: function () {
    var that = this
    console.log({
      title: "还差" + that.data.tuan_info.tuan_sheng_num + "人，我" + that.data.tuan_info.tuan_price + "元团了，【" + that.data.tuan_info.goods_name + '】' || '',
      desc: '',
      path: '/pages/tuan/join/join?tid=' + that.data.this_tuan_id
    });
    return {
      title: "还差" + that.data.tuan_info.tuan_sheng_num + "人，我" + that.data.tuan_info.tuan_price + "元团了，【" + that.data.tuan_info.goods_name +'】'|| '',
      desc: '',
      path: '/pages/tuan/join/join?tid=' + that.data.this_tuan_id
    }
  },
  //显示分享方式弹窗
  tuan_sharing_bind: function () {
    var that = this
    that.setData({
      show_sharing: true
    });
  },
  //隐藏分享方式弹窗
  bind_cancel_sharing: function () {
    var that = this
    that.setData({
      show_sharing: false
    });
  },
  //生成海报
  bind_poster_sharing: function () {
    var that = this
    var url = '../share/share?tid=' + that.data.this_tuan_id
    wx.redirectTo({
      url: url
    })
  },
  order_detail_bind:function(){
      var that = this;
      wx.redirectTo({
        url: '/pages/tuan/tuan/info/index?oid='+that.data.tuan_info.oid,
      })
  },
  detail: function (e) {
    wx.navigateTo({
      url: '../info/info?tid=' + e.currentTarget.id + '&chengtuan_id=0'
    })
  },
  tuan_fubao:function(){
    wx.navigateTo({
      url: '/pages/user/red-packet/records/index?type=tuan_record'
    })
  },
})