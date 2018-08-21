// mallcart.js
var _function = require('../../../utils/functionData');
const requestUtil = require('../../../utils/requestUtil');
const _DuoguanData = require('../../../utils/data');
var app = getApp()
Page({
    data:{
        wldata:[],
        glo_is_load:true
    },
    onLoad:function(options){
        var that = this;
        var order_id = options.oid;
        that.setData({
          this_order_id:order_id,
        });
    },
    onShow:function(){
        var that = this;
        //获取物流信息
        // _function.getTuanWuliuInfo(that.data.this_order_id,that.initgetTuanWuliuInfoData,that);
        requestUtil.get(_DuoguanData.duoguan_host_api_url + "/index.php/addon/DuoguanTuan/OrderApi/getTuanWulinInfo.html",{oid:that.data.this_order_id},(data)=>{that.initgetTuanWuliuInfoData(data)},this,{isShowLoading:true});
    },
    initgetTuanWuliuInfoData:function(data){
        var that = this;
             that.setData({
                 wldata:data,
                 glo_is_load:false
             })
    }
})