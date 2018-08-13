var server = require('../../../utils/server');
var categoryId
var keywords
var cPage = 0;
var gsort = "shop_price";
var asc = "desc";
// 使用function初始化array，相比var initSubMenuDisplay = [] 既避免的引用复制的，同时方式更灵活，将来可以是多种方式实现，个数也不定的
function initSubMenuDisplay() {
	return ['hidden', 'hidden', 'hidden', 'hidden'];
}
//定义初始化数据，用于运行时保存
var initSubMenuHighLight = [
		['highlight','','','',''],
		['',''],
		['','',''],[]
	];

Page({
	data:{
		menu:["highlight","","",""],
		subMenuDisplay:initSubMenuDisplay(),
		subMenuHighLight:initSubMenuHighLight,
    sort_arr: [['shop_price-desc', 'shop_price-asc'], ['sales_sum-desc', 'sales_sum-asc'], ['on_time-desc', 'on_time-asc'], ['comment_count-desc', 'comment_count-asc']],
		goods: [],
		empty:false,
    flag: true,
    num: 1,
    minusStatus: 'disabled',
    textStates: ["", "redbg"],
	},
	search:function(e){

        keywords = this.data.keywords;
		cPage = 0;
		this.data.goods = [];
        this.getGoodsByKeywords(keywords,cPage,gsort+"-"+asc);
		
	},
	bindChange: function(e) {
		var keywords = e.detail.value;
		this.setData({
			keywords: keywords
		});
	},
	onLoad: function(options){
		categoryId = options.categoryId;
		keywords = options.keywords;
		if(!keywords){
      this.getGoods(categoryId, 0, this.data.sort_arr[0][0]);
    }else{
      this.getGoodsByKeywords(keywords, 0, this.data.sort_arr[0][0]);
    }
	},
	getGoodsByKeywords: function(keywords,page,sort){
		var that = this;
		var sortArray = sort.split('-');
		gsort = sortArray[0];
		asc = sortArray[1];
    server.getJSON('/Goods/search/keywords/' + keywords + "/p/" + page + "/sort/" + gsort + "/sort_asc/" + asc,function(res){
        var newgoods = res.data.result.goods_list
        var ms = that.data.goods
        for(var i in newgoods){
          ms.push(newgoods[i]);
        }
        wx.stopPullDownRefresh();
        if(ms.length == 0)
        {
          that.setData({
                      empty: true
                  });
        }else{
          that.setData({
            empty: false
          });
        }
              
        that.setData({
            goods: ms
        });

		});
	},

	getGoods: function(category, pageIndex,sort){
		var that = this;
		var sortArray = sort.split('-');
		gsort = sortArray[0];
		asc = sortArray[1];
    server.getJSON('/Goods/goodsList/id/' + category + "/sort/" + sortArray[0] + "/sort_asc/" + sortArray[1] + "/p/"+pageIndex,function(res){
		var newgoods = res.data.result.goods_list        
    var ms = that.data.goods
    for(var i in newgoods){
        ms.push(newgoods[i]);
    }
    if(ms.length == 0)
	  {
		  that.setData({
                empty: true
            });
  	}else 
	    that.setData({
                empty: false
      });
      wx.stopPullDownRefresh();
			that.setData({
                goods: ms
            });
		});
	},
	tapGoods: function(e) {
		var objectId = e.currentTarget.dataset.objectId;
		wx.navigateTo({
			url:"../../../../../detail/detail?objectId="+objectId
		});
	},
	tapSubMenu: function(t) {
      var a = this,
      e = t.currentTarget.dataset.sort,
      i = void 0 == t.currentTarget.dataset.default_sort_type ? -1 : t.currentTarget.dataset.default_sort_type,
      o = a.data.sort_type;
    if (a.data.sort == e) {
      if (- 1 == i) return;
      o = -1 == a.data.sort_type ? i : 0 == o ? 1 : 0
    } else o = i;
    a.setData({
      sort: e,
      sort_type: o
    })
		// 初始化状态
    this.setData({
        goods: []
    });
		cPage = 0;
		if(!keywords)
      this.getGoods(categoryId, 0, this.data.sort_arr[e][o]);
		else
      this.getGoodsByKeywords(keywords, 0, this.data.sort_arr[e][o]);

	},
	onReachBottom: function () {
		if(!keywords)
		this.getGoods(categoryId, ++cPage,gsort+"-"+asc);
		else
		this.getGoodsByKeywords(keywords, ++cPage,gsort+"-"+asc);
		wx.showToast({
		  title: '加载中',
		  icon: 'loading'
		})
	},
	onPullDownRefresh: function () {
		this.setData({
                goods: []
            });
		cPage = 0;
		if(!keywords)
		this.getGoods(categoryId, cPage,gsort+"-"+asc);
		else
		this.getGoodsByKeywords(keywords, cPage,gsort+"-"+asc);
	},

  //弹出购物车框
  addtocart: function (e) {
    var that = this;
    var goods_id = e.target.dataset.goods;
    server.getJSON('/Goods/goodsInfo/id/' + goods_id, function (res) {
      var goodsInfo = res.data.result;
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
    this.setData({ price: final_price });
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
      if (res.data.status == 1)
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 1000
        });
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
        wx.navigateTo({
          url: '../../order/checkout/checkout?cartIds=' + goods_id + '&amount=' + goods_num * goods.goods.shop_price
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
});