try { JSAN.use('Rogueliki.Base'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded\n' + e; }

Rogueliki.Item = function () { };
Rogueliki.Item.prototype = new Rogueliki.Base;

// object
Object.extend(Rogueliki.Item, {

});

// prototype
Object.extend(Rogueliki.Item.prototype, {
  type: 'Rogueliki.Item',

  add: function (item) {
    item._container = this.items instanceof Array ? this.items : (this.items = []);
    item._key = item._container.length;
    return this.items.push(item);
  },

  commands: {},

  complement: function () {
    if (this.items instanceof Array) {
      this.items.forEach(function (item, key, array) {
        if (item instanceof Object) { // for remove
          item._key = key;
          item._container = array;
        }
      });
    }

    return this;
  },

  forEach: function (callback, self) {
    if (this.items instanceof Array) {
      this.items.forEach(callback, self);
    }
  },

  toString: function () {
    return this.symbol || ' ';
  }
});

// execute command
Object.extend(Rogueliki.Item.prototype.commands, {
  Default: function (rl, order) {
    return rl.eval.apply(rl, [this[order], this].concat(Array.slice(arguments, 2)));
  },

  equip: function (rl, equiper) {
    var equip = rl.eval(this.equip, this, equiper),
      equiping = function () {
        return [
          rl.player.other
            ? "%s equips %s.".format(rl.command(rl.player, 'look'), rl.command(this, 'look'))
            : "You equip %s.".format(rl.command(this, 'look')),
          rl.eval(equiper, null, this),
          this.equipped = true,
          rl.turn(1)
        ];
      }.bind(this);
    return typeof equip == 'number' || equip instanceof Number
      ? (rl.player.armorClass += equip, equiping)
      : Rogueliki.isHash(equip)
        ? (Object.forEach(equip, function (value, key) {
          return rl.player[key] = (rl.player[key] || 0) + value;
        }), equiping)
        : equip && equiping;
  },

  fight: function (rl) {
    var fight = rl.eval(this.fight, this), extend = {};
    return Rogueliki.isHash(fight)
      && (Object.forEach(fight, function (value, key, obj) {
        extend[key] = function (opponent) {
          return rl.eval(
            typeof value == 'string' || value instanceof String
              ? function (item, opponent) {
                return this.command(this.player, value, item, opponent);
              }
              : value,
            null,
            this,
            opponent
          );
        }.bind(this);
      }, this), extend)
      || fight;
  },

  look: function (rl, looker) {
    var look = this.identify
      ? rl.eval(this.name, this)
      : rl.eval(this.look, this) || rl.eval(this.name, this);
    look = this.equipped ? "%s%s".format(look, " (being equipped)") : look;
    return rl.eval(looker, null, look) || look;
  },

  read: function (rl) {
    return rl.eval(this.read, this);
  },

  slash: function (rl) {
    var slash = rl.eval(this.slash, this);
    return typeof slash == 'number' || slash instanceof Number
      ? { slashing: Math.max(slash + rl.player.strength - 10 + Rogueliki.roll(1, 20) - 10, 0) }
      : slash;
  },

  unequip: function (rl, unequiper) {
    var unequip = rl.eval(this.unequip, this, unequiper),
      unequiping = function () {
        return [
          rl.eval(unequiper, null, this),
          delete this.equipped,
          rl.player.other
            ? "%s unequips %s.".format(rl.command(rl.player, 'look'), rl.command(this, 'look'))
            : "You unequip %s.".format(rl.command(this, 'look')),
          rl.turn(1)
        ];
      }.bind(this);
    return unequip && (typeof unequip == 'boolean' || unequip instanceof Boolean)
      && (unequip = this.equip, false) // unequip equals equip if unequip is `true'
      || typeof unequip == 'number' || unequip instanceof Number
        ? (rl.player.armorClass -= unequip, unequiping)
        : Rogueliki.isHash(unequip)
          ? (Object.forEach(unequip, function (value, key) {
            return rl.player[key] -= value;
          }), unequiping)
          : unequip && unequiping;
  },

  unwield: function (rl, unwielder) {
    return rl.eval(this.unwield, this, unwielder);
  },

  wield: function (rl, wielder) {
    return rl.eval(this.wield, this, wielder);
  }
});
