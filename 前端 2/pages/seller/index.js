var server = require('../../utils/server');
Page({
  data:{},
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    server.getJSON("/Store/getStoreClass",function(res){
            var store_class = res.data;
            for(var i = 0 ; i< store_class.length;i++){
              if(i == 0)
              {
                 store_class[i].select = 1;
                 that.getStoreList(store_class[i].sc_id);
                 }
              else{
                store_class[i].select = 0;
              }
            }
            that.setData({store_class:store_class});
    });
  },
  getStoreList:function(sc_id){
    var that = this;
    server.getJSON("/Store/getStoresnormal",{cid:sc_id},function(res){
            var stores = res.data;
            
            that.setData({stores:stores});
    });
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  seller: function (e) {
    var store_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../seller/seller/seller?store_id=' + store_id
    })
  },
  take:function(e){
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
  phoneNumber: phone //仅为示例，并非真实的电话号码
})
  },
  onClickClass:function(e){
    var class_id = e.currentTarget.dataset.id;
    var store_class = this.data.store_class;
    for(var i = 0 ; i< store_class.length;i++){
              if(store_class[i].sc_id == class_id)
              {
                 store_class[i].select = 1;
                 this.getStoreList(store_class[i].sc_id);
              }
              else{
                store_class[i].select = 0;
              }
            }
           this.setData({store_class:store_class});
  }
})