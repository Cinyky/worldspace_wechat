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
    
    dgBargain_setintvalid: null,
    dgBargain_shareInfo: {},
    
    data:{
        dgGlobal_options:null,
        
        dgBargain_imgUrls: [],
        dgBargain_indicatorDots: true,
        dgBargain_autoplay: true,
        dgBargain_interval: 2000,
        dgBargain_duration: 500,
        dgBargain_category: [],
        dgBargain_goods: [],
        dgBargain_page: 1,
        dgBargain_is_more: true,
        dgBargain_timeall: [],
        dgBargain_sec: 0,
        
        dgTuan_g_share_title: '',
        dgTuan_g_share_desc: '',
        dgTuan_cate_list: [],
        dgTuan_this_item: 0,
        dgTuan_this_cate_id: 0,
        dgTuan_goods_list: [],
        dgTuan_showLoading: false,
        dgTuan_this_page: 1,//当前页码
        dgTuan_pagesize: 4,//每页数量
        dgTuan_this_finish_page: 0,
        dgTuan_glo_is_load: true,
        
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
        requestUtil.get(url, { id: 79841 }, (data) => {
			that.setData({ config_options: data });
			that.parseVideoUrl(data);
			
        that.dgBargain_initlist(options);
        that.dgBargain_getgoodslist(options);
        //this.dgBargain_shareinfo();
        plugUtil.popup(that, 'DuoguanBargain');
        
        that.dgTuaninitLoadData();
        
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
        var sharePath = 'pages/custom/custom_669907976';
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
    
    dgBargain_initlist: function (options) {
        var that = this;

        options = { module: "DuoguanBargain" };
        requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanUser/DuoguanSwiperApi/index.html', options, (info) => {
            that.setData({
            dgBargain_imgUrls: info
        })
    });
        requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Category/getcate.html', options, (info) => {
            that.setData({
            dgBargain_category: info
        })
    });
    },
    dgBargain_getgoodslist: function (options) {
        let that = this;
        options = _.extend({
            _p: that.data.dgBargain_page,
            _r: that.data.config_options['dg-kj-comList'].dataRows
        }, options)
        requestUtil.post(_DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanBargain/Goods/lists.html', options, (info) => {
            if (that.data.is_more) {
            let page = that.data.dgBargain_page;
            page = ++page;
            that.setData({
                dgBargain_page: page
            })
        }
        if (info.length > 0) {
            that.dgBargain_getmin(info, options._p);
            that.setData({
                dgBargain_goods: options._p == 1 ? info : that.data.dgBargain_goods.concat(info),
            })
            that.setintvalid = setInterval(function () {
                let sec = new Date().getSeconds();
                if (sec == 59) {
                    that.dgBargain_getmin(info, options._p);
                }
                that.setData({
                    dgBargain_sec: that.dgBargain_checkTime(59 - sec)
                })
            }, 1000);
        } else {
            that.setData({
                is_more: false
            })
        }
    });
    },
    dgBargain_getmin: function (info, opage) {
        let timeall = [];
        let that = this;
        let thistime = new Date().getTime();
        for (var i = 0; i < info.length; i++) {
            let end_time = Date.parse(that.dgBargain_GetDateDiff(info[i].end_time));
            let start_time = Date.parse(that.dgBargain_GetDateDiff(info[i].start_time));
            timeall.push({ end_time: end_time, start_time: start_time });
            that.dgBargain_start_goods(start_time, thistime, end_time, timeall[i]);
        }
        that.setData({
            dgBargain_timeall: opage == 1 ? timeall : that.data.dgBargain_timeall.concat(timeall),
        })
    },
    dgBargain_cutgoods: function (e) {
        let goods_id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/bargain/commdityDetail/commdityDetail' + '?goods_id=' + goods_id,
        })
    },
    dgBargain_tocatecut: function (e) {
        let cate_id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/bargain/commdityList/commdityList' + '?cate_id=' + cate_id,
        })
    },
    dgBargain_end_goods: function (end_time, thistime, info) {
        let cha = end_time - thistime;
        let that = this;
        info = _.extend(info, { cutdaowbefore: false });
        cha-=1000;
        if (cha <= 0) {
            cha = 0;
            info = _.extend(info, { notcut: true });
            return;
        }
        that.dgBargain_time_meter(cha, info);
    },
    dgBargain_start_goods: function (start_time, thistime, end_time, info) {
        let cha = start_time - thistime;
        let that = this;
        info = _.extend(info, { cutdaowbefore: true });
        if (cha <= 0) {
            cha = 0;
            that.dgBargain_end_goods(end_time, thistime, info);
        }
        that.dgBargain_time_meter(cha, info);
    },
    dgBargain_time_meter: function (timer, info) {
        if (info.notcut || timer <= 0) {
            return;
        }
        let that = this;
        let dd = parseInt(timer / 1000 / 60 / 60 / 24, 10);//计算剩余的天数
        dd = that.dgBargain_checkTime(dd);
        let hh = parseInt(timer / 1000 / 60 / 60 % 24, 10);//计算剩余的小时数
        hh = that.dgBargain_checkTime(hh);
        let mm = parseInt(timer / 1000 / 60 % 60, 10);//计算剩余的分钟数
        mm = that.dgBargain_checkTime(mm);
        let cutdown = dd + '天' + hh + '时' + mm + '分';
        info = _.extend(info, { cutdown: cutdown });
    },
    dgBargain_checkTime: function (i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    },


    setdatapage: function () {
        this.setData({
            dgBargain_page: 1
        });
    },
    dgBargain_GetDateDiff: function (DiffTime) {
        //将xxxx-xx-xx的时间格式，转换为 xxxx/xx/xx的格式
        return DiffTime.replace(/\-/g, "/");
    },
    
    /*onload事件执行*/
    dgTuaninitLoadData: function () {
        //大转盘
        // plugUtil.popup(this, "DuoguanTuan");
        var that = this
        if (that.data.config_options["duoguan-pt-goodsItem"].mode>0){
            that.setData({
                dgTuan_pagesize: that.data.config_options["duoguan-pt-goodsItem"].mode
            })
        }
        //商品列表
        requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsList.html", { cid: 0, pagesize: 1, pagenum: that.data.dgTuan_pagesize , versions: 20180523}, (data) => { that.dgTuaninitGoodsListData(data) }, this, { isShowLoading: true });
        //获取分类信息
        requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getCateList.html", {}, (data) => { that.dgTuaninitTuanCateData(data) }, this, { isShowLoading: false });
    },
    /*获取分类的信息*/
    dgTuaninitTuanCateData: function (data) {
        var that = this
        that.setData({
            dgTuan_cate_list: data,
            dgTuan_glo_is_load: false
        })
    },
    /*获取商品列表*/
    dgTuaninitGoodsListData: function (data) {
        var that = this
        that.setData({
            dgTuan_goods_list: data
        })
        if (data == null) {
            that.setData({
                dgTuan_showLoading: false
            })
        } else {
            if (data.length >= that.data.pagesize) {
                that.setData({
                    dgTuan_showLoading: true
                })
            } else {
                that.setData({
                    dgTuan_showLoading: false
                })
            }
        }
        wx.hideToast()
    },
    /*滚动到底部数据操作*/
    dgTuaninitGoodsListLoadData: function (data) {
        var that = this
        if (data == null) {
            that.setData({
                dgTuan_showLoading: false
            })
        } else {
            if (data.length >= that.data.dgTuan_pagesize) {
                that.setData({
                    dgTuan_showLoading: true
                })
            } else {
                that.setData({
                    dgTuan_showLoading: false
                })
            }
            that.setData({
                dgTuan_goods_list: that.data.dgTuan_goods_list.concat(data),
                dgTuan_this_page: that.data.dgTuan_this_page + 1
            })
        }
        that.setData({
            dgTuan_this_finish_page: that.dgTuan_this_finish_page + 1
        })
    },
    /*当滚动到底部加载*/
    dgTuanonBotton: function () {
        var that = this
        var this_target = this.data.this_item
        if (that.data.dgTuan_this_finish_page != that.data.dgTuan_this_page) {
          requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsList.html", { cid: this_target, pagesize: that.data.dgTuan_this_page + 1, pagenum: that.data.dgTuan_pagesize }, (data) => { that.dgTuaninitGoodsListLoadData(data) }, this, { isShowLoading: false });
        }
    },
    /*选项卡操作*/
    dgTuanindex_item_bind: function (e) {
        wx.showToast({
            title: '加载中',
            icon: 'loading',
            duration: 10000
        })
        //获取分类id 然后动态加载所属分类商品
        var that = this
        var this_target = e.target.id;
        that.setData({
            this_item: this_target,
            this_page: 1,
            this_cate_id: this_target
        })
        requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getGoodsList.html", { cid: this_target, pagesize: 1, pagenum: that.data.pagesize }, (data) => { that.initGoodsListData(data) }, this, { isShowLoading: false });
    },
    /*详情*/
    dgTuandetail: function (e) {
        wx.navigateTo({
            url: '/pages/tuan/info/info?tid=' + e.currentTarget.id + '&chengtuan_id=0'
        })
    },
    dgTuangoTuanIndex: function (e) {
      wx.switchTab({
        url: '/pages/tuan/index/index',
        fail: function () {
          wx.navigateTo({
            url: '/pages/tuan/index/index',
          })
        }
      })
      
    },
    
})