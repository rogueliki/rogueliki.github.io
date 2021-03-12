try { JSAN.use('Rogueliki.Base'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded\n' + e; }

Rogueliki.Player = function () {
  this.strength = Rogueliki.roll(3, 6);
  this.dexterity = Rogueliki.roll(3, 6);
  this.constitution = Rogueliki.roll(3, 6);
  this.intelligence = Rogueliki.roll(3, 6);
  this.wisdom = Rogueliki.roll(3, 6);
  this.charisma = Rogueliki.roll(3, 6);

  this.hitPoints = Rogueliki.roll(1, 10) + Math.max(this.constitution - 10, 0);
  this.maxHitPoints = this.hitPoints;
  this.magicPoints = Rogueliki.roll(1, 10) + Math.max(this.intelligence- 10, 0);
  this.maxMagicPoints = this.magicPoints;
  this.armorClass = 10;

  this.time = 0;
  this.items = {};
  this.equipments = {};
};
Rogueliki.Player.prototype = new Rogueliki.Base;

// object
Object.extend(Rogueliki.Player, {

});

// prototype
Object.extend(Rogueliki.Player.prototype, {
  type: 'Rogueliki.Player',

  add: function (item) {
    var key_code = 97 /* a */, result = [];
    //Array.forEach(arguments, function (item) {
    while (key_code && this.items.hasOwnProperty(String.fromCharCode(key_code))) {
      ++key_code;
      if (122 /* z */ < key_code) {
        key_code = 65; /* A */
        continue;
      } else if (90 /* Z */< key_code && key_code < 97 /* a */) { // not found
        key_code = 0;
        break;
      }
    }
    if (key_code) {
      item._container = this.items; // for remove
      item._key = String.fromCharCode(key_code); // for remove
      this.items[String.fromCharCode(key_code)] = item;
      ++this.items.length;
    } else {
      result.push(item);
    }
    //}, this);

    if (!key_code) {
      throw Object.extend(new Error('Full Key'), { result: result });
    }

    return String.fromCharCode(key_code);
  },

  block: true,

  commands: {},

  complement: function () {
    var num = 0;
    Object.forEach(this.items, function (item, key, items) {
      if (key.length == 1) {
        if (item instanceof Object) { // for remove
          item._key = key;
          item._container = items;
        } 
        ++num;
      }
    });
    this.items.length = num;

    this._time = this._time || 0; // for turn priority only
    return this;
  },

  forEach: function (callback, self) {
    for (var key in this.items) {
      if (key.length == 1) {
        callback.call(self, this.items[key], key, this.items);
      }
    }
  },

  other: true,

  toLiteral: function (real_literal) {
    var obj = Rogueliki.simplify(this);
    delete obj.other;
    return Object.toLiteral(typeof obj == 'string' && Rogueliki.typeMap[obj] || obj);
  },

  toString: function () {
    return this.symbol || '@';
  }
});

// execute command
Object.extend(Rogueliki.Player.prototype.commands, {
  Default: function (rl, order) {
    return rl.eval.apply(rl, [this[order], this].concat(Array.slice(arguments, 2)));
  },

  automate: function (rl) {
    return rl.eval(this.automate, this) || rl.perform('rester');
  },

  apply: function (rl) {
    return !this.items.length
      ? this.other || "You don't have anything."
      : [
        "What do you want to apply?",
        rl.ready('selectItemHere', function (item) {
          return this.command(item, 'apply');
        })
      ];
  },

  attacked: function (rl, damage) {
    var player = rl.player;
    return rl.eval(this.attacked, this, damage) || [
      this.armorClass + this.dexterity < Rogueliki.roll(1, 20, { 1: -10, 20: 30 }) + player.strength
        ? [
          player.other
            ? "%s attacks %s.".format(rl.command(player, 'look'), rl.command(this, 'look'))
            : "You attack %s.".format(rl.command(this, 'look')),
          rl.command(this, 'damaged', damage)
        ]
        : player.other
          ? "%s misses.".format(rl.command(player, 'look'))
          : "You miss %s.".format(rl.command(this, 'look')),
      rl.turn(1)
    ];
  },

  block: function (rl) {
    var block = rl.eval(this.block, this);
    return block && (typeof block == 'boolean' || block instanceof Boolean)
      ? rl.player.other || "%s is in the way.".format(rl.command(this, 'look')) // called by another player
      : block;
  },

  damaged: function (rl, damage) {
    return rl.eval(this.damaged, this, damage)
      || (Rogueliki.isHash(damage)
        ? (Object.forEach(damage, function (value, key) {
          this.hitPoints -= Math.max(value - (this.constitution - 10) - (this[key] || 0), 0);
        }, this), true)
        : typeof damage == 'number' || damage instanceof Number
          ? (this.hitPoints -= Math.max(damage - (this.constitution - 10), 0), true)
          : false);
  },

  die: function (rl) {
    return rl.eval(this.die, this)
      || (this.other
        ? (rl.remove(this), "%s died.".format(rl.command(this, 'look')))
        : [
          "You died.",
          '                      ----------\n'
          + '                     /          \\\n'
          + '                    /    REST    \\\n'
          + '                   /      IN      \\\n'
          + '                  /     PEACE      \\\n'
          + '                 /                  \\\n'
          + '                 |' + rl.eval(this.name, this).center(18) + '|\n'
          + '                 |                  |\n'
          + '                 |                  |\n'
          + '                 |                  |\n'
          + '                 |                  |\n'
          + '                 |                  |\n'
          + '                 |       2007       |\n'
          + '                *|     *  *  *      | *\n'
          + '       _________)/\\_//(\/(/\)/\//\/|_)_______\n',
          rl.ready('stop')
        ]
      );
  },

  drop: function (rl, item) {
    return item
      ? item.equipped
        ? this.other || "You cannot drop something you are wearing."
        : rl.command(item, 'drop')
          || (rl.remove(item),
              [rl.command(rl.map, 'drop', item), rl.turn(1)])
      : !this.items.length
        ? this.other || "You don't have anything."
        : [
          "What do you want to drop?",
          rl.ready('selectItem', function (item) {
            return this.command(this.player, 'drop', item);
          })
        ];
  },

  dropSeveral: function (rl) {
    return !this.items.length
      ? this.other || "You don't have anything."
      : [
        "What do you want to drop?",
        rl.ready('selectItems', function (items) {
          return items.map(function (item) {
            return this.command(this.player, 'drop', item);
          }, this);
        })
      ];
  },

  equip: function (rl, item, key) {
    var items = this.items, equipments = this.equipments,
      part = equipments[item.equipOn] || [], temp, over = { size: -1 };

    key = key || Object.map(items, function (value, key) {
      return value === item ? key : '';
    }).join('');

    // determination for layers of equipments
    [item.equipOn].concat(
      item.equipOn == 'body'
        ? ['upper body', 'lower body']
        : item.equipOn.match(/body$/)
          ? ['body']
          : []
    ).forEach(function (value) {
      if ((item.size || 0) <= (
        (temp = items[(equipments[value] || [])[0]]) instanceof Object
          ? temp.size || 0
          : -1
      )) {
        over = over.size < (temp.size || 0) ? temp : over;
      }
    });

    return !item
      ? this.other || "You have not chosen any items to equip."
      : item.equipped
        ? this.other || "You have equipped this item already."
        : !item.equipOn
          ? this.other || "You cannot equip %s.".format(rl.command(item, 'look'))
          : over.size != -1
            ? this.other || "You cannot equip %s over %s.".format(rl.command(item, 'look'), rl.command(over, 'look'))
            : rl.command(item, 'equip', function () { (equipments[item.equipOn] = part).unshift(key); })
              || this.other || "You cannot equip %s.".format(rl.command(item, 'look'));
  },

  fight: function (rl, fighter, opponent) {
    var fight = rl.eval(this.fight, this), extend = {}, selects = [];
    return !fighter
      ? (
        (this.equipments.wielding || []).map(function (item_key) {
          return rl.command(this.items[item_key], 'fight');
        }, this).concat(
          Rogueliki.isHash(fight)
            ? [(Object.forEach(fight, function (value, key, obj) {
              return extend[key] = typeof value == 'string' || value instanceof String
                ? function (opponent) {
                  return this.command(this.player, value, opponent);
                }
                : value;
            }, this), extend)]
            : []
        ).forEach(function (obj) {
          return Rogueliki.isHash(obj)
            && Object.forEach(obj, function (value, key) {
              return selects.push({
                key: key,
                value: value,
                toString: function () {
                  return this.key;
                }
              });
            });
        }),
        !selects.length
          ? this.other || "You don't have any way to fight."
          : fighter === false
            ? selects // for other player's AI
            : [
              "What method do you fight by?",
              rl.ready('selectItem', function (obj) {
                return this.command(this.player, 'fight', obj.value);
              }, selects)
            ]
      )
      : rl.eval(fighter, null);
  },

  kick: function (rl, opponent, damage) {
    damage = damage || { bludgeoning: Math.max(this.strength - 10 + Rogueliki.roll(1, 20) - 10, 0) };
    var player = opponent instanceof Rogueliki.Player;
    return !opponent
      ? [
        "In what direction?",
        rl.ready('selectScreen', function (opponent) {
          return this.command(this.player, 'kick', opponent);
        })
      ]
      : rl.eval(this.kick, this)
        || rl.command(opponent, player ? 'kicked' : 'kick', damage)
        || rl.command(opponent, player ? 'attacked' : 'attack', damage)
        || this.other || "That is a silly thing to kick.";
  },

  kicked: function (rl, damage) {
    var player = rl.player;
    return rl.eval(this.kicked, this, damage) || [
      this.armorClass + this.dexterity < Rogueliki.roll(1, 20, { 1: -10, 20: 30 }) + player.strength
        ? [
          player.other
            ? "%s kicks %s.".format(rl.command(player, 'look'), rl.command(this, 'look'))
            : "You kick %s.".format(rl.command(this, 'look')),
          rl.command(this, 'damaged', damage)
        ]
        : player.other
          ? "%s misses.".format(rl.command(player, 'look'))
          : "You miss %s.".format(rl.command(this, 'look')),
      rl.turn(1)
    ];
  },

  listItem: function (rl) {
    return !this.items.length
      ? this.other || "You don't have anything."
      : Object.map(this.items, function (item, key) {
        return key.length != 1
          ? ''
          : key + ' - ' + this.command(item, 'look') +  '\n';
      }, rl).join('');
  },

  look: function (rl, looker) {
    var look = this.other ? rl.eval(this.look, this) || rl.eval(this.name, this) || "the player" : "you";
    return look && rl.eval(looker, null, look) || look;
  },

  pickUp: function (rl, item) {
    return !item
      ? rl.command(rl.map, 'pickUp')
      : [this.add(item) + ' - ' + rl.command(item, 'look'), rl.turn(1)];
  },

  read: function (rl) {
    return !this.items.length
      ? this.other || "You don't have anything."
      : [
        this.other || "What do you want to read?",
        rl.ready('selectItemHere', function (item) {
          return this.command(item, 'read')
            || this.player.other
            || "That is a silly thing to read.";
        })
      ];
  },

  rest: function (rl) {
    return rl.turn(1);
  },

  say: function (rl, line) {
    return line
      ? [
        this.other
          ? "\"%s\" %s said.".format(line, rl.command(this, 'look'))
          : "\"%s\" You said.".format(line),
        rl.turn(1)
      ]
      : rl.ready('inputLine', function (line) {
      return this.command(this.player, 'say', line);
    });
  },

  start: function (rl) {
    this.other = false;
  },

  slash: function (rl, item, opponent) {
    var damage = rl.command(item, 'slash')
      || { slashing: Math.max(this.strength - 10 + Rogueliki.roll(1, 20) - 10, 0) },
      player = opponent instanceof Rogueliki.Player;
    return !opponent
      ? [
        "In what direction?",
        rl.ready('selectScreen', function (opponent) {
          return this.command(this.player, 'slash', item, opponent);
        })
      ]
      : rl.eval(this.slash, this)
        || rl.command(opponent, player ? 'slashed' : 'slash', damage)
        || rl.command(opponent, player ? 'attacked' : 'attack', damage)
        || this.other || "That is a silly thing to slash.";
  },

  takeOff: function (rl) {
    return !this.items.length
      ? this.other || "You don't have anything."
      : [
        this.other || "What do you want to take off?",
        rl.ready('selectItem', function (item) {
          return this.command(item, 'takeOff')
            || this.other || "That is a silly thing to take off.";
        })
      ];
  },

  turn: function (rl) {
    return this.hitPoints < 0
      ? rl.command(this, 'die')
      : true;
  },

  unequip: function (rl, item, key) {
    var items = this.items, equipments = this.equipments,
      part = equipments[item.equipOn] || [], temp, over = { size: -1 };

    key = key || Object.map(items, function (value, key) {
      return value === item ? key : '';
    }).join('');

    // determination for layers of equipments
    [item.equipOn].concat(
      item.equipOn == 'body'
        ? ['upper body', 'lower body']
        : item.equipOn.match(/body$/)
          ? ['body']
          : []
    ).forEach(function (value) {
      if ((item.size || 0) <= (
        (temp = items[(equipments[value] || [])[0]]) instanceof Object
          ? temp.size || 0
          : -1
      )) {
        over = over.size < (temp.size || 0) ? temp : over;
      }
    });

    return !item
      ? this.other || "You have not chosen any items to unequip."
      : !item.equipped
        ? this.other || "You have not equipped this item."
        : !item.equipOn
          ? this.other || "You cannot unequip %s.".format(rl.command(item, 'look'))
          : over != item
            ? this.other || "You must unequip %s first.".format(rl.command(over, 'look'))
            : rl.command(item, 'unequip', function () { (equipments[item.equipOn] = part).shift(); })
              || this.other || "You cannot unequip %s.".format(rl.command(item, 'look'));
  },

  wield: function (rl, item, key) {
    var wielding, sum = 0, items = this.items;

    key = key || Object.map(items, function (value, key) {
      return value === item ? key : '';
    }).join('');

    return item
      ? (wielding = (this.equipments.wielding = this.equipments.wielding || []),
         item == "bare hands")
        ? wielding.length
          ? rl.command(item = items[wielding[0]], 'unwield', function () { wielding.shift(); })
            || this.other || "You cannot unwield %s.".format(rl.command(item, 'look'))
          : this.other || "You are already empty handed."
        : item.equipped
          ? this.other || "You have equipped this item already."
          : (wielding.forEach(function (key) { sum += items[key].size; }),
             sum + item.size > rl.eval(this.wield, this))
            ? this.other || "You cannot wield items any more."
            : rl.command(item, 'wield', function () { wielding.push(key); })
              || this.other || "You cannot wield %s.".format(rl.command(item, 'look'))
      : !this.items.length
        ? this.other || "You don't have anything."
        : [
          "What do you want to wield?",
          rl.ready('selectItem', function (item) {
            return this.command(this.player, 'wield', item);
          }, Object.extend({ '-': "bare hands" }, this.items))
        ];
  },

  wear: function (rl) {
    return !this.items.length
      ? this.other || "You don't have anything."
      : [
        this.other || "What do you want to wear?",
        rl.ready('selectItem', function (item) {
          return this.command(item, 'wear')
            || this.other || "That is a silly thing to wear.";
        })
      ];
  }
});
