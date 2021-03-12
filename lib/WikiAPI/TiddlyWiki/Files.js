if (typeof ActiveXObject != 'undefined' && typeof XMLHttpRequest == 'undefined') {
  XMLHttpRequest = function () { try { return new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) { return new ActiveXObject("Microsoft.XMLHTTP"); } };
}

if (typeof WikiAPI == 'undefined') { var WikiAPI = {}; }
if (typeof WikiAPI.TiddlyWiki == 'undefined') { WikiAPI.TiddlyWiki = {}; }
if (typeof WikiAPI.TiddlyWiki.Files == 'undefined') {
  WikiAPI.TiddlyWiki.Files = function (wiki, dir) {
    this.wiki = wiki || 'empty.html';
    var format = String.prototype.format; // save
    this._importFromWiki('loadFile', 'saveFile', 'getLocalPath', 'convertUnicodeToUTF8', 'convertUTF8ToUnicode');
    String.prototype.format = format; // restore
    var pathname = location.pathname.replace(/^\//, 'file:///').replace(/\\/g, '/'); // for IE6
    this.locate = location.href.substring(0, location.href.indexOf(pathname) + pathname.lastIndexOf('/') + 1);
    this.dir = dir || this.wiki.substring(0, this.wiki.lastIndexOf('/') + 1) + 'wiki/';
  };
}

try {
  JSAN.use('Array.Iterative'); // Array.prototype.forEach
  JSAN.use('Object.Source'); // Object.Source
  JSAN.use('String.Escape'); // String.prototype.unscape
} catch (e) {
  throw 'WikiAPI.TiddlyWiki.Files requires JSAN to be loaded\n' + e;
}

WikiAPI.TiddlyWiki.Files.VERSION = '0.0.1';

// prototype
WikiAPI.TiddlyWiki.Files.prototype._importFromWiki = function () {
  eval(this._getURL(this.wiki).match(/<!--POST-BODY-END-->\n<script type="text\/javascript">((.*\n)*)<\/script>\n<script/m)[1]);
  for (var i = 0; i < arguments.length; ++i) {
    var name = arguments[i];
    this[name] = eval(name);
  }
};

WikiAPI.TiddlyWiki.Files.prototype.getAllPages = function () {
  return this.getPage('RecentChanges').replace(/^.*?\[\[(.*)\]\]$/gm, '$1').slice(0, -1).split('\n');
};

WikiAPI.TiddlyWiki.Files.prototype._getURL = function (url) {
  var req = new XMLHttpRequest;
  req.open('GET', encodeURI(url), false);
  req.send(null);
  return req.status == 200 || req.status == 304 || req.status == 0 || req.status == null
    ? req.responseText
    : '';
};

WikiAPI.TiddlyWiki.Files.prototype._getFile = function (path) {
  try {
    return this.convertUTF8ToUnicode(this.loadFile(path)).replace(/&#x?[0-9a-fA-F]+;/g, function (match) { 
      return match.unescapeHTML(); 
    });
  } catch (e) {
    alert(path + Object.toSource(e));
    return '';
  }
};

WikiAPI.TiddlyWiki.Files.prototype._getPath = function (wiki_name) {
  return this.dir + wiki_name.replace(/^(\w+:)?(.*)$/, function (match, space, name) {
    return (space ? encodeURIComponent(space.slice(0, -1)) + '/' : '') + encodeURIComponent(name);
  });
};

WikiAPI.TiddlyWiki.Files.prototype._getLocalPath = function (wiki_name) {
  return this.getLocalPath(this.locate + encodeURI(this._getPath(wiki_name)));
};

WikiAPI.TiddlyWiki.Files.prototype.getPage = function (page_name) {
  return this._getFile(this._getLocalPath(page_name) + '.txt');
};

WikiAPI.TiddlyWiki.Files.prototype.getPageHTML = function (page_name) {
  return this.getPage(page_name);
};

WikiAPI.TiddlyWiki.Files.prototype._assignNamespace = function (name, object, force) {
  var parent = function () { return this; }();
  name.split('.').forEach(function (value, key, array) {
    parent = parent[value] == null
      ? array.length - 1 == key // object undefined
        ? parent[value] = object
        : parent[value] = {}
      : array.length - 1 == key // object defined
        ? parent[value] = force
          ? object
          : parent[value]
        : parent[value];
  });
  return parent;
};

WikiAPI.TiddlyWiki.Files.prototype.getObject = function (object_name, padding) {
  if (padding) {
    this._assignNamespace(padding, function (obj) { return obj; }, false);
  }
  return eval(this._getFile(this._getLocalPath(object_name) + '.js').replace(/^\S*?\(/, padding + '('));
};

WikiAPI.TiddlyWiki.Files.prototype.putPage = function (page_name, content) {
  var changes = new Date().formatString('YYYY-0MM-0DD 0hh:0mm:0ss ')
    + '[[' + page_name + ']]\n'
    + this.getPage('RecentChanges').replace(new RegExp('^.*?\\[\\[' + page_name + '\\]\\]\n', 'gm'), '');

  return page_name != 'RecentChanges'
    && this.saveFile(
      this._getLocalPath('RecentChanges') + '.txt',
      this.convertUnicodeToUTF8(changes)
    ) && this.saveFile(
      this._getLocalPath(page_name) + '.txt',
       this.convertUnicodeToUTF8(content)
    );
};

WikiAPI.TiddlyWiki.Files.prototype.putObject = function (object_name, object, padding) {
  var json = window.netscape ? this.convertUnicodeToUTF8(Object.toLiteral(object)) : Object.toLiteral(object);
  if (padding) {
    json = padding + '(\n' + json + '\n);\n';
  }
  return this.saveFile(this._getLocalPath(object_name) + '.js', json);
};
