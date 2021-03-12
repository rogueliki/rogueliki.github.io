try { JSAN.use('Rogueliki.Setup'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded\n' + e; }

Rogueliki.AI = function () {
};

// called by this == rl
Object.extend(Rogueliki.AI, {
  Default: function (player, map) {
    return this.turn(1);
  },

  attacker: function (player, map, opponent) {
    var sx = map.size.x, sy = map.size.y,
      px = player.x, py = player.y,
      players = map.players, temp, result = [];

    px != 0 && py != 0 && (temp = players[py - 1][px - 1]) && result.push(temp); // y
    py != 0 && (temp = players[py - 1][px]) && result.push(temp); // k
    px != sx - 1 && py != 0 && (temp = players[py - 1][px + 1]) && result.push(temp); // u

    px != 0 && (temp = players[py][px - 1]) && result.push(temp); // h
    px != sx - 1 && (temp = players[py][px + 1]) && result.push(temp); // l

    px != 0 && py != sy - 1 && (temp = players[py + 1][px - 1]) && result.push(temp); // b
    py != sy - 1 && (temp = players[py + 1][px]) && result.push(temp); // j
    px != sx - 1 && py != sy - 1 && (temp = players[py + 1][px + 1]) && result.push(temp); // n

    temp = false; // be flag to have attacked
    return result.length
      ? result.map(function (other) {
        if (temp || opponent && (typeof opponent == 'string' || opponent instanceof String
                                 ? this.command(other, 'look') != String(opponent) // for convert object to primitive
                                 : other != opponent)) {
          return;
        }
        temp = true;
        var fight;
        return this.eval(
          (fight = this.command(player, 'fight', false)) instanceof Array && fight[0].value,
          null,
          other
        ) || this.perform('rester');
      }, this).concat([ temp || this.perform('stalker') ])
      : this.perform('stalker', opponent);
  },

  counterattacker: function (player, map, normal) {
    player.damaged = player.damaged || function (rl, damage) {
      if (damage) {
        this.damagedBy = rl.command(rl.player, 'look');
      }
      return false;
    };

    return player.damagedBy
      ? this.perform('attacker', player.damagedBy)
      : this.perform(normal || 'rester');
  },

  rester: function (player, map) {
    return this.command(player, 'rest');
  },

  stalker: function (player, map, opponent) {
    var dir = {}, sight = this.see(), target, find = false;
    for (var i = 0; i < sight.length; ++i) {
      if ((target = map.player(sight[i][0], sight[i][1]))
          && (opponent
            ?  typeof opponent == 'string' || opponent instanceof String
              ? this.command(target, 'look') == String(opponent) // for convert object to primitive
              : target == opponent
            : target != player)) {
        find = true;
        break;
      }
    }
    if (!find) {
      return this.perform('walker');
    }
    dir.x = target.x > player.x + 1 ? 1 : target.x < player.x - 1 ? -1 : 0;
    dir.y = target.y > player.y + 1 ? 1 : target.y < player.y - 1 ? -1 : 0;
    return this.command(this.system, 'walk', dir);
  },

  walker: function (player, map) {
    var dir = {};
    dir.x = parseInt(Math.random() * 3, 10) - 1;
    dir.y = parseInt(Math.random() * 3, 10) - 1;
    return this.command(this.system, 'walk', dir);
  }
});
