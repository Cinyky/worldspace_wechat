const requestUtil = require('../../../utils/requestUtil');
const util = require('../../../utils/util');
const _DgData = require('../../../utils/data');
import _dg from '../../../utils/dg';
import {
  Base
} from 'base.js';
class Store extends Base {

  constructor() {
    super();
    this.baseRestUrl = _DgData.duoguan_host_api_url;
    this.lat = _dg.getStorageSync('LATITUD')
    this.lng = _dg.getStorageSync('LONGITUDE')
  }

  /**
   * 获取商品列表 
   * sort_type :1-距离最近；2-销量最高；3-最新入住；4-智能排序
   */
  getStoreList(callback, params) {

    var param = {
      page_index: params.page_index ? params.page_index : 1,
      page_size: params.page_size ? params.page_size:20,
      ws_lat: params.lat ? params.lat : _dg.getStorageSync('LATITUD'),
      ws_lng: params.lng ? params.lng : _dg.getStorageSync('LONGITUDE'),
      store_cate: params.store_cate ? params.store_cate : '',
      keywords: params.keywords ? params.keywords : '',
      sort_type: params.sort_type ? params.sort_type : 1
    }
    requestUtil.get(_DgData.duoguan_host_api_url + '/index.php/addon/DgStore/Api/getStoreLists.html', param, (data) => {
      callback && callback(data)
    },this,{isShowLoading:false})
  }

  /**
   * 获取商品列表 
   * sort_type :1-距离最近；2-销量最高；3-最新入住；4-智能排序
   */
  getGoodsList(callback, params) {
    var param = {
      page_index: params.page_index ? params.page_index : 1,
      page_size: params.page_size ? params.page_size : 20,
      ws_lat: _dg.getStorageSync('LATITUD'),
      ws_lng: _dg.getStorageSync('LONGITUDE'),
      store_cate: params.store_cate ? params.store_cate : 1,
      keywords: params.keywords ? params.keywords : '',
      sort_type: params.sort_index ? params.sort_index : 1
    }
    requestUtil.get(_DgData.duoguan_host_api_url + '/index.php/addon/DgStore/Api/getStoreGoodsList.html', param, (data) => {
      callback && callback(data)
    })
  }




}

export {
  Store
};