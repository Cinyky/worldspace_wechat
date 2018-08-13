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
		sort:[['shop_price-desc','shop_price-asc'],['sales_sum-desc','sales_sum-asc'],['is_new-desc','is_new-asc'],'comment_count-asc'],
		goods: [],
		empty:false,
    flag: true,
    num: 1,
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
    cPage= 0;
		categoryId = options.categoryId;
		keywords = options.keywords;
		// 生成Category对象
        //var category = AV.Object.createWithoutData('Category', categoryId);
        //this.category = category;
 
		if(!keywords)
        this.getGoods(categoryId, 0,this.data.sort[0][0]);
		else
		this.getGoodsByKeywords(keywords,0,this.data.sort[0][0]);
    getApp().setPageNavbar(this);
	},
	getGoodsByKeywords: function(keywords,page,sort){
		var that = this;
		var sortArray = sort.split('-');
		gsort = sortArray[0];
		asc = sortArray[1];
  
        server.getJSON('/Goods/search/keywords/' + keywords + "/p/" + page + "/sort/" + gsort + "/sort_asc/" + asc,function(res){
var newgoods = res.data.result.goods_list
			var ms = that.data.goods;
            for(var i in newgoods){
               ms.push(newgoods[i]);
            }
	         that.setData({
                empty: false,
                goods: ms
            });
			
		});

	},

	getGoods: function(category, pageIndex,sort){
		var that = this;
		var sortArray = sort.split('-');
		gsort = sortArray[0];
		asc = sortArray[1];

server.getJSON('/Activity/group_list/' +  "p/"+pageIndex,function(res){
  var newgoods = res.data.result;
	var ms = that.data.goods; 
        for(var i in newgoods){
            ms.push(newgoods[i]);
        }
      that.setData({
        empty: false,
        goods: ms
      });


		});

	},
  //弹出购物车框
  addtocart: function (e) {
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
    this.setData({ price: final_price, spec_price: price });
  },

	tapGoods: function(e) {
		var objectId = e.currentTarget.dataset.objectId;
		wx.navigateTo({
			url:"../../../../../groupDetail/detail?objectId="+objectId
		});
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
        if (res.data.shopExist == 0) {
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
          url: '../../order/ordersubmit/index?cartIds=' + goods_id + '&amount=' + goods_num * goods.goods.shop_price
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

	tapMainMenu: function(e) {
//		获取当前显示的一级菜单标识
		var index = parseInt(e.currentTarget.dataset.index);
		// 生成数组，全为hidden的，只对当前的进行显示
		var newSubMenuDisplay = initSubMenuDisplay();
//		如果目前是显示则隐藏，反之亦反之。同时要隐藏其他的菜单
		if(this.data.subMenuDisplay[index] == 'hidden') {
			newSubMenuDisplay[index] = 'show';
		} else {
			newSubMenuDisplay[index] = 'hidden';
		}

        var menu = ["","","",""];
        menu[index] = "highlight";

       if(index == 3)
	   {
		   this.setData({
                goods: []
            });
		cPage = 0;
		   if(!keywords)
        this.getGoods(categoryId, 0,this.data.sort[index]);
		else
		this.getGoodsByKeywords(keywords, 0,this.data.sort[index]);
	   }

		// 设置为新的数组
		this.setData({
			menu:menu,
			subMenuDisplay: newSubMenuDisplay
		});
	},
	tapSubMenu: function(e) {
		// 隐藏所有一级菜单
		this.setData({
			subMenuDisplay: initSubMenuDisplay()
		});
		// 处理二级菜单，首先获取当前显示的二级菜单标识
		var indexArray = e.currentTarget.dataset.index.split('-');
		// 初始化状态
		// var newSubMenuHighLight = initSubMenuHighLight;
		for (var i = 0; i < initSubMenuHighLight.length; i++) {
			// 如果点中的是一级菜单，则先清空状态，即非高亮模式，然后再高亮点中的二级菜单；如果不是当前菜单，而不理会。经过这样处理就能保留其他菜单的高亮状态
			//if (indexArray[0] == i) {
				for (var j = 0; j < initSubMenuHighLight[i].length; j++) {
					// 实现清空
					initSubMenuHighLight[i][j] = '';
				}
				// 将当前菜单的二级菜单设置回去
			//}
		}
        this.setData({
                goods: []
            });
		cPage = 0;
		if(!keywords)
        this.getGoods(categoryId, 0,this.data.sort[indexArray[0]][indexArray[1]]);
		else
		this.getGoodsByKeywords(keywords, 0,this.data.sort[indexArray[0]][indexArray[1]]);

		// 与一级菜单不同，这里不需要判断当前状态，只需要点击就给class赋予highlight即可
		initSubMenuHighLight[indexArray[0]][indexArray[1]] = 'highlight';
		// 设置为新的数组
		this.setData({
			subMenuHighLight: initSubMenuHighLight
		});
	},
	onReachBottom: function () {
    
 
     if (!keywords)
     {
  
       this.getGoods(categoryId, ++cPage, gsort + "-" + asc);
     }
     else{
       this.getGoodsByKeywords(keywords, ++cPage, gsort + "-" + asc);
     }
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
      if (!keywords)
        this.getGoods(categoryId, cPage, gsort + "-" + asc);
      else
        this.getGoodsByKeywords(keywords, cPage, gsort + "-" + asc);
    }
	
});