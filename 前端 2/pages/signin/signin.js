// pages/others/this.calendar/this.calendar.js
var server = require('../../utils/server');
Page({
    data: {
        jifen_num:0,
        dataqd:"立即签到",
        datalq:0,
        dataqdts:"签到可获得x积分",
        disabled:false,
        selectedDate: '',//选中的几月几号
        selectedWeek: '',//选中的星期几
        curYear: 2017,//当前年份
        curMonth: 0,//当前月份
        daysCountArr: [// 保存各个月份的长度，平年
            31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
        ],
        weekArr: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        dateList: [],
       goods:[],
    },
    onLoad: function () {
        // 页面初始化 options为页面跳转所带来的参数
      var that = this;
      getApp().setPageNavbar(this);
      var user_id = getApp().globalData.userInfo.user_id;
      server.getJSON("/Jifen/getJifen", { user_id: user_id }, function (res) {
        console.log(res);
        if (res.data.bj == 1) {
         
          var dateList = that.data.dateList;
          var signdate = res.data.signdate;
          for (var k in signdate) {

            for (var i in dateList) {
              for (var j in dateList[i]) {

                if (dateList[i][j].value == signdate[k]) {
                  dateList[i][j]['active'] = 1;
                }
              }
            }
          }
          that.setData({
            jifen_num: res.data.jifen,
            datalq: res.data.sign_day,
            signdate : res.data.signdate,
            dateList: dateList,
            goods: res.data.goods,
           
          })
          if (res.data.sign>0){
            that.setData({
              dataqdts: '今日已签到，获得' + res.data.sign_jifen + '积分',
              dataqd: "已签到",
            
            })
          }else{
            that.setData({
              dataqdts: '签到可获得' + res.data.sign_jifen + '积分',
              dataqd: "立即签到",
            
            })
          }
        }
        else {
            app.redirectTo("../../login/login");
        }
      })
    },
    onReady: function () {
        // 页面渲染完成
    },

    onShow: function () {
        var today = new Date();//当前时间  
        var y = today.getFullYear();//年  
        var mon = today.getMonth() + 1;//月  
        var d = today.getDate();//日  
        var i = today.getDay();//星期  
        this.setData({
            curYear: y,
            curMonth: mon,
            selectedDate: y + '-' + mon + '-' + d,
            selectedWeek: this.data.weekArr[i]
        });

        this.getDateList(y, mon - 1);
    },
    getDateList: function (y, mon) {
        var vm = this;
        //如果是否闰年，则2月是29日
        var daysCountArr = this.data.daysCountArr;
        if (y % 4 == 0 && y % 100 != 0) {
            this.data.daysCountArr[1] = 29;
            this.setData({
                daysCountArr: daysCountArr
            });
        }
        //第几个月；下标从0开始实际月份还要再+1  
        var dateList = [];
        // console.log('本月', vm.data.daysCountArr[mon], '天');
        dateList[0] = [];
        var weekIndex = 0;//第几个星期
        for (var i = 0; i < vm.data.daysCountArr[mon]; i++) {
            var week = new Date(y + '-' + (mon + 1) + '-' + (i + 1)).getDay();
            dateList[weekIndex].push({
                value: y + '-' + (mon + 1) + '-' + (i + 1),
                date: i + 1,
                week: week
            });
            if (week == 0) {
                weekIndex++;
                dateList[weekIndex] = [];
            }
        }
        // console.log('本月日期', dateList);
        vm.setData({
            dateList: dateList
        });
    },
    selectDate: function (e) {
        var vm = this;
        // console.log('选中', e.currentTarget.dataset.date.value);
        vm.setData({
            selectedDate: e.currentTarget.dataset.date.value,
            selectedWeek: vm.data.weekArr[e.currentTarget.dataset.date.week]
        });
    },
    preMonth: function () {
        // 上个月
        var vm = this;
        var curYear = vm.data.curYear;
        var curMonth = vm.data.curMonth;
        curYear = curMonth - 1 ? curYear : curYear - 1;
        curMonth = curMonth - 1 ? curMonth - 1 : 12;
        // console.log('上个月', curYear, curMonth);
        vm.setData({
            curYear: curYear,
            curMonth: curMonth
        });

        vm.getDateList(curYear, curMonth - 1);
        vm.getsigndate();
    },
    nextMonth: function () {
        // 下个月
        var vm = this;
        var curYear = vm.data.curYear;
        var curMonth = vm.data.curMonth;
        curYear = curMonth + 1 == 13 ? curYear + 1 : curYear;
        curMonth = curMonth + 1 == 13 ? 1 : curMonth + 1;
        // console.log('下个月', curYear, curMonth);
        vm.setData({
            curYear: curYear,
            curMonth: curMonth
        });

        vm.getDateList(curYear, curMonth - 1);
        vm.getsigndate();
    },
    getsigndate: function () {
      var vm = this;
      var dateList = vm.data.dateList;
      var signdate = vm.data.signdate;
      for (var k in signdate) {

        for (var i in dateList) {
          for (var j in dateList[i]) {

            if (dateList[i][j].value == signdate[k]) {
              dateList[i][j]['active'] = 1;
            }
          }
        }
      }
      vm.setData({
        dateList: dateList,
      });
    },
    signin: function (e) {
      var that = this;
      var user_id = getApp().globalData.userInfo.user_id;
      server.getJSON("/Jifen/sign", { user_id: user_id }, function (res) {
        console.log(res)
        if (res.data.bj == 1) {
          var datalq = that.data.datalq;
          var jifen_num = parseInt(that.data.jifen_num) + parseInt(res.data.jifen)
          datalq = parseInt(datalq) + 1;

          var dateList = that.data.dateList;
          for (var i in dateList) {
            for (var j in dateList[i]) {
              if (dateList[i][j].value == res.data.sign_date) {
                dateList[i][j]['active'] = 1;
              }
            }
          }
          getApp().globalData.userInfo.pay_points = jifen_num;
          that.setData({
            dataqd: "已签到",
            datalq: datalq,
            jifen_num: jifen_num,
            dataqdts: "今日已签到，获得" + res.data.jifen+"积分",
            disabled: true,
            dateList: dateList
          });
        } else if (res.data.bj == 2){

        }
      })
        
    },
})