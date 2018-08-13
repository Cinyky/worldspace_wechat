// pages/rzagreement/rzagreement.js
var server = require('../../utils/server');
Page({

  data: {
      select: false
  },

  onLoad: function (options) {
  
  },
  formSubmit: function(e) {
	
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
	if(this.data.select==false){
		
			wx.showToast({
				title: '请先勾选同意协议',
				duration: 1000
			});	
			return ;
	}
	var that = this;
	var user_id = getApp().globalData.userInfo.user_id
    server.postJSON('/Store/register/user_id/' + user_id,e.detail.value,function(res){

		if(res.data.status == 1)
		{
			wx.showToast({
				title: '申请成功',
				duration: 1000
			});
            setTimeout(function () {
				wx.navigateBack();
			}, 1000);
			
		}else{
			
			wx.showToast({
				title: res.data.msg,
				duration: 3000
			});	
			
		}
	});
  },
  select(e) {
      let select = this.data.select;
      select = !select;
      this.setData({
          select: select,
      });
  },
})