var server = require('../../utils/server');
Page({

  data: {
    "yue": "30.00",
  },
  onLoad: function (options) {
	  
	 var app = getApp();
	  var user_money = app.globalData.userInfo.user_money;
	  this.setData({	
		user_money:user_money
		});

  },
  tixian: function (e) {
	  
	var  money=e.detail.value.money; 
	var  wechat=e.detail.value.wechat; 
	var  zhifubao=e.detail.value.zhifubao; 
	var app = getApp()
	if(app.globalData.login)
		var user_id = app.globalData.userInfo.user_id
		server.getJSON('/User/withdrawals/user_id/' + user_id +"/money/" + money +"/wechat/" + wechat+"/zhifubao/" + zhifubao,function(res){
			
			    wx.showToast({
					title: res.data.result.message,
					icon: 'success',
					duration: 1500
				});
          if (res.data.status){
            setTimeout(function () {
              wx.redirectTo({
                url: '../distribute/index'
              });
            }, 1000);
          }
			
		});	  

  },
})