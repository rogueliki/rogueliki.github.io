if (typeof WikiAPI == 'undefined') { var WikiAPI = {}; }
if (typeof WikiAPI.Cookie == 'undefined') {
  WikiAPI.Cookie = function () {
  };
}

WikiAPI.Cookie.VERSION = '0.0.1';

// prototype
WikiAPI.Cookie.prototype.getPage = function (page_name) {
  var pairs = document.cookie.split(';');
  for (var i = 0; i < pairs.length; ++i) {
    var pair = pairs[i].match(/\S+=\S+/)[0].split('=');
    if (decodeURIComponent(pair[0]) == page_name) {
      return decodeURIComponent(pair[1]);
    }
  }
  return '';
};

WikiAPI.Cookie.prototype.putPage = function (page_name, content) {
  if ((document.cookie + encodeURIComponent(content)).length > 4096) {
    return false;
  }
  var date = new Date;
  date.setTime(date.getTime() + 1000 * 60 * 60 * 24 * 365);
  try {
    document.cookie = encodeURIComponent(page_name) + '=' + encodeURIComponent(content)
      + '; expires=' + date.toUTCString();
    return true;
  } catch (e) {
    return false;
  }
};
