if (typeof Rogueliki == 'undefined') { var Rogueliki = {}; }
if (typeof Rogueliki.HTML == 'undefined') { Rogueliki.HTML = {}; }
if (typeof Rogueliki.HTML.Setup == 'undefined') { Rogueliki.HTML.Setup = {}; }

try {
  JSAN.use('String.Escape');
  JSAN.use('Locale.Gettext', ':all');
} catch (e) {
  throw 'Rogueliki.HTML requires Locale.Gettext to be loaded\n' + e;
}
/*
if (typeof N_ == 'undefined') {
  N_ = function (str) {
    return str;
  };
}

if (typeof n_ == 'undefined') {
  n_ = function (a, b, n) {
    return n != 1 ? b : a;
  };
}
*/

if (!document.addEventHandler) {
  document.addEventHandler = function (element) {
    if (!element.addEventListener || window.opera) { // addEventListener('submit'.. don't works in opera
      if (element.attachEvent) {
        element.addEventListener = function (name, listener, useCapture) {
          return this.attachEvent('on' + name, listener);
        };
        element.removeEventListener = function (name, listener, useCapture) {
          return this.detachEvent('on' + name, listener);
        };
      } else {
        element.addEventListener = function (name, listener) {
          this['on' + name] = listener;
        };
        element.removeEventListener = function (name, listener) {
          delete this['on' + name];
        };
      }
    }
  };
}

if (!Rogueliki.HTML.Setup.getKeyCode) {
  Rogueliki.HTML.Setup.getKeyCode = function (e) {
    e = e || window.event;
    if (typeof e == 'number') {
      return e;
    } else if (typeof e == 'string') {
      return e.charCodeAt(0);
    } else if (e) { // IE, e instanceof Object == false
      return e.which || e.keyCode;
      //return this.toLowerByShift(e.which || e.keyCode, e.shiftKey); // when onkeydown and onkeyup
    } else {
      return 0;
    }
  };
}

if (!Rogueliki.HTML.Setup.toLowerByShift) {
  Rogueliki.HTML.Setup.toLowerByShift = function (key_code, shift) {
    return !shift && 65 <= key_code && key_code <= 90 ? key_code + 32 : key_code;
  };
}

document.addEventHandler(document);

if (typeof ActiveXObject != 'undefined' && typeof XMLHttpRequest == 'undefined') {
  XMLHttpRequest = function () {
    try {
      return new ActiveXObject('Msxml2.XMLHTTP');
    } catch (e) {
      try {
        return new ActiveXObject('Microsoft.XMLHTTP');
      } catch (e) {
        throw 'Browser does not support XMLHttpRequest\n' + e;
      }
    }
  };
}
