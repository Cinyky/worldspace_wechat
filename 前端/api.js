var _api_root = 'http://www.xiaocx4.com/index.php/WXAPI/';
var api = {
    
    order: {
         upload_image: _api_root +'user/upload_image',
         refund: _api_root + 'user/refund',
         refund_detail: _api_root + 'user/refund_detail',
      
    },

};
module.exports = api;