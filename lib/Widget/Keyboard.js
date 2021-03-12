if (typeof Widget == 'undefined') { var Widget= {}; }
if (typeof Widget.Keyboard == 'undefined') {
  Widget.Keyboard = function (width, layout) {
    this.id = 'Widget-Keyboard-' + Widget.Keyboard.getId();
    if (width instanceof Array) {
      this.height = width[1];
      width = width[0];
    }
    this.width = width && parseFloat(width.replace('([0-9.]*)([^0-9]*)', '$1'), 10) || 6;
    this._size = width && width.replace(this.width, '') || 'ex';
    this.layout = layout || Widget.Keyboard.QWERTY_US;
    this.callback = {};
  };
}

Widget.Keyboard.VERSION = '0.0.3';

Widget.Keyboard.QWERTY_US = [
  ["` ~", "1 ! i ¹", "2 @ ²", "3 # ³", "4 $ ¤ £", "5 % €", "6 ^ ¼", "7 & ½", "8 * ¾", "9 ( '", "0 ) '", "- _ ¥", "= + × ÷", ["BackSpace", 2]],
  [["Tab", 1.5], "q Q ä Ä", "w W å Å", "e E é É é ë è  ê", "r R ®", "t T þ Þ", "y Y ü Ü ý", "u U ú Ú ú ü ù  û", "i I í Í í ï ì  î", "o O ó Ó ó ö ò õ ô", "p P ö Ö", "[ { «", "] } »", ["\\ | ¬ ¦", 1.5]],
  [["CapsLock", 2], "a A á Á á ä   â",  "s S ß §", "d D ð Ð", "f F", "g G", "h H", "j J", "k K", "l L ø Ø", "; : ¶ °", "' \" ´ ¨", ["Enter", 2]],
  [["Shift", 2.5], "z Z æ Æ", "x X", "c C © ¢", "v V", "b B", "n N ñ Ñ    ñ", "m M µ",  ", < ç Ç",  ". >",  "/ ? ¿", ["RightShift", 2.5]],
  [["Ctrl", 2], ["Alt", 1.5], ["Space    ' \" ` ~ ^", 6], ["AltGr", 1.5], "Left", "Down", "Up", "Right"]
];

Widget.Keyboard._id = 0;
Widget.Keyboard.getId = function () {
  return ++Widget.Keyboard._id;
};

Widget.Keyboard.prototype.addEventListener = function (event, callback) {
  this.callback[event] = this.callback[event] instanceof Array
    ? this.callback[event].concat(callback)
    : [callback];

  var self = this;
  for (var i = 0; i < this.allButtons.length; ++i) {
    document.getElementById(this.id + ' ' + this.allButtons[i])['on' + event] = function () {
      self.onEvent(event, this);
    };
  }
};

Widget.Keyboard.prototype.removeEventListener = function (event, callback) {
  var i;
  for (i = 0; i < this.callback[event].length; ++i) {
    if (this.callback[event][i] == callback) {
      this.callback[event].splice(i, 1);
    }
  }

  if (this.callback[event].length == 0) {
    for (i = 0; i < this.allButtons.length; ++i) {
      delete document.getElementById(this.id + ' ' + this.allButtons[i])['on' + event];
    }
  }
};

Widget.Keyboard.prototype.addTypeListener = function (international, callback) {
  var self = this, caps = false;
  this.addEventListener('click', function (key) {
    var value = key.value;
    if (value.indexOf('Shift') != -1) {
      return self.shift(1);
    } else if (value == 'CapsLock') {
      caps = !caps;
      return self.shift(1);
    }
    if (international) {
      if (value == 'AltGr') {
        return self.shift(2);
      } else if (value == '\'' && self.keySet != 4) {
        return self.shift(4);
      } else if (value == '"' && self.keySet != 5) {
        return self.shift(5);
      } else if (value == '`' && self.keySet != 6) {
        return self.shift(6);
      } else if (value == '~' && self.keySet != 7) {
        return self.shift(7);
      } else if (value == '^' && self.keySet != 8) {
        return self.shift(8);
      }
    }
    callback(key);
    return caps && self.keySet == 1 || self.shift(caps ? 1 : 0);
  });
};

Widget.Keyboard.prototype.keySet = -1;
Widget.Keyboard.prototype.shift = function (num) {
  var after = num >= 4
    ? num
    : num == 0 || this.keySet == num
      ? 0
      : this.keySet + num == 3
        ? 3
        : num;
  if (after != this.keySet) {
    var buttons = this.allButtons;
    for (var i = 0, length = buttons.length; i < length; ++i) {
      var button = document.getElementById(this.id + ' ' + buttons[i]);
      button.value = button.id.split(' ')[after + 1] || button.id.split(' ')[1];
    }
    this.keySet = after;
  }
};

Widget.Keyboard.prototype.onEvent = function (event, key) {
  var callback = this.callback;
  for (var i = 0; i < callback[event].length; ++i) {
    callback[event][i](key);
  }
};

Widget.Keyboard.prototype.write = function () {
  document.write(this.toForm());
  this.shift(0);
};

Widget.Keyboard.prototype._escape = function (string) {
  return string.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;');
};

Widget.Keyboard.prototype.toForm = function () {
  this.allButtons = [];
  var buttons = '', key_name, key_size, height = this.width * (this.height || 0.8)
  for (var i = 0; i < this.layout.length; ++i) {
    for (var j = 0; j < this.layout[i].length; ++j) {
      if (this.layout[i][j] instanceof Array) {
        key_name = this.layout[i][j][0];
        key_size = this.width * this.layout[i][j][1];
      } else {
        key_name = this.layout[i][j]
        key_size = this.width;
      }
      buttons += '<input type="button" id="' + this.id + ' ' + this._escape(key_name) + '" '
        + 'value="' + this._escape(key_name) +'" ' + 'style="width:' + key_size + this._size + ';height:' + height + this._size + '" />';
      this.allButtons.push(key_name);
    }
    buttons += '<br />\n';
  }

  return '<form class="Widget-Keyboard" method="get" action="#" id="' + this.id + '" name="' + this.id + '">\n'
    + buttons + '</form>\n';
};

