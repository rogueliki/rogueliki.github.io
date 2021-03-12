if (typeof ActiveXObject != 'undefined' && typeof XMLHttpRequest == 'undefined') {
  XMLHttpRequest = function () { try { return new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) { return  new ActiveXObject("Microsoft.XMLHTTP"); } };
}

if (typeof XMLRPC == 'undefined') { var XMLRPC = {}; }
if (typeof XMLRPC.Minimal == 'undefined') {
  XMLRPC.Minimal = function (url) {
    this.url = url;
    this.req = new XMLHttpRequest;
  };
}

XMLRPC.Minimal.VERSION = '0.0.2';

XMLRPC.Minimal.errorLevel = '';
XMLRPC.Minimal.contentMethod = 'XML';

XMLRPC.Minimal._DEBUG = false;

//--------------------------------------
// "Object to XML, DOM" methods

XMLRPC.Minimal.prototype._intXML = function (int_value) {
  return '<int>' + parseInt(int_value, 10) + '</int>';
};
XMLRPC.Minimal.prototype._intDOM = function (int_value) {
  return document.createElement('i4')
    .appendChild(document.createTextNode( parseInt(int_value, 10) )).parentNode;
};
XMLRPC.Minimal.prototype._i4XML = function (int_value) {
  return '<i4>' + parseInt(int_value, 10) + '</i4>';
};
XMLRPC.Minimal.prototype._i4DOM = function (int_value) {
  return document.createElement('int')
    .appendChild(document.createTextNode( parseInt(int_value, 10) )).parentNode;
};
XMLRPC.Minimal.prototype._floatXML = function (float_value) {
  return '<float>' + parseFloat(float_value) + '</float>';
};
XMLRPC.Minimal.prototype._floatDOM = function (float_value) {
  return document.createElement('float')
    .appendChild(document.createTextNode( parseFloat(float_value) )).parentNode;
};
XMLRPC.Minimal.prototype._stringXML = function (string_value) {
  return '<string>' + string_value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</string>';
};
XMLRPC.Minimal.prototype._stringDOM = function (string_value) {
  return document.createElement('string')
    .appendChild(document.createTextNode( string_value )).parentNode;
};
XMLRPC.Minimal.prototype._booleanXML = function (boolean_value) {
  return '<boolean>' + (boolean_value ? 1 : 0) + '</boolean>';
};
XMLRPC.Minimal.prototype._booleanXML = function (boolean_value) {
  return document.createElement('boolean')
    .appendChild(document.createTextNode( boolean_value ? 1 : 0 )).parentNode;
};

XMLRPC.Minimal.prototype._iso8601 = function (date) {
  return date.getUTCFullYear().toString()
    + (date.getUTCMonth()   < 10 ? '0' + date.getUTCMonth( )  : date.getUTCMonth())
    + (date.getUTCDay()     < 10 ? '0' + date.getUTCDay()     : date.getUTCMonth())
    + 'T'
    + (date.getUTCHours()   < 10 ? '0' + date.getUTCHours()   : date.getUTCHours())
    + ':'
    + (date.getUTCMinutes() < 10 ? '0' + date.getUTCMinutes() : date.getUTCMinutes())
    + ':'
    + (date.getUTCSeconds() < 10 ? '0' + date.getUTCSeconds() : date.getUTCSeconds());
};

XMLRPC.Minimal.prototype._dateTimeXML = function (date) {
  return '<dateTime.iso8601>' + this._iso8601(date) + '</dateTime.iso8601>';
};
XMLRPC.Minimal.prototype._dateTimeDOM = function (date) {
  return document.createElement('dateTime.iso8601')
    .appendChild(document.createTextNode( this._iso8601(date) )).parentNode;
};
XMLRPC.Minimal.prototype._arrayXML = function (arr) {
  var array = '<array><data>';
  for (var i = 0; i < arr.length; ++i) {
    array += this.toXML(arr[i]);
  } 
  return array + '</data></array>'
};
XMLRPC.Minimal.prototype._arrayDOM = function (arr) {
  var data = document.createElement('data');
  for (var i = 0; i < arr.length; ++i) {
    data.appendChild(this._valueDOM(arr[i]));
  } 
  return document.createElement('array').appendChild(data).parentNode;
};
XMLRPC.Minimal.prototype._structXML = function (obj) {
  var struct = '<struct>';
  for (var i in obj) {
    struct += '<member><name>' + i + '</name>' + this._valueXML(obj[i]) + '</member>';
  }
  return struct + '</struct>'
};
XMLRPC.Minimal.prototype._structDOM = function (obj) {
  var struct = document.createElement('struct');
  for (var i in obj) {
    var member = struct.appendChild(document.createElement('member'));
    member.appendChild(
      document.createElement('name').appendChild(document.createTextNode(i)).parentNode
    );
    member.appendChild(this._valueDOM(obj[i]));
  }
  return struct
};
XMLRPC.Minimal.prototype._valueXML = function (value) {
  return '<value>'
    + (
      (typeof value == 'number' && this._intXML(value))
      || (value instanceof Number && this._intXML(value))
      || (typeof value =='string' && this._stringXML(value))
      || (value instanceof String && this._stringXML(value))
      || (typeof value == 'boolean' && this._booleanXML(value))
      || (value instanceof Boolean && this._booleanXML(value))
      || (value instanceof Date && this._dateTimeXML(value))
      || (value instanceof Array && this._arrayXML(value))
      || (value !== null && typeof value == 'object' && this._structXML(value))
      || ''
      )
    + '</value>';
};
XMLRPC.Minimal.prototype._valueDOM = function (value) {
  return document.createElement('value').appendChild(
      (typeof value == 'number' && this._intDOM(value))
      || (value instanceof Number && this._intDOM(value))
      || (typeof value =='string' && this._stringDOM(value))
      || (value instanceof String && this._stringDOM(value))
      || (typeof value == 'boolean' && this._booleanDOM(value))
      || (value instanceof Boolean && this._booleanDOM(value))
      || (value instanceof Date && this._dateTimeDOM(value))
      || (value instanceof Array && this._arrayDOM(value))
      || (value !== null && typeof value == 'object' && this._structDOM(value))
      || null
    ).parentNode;
};

XMLRPC.Minimal.prototype.toXML = function (method_name, params) {
  var method_call = '<?xml version="1.0" ?><methodCall>'
    + '<methodName>' + method_name + '</methodName><params>';
  for (var i = 0; i < params.length; ++i) {
    method_call += '<param>' + this._valueXML(params[i]) + '</param>';
  }
  return method_call + '</params></methodCall>';
}

XMLRPC.Minimal.prototype.toDOM = function (method_name, params) {
  var method_call = document.createElement('methodCall');
  method_call.appendChild(
    document.createElement('methodName').appendChild(document.createTextNode(method_name)).parentNode
  );
  var params_ele = method_call.appendChild(document.createElement('params'));
  for (var i = 0; i < params.length; ++i) {
    var test = params_ele.appendChild(this._valueDOM(params[i]));
  }
  return method_call;
}
//--------------------------------------
// "DOM Object to Native Object" methods

XMLRPC.Minimal.prototype._intObj = function (int_ele) {
  return parseInt(int_ele.hasChildNodes() ? int_ele.firstChild.nodeValue : 0);
};
XMLRPC.Minimal.prototype._i4Obj = function (i4_ele) {
  return parseInt(i4_ele.hasChildNodes() ? i4_ele.firstChild.nodeValue : 0);
};
XMLRPC.Minimal.prototype._floatObj = function (float_ele) {
  return parseFloat(float_ele.hasChildNodes() ? float_ele.firstChild.nodeValue : 0);
};
XMLRPC.Minimal.prototype._stringObj = function (string_ele) {
  return String(string_ele.hasChildNodes() ? string_ele.firstChild.nodeValue : '');
};
XMLRPC.Minimal.prototype._booleanObj = function (boolean_ele) {
  return boolean_ele.hasChildNodes() ? parseInt(boolean_ele.firstChild.nodeValue, 10) != 0 : false;
};
XMLRPC.Minimal.prototype._dateTimeObj = function (date_ele) {
  return new Date(date_ele.hasChildNodes() ? date_ele.firstChild.nodeValue : new Date);
};
XMLRPC.Minimal.prototype._arrayObj = function (array_ele) {
  var arr = [];
  for (var i = 0, data; data = array_ele.childNodes[i]; ++i) {
    if (data.nodeType == 1 && data.nodeName == 'data') {
      for (var j = 0, child; child = data.childNodes[j]; ++j) {
        if (child.nodeType == 1 && child.nodeName == 'value') {
          arr.push(this._valueObj(child));
        }
      }
    }
  }
  return arr;
};
XMLRPC.Minimal.prototype._structObj = function (struct_ele) {
  var obj = {};
  for (var i = 0, member; member = struct_ele.childNodes[i]; ++i) {
    if (member.nodeType == 1 && member.nodeName == 'member') {
      var name, value;
      for (var j = 0, child; child = member.childNodes[j]; ++j) {
        if (child.nodeType == 1) {
          if (child.nodeName == 'name') {
            name = child.hasChildNodes() ? child.firstChild.nodeValue : '';
          } else if (child.nodeName == 'value') {
            value = this._valueObj(child);
          }
        }
      }
      obj[name] = value;
    }
  }
  return obj;
};
XMLRPC.Minimal.prototype._valueObj = function (value_ele) {
  for (var i = 0, child; child = value_ele.childNodes[i]; ++i) {
    if (child.nodeType != 1) { continue; }
    switch (child.nodeName) {
      case 'int': return this._intObj(child);
      case 'i4': return this._i4Obj(child);
      case 'float': return this._floatObj(child);
      case 'string': return this._stringObj(child);
      case 'boolean': return this._booleanObj(child);
      case 'dateTime.iso8601': return this._dateTimeObj(child);
      case 'array': return this._arrayObj(child);
      case 'struct': return this._structObj(child);
    }
  }
};
XMLRPC.Minimal.prototype.toObj = function (element) {
  var params = element.getElementsByTagName('param');
  for (var i = 0, param; param = params[i]; ++i) {
    for (var j = 0, child; child = param.childNodes[j]; ++j) {
      if (child.nodeType == 1 && child.nodeName == 'value') {
        return this._valueObj(child);
      }
    }
  }

  var faults = element.getElementsByTagName('fault');
  for (var i = 0, fault; fault = faults[i]; ++i) {
    for (var j = 0, child; child = fault.childNodes[j]; ++j) {
      if (child.nodeType == 1 && child.nodeName == 'value') {
        switch (XMLRPC.Minimal.errorLevel) {
          case 'die': throw new Error(this._valueObj(child));
          case 'warn': return this._valueObj(child);
        }
      }
    }
  }
};

//--------------------------------------
// method call

XMLRPC.Minimal.prototype.methodCall = function (method_name) {
  var params = [];
  for (var i = 1; i < arguments.length; ++i) { params.push(arguments[i]); }

  this.req.open('post', this.url, false);
  this.req.setRequestHeader('Content-Type', 'text/xml');

  if (XMLRPC.Minimal.contentMethod == 'XML') {    
    var method_call = this.toXML(method_name, params);
    //this.req.setRequestHeader('Content-Length', method_call.length); // not works at multi byte
  } else if (XMLRPC.Minimal.contentMethod == 'DOM') {
    var method_call = this.toDOM(method_name, params);
  }

  if (XMLRPC.Minimal._DEBUG) { alert(this.url + '\n' + method_call); }
  this.req.send(method_call);
  if (XMLRPC.Minimal._DEBUG) { alert(this.req.status + '\n' + this.req.responseText); }

  return this.req.responseXML;
};
