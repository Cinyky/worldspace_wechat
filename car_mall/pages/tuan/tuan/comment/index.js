var app = getApp()
var _function = require('../../../../utils/functionData');
const request = require('../../../../utils/requestUtil');
const DuoguanData = require('../../../../utils/data');
Page({
    data:{
        score_arr:[
            {
                'val':1,
                'ischeck':true
            },
            {
                'val':2,
                'ischeck':false
            },
            {
                'val':3,
                'ischeck':false
            },
            {
                'val':4,
                'ischeck':false
            },
            {
                'val':5,
                'ischeck':false
            }
        ],
        this_order_id:0,
        submitIsLoading:false,
        buttonIsDisabled:false,
        this_score_val:1
    },
    onLoad:function(options){
        var that = this
        var order_id = options.order_id;
        that.setData({
          this_order_id:order_id,
        })
    },
    formSubmit:function(e){
        var that = this
        var t_con = e.detail.value.content
        that.setData({
          submitIsLoading:true,
          buttonIsDisabled:true
        })
        if(t_con == ''){
            wx.showModal({
                title: '提示',
                content: '对不起，请输入留言内容',
                showCancel:false
            })
            that.setData({
                submitIsLoading:false,
                buttonIsDisabled:false
            })
            return false;
        }
        // _function.postCommentOrder(wx.getStorageSync("utoken"),that.data.this_order_id,that.data.this_score_val,t_con,that.initpostCommentOrderData,this)

        let url = DuoguanData.duoguan_host_api_url + '/index.php?s=/addon/DuoguanTuan/OrderApi/postComment';
        let data = {
          token: DuoguanData.duoguan_user_token,
          utoken: wx.getStorageSync("utoken"),
          oid: that.data.this_order_id,
          fval: that.data.this_score_val,
          fcon: t_con,
          _: Date.now()
        }
        request.get(url, data, (info)=>{
          console.log(info)
          wx:wx.showToast({
            title: info,
            icon: 'success',
            duration: 1500,
            complete: function(res) {
              wx.navigateTo({
                url: '../../tuan/list/index',
              })
            },
          })
        })

    },
    initpostCommentOrderData:function(data){
        var that = this
        that.setData({
            submitIsLoading:false,
            buttonIsDisabled:false
        })
        if(data.code == 1){
            wx.showModal({
                title: '提示',
                content: "订单评论成功",
                showCancel:false,
                success:function(res){
                      wx.redirectTo({
                        url: '../list/index'
                      })
                }
            })
        }else if(data.code == 2){
            wx.showToast({
                title: '登陆中',
                icon: 'loading',
                duration: 10000,
                success: function () {
                    app.getNewToken(function (token) {
                        that.setData({
                            local_global_token: token
                        })
                        wx.redirectTo({
                            url: '../comment/index?order_id=' + that.data.this_order_id
                        })
                    })
                }
            });
        }else if(data.code == 5){
            wx.showModal({
                title: '提示',
                content: data.info,
                showCancel:false
            })
            return false;
        }
    },
    set_score_bind:function(e){
        var that = this
        var max_val = e.currentTarget.id
        var datas = that.data.score_arr
        for(var i=0;i<datas.length;i++){
            if(i < max_val){
                datas[i].ischeck = true
            }else{
                datas[i].ischeck = false
            }
        }
        that.setData({
            score_arr:datas,
            this_score_val:max_val
        })
    }
})