const app = getApp();
const util = require('../../../utils/util');
const requestUtil = require('../../../utils/requestUtil');
const $ = require('../../../utils/underscore');
const _DuoguanData = require('../../../utils/data');
const WxParse = require('../../../wxParse/wxParse.js');
function GetLength(str) {
  return str.replace(/[\u0391-\uFFE5]/g, "aa").length;
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadhide: true,
    tuan_info: '',
    goods_pic: '',
    head_pic: '',
    qrcode: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
    })

  },

  initplacard: function (options) {
    let that = this;
    var userinfo = wx.getStorageSync('user_info');
    //获取商品信息
    if(options.tid>0){
      requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/Api/shareInfo.html',
        { tid: options.tid },
        (data) => {
          that.setData({
            tuan_info: data
          })
          //下载图片
          that.getImg();
        }, this, { isShowLoading: false });
    }else if(options.gid>0){
      requestUtil.get(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/Api/shareInfo.html',
        { gid: options.gid },
        (data) => {
          that.setData({
            tuan_info: data
          })
          //下载图片
          that.getImg();
        }, this, { isShowLoading: false });
    }
    var info = that.data;

  },
  //下载图片方法
  getImg: function () {
    var that = this
    var userinfo = wx.getStorageSync('user_info');
    //商品图片
    wx.downloadFile({
      url: that.data.tuan_info.g_img,
      success: function (res) {
        if (res.statusCode == 200) {
          that.setData({
            goods_pic: res.tempFilePath
          })
          console.log(_DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/Api/qrcode.html?tid=' + (that.data.options.tid ? that.data.options.tid : 0) + '&utoken=' + wx.getStorageSync("utoken") + '&token=' + _DuoguanData.duoguan_user_token + '&gid=' + (that.data.options.gid ? that.data.options.gid : 0));
          //  获取二维码
          wx.downloadFile({
            url: _DuoguanData.duoguan_host_api_url + '/index.php/addon/DuoguanTuan/Api/qrcode.html?tid=' + (that.data.options.tid ? that.data.options.tid : 0) + '&utoken=' + wx.getStorageSync("utoken") + '&token=' + _DuoguanData.duoguan_user_token + '&gid=' + (that.data.options.gid ? that.data.options.gid : 0),
            success: function (res) {
              that.setData({
                qrcode: res.tempFilePath
              })
              // 用户头像
              wx.downloadFile({
                url: that.data.tuan_info.headimgurl,
                success: function (res) {
                  that.setData({
                    head_pic: res.tempFilePath
                  })
                  that.canvasposter()
                },
                fail: function () {
                  //如果用户头像获取失败不影响海报生成
                  that.canvasposter()
                }
              })
            }
          })
        }
      },
    })


  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  canvasposter: function () {
    console.log(1231);
    let that = this;

    //用户信息
    let userinfo = wx.getStorageSync('user_info');
    //手机信息
    let phone = wx.getSystemInfoSync();

    // 手机宽度
    let phoneWidth = phone.screenWidth;
    //以手机的宽度为基准,设置比例尺 mpx
    let mpx = phoneWidth / 375;
    var context = wx.createCanvasContext('myCanvas');
    context.beginPath();
    //获取手机界面的中线
    let arcx = phoneWidth / 2;
    context.setFillStyle('#ffffff');
    context.fillRect(0, 0, phoneWidth, 3 * arcx);
    that.setData({
      c_w: phone.windowWidth,
      c_h: 3 * arcx
    })
    //放置商品图片
    //商品图片尺寸
    //获取图片高度
    wx.getImageInfo({
      src: that.data.goods_pic,
      success: function (res) {
        //固定图片宽度;计算图片应有高度
        var g_w = phoneWidth;
        var g_h = res.height / (res.width / g_w);
        console.log(g_w, g_h);
        context.drawImage(that.data.goods_pic, 0, 0, g_w, g_h);
        // 设置四比三你的大图比例
        if (g_h > g_w * 0.6) {
          context.setFillStyle('#ffffff');
          context.fillRect(0, g_w * 0.6, phoneWidth, 3 * arcx - g_w * 0.6);
          g_h = g_w * 0.6;
        }

        // // /放置用户头像
        // //头像边框

        var h_w = 50 * mpx;
        var h_h = 50 * mpx;
        context.arc(50 * mpx, g_h + 8 * mpx, 28 * mpx, 0, 2 * Math.PI)
        context.setFillStyle('#ffffff')
        context.fill()
        context.drawImage(that.data.head_pic, 25 * mpx, g_h - 17 * mpx, h_w, h_h);
        let bargainstr = that.data.tuan_info.nickname + (that.data.options.tid) ?'邀您参与拼团!':'邀您购买!'
        let bargainlen = GetLength(bargainstr);
        context.setFontSize(16 * mpx);
        context.setFillStyle('#000000');
        context.fillText(bargainstr, 76 * mpx, g_h + 20 * mpx);
        var descripution_str = that.data.tuan_info.g_description;
        var descripution_l = descripution_str.length;
        // 计算一行最多写字多少
        context.setFillStyle('#999999');
        context.setFontSize(14 * mpx);
        var line_max = Math.floor((phoneWidth - 60 * mpx) / (14 * mpx));
        var w_n = 0;//写入次数
        var s_str = '';
        for (var i = 0; i < descripution_l; i++) {
          s_str += descripution_str.substring(i, i + 1);
          if (((GetLength(s_str) / 2) > line_max - 5) && w_n >= 1) {
            s_str += '...';
            context.fillText(s_str, 25 * mpx, g_h + 50 * mpx + (w_n * 22 * mpx));
            w_n++;
            break
          }
          if (w_n < 2) {
            if (GetLength(s_str) >= (line_max * 2)) {
              console.log(GetLength(s_str));
              context.fillText(s_str, 25 * mpx, g_h + 50 * mpx + (w_n * 22 * mpx));
              w_n++;
              s_str = '';
            }
          }
        }
        if (w_n <= 0 &&s_str.length>0) {
          console.log(GetLength(s_str));
          context.fillText(s_str + '...', 25 * mpx, g_h + 50 * mpx + (w_n * 22 * mpx));
        }
          if(w_n==0){
            w_n = 1;
          }
        var now_h = g_h + 50 * mpx + (w_n * 22 * mpx);
        //商品名
        var g_name = that.data.tuan_info.g_name;
        let g_name_len = GetLength(g_name);
        context.setFontSize(18*mpx);
        context.setFillStyle('#333333');
        var max = Math.ceil(g_name_len / 20);
        for (var i = 1; i <= max; i++) {
          var b = (i - 1) * 10;
          var e = i * 10;
          if (i < 2) {
            var sub_name = g_name.substring(b, e);
            context.fillText(sub_name, 25 * mpx, now_h + i * (20 * mpx));
          } else if (i == 3) {
            var sub_name = g_name.substring(b, b + 6);
            context.fillText(sub_name + '...', 25 * mpx, now_h + i * (16 * mpx));
          }
        }
        if (max > 2) {
          max = 2
        }
        now_h = now_h + i * (16 * mpx);
        let g_pic = "￥ " + that.data.tuan_info.tuan_price;
        let G_pic_len = GetLength(g_pic);
        context.setFontSize(18*mpx);
        context.setFillStyle('#ff0000');
        context.fillText(g_pic, 25 * mpx, now_h+10*mpx);
        context.setFontSize(14*mpx);
        let t_num = that.data.tuan_info.tuan_num + "人团"
        context.setFillStyle('#333333');
        context.fillText(t_num, 110 * mpx, now_h+10*mpx);
        let noticstr = "长按识别二维码"
        let noticlen = GetLength(noticstr);
        context.setFontSize(14*mpx);
        context.setFillStyle('#333333');
        context.fillText(noticstr, 25 * mpx, now_h + 30 * mpx);
        context.setFontSize(20*mpx);
        context.fillText('→', 25 * mpx + 100*mpx, now_h + 34 * mpx);
        now_h = now_h + 50 * mpx
        context.drawImage(that.data.qrcode, phoneWidth - 10 * mpx - 140 * mpx, g_h + 50 * mpx + (w_n * 22 * mpx), 115 * mpx, 115 * mpx);

        // //获取当前海报的高度
        var pic_h = g_h + 50 * mpx + (w_n * 22 * mpx)+140*mpx;
        context.save();
        context.draw();
        setTimeout(function () {
          wx.canvasToTempFilePath({
            canvasId: 'myCanvas',
            height: pic_h,
            fileType: 'jpg',
            success: function (res) {
              console.log(res.tempFilePath);
              that.setData({
                imgurl: res.tempFilePath,
                cavhide: true,
                imghide: false,
                loadhide: false
              })
            }
          })
        }, 3000);

      }
    })
    // var g_w = phoneWidth - 20 * mpx;
    // var g_h = g_w * 0.6
    // context.drawImage(that.data.goods_pic, 10 * mpx, 10 * mpx, g_w, g_h);

  },
  savePic: function () {
    let that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.imgurl,
      success: function (res) {
        if (res.errMsg == 'saveImageToPhotosAlbum:ok') {
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          })
        }
      },
      fail: function (res) {

        wx.showModal({
          title: '提示',
          content: '请前往开启保存到相册权限!',
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({ success: function (res) { console.log(res) } })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    this.initplacard(this.data.options);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  goHome: function () {
    var url = '';
    if (_DuoguanData.duoguan_app_is_superhome == 0) {
      url += "/pages/tuan/index/index";
    } else {
      url += _DuoguanData.duoguan_app_index_path;
    }
    wx.switchTab({
      url: url,
      fail: () => {
        wx.navigateTo({
          url: url,
        })
      }
    })
  }

})