var server = require('../../utils/server');
var seat;
Page({
	data: {
		banner: [],
		goods: [],
		menu: [],
		store_class: [],
    is_show:0,
		bannerHeight: Math.ceil(290.0 / 750.0 * getApp().screenWidth),
		parent_id:0,
    shop_title:'',
    flag: true,
    num: 1,
    minusStatus: 'disabled',
    textStates: ["", "redbg"],
	},
	search: function (e) {
		wx.navigateTo({
			url: "../search/index"
		});
	},
	onLoad: function (options) {
		var parent_id=options.uid;
    if (parent_id){
      getApp().globalData.parent_id = parent_id;
    }
   var that=this;
		this.loadBanner();
		var app = getApp();

      app.getOpenId(function () {
        var openId = getApp().globalData.openid;
        server.getJSON("/User/validateOpenid",{openid:openId},function(res){
          if (res.data.code == 200) {
              getApp().globalData.userInfo = res.data.data;
              getApp().globalData.login = true;
            }
            else{
              if (res.data.code == '400') {
                app.redirectTo("../login/login");
              }
            }
          getApp().setPageNavbar(that);
        });
        });
		},
	onShareAppMessage: function () {
    var shop_name = this.data.shop_title;
		var app = getApp()
		if(app.globalData.login)
			var user_id = app.globalData.userInfo.user_id
		return {
      title: shop_name,
			path: '/pages/index/index?uid='+user_id,
		}
	},
	loadBanner: function () {

		    var that = this;

        server.getJSON("/Index/home",function(res){
		    var banner = res.data.result.ad;
				var goods = res.data.result.goods;
				var ad = res.data.ad;
				var menu = res.data.result.menu;
				var store_class = res.data.store_class;
        var is_show = res.data.result.is_show_store;
        var shop_title = res.data.result.shop_title;
				that.setData({
					banner: banner,
					goods: goods,
					ad: ad,
					menu:menu,
          is_show: is_show,
					store_class:store_class,
          shop_title: shop_title,
				});
		});	
	},
	loadMainGoods: function () {
		var that = this;
		var query = new AV.Query('Goods');
		query.equalTo('isHot', true);
		query.find().then(function (goodsObjects) {
			that.setData({
				goods: goodsObjects
			});
		});
	},
	onShow:function(){

	},
	clickBanner: function (e) {

    var adLink = e.currentTarget.dataset.adLink;
		wx.navigateTo({
      url: adLink
		});
	},
	showDetail: function (e) {
		var goodsId = e.currentTarget.dataset.goodsId;
		wx.navigateTo({
      url: "../goods/detail/detail?objectId=" + goodsId 
		});
	},
  dianpuTap:function(e){
    wx.navigateTo({
      url: "../seller/index"
    });
  },
  avatarTap: function (e) {
      // 拿到objectId，作为访问子类的参数
      var objectId = e.currentTarget.dataset.objectId;
      wx.navigateTo({
          url: "../../../../goods/list/list?categoryId=" + objectId
      });
  },
  
  //弹出购物车框
  addtocart: function(e) {
    var that = this;
    var goods_id = e.target.dataset.goods;
    server.getJSON('/Goods/goodsInfo/id/' + goods_id, function (res) {
      var goodsInfo = res.data.result;
      console.log('goodsInfo');
      that.setData({
        goodsone: goodsInfo
      });
      that.checkPrice();
      that.setData({ flag: false, jgw: false, gm: true });
    });
  },
  
  b: function () {
    this.setData({ flag: true })
  },

  /* 点击减号 */
  bindMinus: function () {
    var num = this.data.num;
    // 如果大于1时，才可以减
    if (num > 1) {
      num--;
    }
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num <= 1 ? 'disabled' : 'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
    this.checkPrice();
  },

  /* 点击加号 */
  bindPlus: function () {
    var num = this.data.num;
    // 不作过多考虑自增1
    num++;
    // 只有大于一件的时候，才能normal状态，否则disable状态
    var minusStatus = num < 1 ? 'disabled' : 'normal';
    // 将数值与状态写回
    this.setData({
      num: num,
      minusStatus: minusStatus
    });
    this.checkPrice();
  },

  /* 输入框事件 */
  bindManual: function (e) {
    // 将数值与状态写回
    this.setData({
      num: e.detail.value
    });
    this.checkPrice();
  },

  propClick: function (e) {
    var pos = e.currentTarget.dataset.pos;
    var index = e.currentTarget.dataset.index;
    var goods = this.data.goodsone
    for (var i = 0; i < goods.goods.goods_spec_list[index].length; i++) {

      if (i == pos)
        goods.goods.goods_spec_list[index][pos].isClick = 1;
      else
        goods.goods.goods_spec_list[index][i].isClick = 0;
    }

    this.setData({ goodsone: goods });
    this.checkPrice();
  },

  //更改价格信息
  checkPrice: function () {
    var goods = this.data.goodsone;
    var spec = ""
    this.setData({ price: goods.goods.shop_price });
    if (goods.goods.goods_spec_list != null) {

      for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {

        for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
          if (goods.goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "")
              spec = goods.goods.goods_spec_list[i][j].item_id
            else
              spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
          }
        }
      }
      var specs = spec.split("_");
      for (var i = 0; i < specs.length; i++) {
        specs[i] = parseInt(specs[i])
      }
      specs.sort(function (a, b) { return a - b });
      spec = ""
      for (var i = 0; i < specs.length; i++) {
        if (spec == "")
          spec = specs[i]
        else
          spec = spec + "_" + specs[i]
      }
      var price = goods['spec_goods_price'][spec].price;
    } else {
      var price = this.data.price;
    }
    var num = this.data.num;
    var final_price = price * num;
    this.setData({ price: final_price, spec_price: price});
  },

  //加入购物车
  addCartdone: function () {
    var goods = this.data.goodsone;
    var spec = ""
    if (goods.goods.goods_spec_list != null)
      for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {

        for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
          if (goods.goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "")
              spec = goods.goods.goods_spec_list[i][j].item_id
            else
              spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
          }
        }
      }
    var app = getApp()
    var that = this;
    var goods_id = that.data.goodsone.goods.goods_id;
    var goods_spec = spec;
    var session_id = app.globalData.openid//that.data.goods.goods.spec_goods_price
    var goods_num = that.data.num;
    var user_id = "0"
    if (app.globalData.login)
      user_id = app.globalData.userInfo.user_id

    server.getJSON('/Cart/addCart', { goods_id: goods_id, goods_spec: goods_spec, session_id: session_id, goods_num: goods_num, user_id: user_id }, function (res) {
      if (res.data.status == 1){
        if (res.data.shopExist == 0){
          var _navbar = getApp().globalData._navbar;
          for (var i = 0; i < _navbar.length; i++) {
            if (_navbar[i].url == "/pages/cart/cart") {
              _navbar[i].is_shownum = parseInt(_navbar[i].is_shownum) + 1;
            }
          };
          that.setData({
            _navbar: _navbar
          })
        }
       
        
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 1000
        });
      }
      else
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 1000
        });
    });
    that.setData({ flag: true });
  },

  //立即购买
  buy: function () {
    var goods = this.data.goodsone;
    var spec = ""
    if (goods.goods.goods_spec_list != null)
      for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {

        for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
          if (goods.goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "")
              spec = goods.goods.goods_spec_list[i][j].item_id
            else
              spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
          }
        }
      }
    var app = getApp()
    var that = this;
    var goods_id = that.data.goodsone.goods.goods_id;
    var goods_spec = spec;
    var session_id = app.globalData.openid//that.data.goods.goods.spec_goods_price
    var goods_num = that.data.num;
    var user_id = "0"
    if (app.globalData.login)
      user_id = app.globalData.userInfo.user_id
    //立即购买先清空购物车
    server.getJSON('/Cart/emptyCart', { session_id: session_id, user_id: user_id });

    server.getJSON('/Cart/addCart', { goods_id: goods_id, goods_spec: goods_spec, session_id: session_id, goods_num: goods_num, user_id: user_id }, function (res) {
      if (res.data.status == 1) {
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 2000
        });
        // wx.switchTab({
        // url: '../cart/cart'
        // });
        wx.navigateTo({
          url: '../order/ordersubmit/index?cartIds=' + goods_id + '&amount=' + goods_num * goods.goods.shop_price
        });
      }
      else
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 2000
        });
    });
    that.setData({ flag: true });
  },
  showDianpu: function (e) {
    var store_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../seller/seller/seller?store_id=' + store_id
    })
  },
})