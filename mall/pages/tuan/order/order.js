// mallcart.js
var _function = require('../../../utils/functionData');
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
const dg = require('../../../utils/dg');
const util = require('../../../utils/util');
var app = getApp()
Page({
  data: {
    cart_list: [],
    all_g_number: 0,
    all_g_price: 0,
    all_g_yunfei: 0,
    all_limit_no_yunfei:0,
    is_show_address: false,
    address_list: null,
    this_address_id: 0,
    this_address_info: '请选择',
    btn_submit_disabled: false,
    glo_is_load: true,
    wx_address_info: '',
    shipping_name: '本店快递',
    config: [],
    name: '',
    phone: '',
    logistics: false,
    since: false,
    l_check: true,
    s_check: false,
    chengtuan_id: 0,
    award: 0.00,
    tuan_type: 0,
    siteInfo :null,
    w_status:0,
    a_status:0,
  },
  onLoad: function () {
    var address = wx.getStorageSync('address');
    var address = wx.setStorageSync('site', null);
    // wx.setStorageSync('person', '');
    // wx.setStorageSync('moren', '');
    
    console.log(address)
    console.log("周二")
    
    if (address) {
      this.setData({
        wx_address_info: address
      })
    }
    requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/Api/getTuanConfig.html',
      {},
      (data) => {
        this.setData({
          config: data
        })
      }, this, { isShowLoading: false });
    try {
      if (wx.getStorageSync('tuan_name')) {
        this.setData({ name: wx.getStorageSync('tuan_name') })
      }
      if (wx.getStorageSync('tuan_phone')) {
        this.setData({ phone: wx.getStorageSync('tuan_phone') })
      }
    } catch (e) {

    }
    var that = this
    //请求购物车信息
    // _function.getTuanCartList(wx.getStorageSync("utoken"),that.initgetCartListData,this)
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/Api/getCartList.html", {}, (data) => { that.initgetCartListData(data) }, this, { isShowLoading: false })

  },
  onShow: function (options) {
    var that = this
    // _function.getAddressList(wx.getStorageSync("utoken"),that.initgetAddressListData,this)
    requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/getAddressList.html", {}, (data) => { that.initgetAddressListData(data) }, this, { isShowLoading: false });
    var site_info = wx.getStorageSync('site');
    that.setData({
      siteInfo: site_info      
    })

  },
  initgetCartListData: function (data) {
    var that = this
    console.log(that.data.config)
    that.setData({
      cart_list: data.glist,
      discounts_status: data.discounts_status,
      discounts_tuanzhang: data.discounts_tuanzhang,
      all_g_number: data.all_g_number,
      all_g_price: (data.all_g_price * 100 / 100).toFixed(2),
      all_g_yunfei: data.all_g_yunfei,
      all_limit_no_yunfei:that.data.config.limit_no_yunfei,
      alternative_yunfei: data.all_g_yunfei,
      tuanzhang_g_price: data.tuanzhang_g_price,
      chengtuan_id: data.chengtuan_id,
      award: data.award ? data.award : 0,
      store_id: data.store_id,
      qhaddress: data.qhaddress,
      tuan_type: data.tuan_type
    })
    if (data.logistics == 1 && data.since == 1) {
      console.log(1);
      that.setData({
        shipping_name: '本店快递',
        logistics: true,
        since: true,
        l_check: true,
        s_check: false,
      });
    }
    if (data.logistics == 0 && data.since == 1) {
      that.setData({
        shipping_name: '到店自提',
        since: true,
        s_check: true,
        l_check: false
      });
      if (that.data.s_check) {
        that.setData({
          all_g_price: ((data.all_g_price * 100 - data.all_g_yunfei * 100) / 100).toFixed(2)
        })
      }
    }
    if (data.logistics == 1 && data.since == 0) {
      console.log(3);
      that.setData({
        shipping_name: '本店快递',
        logistics: true,
      });
    }
  },
  //提交订单并支付
  order_formSubmit: function (e) {
    wx.showLoading({
      title: '请稍后...',
    })
    if (e.detail.value.name && e.detail.value.phone) {
      wx.setStorage({
        key: "tuan_name",
        data: e.detail.value.name
      })
      wx.setStorage({
        key: "tuan_phone",
        data: e.detail.value.phone
      })
    }
    var that = this

    that.setData({
      btn_submit_disabled: true
    })
    var order_info = e.detail.value;
    order_info.form_id = e.detail.formId;
    order_info.wx_address = that.data.wx_address_info;

    //切换到店自提时运费不计，团长免单操作加入标识w_status
    order_info.w_status = that.data.w_status;
    if (this.data.cart_list[0].btype == 2) {
      //如果商品设置团长免单则直接跳过支付过程
      if (this.data.discounts_status == 0 && this.data.tuan_type == 0) {
        requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/postOrder.html", { oinfo: order_info }, (datas) => {
          console.log("晨")
          console.log(datas);
          console.log(datas.length)
          console.log(this.data.all_g_yunfei);
          console.log(222);
          // var cha_fei = this.data.all_limit_no_yunfei - this.data.all_g_price;
          // console.log(cha_fei);
          
            //没有运费时this.data.all_g_yunfei为0
            //返回oid为数字时有长度，可以跳转支付成功后的界面
          if (datas.length != undefined && this.data.all_g_yunfei ==0) {
            wx.redirectTo({
              url: '../join/join?oid=' + datas
            })
          } else {
           //返回的是支付参数时走支付流程 
            that.initorderPostData(datas)
            
          }

        }, this,
          {
            isShowLoading: false, 'complete': (res) => {
              wx.hideLoading()
              that.setData({
                btn_submit_disabled: false
              })
            }
          });
      } else {
        //如果商品设置团长不免单走支付流程
        requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/postOrder.html", { oinfo: order_info }, (data) => { that.initorderPostData(data) }, this,
          {
            isShowLoading: false, 'complete': (res) => {
              console.log("涛")

              wx.hideLoading()
              that.setData({
                btn_submit_disabled: false
              })
            }
          });
      }

    } else {
      requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/postOrder.html", { oinfo: order_info }, (data) => { that.initorderPostData(data) }, this,
        {
          isShowLoading: false, 'complete': (res) => {
            console.log("涛涛")

            wx.hideLoading()
            that.setData({
              btn_submit_disabled: false
            })
          }
        });
    }

    // requestUtil.post(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/postOrder.html", { oinfo: JSON.stringify(order_info),site:JSON.stringify(that.data.siteInfo)}, (data) => { that.initorderPostData(data) }, this,
    //   {
    //     isShowLoading: false, 'complete': (res) => {
    //       wx.hideLoading()
    //       that.setData({
    //         btn_submit_disabled: false
    //       })
    //     }
    //   });
  },
  initorderPostData: function (data) {
    var that = this
    wx.hideToast()
    that.setData({
      btn_submit_disabled: false
    })
    if (that.data.wx_address_info) {
      wx.setStorageSync('address', that.data.wx_address_info)
    }
    wx.requestPayment({
      'timeStamp': data.timeStamp,
      'nonceStr': data.nonceStr,
      'package': data.package,
      'signType': 'MD5',
      'paySign': data.paySign,
      'success': function (res) {
        if (data.btype == 2) {
          wx.redirectTo({
            url: '../join/join?oid=' + data.order_id
          })
        } else {
          wx.redirectTo({
            url: '../tuan/list/index'
          })
        }
      },
      'fail': function (res) {
        console.log(res);
        wx.showModal({
          title: '提示',
          content: "支付失败,请稍后到我的订单中可继续支付",
          showCancel: false,
          success: function (res) {
            wx.switchTab({
              url: '../index/index'
            })
          }
        })
      }
    })

  },
  //选择收货地址
  select_address_bind: function () {
    var that = this;
    util.chooseAddress(function (res) {
      if (res.wxAddress == undefined && res.qqmap_address == undefined) {
        return;
      }
      if (res.wxAddress) {
        that.setData({
          wx_address_info: res.wxAddress
        })
        console.log("巨星")
      } else {
        console.log(res);
        console.log("毛不易")
        var address = {
          userName: res.name,
          nationalCode: '',
          telNumber: res.mobile,
          postalCode: '',
          provinceName: res.qqmap_address.province,
          cityName: res.qqmap_address.city,
          countyName: res.qqmap_address.district + res.qqmap_address.street,
          detailInfo: res.detail_info,
        }
        that.setData({
          wx_address_info: address,
          a_status:1
        })
      }
    })
  },
  initgetAddressListData: function (data) {
    var person = wx.getStorageSync("person");
    var moren = wx.getStorageSync("moren");
    
    console.log("刀女")
    console.log(person)
    console.log("刀男")
    var that = this
    that.setData({
      address_list: data,
      glo_is_load: false
    })
    if (that.data.a_status==0){
      if (that.data.address_list.qqmap_address != null) {
        let addres_info = {
          userName: that.data.address_list.name,
          nationalCode: '',
          telNumber: that.data.address_list.mobile,
          postalCode: '',
          provinceName: that.data.address_list.qqmap_address.province,
          cityName: that.data.address_list.qqmap_address.city,
          countyName: that.data.address_list.qqmap_address.district + that.data.address_list.qqmap_address.street,
          detailInfo: that.data.address_list.detail_info,
        };
        console.log(that.data.address_list)
        console.log("亚索")
        that.setData({ wx_address_info: addres_info })
      }
    }
    console.log(that.data.a_status)
    console.log("小法师")
    
    // if(that.data.a_status!=1){
    //   util.getDefaultAddress(function (res) {
    //     if (res.wxAddress == undefined && res.qqmap_address == undefined) {
    //       return;
    //     }
    //     if (res.wxAddress) {
    //       that.setData({
    //         wx_address_info: res.wxAddress
    //       })
    //     } else {
    //       // console.log(res);
    //       var address = {
    //         userName: res.name,
    //         nationalCode: '',
    //         telNumber: res.mobile,
    //         postalCode: '',
    //         provinceName: res.qqmap_address.province,
    //         cityName: res.qqmap_address.city,
    //         countyName: res.qqmap_address.district + res.qqmap_address.street,
    //         detailInfo: res.detail_info,
    //       }
    //       that.setData({
    //         wx_address_info: address
    //       })
    //     }
    //   })
    // }
    // if (moren == 'moren'){
    //   requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/getAddressList.html", {}, (data) => { that.anew_moren(data) }, this, { isShowLoading: false });
    // }
  },
  // anew_moren:function(data){
  //   var that = this
  //   that.setData({
  //     address_list: data,
  //     glo_is_load: false
  //   })
    
  //     let addres_info = {
  //       userName: that.data.address_list.name,
  //       nationalCode: '',
  //       telNumber: that.data.address_list.mobile,
  //       postalCode: '',
  //       provinceName: that.data.address_list.qqmap_address.province,
  //       cityName: that.data.address_list.qqmap_address.city,
  //       countyName: that.data.address_list.qqmap_address.district + that.data.address_list.qqmap_address.street,
  //       detailInfo: that.data.address_list.detail_info,
  //     };
  //     console.log(that.data.address_list)
  //     console.log("亚索")
  //     that.setData({ wx_address_info: addres_info })
   
  // },
  //确认选择地址
  chose_address_bind: function (e) {
    var that = this
    var aid = e.currentTarget.id
    that.setData({
      this_address_id: aid
    })
    var datas = that.data.address_list
    var address_str = '';
    var this_wx_address_info = {};
    for (var i = 0; i < datas.length; i++) {
      if (datas[i].id == aid) {
        datas[i].is_check = 'active'
        this_wx_address_info.userName = datas[i].consignee;
        this_wx_address_info.telNumber = datas[i].mobile;
        this_wx_address_info.provinceName = datas[i].province;
        this_wx_address_info.cityName = datas[i].city;
        this_wx_address_info.countyName = datas[i].district;
        this_wx_address_info.detailInfo = datas[i].address;
      } else {
        datas[i].is_check = ''
      }
    }
    that.setData({
      address_list: datas,
      wx_address_info: this_wx_address_info
    })
    that.select_address_close_bind()
  },
  //关闭收货地址
  select_address_close_bind: function () {
    var that = this
    that.setData({
      is_show_address: false
    })
  },
  //添加收货地址
  index_item_bind: function () {
    wx.navigateTo({
      url: '../../user/shop/address_add/index'
    })
  },
  shipping_name_change: function (e) {
    var total = 0;
    var c_yunfei = 0;
    var ct_yunfei = 0;
    if (e.detail.value == '到店自提') {
      total = ((this.data.all_g_price * 100) - (this.data.all_g_yunfei * 100)) / 100;
      c_yunfei = ((this.data.all_g_yunfei * 100) - (this.data.all_g_yunfei * 100)) / 100;
      ct_yunfei = ((this.data.tuanzhang_g_price * 100) - (this.data.all_g_yunfei * 100)) / 100;
      
      console.log(ct_yunfei);
      this.setData({ w_status:1})
      console.log(this.data.w_status)
      
    } else if (e.detail.value) {
      // total = ((this.data.all_g_price * 100) + (this.data.all_g_yunfei * 100)) / 100;
      total = ((this.data.all_g_price * 100) + (this.data.alternative_yunfei * 100)) / 100;      
      c_yunfei = ((this.data.all_g_yunfei * 100) + (this.data.alternative_yunfei * 100)) / 100;
      ct_yunfei = ((this.data.tuanzhang_g_price * 100) + (this.data.alternative_yunfei * 100)) / 100;
      
      this.setData({ w_status: 0 })
      console.log(ct_yunfei);
      
      console.log(this.data.w_status)
    }
    this.setData({
      shipping_name: e.detail.value,
      all_g_price: total.toFixed(2),
      all_g_yunfei: c_yunfei,
      tuanzhang_g_price: ct_yunfei,

    })
  },
  mapNavigation: function (e) {
    var that = this
    wx.openLocation({
      latitude: parseFloat(that.data.siteInfo ? that.data.siteInfo.latitude:that.data.qhaddress.store_gps_lat),
      longitude: parseFloat(that.data.siteInfo ? that.data.siteInfo.longitude :that.data.qhaddress.store_gps_lng)
    })
  },
  chooseStie:function(){
    dg.navigateTo({
      url: '/pages/tuan/site/site?sid=' + this.data.store_id,
      success:function(res){
        console.log(res);
      }
    })
  }
})