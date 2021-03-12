try { JSAN.use('Rogueliki.Base'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded\n' + e; }

Rogueliki.Tile = function () { };
Rogueliki.Tile.prototype = new Rogueliki.Base;

// object
Object.extend(Rogueliki.Tile, {

});

// prototype
Object.extend(Rogueliki.Tile.prototype, {
  type: 'Rogueliki.Tile',
  commands: {},

  complement: function () {
    return this;
  },

  forEach: function (callback, self) {
    ['map', 'upstairs', 'downstairs'].forEach(function (property) {
      if (this[property]) {
        callback.call(self, this[property], property, this);
      }
    }, this);
  },

  toString: function () {
    return this.symbol || ' ';
  }
});

// execute command
Object.extend(Rogueliki.Tile.prototype.commands, {
  Default: function (rl, order) {
    return rl.eval.apply(rl, [this[order], this].concat(Array.slice(arguments, 2)));
  },

  arrive: function (rl) {
    return rl.eval(this.arrive, this) || rl.turn(1);
  },

  go: function (rl, map) {
    return (map || this.map)
      && rl.command(rl.map, 'go', Object.extend((map || this.map), rl.eval(this.go) || {}));
  },

  kick: function (rl) {
    return rl.eval(this.kick, this)
      || (this.block ? false : [ rl.player.other || "You move funny.", rl.turn(1) ]);
  },

  look: function (rl, looker) {
    var look = rl.eval(this.look, this) || rl.eval(this.name, this);
    return look && rl.eval(looker, null, look) || look;
  },

  start: false
});
