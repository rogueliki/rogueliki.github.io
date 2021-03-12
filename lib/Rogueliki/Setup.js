if (typeof Rogueliki == 'undefined') { var Rogueliki = {}; }
if (typeof Rogueliki.Setup == 'undefined') { Rogueliki.Setup = {}; }

try {
  JSAN.use('Object.Source');
  JSAN.use('Array.Iterative');
} catch (e) {
  throw 'Rogueliki requires Object.Source and Array.Iterative to be loaded\n' + e;
}

if (!Object.extend) {
  Object.extend = function (obj, add) {
    Object.forEach(add, function (value, key) {
      this[key] = value;
    }, obj);
    return obj;
  };
}

/*
if (!Object.subtract) {
  Object.subtract = function (obj, subtract) {
    for (var i in subtract) {
      if (obj[i] === subtract[i]) {
        delete obj[i];
      }
    }
    return obj;
  };
}
 */

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

if (!String.prototype.center) {
  String.prototype.center = function (width, fillChar) {
    var str = '', fill = fillChar ? fillChar.substring(0, 1) : ' ', length = this.length;
    for (var i = length + 1; i < width; ++i, ++i) {
      str += fill;
    }
    return str + (width > length && (width - length) % 2 ? fill : '') + this + str;
  }
}

if (!String.prototype.ljust) {
  String.prototype.ljust = function (width, fillChar) {
    var str = this, fill = fillChar ? fillChar.substring(0, 1) : ' ';
    for (var i = this.length; i < width; ++i) {
      str += fill;
    }
    return str;
  }
}

if (!String.prototype.rjust) {
  String.prototype.rjust = function (width, fillChar) {
    var str = '', fill = fillChar ? fillChar.substring(0, 1) : ' ';
    for (var i = this.length; i < width; ++i) {
      str += fill;
    }
    return str + this;
  }
}

if (!String.prototype.format) {
  String.prototype.format = function () {
    var arg = arguments, i = 0;
    return Object.extend(new String(this.replace(/%(.)/g, function (match, type) {
      switch (type) {
        case 'd': return parseInt(arg[i++], 10);
        case 'f': return parseFloat(arg[i++]);
        case 's': return String(arg[i++]);
        case '%': return '%';
        default : return arg[i++];
      }
    })), {
      formatString: this,
      arguments: arg
    });
  };
}

if (!String.format) {
  String.format = function (self) {
    return String.prototype.format.apply(self, Array.slice(arguments, 1));
  };
}

// for debug
if (!String.prototype.alert) {
  String.prototype.alert = function () {
    alert(this);
    return this;
  };
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function (self) {
    var func = this;
    return function () {
      return func.apply(self, arguments);
    };
  };
}
