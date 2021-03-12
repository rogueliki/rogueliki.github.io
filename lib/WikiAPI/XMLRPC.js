if (typeof XMLRPC == 'undefined') {
  try {
    JSAN.use('XMLRPC.Minimal');
    JSAN.use('Object.Source');
  } catch (e) {
    throw 'WikiAPI requires JSAN to be loaded\n' + e;
  }
}

if (typeof WikiAPI == 'undefined') { var WikiAPI = {}; }
if (typeof WikiAPI.XMLRPC == 'undefined') {
  WikiAPI.XMLRPC = function (url) {
    this.rpc = new XMLRPC.Minimal(url);
  };
}

WikiAPI.XMLRPC.VERSION = '0.0.1';

WikiAPI.XMLRPC.prototype.getRPCVersionSupported = function () {
  return this.rpc.toObj(this.rpc.methodCall('wiki.getRPCVersionSupported'));
};
WikiAPI.XMLRPC.prototype.getAllPages = function () {
  return this.rpc.toObj(this.rpc.methodCall('wiki.getAllPages'));
};
WikiAPI.XMLRPC.prototype.getRecentChanges = function (time_stamp) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.getRecentChanges', time_stamp));
};
WikiAPI.XMLRPC.prototype.getPage = function (page_name) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.getPage', page_name));
};
WikiAPI.XMLRPC.prototype.getPageVersion = function (page_name) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.getPageVersion', page_name));
};
WikiAPI.XMLRPC.prototype.getPageHTML = function (page_name) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.getPageHTML', page_name));
};
WikiAPI.XMLRPC.prototype.getPageHTMLVersion = function (page_name) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.getPageHTML', page_name));
};
WikiAPI.XMLRPC.prototype.getPageInfo = function (page_name) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.getPageInfo', page_name));
};
WikiAPI.XMLRPC.prototype.getPageInfoVersion = function (page_name) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.getPageInfoVersion', page_name));
};
WikiAPI.XMLRPC.prototype.listLinks = function (page_name, version) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.listLinks', page_name, version));
};

WikiAPI.XMLRPC.prototype.getBackLinks = function (page_name) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.getBackLinks', page_name));
};
WikiAPI.XMLRPC.prototype.putPage = function (page_name, content, attributes) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.putPage', page_name, content, attributes));
};

WikiAPI.XMLRPC.prototype.getObject = function (object_name, padding) {
  return eval(this.rpc.toObj(this.rpc.methodCall('wiki.getObject', object_name, padding || '')));
};

WikiAPI.XMLRPC.prototype.putObject = function (object_name, object, padding) {
  return this.rpc.toObj(this.rpc.methodCall('wiki.putObject', object_name, Object.toLiteral(object), padding || ''));
};
