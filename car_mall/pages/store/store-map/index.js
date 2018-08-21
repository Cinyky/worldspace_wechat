// pages/store/test/index.js
import _dg from '../../../utils/dg';
import {
  Store
} from '../model/store.model.js';
var store = new Store();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_index: 1,
    keywords: '',
    pos: false,
    latitude: 0,
    longitude:0,
    markers: [],
    polyline: []
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  },

  _inits: function() {
    var that=this
    var lat = _dg.getStorageSync('LATITUD')
    var lng = _dg.getStorageSync('LONGITUDE')    
    that.setData({
      latitude: lat ? lat : 23.099994,
      longitude: lng ? lng : 113.32452
    })
  },
 
  onReady: function(e) {
    this._inits()
    this.mapCtx = wx.createMapContext('myMap')
    this.mapCtx.moveToLocation()
    this._getStoreList();
  },

 
  onSearch:function(e){
    var keywords=e.detail.value;
    if(keywords){
      this.setData({
        keywords: keywords,
        pos:true
      })      
    }else{
      this.setData({
        keywords: '',
       
      })   
    }
    this._getStoreList();
  },

  //跳转到门店
  goToTarget: function(e) {
    var marketId = e.markerId-1
    var store_id = this.data.list[marketId].id
    this._jump(store_id);
    /*var markers = this.data.markers
    for (var i = 0; i < markers.length; i++) {
      var obj = markers[i];
      if (obj.id == marketId) {
        var params = {
          longitude: Number(obj.longitude),
          latitude: Number(obj.latitude),
          name: obj.name,
          address: obj.callout.content
        }       
        wx.openLocation(params)
        return
      }
    }*/
  },

  _zero: function() {
    this.setData({
      page_index: 1,
      markers: [],
      list: []
    })
  },

  getNearStore: function(e) {   
    var that = this
    if (e.type == 'end') {
      that._getStoreList();
    }
  },


  _getStoreList:function(){
    var that = this
    that.mapCtx.getCenterLocation({
      success: function (res) {
        that._zero()
        var newLat = res.latitude
        var newLng = res.longitude
        var obj = {
          page_index: that.data.page_index ? that.data.page_index : 1,
          page_size: 20,
          lat: newLat,
          lng: newLng,
          keywords: that.data.keywords ? that.data.keywords : '',
          sort_type: 1 //距离
        }
        store.getStoreList((info) => {
          that._fromatMarket(info)
        }, obj)
      }
    })
  },

  _fromatMarket: function(data) {
    var markers = []
    for (let i = 0; i < data.length; i++) {
      var tar = data[i]
      var tmp = {
        id: i + 1,
        store_id:tar.id,
        latitude: tar.store_gps_lat,
        longitude: tar.store_gps_lng,
        name: tar.store_name,
        iconPath: "/images/shopIco.png",
        width: 60,
        height: 60,
        callout: {
          color: '#ffffff',
          content: tar.store_name,
          fontSize: 14,
          borderRadius: 6,
          bgColor: '#2EA499',
          padding: 6,
          display: 'BYCLICK',
          textAlign: 'center'
        }
      }
      markers.push(tmp)
    }
    this.setData({
      markers: markers,
      list: data
    })  
    if(this.data.pos){
      this.includePoints()
    }    
  },



  //移动到当前用户位置--我的位置
  moveToLocation: function() {
    this.mapCtx.moveToLocation()
  },

  translateMarker: function() {
    var list=this.data.list
    var lat = list[0].store_gps_lat
    var lng = list[0].store_gps_lng
    this.mapCtx.translateMarker({
      markerId: 1,
      autoRotate: true,
      duration: 1,
      destination: {
        latitude: lat,
        longitude: lng,
      },
      animationEnd() {
        console.log('animation end')
      }
    })
  },

  includePoints: function() {
    var list = this.data.list
    var lat = list[0].store_gps_lat
    var lng = list[0].store_gps_lng
    this.setData({
      pos:false
    })
    this.mapCtx.includePoints({
      padding: [10],
      points: [{
        latitude: lat,
        longitude: lng,
      }]
    })
  },


  jumpToStore:function(e){
    var store_id = store.getDataSet(e,'id')   
    this._jump(store_id)
  },

  _jump:function(store_id){
    _dg.navigateTo({
      url: '../store-info/index?store_id=' + store_id,
    });
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})