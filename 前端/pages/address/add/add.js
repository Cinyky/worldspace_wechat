var server = require('../../../utils/server');
Page({
	isDefault: false,
	formSubmit: function(e) {
		// user 
		var mobile = this.data.mobile;
		// detail
		var zipcode = this.data.zipcode;
		// realname
		var consignee = this.data.consignee;
		// mobile
		var address = this.data.address;
		
		var is_default = 1;
		
		var user_id = getApp().globalData.userInfo.user_id
		
		var country = 1;

		var twon = 0;

		//var province = this.data.provinceObjects[this.data.provinceIndex].id;
    var province = this.data.provinceId;
		//var city = this.data.cityObjects[this.data.cityIndex].id;
    var city = this.data.cityId;
		//var district = this.data.regionObjects[this.data.regionIndex].id;
    var district = this.data.countyId;
		var that = this;
    server.postJSON('/User/addAddress/user_id/' + user_id,{user_id:user_id,mobile:mobile,zipcode:zipcode,consignee:consignee,address:address,is_default:is_default,country:country,twon:twon,province:province,city:city,district:district},function(res){
    if(res.data.status == 1)
		{
			wx.showToast({
				title: '保存成功',
				duration: 1000
			});

			if(that.data.returnTo == 1)
            setTimeout(function () {
			wx.navigateTo({
			  url: '../../order/ordersubmit/index'
		  });
			}, 1000);
      else
			{
				wx.navigateBack();
			}
		}else{
      var msg = res.data.msg;
      wx.showToast({
        title: '' + msg,
        duration: 1000
      });
    }


		});


		
	},
	nameChange: function(e) {
		
		var value = e.detail.value;
		
		this.setData({
			consignee: value
		});
	},
	addressChange: function(e) {
		
		var value = e.detail.value;
		
		this.setData({
			address: value
		});
	},
	phoneChange: function(e) {
		
		var value = e.detail.value;
		
		this.setData({
			mobile: value
		});
	},
	yzChange: function(e) {
		
		var value = e.detail.value;
		
		this.setData({
			zipcode: value
		});
	},
	data: {
		current: 0,
		province: [],
		city: [],
		region: [],
		town: [],
		provinceObjects: [],
		cityObjects: [],
		regionObjects: [],
		townObjects: [],
		areaSelectedStr: '请选择省市区',
		maskVisual: 'hidden',
		provinceName: '请选择'
	},
	getArea: function (pid, cb) {
		var that = this;
		
		server.getJSON('/User/getArea/parent_id/' + pid,function(res){
			cb(res.data.result);
		})
	},
	onLoad: function (options) {
		var returnTo = options.returnTo;
		this.setData({returnTo:returnTo});
		var that = this;
		// load province
		this.getArea(0, function (area) {
			var array = [];
			for (var i = 0; i < area.length; i++) {
				array[i] = area[i].name;
			}
			that.setData({
				province: array,
				provinceObjects: area
			});
		});
		// if isDefault, address is empty
		this.setDefault();
		// this.cascadePopup();
		this.loadAddress(options);
		// TODO:load default city...
	},
	loadAddress: function (options) {
		var that = this;
		if (options.objectId != undefined) {
			// 第一个参数是 className，第二个参数是 objectId

		}
	},
	setDefault: function () {
		var that = this;

	},
	cascadePopup: function() {
		var animation = wx.createAnimation({
			duration: 500,
			timingFunction: 'ease-in-out',
		});
		this.animation = animation;
		animation.translateY(-285).step();
		this.setData({
			animationData: this.animation.export(),
			maskVisual: 'show'
		});
	},
	cascadeDismiss: function () {
		this.animation.translateY(285).step();
		this.setData({
			animationData: this.animation.export(),
			maskVisual: 'hidden'
		});
	},
	provinceTapped: function(e) {
    	// 标识当前点击省份，记录其名称与主键id都依赖它
    	var index = e.currentTarget.dataset.index;
    	// current为1，使得页面向左滑动一页至市级列表
    	// provinceIndex是市区数据的标识
    	this.setData({
    		provinceName: this.data.province[index],
    		regionName: '',
    		townName: '',
    		provinceIndex: index,
    		cityIndex: -1,
    		regionIndex: -1,
    		townIndex: -1,
    		region: [],
    		town: [],
        provinceId: this.data.provinceObjects[index].id
    	});
    	var that = this;
    	//provinceObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    	// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    	this.getArea(this.data.provinceObjects[index].id, function (area) {
    		var array = [];
    		for (var i = 0; i < area.length; i++) {
    			array[i] = area[i].name;
    		}
			// city就是wxml中渲染要用到的城市数据，cityObjects是LeanCloud对象，用于县级标识取值
			that.setData({
				cityName: '请选择',
				city: array,
				cityObjects: area
			});
			// 确保生成了数组数据再移动swiper
			that.setData({
				current: 1
			});
		});
    },
    cityTapped: function(e) {
    	// 标识当前点击县级，记录其名称与主键id都依赖它
    	var index = e.currentTarget.dataset.index;
    	// current为1，使得页面向左滑动一页至市级列表
    	// cityIndex是市区数据的标识
    	this.setData({
    		cityIndex: index,
    		regionIndex: -1,
    		townIndex: -1,
    		cityName: this.data.city[index],
    		regionName: '',
    		townName: '',
    		town: [],
        cityId: this.data.cityObjects[index].id
    	});
    	var that = this;
    	//cityObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    	// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    	this.getArea(this.data.cityObjects[index].id, function (area) {
    		var array = [];
    		for (var i = 0; i < area.length; i++) {
    			array[i] = area[i].name;
    		}
			// region就是wxml中渲染要用到的城市数据，regionObjects是LeanCloud对象，用于县级标识取值
			that.setData({
				regionName: '请选择',
				region: array,
				regionObjects: area
			});
			// 确保生成了数组数据再移动swiper
			that.setData({
				current: 2
			});
		});
    },
    regionTapped: function(e) {
    	// 标识当前点击镇级，记录其名称与主键id都依赖它
    	var index = e.currentTarget.dataset.index;
    	// current为1，使得页面向左滑动一页至市级列表
    	// regionIndex是县级数据的标识
    	this.setData({
    		regionIndex: index,
    		townIndex: -1,
    		regionName: this.data.region[index],
    		townName: '',
        countyId: this.data.regionObjects[index].id
    	});
    	var that = this;
    	//townObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    	// getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    	this.getArea(this.data.regionObjects[index].id, function (area) {
			// 假如没有镇一级了，关闭悬浮框，并显示地址
			if (area.length == 0) {
				var areaSelectedStr = that.data.provinceName + that.data.cityName + that.data.regionName;
				that.setData({
					areaSelectedStr: areaSelectedStr
				});
				that.cascadeDismiss();
				return;
			}
			var array = [];
			for (var i = 0; i < area.length; i++) {
				array[i] = area[i].name;
			}
			// region就是wxml中渲染要用到的县级数据，regionObjects是LeanCloud对象，用于县级标识取值
			that.setData({
				townName: '请选择',
				town: array,
				townObjects: area
			});
			// 确保生成了数组数据再移动swiper
			that.setData({
				current: 3
			});
		});
    },
    townTapped: function (e) {
    	// 标识当前点击镇级，记录其名称与主键id都依赖它
    	var index = e.currentTarget.dataset.index;
    	// townIndex是镇级数据的标识
    	this.setData({
    		townIndex: index,
    		townName: this.data.town[index]
    	});
    	var areaSelectedStr = this.data.provinceName + this.data.cityName + this.data.regionName + this.data.townName;
    	this.setData({
    		areaSelectedStr: areaSelectedStr
    	});
    	this.cascadeDismiss();
    },
    currentChanged: function (e) {
    	// swiper滚动使得current值被动变化，用于高亮标记
    	var current = e.detail.current;
    	this.setData({
    		current: current
    	});
    },
    changeCurrent: function (e) {
    	// 记录点击的标题所在的区级级别
    	var current = e.currentTarget.dataset.current;
    	this.setData({
    		current: current
    	});
    },
    getWechatAddress: function (t) {
      var a = this;
      wx.chooseAddress({
        success: function (t) {
          var provinceName = t.provinceName;
          var cityName = t.cityName;
          var countyName = t.countyName;
          server.getJSON('/User/getWxaddressId/provinceName/' + provinceName + '/cityName/' + cityName + '/countyName/' + countyName, function (res) {
            a.setData({
              areaSelectedStr: t.provinceName + t.cityName + t.countyName,
              consignee: t.userName,
              mobile: t.telNumber,
              address: t.detailInfo,
              zipcode: t.postalCode,
              provinceId: res.data.provinceId,
              cityId: res.data.cityId,
              countyId: res.data.countyId
            })
          })
        }
      })
    }
})