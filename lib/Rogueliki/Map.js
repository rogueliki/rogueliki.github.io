try { JSAN.use('Rogueliki.Base'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded\n' + e; }

Rogueliki.Map = function () {
  this.tiles = [ ['-', '-', '-', ' '], ['|', '.', '+', '#'], ['-', '-', '-', ' '] ];
  this.size = {x: 4, y: 3};
  this.start = {x: 1, y: 1};
};
Rogueliki.Map.prototype = new Rogueliki.Base;

// object
Object.extend(Rogueliki.Map, {
});

// prototype
Object.extend(Rogueliki.Map.prototype, {
  type: 'Rogueliki.Map',

  addItem: function (pos, item) {
    item._container = this.items[pos.y][pos.x];
    item._key = item._container.length;
    return this.items[pos.y][pos.x].push(item);
  },

  addPlayer: function (pos, player) {
    player.y = pos.y;
    player.x = pos.x;
    this.players[pos.y][pos.x] = player;
    return this._players.push(player);
  },

  commands: {},

  // convert simple into standard object
  complement: function () {
    /*
      In Firefox
      new Array(10).forEach(function (v, k, a) { ... this function is not called ... });
      Array.forEach2 is force loop *****
     */
    var sx = this.size.x, sy = this.size.y, _players = [];
    ['screen', 'tiles', 'items', 'players', '_cache'].forEach(function (type) {
      var old = this[type] || [];
      (this[type] = new Array(sy)).forEach2(function (value, y, cols) {
        (cols[y] = new Array(sx)).forEach2(function (value, x, rows) {
          var old_value = old[y] instanceof Array ? old[y][x] : undefined; // for shorter defined array 
          if (type == 'items') { // item is in Array
            rows[x] = old_value ? [].concat(old_value) : [];
            rows[x].forEach(function (value, key, array) {
              if (value instanceof Object) { // for remove
                value._key = key;
                value._container = array;
              }
            });
          } else {
            rows[x] = old_value
              || type == 'screen' && '&nbsp;' // screen default (HTML)
              || type == 'tiles' && ' ' // tile dafault
              || type == '_cache' && {} // cache dafault
              || undefined; // default
            if (rows[x] instanceof Object) {
              rows[x].x = x; rows[x].y = y; // for easy access
              if (type == 'players') {
                _players.push(rows[x]);
              }
            }
          }
        });
      });
    }, this);

    this._players = _players; // for easy access
    return this;
  },

  forEach: function (callback, self) {
    ['tiles', 'items', 'players'].forEach(function (type) {
      var each =
        type == 'items'
          ? function (value) { value.forEach(callback, this); }
          : callback;
      this[type].forEach(function (rows) { rows.forEach(each, this); }, self);
    }, this);
    ['map', 'upstairs', 'downstairs'].forEach(function (property) {
      if (this[property]) {
        callback.call(self, this[property], property, this);
      }
    }, this);
  },

  forEachPlayer: function (callback, self) { // access temp array for read mainly
    return this._players.forEach(callback, self);
  },

  item: function (x, y) {
    return x instanceof Object
      ? this.items[x.y][x.x]
      : this.items[y][x];
  },

  mapPlayer: function (callback, self) { // access temp array for read mainly
    return this._players.map(callback, self);
  },

  movePlayer: function (pos, player) {
    this.players[player.y][player.x] = null;
    player.y = pos.y;
    player.x = pos.x;
    this.players[pos.y][pos.x] = player;
  },

  player: function (x, y) {
    return x instanceof Object
      ? this.players[x.y][x.x]
      : this.players[y][x];
  },

  tile: function (x, y) {
    return x instanceof Object
      ? this.tiles[x.y][x.x]
      : this.tiles[y][x];
  },

  toLiteral: function (real_literal) {
    var obj = Rogueliki.simplify(this);
    if (rl.map == this) {
      obj.start = {x: rl.player.x, y: rl.player.y};
      obj.players[rl.player.y][rl.player.x] = undefined;
    }
    return typeof obj == 'string'
      ? Object.toLiteral(Rogueliki.typeMap[obj] || obj)
      : '{\n' + Object.map(obj, function (value, property) {
        var property_src = property == 'tiles' && '\" \"'
          || property == 'items' && '[]'
          || property == 'players' && 'null'
          || property == 'screen' && '\"&nbsp;\"'
          || undefined;
        return Object.toLiteral(property) + ': ' + (property_src
          ? '[\n' + Array.map(value, function (value, key) {
            return '[' + Array.map(value, function (value, key) {
              var src = Object.toLiteral(value);
              return property_src == src ? '' : src;
            }).join(',') + ']';
          }).join(',\n') + '\n]'
          : Object.toLiteral(value));
      }).join(',\n') + '\n}';
  },

  toScreen: function (x, y) {
    return this.players[y][x]
      || (this.items[y][x].length && this.items[y][x][0])
      || this.tiles[y][x];
  },

  toString: function () {
    return this.screen.map(function (rows) { return rows.join(''); }).join('\n');
  }
});

// execute command
Object.extend(Rogueliki.Map.prototype.commands, {
  Default: function (rl, order) {
    var arg = Array.slice(arguments, 2);
    return rl.eval.apply(rl, [this[order], this].concat(arg))
      || rl.command.apply(rl, [this.tile(rl.player), order].concat(arg));
  },

  arrive: function (rl) {
    return [
      rl.command(this, 'lookHere'),
      rl.command(this.tile(rl.player), 'arrive')
    ];
  },

  close: function (rl) {
    return [
      "In what direction?",
      rl.ready('selectTile', function (tile) {
        return this.command(tile, 'close') || "You see no objects to close there.";
      })
    ];
  },

  drop: function (rl, item) {
    return rl.command(this.tile(rl.player), 'drop', item)
      || (
        this.addItem(rl.player, item),
        "You drop %s.".format(rl.command(item, 'look'))
        );
  },

  go: function (rl, map) {
    return map
      && (Object.extend(this.start, {x: rl.player.x, y: rl.player.y}),
          rl.map = map,
          rl.command(rl.map, 'start'));
  },

  look: function (rl, looker, pos) {
    pos = pos || rl.player;
    return rl.player.other || [this.tile(pos)].concat(this.item(pos)).map(function (item_or_tile) {
      return rl.command(item_or_tile, 'look', looker);
    });
  },

  lookHere: function (rl) {
    var num = 0;
    return rl.command(this, 'look', function (name) {
      return (!num++ ? "You see here %s." : "You see %s.").format(name);
    });
  },

  open: function (rl) {
    return [
      "In what direction?",
      rl.ready('selectTile', function (tile) {
        return this.command(tile, 'open') || "You see no objects to open there.";
      })
    ];
  },

  pickUp: function (rl) {
    var items = this.item(rl.player), pickup = function (item) {
      return this.command(item, 'pickUp')
        || (this.remove(item),
            this.command(this.player, 'pickUp', item));
    };

    return items.length == 0 && "There is nothing here to pick up."
      || items.length == 1 && pickup.call(rl, items[0], 0, items)
      || [
        "What dou you want to pick up?",
        rl.ready('selectItem', pickup, items)
      ];
  },

  read: function (rl) {
    return rl.command(this.tile(rl.player), 'read')
      || rl.ready('selectItem', function (item) {
        return this.command(item, 'read');
      }, this.item(rl.player));
  },

  start: function (rl, pos) {
    Object.extend(rl.player, rl.eval(this.start, this));
    Object.extend(rl.player, rl.eval(pos) || {});
    this.addPlayer(rl.player, rl.player);
    return rl.eval(this.start, this);
  },

  walk: function (rl, dir) {
    if (!dir) {
      return [
        "In what direction?",
        rl.ready('selectDir', function (dir) {
          return this.command(this.map, 'walk', dir);
        })
      ];
    }
    var x = dir.x + rl.player.x, y = dir.y + rl.player.y;

    return (this.size.x <= x || this.size.y <= y || x < 0 || y < 0)
      || rl.command(rl.player, 'walk', dir)
      || rl.command(this.tile(rl.player), 'walk', dir)
      || (dir.x || dir.y) // { x: 0, y: 0 } is walk around
        && (rl.command(this.tile(x, y), 'block', dir)
            || rl.command(this.player(x, y), 'block', dir))
      || (this.movePlayer({ x: x, y: y }, rl.player),
          Object.extend(rl.player, { x: x, y: y }),
          rl.command(rl.system, 'arrive', dir));
  },

  walkNorth:     function (rl) { return rl.command(this, 'walk', { x:  0, y: -1 }); }, // k
  walkEast:      function (rl) { return rl.command(this, 'walk', { x:  1, y:  0 }); }, // l
  walkWest:      function (rl) { return rl.command(this, 'walk', { x: -1, y:  0 }); }, // h
  walkSouth:     function (rl) { return rl.command(this, 'walk', { x:  0, y:  1 }); }, // j
  walkNorthWest: function (rl) { return rl.command(this, 'walk', { x: -1, y: -1, skew: true }); }, // y
  walkNorthEast: function (rl) { return rl.command(this, 'walk', { x:  1, y: -1, skew: true }); }, // u
  walkSouthWest: function (rl) { return rl.command(this, 'walk', { x: -1, y:  1, skew: true }); }, // b
  walkSouthEast: function (rl) { return rl.command(this, 'walk', { x:  1, y:  1, skew: true }); }  // n
});
