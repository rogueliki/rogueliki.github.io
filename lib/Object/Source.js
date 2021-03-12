if (typeof Object.Source == 'undefined') {
  Object.Source = function (obj, literal) {
    return obj == null
      ? 'null'
      : obj[literal ? 'toLiteral' : 'toSource'] 
        ? obj[literal ? 'toLiteral' : 'toSource']()
        : Object[literal ? 'toLiteral' : 'toSource'](obj); 
  };
}

Object.Source.VERSION = '0.0.1';

try {
  JSAN.use('Array.Iterative');
  JSAN.use('String.Escape');
} catch (e) {
  throw 'Object.Source requires JSAN to be loaded\n' + e;
}

if (!Object.toLiteral) {
  Object.toLiteral = function (obj) {
    if (obj == null) {
      return 'null';
    } else if (obj.toLiteral) {
      return obj.toLiteral();
    }

    var result = [];
    Object.forEach(obj, function (value, key, array) {
      if (array.hasOwnProperty(key)) {
        result.push(Object.toLiteral(key) + ': ' + Object.toLiteral(value));
      }
    });
    return '{\n' + result.join(',\n') + '\n}';
  };
}

if (!Object.toSource) {
  Object.toSource = Object.toLiteral;
}

if (!Array.prototype.toLiteral) {
  Array.prototype.toLiteral = function () {
    return '[' + this.map(function (value) {
      return Object.toLiteral(value);
    }).join(', ') + ']';
  };
}

if (!Array.prototype.toSource) {
  Array.prototype.toSource = Array.prototype.toLiteral;
}

if (!String.prototype.toLiteral) {
  String.prototype.toLiteral = function () {
    return '"' + this.escape('"').escapeSpecial() + '"';
  };
}

if (!String.prototype.toSource) {
  String.prototype.toSource = String.prototype.toLiteral;
}

if (!Function.prototype.toLiteral) {
  Function.prototype.toLiteral = function () {
    return this.toString();
  };
}

if (!Function.prototype.toSource) {
  Function.prototype.toSource = Function.prototype.toLiteral;
}


if (!Boolean.prototype.toLiteral) {
  Boolean.prototype.toLiteral = function () {
    return this ? 'true' : 'false';
  };
}

if (!Boolean.prototype.toSource) {
  Boolean.prototype.toSource = Boolean.prototype.toLiteral;
}

if (!Number.prototype.toLiteral) {
  Number.prototype.toLiteral = function () {
    return this.toString();
  };
}

if (!Number.prototype.toSource) {
  Number.prototype.toSource = Number.prototype.toLiteral;
}
