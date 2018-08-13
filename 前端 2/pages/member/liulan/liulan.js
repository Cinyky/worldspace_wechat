var server = require('../../../utils/server');
var cPage = 0;
Page({

	details:function(e){
var objectId = e.currentTarget.dataset.goodsId;
		wx.navigateTo({
			url:"../../goods/detail/detail?objectId="+objectId
		});

	},
     deleteGoods:function(e){
			 var that = this;
wx.showModal({
  title: '提示',
  showCancel:true,
  content: '确定删除该浏览记录吗？',
  success: function(res) {
    
    if (res.confirm) {

		 
		var user_id = getApp().globalData.userInfo.user_id
	  var goods_id = e.currentTarget.dataset.goodsId;;
		var ctype = 1;

    server.getJSON('/Goods/liulanGoods/user_id/' + user_id +"/goods_id/" + goods_id + "/type/" + ctype,function(res){
wx.showToast({ title: res.data.msg, icon: 'success', duration: 2000 })
				cPage = 0;
	      that.data.collects = [];
        that.getLiulanLists(0);
		});
		}}
})

	 },
	tabClick:function(e){
        var index = e.currentTarget.dataset.index
		var classs= ["text-normal","text-normal","text-normal","text-normal","text-normal","text-normal"]
		classs[index] = "text-select"
		this.setData({tabClasss:classs,tab:index})
	},
	
	onReachBottom: function () {
		this.getLiulanLists(++cPage);
		wx.showToast({
		  title: '加载中',
		  icon: 'loading'
		})
	},
	onPullDownRefresh: function () {
    cPage = 0;
	this.data.collects = [];
    this.getLiulanLists(0);
    
	},


	data: {
		orders: [],
		collects:[],
        tabClasss:["text-select","text-normal","text-normal","text-normal","text-normal"],
	},
	getLiulanLists:function(page)
	{
		var that = this;
		var user_id = getApp().globalData.userInfo.user_id
	

    server.getJSON('/User/getGoodsLiulan/user_id/' + user_id +"/page/" + page,function(res){
			var datas = res.data.result;
            var ms = that.data.collects
            for(var i in datas){
              ms.push(datas[i]['ymd'])
              for (var ii in datas[i]['data']){
                ms.push(datas[i]['data'][ii]);
              }
            }

      wx.stopPullDownRefresh();
			that.setData({
						collects: ms
					});
      console.log(ms)
		});
	},
	onLoad: function () {
    getApp().setPageNavbar(this);
		cPage = 0;
        this.getLiulanLists(0);

	    return ;
		
	}
});