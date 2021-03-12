try { JSAN.use('Rogueliki.Setup'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded\n' + e; }

Rogueliki.Event = function () {
};

// called by this == rl
Object.extend(Rogueliki.Event, {
  Default: function (listener) {
    return function (key_code) {
      if (this.debug) {
        this.print(new String(key_code) + '(' + String.fromCharCode(key_code) + '): ');
      }
      return this.command(this.system, this.keyMap[key_code] || this.keyMap[String.fromCharCode(key_code)]);
    };
  },

  answerYN: function (listener) {
    return function (key_code) {
      var key = String.fromCharCode(key_code), ans;
      if (key.match(/[Yy]/)) {
        ans = true;
      } else if (key.match(/[Nn]/)) {
        ans = false;
      } else {
        return "Never mind.";
      }
      return this.eval(listener, null, ans) || true;
    };
  },

  inputLine: function (listener, value) {
    return this.readyInput('line', listener, value);
  },

  inputLines: function (listener, value) {
    return this.readyInput('lines', listener, value);
  },

  pause: function (listener) {
    return function (key_code) {
      return this.eval(listener, null, key_code) || true;
    };
  },

  selectDir: function (listener, center) {
    var pos = center instanceof Object ? center : this.player;
    return function (key_code) {
      var dir = this.keyMap.direction[key_code] || this.keyMap.direction[String.fromCharCode(key_code)];
      return dir
        ? this.eval(listener, null, dir) || true
        : "Never mind.";
    };
  },

  selectItem: function (listener, items) {
    items = items || this.player.items;
    var is_array = items instanceof Array;

    this.print((is_array ? Array.map : Object.map)(items, function (value, key) {
      return !is_array && key.length != 1
        ? ''
        : (is_array ? String.fromCharCode('a'.charCodeAt(0) + key) : key)
          + ' - ' + (value instanceof Rogueliki.Item ? this.command(value, 'look') : this.translate(value)) + '\n';
    }, this).join(''));

    return function (key_code) {
      var key = is_array ? key_code - 'a'.charCodeAt(0) : String.fromCharCode(key_code),
        item = is_array ? (key >= 0 ? items[key] : null) : items[key];
      //if (key == '?') { this.push(this.command(player 'listItem')); return; }
      return item ? this.eval(listener, null, item, key, items) || true : "Never mind.";
    };
  },

  selectItemHere: function (listener) {
    var select = rl.ready('selectItem', listener, this.player.items).handler;
    return function (key_code) {
      var key = String.fromCharCode(key_code);
      if (key == ',' || key == '-') {
        var items = this.map.item(this.player);
        if (items.length) {
          return this.ready('selectItem', listener, items);
        }
      }
      return select.call(this, key_code);
    };
  },

  selectItems: function (listener, all_items, defaults) {
    all_items = all_items || this.player.items;
    var is_array = all_items instanceof Array,
      selected = {},
      table = function () {
        return (is_array ? Array.map : Object.map)(all_items, function (value, key) {
          return !is_array && key.length != 1
            ? ''
            : '[' + (selected[key] ? 'o' : ' ') + '] '
              + (is_array ? String.fromCharCode('a'.charCodeAt(0) + key) : key)
              + ' - ' + (value instanceof Rogueliki.Item ? this.command(value, 'look') : value) + '\n';
        }, this).join('');
      }.bind(this);

    if (defaults) { // set default marks
      if (defaults instanceof Array) {
        Array.forEach(defaults, function (value, key) {
          return selected[value] = true;
        });
      } else if (defaults instanceof Object) {
        Object.forEach(defaults, function (value, key) {
          return selected[key] = value;
        });
      } else {
        (is_array ? Array.forEach : Object.forEach)(all_items, function (value, key) {
          return selected[key] = true;
        });
      }
    }

    this.print(table());

    return function (key_code) {
      var key = is_array ? key_code - 'a'.charCodeAt(0) : String.fromCharCode(key_code),
        item = is_array ? (key >= 0 ? all_items[key] : null) : all_items[key];
      if (item) {
        selected[key] = !selected[key];
      }
      if (key_code == 13) { // Enter
        var items = [], keys = [];
        (is_array ? Array.forEach : Object.forEach)(all_items, function (value, key) {
          if (selected[key]) {
            items.push(value);
            keys.push(key);
          }
        });
        return this.eval(listener, null, items, keys, all_items) || true;
      }
      return String.fromCharCode(key_code).match(/[A-Za-z]/) ? (this.print(table()), false) : "Never mind.";
    };
  },

  selectScreen: function (listener, center) {
    var pos = center instanceof Object ? center : this.player;
    return function (key_code) {
      var dir = this.keyMap.direction[key_code] || this.keyMap.direction[String.fromCharCode(key_code)];
      if (!dir) {
        return "Never mind.";
      }
      var x = pos.x + dir.x, y = pos.y + dir.y, obj;
      return x < 0 || this.map.size.x <= x || y < 0 || this.map.size.y <= y
        || this.eval(listener, null, obj = this.map.toScreen(x, y), obj._key, obj._container) // key and array work only for item
        || true;
    };
  },

  selectTile: function (listener, center) {
    var pos = center instanceof Object ? center : this.player;
    return function (key_code) {
      var dir = this.keyMap.direction[key_code] || this.keyMap.direction[String.fromCharCode(key_code)];
      if (!dir) {
        return "Never mind.";
      }
      var x = pos.x + dir.x, y = pos.y + dir.y;
      return x < 0 || this.map.size.x <= x || y < 0 || this.map.size.y <= y
        || this.eval(listener, null, this.map.tiles[y][x], x, this.map.tiles[y])
        || true;
    };
  },

  stop: function (listener) {
    return function (key_code) {
      return this.eval(listener, null, key_code);
    };
  }
});
