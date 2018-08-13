
import requestUtil from '../../../../utils/requestUtil';
import _DuoguanData from '../../../../utils/data';
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  /**
   * 组件的属性列表
   */
  properties: {
     
  },
  /**
   * 组件的初始数据
   */
  data: {
      is_show:false
  },

  ready() {
    !this.data.lazy && this.onPullDownRefresh();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPullDownRefresh(callback) {
      callback && callback();
    },
   dgtuanclose:function(){
     console.log(123)
     this.setData({
       is_show:false
     })
   }
  },
  ready: function (options){
    console.log(123);
    let that  =this;
    let pagesinfo = getCurrentPages();
    if(_DuoguanData.duoguan_app_index_path != "/" + pagesinfo[0].route){
      console.log(456);
      this.setData({
        is_show:true
      })
    }
  }
});

