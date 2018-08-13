var server = require('../../../utils/server');
Page({
	data: {
		orderId: '',
    xiajia:0
	},
	onLoad: function (options) {
		
		var app = getApp();
		var order = app.globalData.order;
		var orderId = order.order_id;
		this.setData({order:order});
    var that=this;
		console.log('order id : ' + orderId);

    server.getJSON('/Cart/getWXPayData/user_id/' + 1 +"/order_id/" + orderId,function(res){

      if (res.data.status==0){
        that.setData({ xiajia: 1 });
      }else{
        app.globalData.wxdata = res.data.result;
      }
		});
	},
	pay: function () {
		var app = getApp();
    this.is_xiajia();
		var that = this;
		var wxdata =       app.globalData.wxdata.wdata
		var timeStamp = wxdata.timeStamp + "";
		var nonceStr = wxdata.nonceStr + "";
		var package1 = wxdata.package
		var sign = wxdata.sign;
			 wx.requestPayment({
			    'nonceStr': nonceStr,
		       'package': package1,
			    'signType': 'MD5',
				'timeStamp': timeStamp,
			    'paySign': sign,
			    'success':function(res){
             		 	//给管理员发送短信通知
           			 server.getJSON('/Aliyundysms/sendSms_notice', { store_id: that.data.order.store_id, order_id: that.data.order.order_id});
							wx.showToast({ title: '支付成功', icon: 'success', duration: 2000 })
                setTimeout(function doHandler(){
                  wx.navigateBack({
                    delta: 1, // 回退前 delta(默认为1) 页面
                    success: function(res){
                      // success
                    },
                    fail: function() {
                      // fail
                    },
                    complete: function() {
                      // complete
                    }
                  })
                },2000);
			    },
			    'fail':function(res){
			    		console.log(res);
							wx.showToast({ title: '支付失败', icon: 'success', duration: 2000 })
                setTimeout(function doHandler(){
                  wx.navigateBack({
                    delta: 1, // 回退前 delta(默认为1) 页面
                    success: function(res){
                      // success
                    },
                    fail: function() {
                      // fail
                    },
                    complete: function() {
                      // complete
                    }
                  })
                },2000);
			    }
			 })
	},
  is_xiajia:function(){
    if(this.data.xiajia){
      wx.showToast({ title: '商品下架了', icon: 'fail', duration: 2000 });
      setTimeout(function doHandler() {
        wx.navigateBack({
          delta: 1, // 回退前 delta(默认为1) 页面
          success: function (res) {
            // success
          },
          fail: function () {
            // fail
          },
          complete: function () {
            // complete
          }
        })
      }, 1000);
      return;
    }
  }
})