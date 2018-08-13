var app_index_path="/pages/store/store-info/index";var DUOGUAN_HOST_URL = "https://619900.ixiaochengxu.cc";var user_token = "gh_bae056c74297";var app_config_version = 10213;var dg_ext = ( typeof (wx) === "undefined" ? my : wx ).getExtConfigSync();if (dg_ext && dg_ext.host) {DUOGUAN_HOST_URL = dg_ext.host;user_token = dg_ext.token;app_config_version = dg_ext.version;}
module.exports = {
  duoguan_host_api_url:DUOGUAN_HOST_URL,
  duoguan_user_token: user_token,
  duoguan_app_index_path:app_index_path,
  duoguan_app_is_superhome:1,
  duoguan_share_info:'',
  duoguan_config_version:app_config_version,
  duoguan_error_log_url:DUOGUAN_HOST_URL + "/index.php/addon/DuoguanUser/Api/errorLog.html",
  duoguan_get_share_data_url:DUOGUAN_HOST_URL + "/index.php/addon/DuoguanUser/Api/getShareInfo.html",
  duoguan_auth_login_url:DUOGUAN_HOST_URL + "/index.php/home/weixin/slogin",
  duoguan_Launch_log_url:DUOGUAN_HOST_URL + "/index.php/home/index/logs_on",
  duoguan_get_user_menu_url:DUOGUAN_HOST_URL + "/index.php/addon/DuoguanUser/Api/getUserMenuList.html",
  duoguan_swiper_url:DUOGUAN_HOST_URL + "/index.php/addon/DuoguanSwiper/DuoguanSwiper/dataApi.html",
  duoguan_user_info_url:DUOGUAN_HOST_URL + "/index.php/addon/DuoguanUser/Api/getUserInfo.html",
  duoguan_user_info_post_url:DUOGUAN_HOST_URL + "/index.php/addon/DuoguanUser/Api/editUserInfo.html",
  duoguan_get_user_paylog_url:DUOGUAN_HOST_URL + "/index.php/addon/DuoguanUser/Api/getUserPaylog.html",
  duoguan_make_paydata_url:DUOGUAN_HOST_URL + "/index.php/addon/DuoguanUser/Api/makePayData.html",
}