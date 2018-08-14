var _function = require('../../../../utils/functionData.js');
var app = getApp()
const requestUtil = require('../../../../utils/requestUtil');
const _DuoguanData = require('../../../../utils/data');
Page({
    data:{
        userInfo:{},
        allAddress:[]
    },
    //加载完成后 读取用户信息
    onShow:function(){
        var that = this
        //获取用户收货地址
        // _function.getUserAddressList(wx.getStorageSync("utoken"),that.initGetUserAddressListData,this)
        requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanShop/OrderApi/getAddressList.html",{},(data)=>{console.log(data);that.initGetUserAddressListData(data)},this)
    },
    initGetUserAddressListData:function(data){
        var that = this
            that.setData({
                allAddress:data
            })
    },
    //添加新地址
    addrss_bind:function(e){
        var aid = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../address_add/index?aid=' + aid
        })
    },
    //下拉刷新
    onPullDownRefresh:function(){
        _function.getUserInfo(wx.getStorageSync("utoken"),this.initGetUserInfoData,this)
        setTimeout(()=>{
            wx.stopPullDownRefresh()
        },1000)
    }
})