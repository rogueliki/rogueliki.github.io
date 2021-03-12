if (typeof String.Escape == 'undefined') { String.Escape = {}; }

String.Escape.VERSION = '0.0.1';

if (!Array.slice) {
  Array.slice = function (self) {
    return Array.prototype.slice.apply(self, Array.prototype.slice.call(arguments, 1));
  };
}

if (!Array.join) {
  Array.join = function (self) {
    return Array.prototype.join.apply(self, Array.slice(arguments, 1));
  };
}

if (!String.prototype.escapeHTML) {
  String.prototype.escapeHTML = function (nbsp) {
    return this.replace(/&/g, '&amp;').replace(/ /g, nbsp ? '&nbsp;' : ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
    //return document.createElement('div').appendChild(document.createTextNode(this)).parentNode.innerHTML;
  };
}

if (!String.escapeHTML) {
  String.escapeHTML = function (self) {
    return String.prototype.escapeHTML.apply(self, Array.slice(arguments, 1));
  };
}

if (!String.prototype.unescapeHTML) {
  String.prototype.unescapeHTML = function () {
    var p = document.createElement('p');
    p.innerHTML = this;
    return p.childNodes[0] ? p.childNodes[0].nodeValue : '';
  };
}

if (!String.unescapeHTML) {
  String.unescapeHTML = function (self) {
    return String.prototype.unescapeHTML.apply(self, Array.slice(arguments, 1));
  };
}

if (!String.prototype.escapeRegExp) {
  String.prototype.escapeRegExp = function () {
    return this.replace(/\\/g,'\\\\').replace(/([-.*+?^$()\[\]{}|])/g, '\\$1');
  };
}

if (!String.escapeRegExp) {
  String.escapeRegExp = function (self) {
    return String.prototype.escapeRegExp.apply(self, Array.slice(arguments, 1));
  };
}

if (!String.prototype.escapeSpecial) {
  String.prototype.escapeSpecial = function () {
    return this/*.replace(/\b/g,'\\b')*/.replace(/\f/g,'\\f').replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t').replace(/\v/g,'\\v');
  };
}

if (!String.escapeSpecial) {
  String.escapeSpecial = function (self) {
    return String.prototype.escapeSpecial.apply(self, Array.slice(arguments, 1));
  };
}

if (!String.prototype.escape) {
  String.prototype.escape = function () {
    return this.replace(/\\/g, '\\\\').replace(new RegExp('([' + Array.join(arguments, '').escapeRegExp() + '])', 'g'), '\\$1');
  };
}

if (!String.escape) {
  String.escape = function (self) {
    return String.prototype.escape.apply(self, Array.slice(arguments, 1));
  };
}
