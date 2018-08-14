const app = getApp();
import _ from '../../utils/underscore';
import requestUtil from '../../utils/requestUtil';
import _DuoguanData, { duoguan_host_api_url as API_HOST } from '../../utils/data';
import _function from '../../utils/functionData';
import util from '../../utils/util';
import dg from '../../utils/dg';
import plugUtil from '../../utils/plugUtil';
import wxParse from '../../wxParse/wxParse';
import listener from '../../utils/listener';

Page({
    
    data:{
        dgGlobal_options:null,
        
    dgsinglestore_store_data: false,
    dgsinglestore_this_store_id: 0,
    dgsinglestore_is_show_load_bg: true,//没有加载好则显示默认背景
    dgsinglestore_store_type: 2,
    dgsinglestore_storeSwiperNum: 0,
    dgsinglestore_is_show_all_intro: false,
    dgsinglestore_is_show_consult_view: false,
    
    },
    onLoad:function(options) {
        this.setData({dgGlobal_options:options});
        this.loadControlOptions(options);
    },
    /**
    * 加载页面组件配置数据
    */
    loadControlOptions: function (options) {
        var that = this;
        const url = API_HOST + '/index.php/addon/DuoguanUser/Api/getCustomConfig';
        requestUtil.get(url, { id: 79842 }, (data) => {
			that.setData({ config_options: data });
			that.parseVideoUrl(data);
			
    var dgsinglestore_this_store_id = options.store_id || 0;
    if (dgsinglestore_this_store_id == 0) {
      that.dgsinglestore_getStoreConfig();
    } else {
      that.setData({
        dgsinglestore_this_store_id: dgsinglestore_this_store_id,
      });
      that.dgsinglestore_getStoreInfo();
    }
    
        });
    },
    
	/**
	 * 解析视频地址
	 */
    parseVideoUrl: function (options) {
        const videos = [];
        for (const key in options) {
            const item = options[key];
            if (item.autoplay !== undefined && item.src !== undefined) {
                videos.push(item);
            }
        }
        if (videos.length === 0) return;
        
        requestUtil.post(API_HOST + '/index.php/home/utils/parseVideoUrls', {
            urls: JSON.stringify(videos.map(item => item.src))
        }, (data) => {
            for (let i = 0; i < data.length; i++) {
                const url = data[i];
                videos[i].src = url;
            }
            this.setData({ config_options: options });
        });
    },
    
    //下拉刷新
    onPullDownRefresh: function () {
        var that = this;
        that.onLoad(that.data.dgGlobal_options);
        setTimeout(() => {
            wx.stopPullDownRefresh();
        }, 1000);
    },
    onShareAppMessage: function () {
        var that = this;
        var shareTitle = '新页面';
        var shareDesc = '新页面';
        var sharePath = 'pages/custom/custom_930435294';
        return {
            title: shareTitle,
            desc: shareDesc,
            imageUrl:'',
            path: sharePath
        }
    },
    /**
     * 拨打电话
     */
    onCallTap: function (e) {
        const dataset = e.currentTarget.dataset || e.target.dataset, mobile = dataset.mobile,tips = dataset.tips;
        if (!mobile) return;
        const msg = tips || '你将要拨打电话：' + mobile;

        wx.showModal({
            title: '温馨提示',
            content: msg,
            success: (res) => {
                if (res.cancel) return;
                wx.makePhoneCall({ phoneNumber: mobile, });
            }
        });
    },

    /**
     * 跳转页面
     */
    onNavigateTap: function (e) {
       const dataset = e.detail.target ? e.detail.target.dataset : e.currentTarget.dataset;
        const url = dataset.url, type = dataset.type, nav = { url: url }, appId = dataset.appId;
        if (dataset.invalid) return console.warn('链接已被禁用');
        if (!url) return console.warn('页面地址未配置');

        if (e.detail.formId) requestUtil.pushFormId(e.detail.formId);

        if (type === 'mini') {
            wx.navigateToMiniProgram({
                appId: appId, path: url, fail: (err) => {
                    console.error(err);
                }
            });
        } else {
            wx.navigateTo({
                url: url, fail: () => {
                    wx.switchTab({
                        url: url,
                    });
                }
            });
        }
    },

    /**
     * 预览视图
     */
    onPreviewTap: function (e) {
        let dataset = e.target.dataset, index = dataset.index, url = dataset.url;
        if (index === undefined && url === undefined) return;

        let urls = e.currentTarget.dataset.urls;
        urls = urls === undefined ? [] : urls;
        if (index !== undefined && !url) url = urls[index];
        wx.previewImage({ current: url, urls: urls });
    },
    
  //获取配置信息
  dgsinglestore_getStoreConfig: function () {
    var that = this;
    requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DgStore/Api/getStoreConfig.html', {}, (info) => {
      // if (info.store_type == 1) {
      that.setData({
        dgsinglestore_store_type: info.store_type,
        dgsinglestore_this_store_id: info.store_id,
      });
      // }
      that.dgsinglestore_getStoreInfo();
    }, that, { isShowLoading: false });
  },
  //跳转外链小程序
  dgsinglestore_jump_xcx: function (e) {
    var appid = e.currentTarget.id;
    wx.navigateToMiniProgram({
      appId: appid,
      path: '',
      extraData: {
        foo: 'bar'
      },
      envVersion: 'develop',
      success(res) {

      }
    })
  },
  //快速买单
  dgsinglestore_rapid_pay_bind: function (e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/store/store-rapid-pay/index?store_id=' + that.data.dgsinglestore_this_store_id
    });
  },
  //跳转优惠券列表
  dgsinglestore_coupon_list_bind: function (e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/store/store-coupon/index?list_type=1&store_id=' + that.data.dgsinglestore_this_store_id
    });
  },
  //跳转商品详情
  dgsinglestore_goods_info_bind: function (e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/store/store-goods-details/index?goods_id=' + e.currentTarget.id + '&store_id=' + that.data.dgsinglestore_this_store_id
    });
  },
  //跳转商品列表
  dgsinglestore_goods_list_bind: function (e) {
    var that = this;
    wx.navigateTo({
      url: '/pages/store/store-goods-list/index?store_id=' + that.data.dgsinglestore_this_store_id
    });
  },
  //活动公告
  dgsinglestore_huodong_info_bind: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/store/store-active/index?&store_id=' + that.data.dgsinglestore_this_store_id
    });
  },
  //领券页面
  dgsinglestore_huodong_quan_info_bind: function () {
    var that = this;
    wx.navigateTo({
      url: '/pages/store/store-juan/index?&store_id=' + that.data.dgsinglestore_this_store_id
    });
  },
  //订单
  dgsinglestore_go_user_order_bind: function (e) {
    wx.navigateTo({
      url: '/pages/store/store-order-list/index'
    });
  },
  //导航导航
  dgsinglestore_get_location_bind: function () {
    var that = this;
    var loc_lat = that.data.dgsinglestore_store_data.store_gps_lat;
    var loc_lng = that.data.dgsinglestore_store_data.store_gps_lng;
    wx.openLocation({
      latitude: parseFloat(loc_lat),
      longitude: parseFloat(loc_lng),
      scale: 18,
      name: that.data.dgsinglestore_store_data.store_name,
      address: that.data.dgsinglestore_store_data.store_address
    });
  },
  //电话
  dgsinglestore_call_phone_bind: function () {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.dgsinglestore_store_data.store_con_mobile
    });
  },
  //获取店铺信息 包含店铺商品
  dgsinglestore_getStoreInfo: function () {
    var that = this;
    requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DgStore/StoreApi/getStoreHomeInfo.html', { store_id: that.data.dgsinglestore_this_store_id, versions: 2 }, (info) => {
      var dgsinglestore_store_data = info;
      that.data.dgsinglestore_store_data = dgsinglestore_store_data;
      that.setData({
        dgsinglestore_is_show_load_bg: false,
        dgsinglestore_store_data: dgsinglestore_store_data,
        dgsinglestore_comment_data: dgsinglestore_store_data.recommend_comments,
        dgsinglestore_comment_title: '最新评价'
      });


      var handler = {
        setData: (bindData) => {
          _.each(bindData.content.images, (item, index) => {
            if (item.attr.src.indexOf('http') !== 0) {
              item.attr.src = _data.DUOGUAN_HOST_URL + item.attr.src;
              bindData.content.imageUrls[index] = item.attr.src;
            }
          });
          this.setData(bindData);
        }
      };
      if (info.store_intro != null && info.store_intro != '') {
        wxParse.wxParse('content', 'html', info.store_intro, handler);
        this.wxParseImgLoad = handler.wxParseImgLoad;
        this.wxParseImgTap = handler.wxParseImgTap;
      }

    }, this);
  },

  //立即购买
  dgsinglestore_buy_now: function (e) {
    var that = this;
    wx.switchTab({
      url: '/pages/store/store-order-sure/index?store_id=' + that.data.dgsinglestore_this_store_id + '&buy_type=1&goods_id=' + e.currentTarget.id
    });
  },
  dgsinglestore_backHome: function () {
    var that = this;
    wx.switchTab({
      url: '/pages/store/store-home/index'
    });
  },

  // 轮播图渲染数字
  dgsinglestore_storeSwiperChange: function (e) {
    this.setData({ dgsinglestore_storeSwiperNum: e.detail.current });
  },
  dgsinglestore_change_store_intro_show: function () {
    this.setData({
      dgsinglestore_is_show_all_intro: !this.data.dgsinglestore_is_show_all_intro
    });
  },
  dgsinglestore_change_consult_view_show: function () {
    this.setData({
      dgsinglestore_is_show_consult_view: !this.data.dgsinglestore_is_show_consult_view
    });

  },
  //表单
  dgsinglestore_formSubmit: function (e) {
    var that = this;
    var rdata = e.detail.value;
    rdata['store_id'] = that.data.dgsinglestore_this_store_id;
    requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DgStore/StoreApi/postConsultMsg.html', rdata, (info) => {
      wx.showModal({
        title: '提示',
        content: "提交成功，我们会尽快回复您！",
        showCancel: false,
        success: function (res) {
          that.setData({
            dgsinglestore_is_show_consult_view: false
          });
        }
      });
    }, that, { isShowLoading: false });
  },
  
})