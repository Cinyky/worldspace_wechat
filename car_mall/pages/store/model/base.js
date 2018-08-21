const util = require('../../../utils/util');
const _DgData = require('../../../utils/data');
import _dg from '../../../utils/dg';
class Base{
 constructor(){

 }
 /*获得元素上的绑定的值*/
 getDataSet(event, key) {
   return event.currentTarget.dataset[key];
 }

 //返回map sdk
 getMapSdk() {
   return util.getMapSdk();
 }
}
export {
  Base
};