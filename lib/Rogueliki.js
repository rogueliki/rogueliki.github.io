if (typeof Rogueliki == 'undefined') {
  // This time cannot use `var' because JSAN cannot find local object
  // when JSAN.use is recursive called.
  //var Rogueliki = function () {
  Rogueliki = function () {
    this.loaded = {};

    this.queue = [];
    this.line = '';
    this.lines = '';

    this.load('Rogueliki.Item');
    this.map = this.load('Rogueliki.Map');
    this.player = this.load('Rogueliki.Player');
    this.system = this.load('Rogueliki.System');
    this.keyMap = this.load('Rogueliki.KeyMap');
    this.wiki = null;
  };
}

Rogueliki.VERSION = '0.2.2';

try {
  JSAN.use('Rogueliki.Setup');
  JSAN.use('Rogueliki.Event');
  JSAN.use('Rogueliki.AI');
} catch (e) {
  throw 'Rogueliki requires JSAN to be loaded\n' + e;
}

// object
Object.extend(Rogueliki, {
  chrSize: 1,

  // called in type script
  defineType: function (type, proto) {
    var obj, parent;
    try {
      var parent_str = type.substring(0, type.lastIndexOf('.'));
      JSAN.use(parent_str);
      parent = eval(parent_str);
      obj = eval(type + ' = ' + function () { });
      obj.prototype = new parent;
    } catch (e) {
      throw 'DefineTypeError: ' + type + '\n' + Object.toSource(e);
    }
    obj.prototype.type = type;
    obj.prototype.constructor = obj;
    Object.extend(obj.prototype, typeof proto == 'function' ? proto(parent.prototype) : proto);
  },

  isHash: function (obj) {
    return obj instanceof Object
      && obj.constructor == Object // not Array
      && !obj.handler; // not handler object
  },

  // called in object script
  onLoad: function (obj) { return obj },

  roll: function (times, sides, option) {
    sides = sides || 6;
    var cast, result = 0;
    for (var i = 0; i < times; ++i) {
      cast = Math.floor(Math.random() * sides) + 1;
      result += option && typeof option[cast] == 'number'
        ? option[cast]
        : cast;
    }
    return result;
  },

  // simplify instance by type property
  simplify: function (source, real_literal) {
    if (source.id && !(real_literal || source._realLiteral)) { // id only
      return source.id;
    }

    var obj = { type: source.type }, temp_key = /^(id|x|y|_.*)$/, data_num = 0;
    Object.forEach(source, function (value, key, source) {
      if (!key.match(temp_key) && source.hasOwnProperty(key) && value !== null) {
        obj[key] = value;
        // if 'type' value only exists and all containers length be zero, notation is simple string
        if (!(key == 'type' || value instanceof Object && value.length === 0)) {
          ++data_num;
        }
      }
    });

    return data_num == 0 ? obj.type : obj;
  },

  strMap: {
    ' ': 'Rogueliki.Tile.Wall',                     '.': 'Rogueliki.Tile.Floor',
    '#': 'Rogueliki.Tile.Corridor',                 '|': 'Rogueliki.Tile.Wall.Y',
    '-': 'Rogueliki.Tile.Wall.X',                   '+': 'Rogueliki.Tile.Door',
    '<': 'Rogueliki.Tile.Floor.Staircase.Up',       '>': 'Rogueliki.Tile.Floor.Staircase.Down',
    '?': 'Rogueliki.Item.Scroll',                   '[': 'Rogueliki.Item.Armor',
    ')': 'Rogueliki.Item.Sword'
  },

  width: 80
});

Object.forEach(Rogueliki.strMap, function (value, key) {
  return this[value] = key;
}, Rogueliki.typeMap = {});

// prototype
Object.extend(Rogueliki.prototype, {
  // complement instance from type property
  complement: function (source) {
    var obj = {};
    try {
      JSAN.use(source.type);
      var type = eval(source.type);
      delete source.type; // duplication
      obj = new type;
      this.eval(obj.init, obj); // init instance
    } catch (e) {
      throw 'ComplementError: ' + source + '(' + source.type + ')\n' + Object.toSource(e);
    }
    Object.extend(obj, source);
    if (obj.complement) {
      obj = obj.complement();
    }
    return obj;
  },

  command: function (obj, order) {
    if (!(obj instanceof Object) || !obj.commands) {
      //throw new Error('invalid Rogueliki.prototype.command argument');
      return false;
    }
    this.loadAround(obj); // load around to command

    var is_default = false, param = (obj.commands[order] || (is_default = true, obj.commands['Default']))
      .apply(obj, [this].concat(Array.slice(arguments, is_default ? 1 : 2))); // extra arguments

    return typeof param == 'string' || param instanceof String
      ? this.translate(param)
      : param; 
  },

  draw: function () {
    // not implemented
  },

  // evaluate obj.param
  eval: function (param, self) {
    return typeof param == 'function'
      ? param.apply(
        self || this,
        self
          ? [this].concat(Array.slice(arguments, 2))
          : Array.slice(arguments, 2)
        )
      : param;
  },

  event: '',

  // forward to next --More--
  forward: function () {
    var line = '', lines, width = Rogueliki.width / Rogueliki.chrSize;
    this.more = false;
    while (this.queue.length > 0) {
      var param = this.queue.shift(), pre_param;
      while (param !== (pre_param = this.eval(param, this))) {
        param = pre_param; // for higher-order function
      }

      if (param instanceof Array) { // array is meta queue
        this.queue = param.concat(this.queue);
        continue;
      } else if (typeof param == 'string' || param instanceof String) { // string is for display
        param = this.translate(param);
        if (param.indexOf('\n') == -1) { // single line string
          if (param.length > width) { // for long line
            this.queue.unshift(param.substring(width - line.length));
            line += param.substring(0, width - line.length) + '--More--';
            this.more = true;
            break;
          } else if (line.length + param.length > width) { // for normal --More--
            this.queue.unshift(param);
            line += '--More--';
            this.more = true;
            break;
          } else { // if space have the luxury, concat string
            line += (Rogueliki.chrSize == 1 ? ' ': '') + param; // consider a termination space
          }
        } else { // multiple lines string
          if (lines) { // lines exists already
            this.queue.unshift(param);
            lines += '\n--More--';
            this.more = true;
            break;
          }
          lines = param.replace(/\n*$/, '');
        }
      } else if (param instanceof Object) { // object is for particular use
        if (typeof param.handler == 'function') { // update-handler object
          this.event = param.event;
          this.handler = param.handler;
        }
      }
    }

    if (line) { // check message exists, for continuous display
      this.line = line; // clear before message
    }
    if (lines) {
      this.lines = lines;
    }
  },

  handler: function () { },

  key: function (key_code, sub) {
    if (!this.more) {
      this.receive(key_code ? this.handler(key_code) : sub); // receive sub directly if key_code is NUL
    }
    this.forward();
    this.update();
    this.draw();
  },

  // load instance
  load: function (arg) {
    var obj;
    try {
      if (typeof arg == 'string') {
        if (arg.length == 1) {
          obj = this.complement({ type: Rogueliki.strMap[arg] }); // create new object
        } else if (arg.match(/^Rogueliki\./)) {
          obj = this.complement({ type: arg }); // create new object
        } else {
          obj = this.loaded[arg] || this.provideLoad(arg) && this.wiki.getObject(arg, 'Rogueliki.onLoad'); // load user object
        }
      } else if (arg instanceof Object) {
        obj = this.complement(arg); // renew object
      }
    } catch (e) {
      throw 'LoadError: ' + arg + '\n' + Object.toSource(e);
    }
    //this.loadAround(obj);
    return obj;
  },

  // load owned instances
  loadAround: function (obj) {
    if (!obj._loaded) {
      try {
        if (obj.forEach) {
          obj.forEach(function (value, key, arr) {
            if (value) {
              arr[key] = this.load(value);
            }
          }, this);
        }
        if (obj.complement) {
          obj = obj.complement(); // for property as _key, _container, x, y
        }
      } catch (e) {
        throw 'LoadAroundError: ' + obj.type + '\n' + Object.toSource(e);
      }
      obj._loaded = true;
    }
    return obj;
  },

  order: '',

  perform: function (role) {
    return (typeof role == 'function' ? role : Rogueliki.AI[role] || Rogueliki.AI['Default'])
      .apply(this, [this.player, this.map].concat(Array.slice(arguments, 1)));
  },

  // string only push manually
  print: function () {
    var printed = false;
    Array.forEach(arguments, function (param) {
      if (typeof param == 'string' || param instanceof String) {
        this.push(param);
        printed = true;
      }
    }, this);
    return printed;
  },

  provideLoad: function (id, async) {
    return Rogueliki.onLoad = function (obj) { // called in object script
      obj = id == obj ? null : this.load(obj); // stop process for recursive forever
      obj.id = id;
      return async
        ? Object.extend(this.loaded[id], obj)
        : (this.loaded[id] = obj);
    }.bind(this);
  },

  // push manually
  push: function () {
    var pushed = false;
    Array.forEach(arguments, function (param) {
      this.queue.push(param);
      pushed = true;
    }, this);
    return pushed;
  },

  // return function to ready event
  ready: function (event) {
    return { // return handler object (handler is updated when received)
      event: event,
      handler: typeof event == 'function'
        ? event
        : (Rogueliki.Event[event] || Rogueliki.Event['Default'])
          .apply(this, Array.slice(arguments, 1))
    };
  },

  readyInput: function (type, listener) {
    return function () {
      return this.eval(listener, null, prompt());
    };
  },

  // called in event-returning
  receive: function (param) {
    return this.push(param && rl.ready('Default'), param);
  },

  register: function (obj, id_string) {
    var id = id_string || String((new Date).getTime());
    obj.id = !id.match(/^.*:/) && obj.type ? obj.type.split('.')[1].toLowerCase() + ':' + id : id; // add InterWiki
    return (this.loaded[obj.id] = obj).id;
  },

  // generally remove object from parent array
  remove: function (obj) {
    if (obj instanceof Rogueliki.Item) {
      if (obj._container instanceof Array) {
        obj._container.splice(obj._key, 1);
        obj._container.forEach(function (value, key) { // re-indexing
          if (value instanceof Object) {
            value._key = key;
          }
        });
      } else if (obj._container instanceof Object) {
        delete obj._container[obj._key];
        --obj._container.length;
      }
    } else if (obj instanceof Rogueliki.Tile) {
      delete this.map.tiles[obj.y][obj.x];
    } else if (obj instanceof Rogueliki.Player) {
      delete this.map.players[obj.y][obj.x];
      this.map.forEachPlayer(function (player, key, array) {
        if (obj == player) {
          //delete array[key];
          array.splice(key, 1);
        }
      });
    }
  },

  save: function (obj) {
    try {
      /*
      if (obj.forEach) {
        obj.forEach(function (value) {
          if (value instanceof Rogueliki.Base) {
            this.save(value);
          }
        }, this);
      }
       */
      return obj.id && [
        obj._realLiteral = true, // using in toLiteral
        this.wiki.putObject(obj.id, obj, 'Rogueliki.onLoad'),
        delete obj._realLiteral
      ][1];
    } catch (e) {
      throw 'SaveError: ' + obj.id + '\n' + Object.toSource(e);
    }
  },

  _seeN: function (result, map, x, y, rest, light, pushed, last, all) {
    if (y == 0 || rest == 0) {
      return 0;
    }
    var tile = map.tiles[--y][x];
    tile.light && !pushed && result.add([x, y + 1]);
    pushed = (all || light || tile.light) && result.add([x, y]);
    last && (all || light || tile.light) && result.add([x + last, y]);
    last = tile.light ? last : 0;
    return tile.transparent
      ? arguments.callee(result, map, x, y, rest - 1, tile.light, pushed, last, all) + 1
      : 0;
  },

  _seeE: function (result, map, x, y, sx, rest, light, pushed, last, all) {
    if (x == sx - 1 || rest == 0) {
      return 0;
    }
    var tile = map.tiles[y][++x];
    tile.light && !pushed && result.add([x - 1, y]);
    pushed = (all || light || tile.light) && result.add([x, y]);
    last && (all || light || tile.light) && result.add([x, y + last]);
    last = tile.light ? last : 0;
    return tile.transparent
      ? arguments.callee(result, map, x, y, sx, rest - 1, tile.light, pushed, last, all) + 1
      : 0;
  },

  _seeW: function (result, map, x, y, rest, light, pushed, last, all) {
    if (x == 0 || rest == 0) {
      return 0;
    }
    var tile = map.tiles[y][--x];
    tile.light && !pushed && result.add([x + 1, y]);
    pushed = (all || light || tile.light) && result.add([x, y]);
    last && (all || light || tile.light) && result.add([x, y + last]);
    last = tile.light ? last : 0;
    return tile.transparent
      ? arguments.callee(result, map, x, y, rest - 1, tile.light, pushed, last, all) + 1
      : 0;
  },

  _seeS: function (result, map, x, y, sy, rest, light, pushed, last, all) {
    if (y == sy - 1 || rest == 0) {
      return 0;
    }
    var tile = map.tiles[++y][x];
    tile.light && !pushed && result.add([x, y - 1]);
    pushed = (all || light || tile.light) && result.add([x, y]);
    last && (all || light || tile.light) && result.add([x + last, y]);
    last = tile.light ? last : 0;
    return tile.transparent
      ? arguments.callee(result, map, x, y, sy, rest - 1, tile.light, pushed, last, all) + 1
      : 0;
  },

  _seeNW: function (result, map, x, y, n, w, light, pushed, all) {
    if (x == 0 || y == 0) {
      return 0;
    }
    var tile = map.tiles[y - 1][x - 1], transparent = tile.transparent;
    n = this._seeN(result, map, x, y, n, light, pushed, !transparent && -1, all);
    w = this._seeW(result, map, x, y, w, light, pushed, !transparent && -1, all);
    tile.light && !pushed && result.add([x, y]);
    pushed = (all || light || tile.light) && result.add([x - 1, y - 1]);
    return transparent
      ? this._seeNW(result, map, x - 1, y - 1, n, w, tile.light, pushed, all) + 1
      : 0;
  },

  _seeSW: function (result, map, x, y, sy, s, w, light, pushed, all) {
    if (x == 0 || y == sy - 1) {
      return 0;
    }
    var tile = map.tiles[y + 1][x - 1], transparent = tile.transparent;
    s = this._seeS(result, map, x, y, sy, s, light, pushed, !transparent && -1, all);
    w = this._seeW(result, map, x, y, w, light, pushed, !transparent && 1, all);
    tile.light && !pushed && result.add([x, y]);
    pushed = (all || light || tile.light) && result.add([x - 1, y + 1]);
    return transparent
      ? this._seeSW(result, map, x - 1, y + 1, sy, s, w, tile.light, pushed, all) + 1
      : 0;
  },

  _seeNE: function (result, map, x, y, sx, n, e, light, pushed, all) {
    if (x == sx - 1 || y == 0) {
      return 0;
    }
    var tile = map.tiles[y - 1][x + 1], transparent = tile.transparent;
    n = this._seeN(result, map, x, y, n, light, pushed, !transparent && 1, all);
    e = this._seeE(result, map, x, y, sx, e, light, pushed, !transparent && -1, all);
    tile.light && !pushed && result.add([x, y]);
    pushed = (all || light || tile.light) && result.add([x + 1, y - 1]);
    return transparent
      ? this._seeNE(result, map, x + 1, y - 1, sx, n, e, tile.light, pushed, all) + 1
      : 0;
  },

  _seeSE: function (result, map, x, y, sx, sy, s, e, light, pushed, all) {
    if (x == sx - 1 || y == sy - 1) {
      return 0;
    }
    var tile = map.tiles[y + 1][x + 1], transparent = tile.transparent;
    s = this._seeS(result, map, x, y, sy, s, light, pushed, !transparent && 1, all);
    e = this._seeE(result, map, x, y, sx, e, light, pushed, !transparent && 1, all);
    tile.light && !pushed && result.add([x, y]);
    pushed = (all || light || tile.light) && result.add([x + 1, y + 1]);
    return transparent
      ? this._seeSE(result, map, x + 1, y + 1, sx, sy, s, e, tile.light, pushed, all) + 1
      : 0;
  },

  _seeAdd: function (pos) {
    var text = pos.toString();
    if (!this[text]) {
      this[text] = true;
      this.push(pos);
    }
    return true;
  },

  see: function (pos, all) {
    var px = pos ? pos.x : this.player.x, py = pos ? pos.y : this.player.y,
      map = this.map,
      sx = map.size.x, sy = map.size.y,
      pcache = map._cache[py][px];

    if (pcache.see) { // if update-array is cached
      return pcache.see;
    }

    var result = pcache.see = [], ptile = map.tiles[py][px],
      corridor = ptile instanceof Rogueliki.Tile.Corridor, Wall = Rogueliki.Tile.Wall;
    result.add = this._seeAdd;
    result.add([px, py]);
    this._seeNW(result, map, px, py, sy, sx, ptile.light, true, all);
    this._seeSW(result, map, px, py, sy, sy, sx, ptile.light, true, all);
    this._seeNE(result, map, px, py, sx, sy, sx, ptile.light, true, all);
    this._seeSE(result, map, px, py, sx, sy, sy, sx, ptile.light, true, all);

    py != 0 && px != 0 && !(corridor && map.tiles[py - 1][px - 1] instanceof Wall) && result.add([px - 1, py - 1]); // y
    py != 0 && !(corridor && map.tiles[py - 1][px] instanceof Wall) && result.add([px, py - 1]); // k
    py != 0 && px != sx - 1 && !(corridor && map.tiles[py - 1][px + 1] instanceof Wall) && result.add([px + 1, py - 1]); // u

    px != 0 && !(corridor && map.tiles[py][px - 1] instanceof Wall) && result.add([px - 1, py]); // h
    px != sx - 1 && !(corridor && map.tiles[py][px + 1] instanceof Wall) && result.add([px + 1, py]); // l

    py != sy - 1 && px != 0 && !(corridor && map.tiles[py + 1][px - 1] instanceof Wall) && result.add([px - 1, py + 1]); // b
    py != sy - 1 && !(corridor && map.tiles[py + 1][px] instanceof Wall) && result.add([px, py + 1]); // j
    py != sy - 1 && px != sx - 1 && !(corridor && map.tiles[py + 1][px + 1] instanceof Wall) && result.add([px + 1, py + 1]); // n
    return result;
  },

  start: function () {
    if (!(this.player instanceof Object)
        || !(this.player instanceof Rogueliki.Player) && !String(this.player.type).match('Rougeliki.Player')) {
      throw new Error('player is not a instance of Rogueliki.Player');
    }
    if (!(this.map instanceof Object)
        || !(this.map instanceof Rogueliki.Map) && !String(this.map.type).match('Rougeliki.Map')) {
      throw new Error('map is not a instance of Rogueliki.Player');
    }
    this.key(null, this.command(this.system, 'start'));
  },

  translate: function (param) {
    return param;
  },

  turn: function (num) {
    var before = this.player, self_time = parseInt(60 * num / (before.speed || 1), 10); // 1 min
    before.time += self_time;
    before.time %= 86400; // 1 day
    return (this.player.other
      ? (this.player._time -= self_time, [])
      : this.map.mapPlayer(function (player) {
        if (!player || !player.other) { // `!player ||' is for IE, in case rl.remove in forEach
          return;
        }
        var actions = [], count = 0;
        player._time += self_time;
        this.player = player; // for procedural
        actions.push(function () { this.player = player; }); // for functional
        while (player._time > 0) {
          actions.push(this.command(player, 'automate'));
          if (++count > 10) {
            actions.push("AI must call rl.turn and pass time."); // seem AI doesn't call rl.turn
            break;
          }
        }
        return actions;
      }, this).concat(
        (this.player = before, [function () { this.player = before; }])
      )
    ).concat([this.command(this.player, 'turn')]);
  },

  // update map.screen rudely
  update: function (callback) {
    if (this.player.other) { // don't update screen if player is other
      return;
    }

    var data_array = this.see(),
      map = this.map,
      screen = map.screen,
      to_screen = callback || function (obj) { return obj.toString(); },
      x, y;

    //for (var i = 0; i < data_array.length; ++i) {
    for (var i = 0, length = data_array.length; i < length; ++i) { // optimization
      x = data_array[i][0], y = data_array[i][1];
      screen[y][x] = to_screen.call(this, map.toScreen(x, y));
    }
    /*
    data_array.forEach(function (pos) {
      var x = pos[0], y = pos[1];
      screen[y][x] = to_screen.call(this, map.toScreen(x, y));
    }, this);
     */
  }
});
