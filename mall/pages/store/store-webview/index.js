const app = getApp();
import _dg from '../../../utils/dg';
const requestUtil = require('../../../utils/requestUtil');
Page({
  data:{
    weburl:null
  },
  onLoad: function(options) {
    this.setData({
      weburl: decodeURIComponent(options.weburl)
    })
  },
  //获取分享信息
  getShareData: function () {
    var that = this;
    requestUtil.get(_DgData.duoguan_get_share_data_url, { mmodule: 'dg_store' }, (data) => {
      that.setData({
        g_share_title: data.title,
        g_share_desc: data.desc
      })
    });
  },
  //设置分享
  onShareAppMessage: function () {
    var that = this
    var weburl=that.data.weburl  
    return {
      title: that.data.g_share_title,
      desc: that.data.g_share_desc,
      path: '/pages/store/store-webview/index?weburl='+weburl
    }
    
  

  }
})