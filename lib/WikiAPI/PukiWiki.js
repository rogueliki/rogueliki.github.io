if (typeof ActiveXObject != 'undefined' && typeof XMLHttpRequest == 'undefined') {
  XMLHttpRequest = function () { try { return new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) { return  new ActiveXObject("Microsoft.XMLHTTP"); } };
}

if (typeof WikiAPI == 'undefined') { var WikiAPI = {}; }
if (typeof WikiAPI.PukiWiki == 'undefined') {
  WikiAPI.PukiWiki = function (wiki) {
    this.wiki = wiki || 'index.php';
  };
}

// prototype
WikiAPI.PukiWiki.prototype.getURL = function (url) {
  var req = new XMLHttpRequest;
  req.open('GET', url, false);
  req.send(null);
  /*
  if (req.status == 200 || req.status == 304 || req.status == 0 || req.status == null) {
    return req.responseText;
  }
   */
  return req;
};

WikiAPI.PukiWiki.prototype.getAllPages = function () {
  var req = this.getURL(this.wiki + '?cmd=list');
  var lis = req.responseText.replace(/\r\n/g, '\n').match(/^   <li>.*<\/li>$/gm);
  // for (var i = 0; i < lis.length; ++i) {
  for (var i = 0, length = lis.length; i < length; ++i) {
    lis[i] = lis[i].match(/">(.*)<\/a>/)[1]; //"
  }
  return lis;
};


WikiAPI.PukiWiki.prototype.getPage = function (page_name) {
  var req = this.getURL(this.wiki + '?cmd=source&page=' + encodeURIComponent(page_name));

  return req.resposeXML
    ? req.responseXML.getElementById('source').innerHTML
    : req.responseText
      .replace(/\r\n/g, '\n')
      .match(/<pre id="source">((.*\n)*)<\/pre>/)[1];
};

WikiAPI.PukiWiki.prototype.getPageHTML = function (page_name) {
  var req = this.getURL(this.wiki + '?' + encodeURIComponent(page_name));

  return req.resposeXML
    ? req.responseXML.getElementById('body').innerHTML
    : req.responseText
      .replace(/\r\n/g, '\n')
      .match(/<div id="body">((.*\n)*)<\/div>\n  <\/td>\n <\/tr>\n<\/table>/)[1];
};
