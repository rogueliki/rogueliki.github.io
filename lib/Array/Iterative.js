if (typeof Array.Iterative == 'undefined') { Array.Iterative = {}; }

Array.Iterative.VERSION = '0.0.1';

if (!Object.forEach) {
  Object.forEach = function (obj, callback, self) {
    var called = {};
    for (var i in obj) {
      called[i] = true;
      callback.call(self, obj[i], i, obj);
    }
    // for overridden DontEnum property (IE, NS) *****
    [
      'eval',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toSource',
      'toString',
      'unwatch',
      'valueOf',
      'watch'
    ].forEach(function (key) {
      if (!called.hasOwnProperty(key) && this.hasOwnProperty(key)) {
        callback.call(self, this[key], key, this);
      }
    }, obj);
  };
}

if (!Object.map) {
  Object.map = function (obj, callback, self) {
    var result = [];
    Object.forEach(obj, function (value, key) {
      result.push(callback.call(self, value, key, this));
    }, obj);
    return result;
  };
}

if (!Array.slice) {
  Array.slice = function (self) {
    return Array.prototype.slice.apply(self, Array.prototype.slice.call(arguments, 1));
  };
}

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (callback, self) {
    //for (var i = 0; i < this.length; ++i) {
    for (var i = 0, length = this.length; i < length; ++i) { // optimization
      callback.call(self, this[i], i, this);
    }
  };
}

// for firefox
if (!Array.prototype.forEach2) {
  Array.prototype.forEach2 = function (callback, self) {
    //for (var i = 0; i < this.length; ++i) {
    for (var i = 0, length = this.length; i < length; ++i) { // optimization
      callback.call(self, this[i], i, this);
    }
  };
}

if (!Array.forEach) {
  Array.forEach = function (self) {
    return Array.prototype.forEach.apply(self, Array.slice(arguments, 1));
  };
}

if (!Array.prototype.map) {
  Array.prototype.map = function (callback, self){
    var result = [];
    //for (var i = 0; i < this.length; ++i) {
    for (var i = 0, length = this.length; i < length; ++i) { // optimization
      result[i] = callback.call(self, this[i], i, this);
    }
    return result;
  };
}

if (!Array.map) {
  Array.map = function (self) {
    return Array.prototype.map.apply(self, Array.slice(arguments, 1));
  };
}

if (!Array.prototype.every) {
  Array.prototype.every = function (callback, self) {
    //for (var i = 0; i < this.length; ++i) {
    for(var i = 0, length = this.length; i < length; ++i) { // optimization
      if (!callback.call(self, this[i], i, this)) {
        return false;
      }
    }
    return true;
  };
}

if (Array.every) {
  Array.every = function (self) {
    return Array.prototype.every.apply(self, Array.slice(arguments, 1));
  };
}

if (!Array.prototype.some) {
  Array.prototype.some = function (callback, self) {
    //for (var i = 0; i < this.length; ++i) {
    for (var i = 0, length = this.length; i < length; ++i) { // optimization
      if (callback.call(thisObject,this[i],i,this)) {
        return true;
      }
    }
    return false;
  };
}

if (Array.some) {
  Array.some = function (self) {
    return Array.prototype.some.apply(self, Array.slice(arguments, 1));
  };
}
