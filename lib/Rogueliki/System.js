try { JSAN.use('Rogueliki.Base'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded\n' + e; }

Rogueliki.System = function () { };
Rogueliki.System.prototype = new Rogueliki.Base;

// object
Object.extend(Rogueliki.System, {
  
});

// prototype
Object.extend(Rogueliki.System.prototype, {
  type: 'Rogueliki.System',
  commands: {},

  complement: function () {
    return this;
  }
});

// execute command
Object.extend(Rogueliki.System.prototype.commands, {
  Default: function (rl, order) {
    var arg = Array.slice(arguments, 2);
    return rl.eval.apply(rl, [this[order], this].concat(arg))
      || rl.command.apply(rl, [rl.player, order].concat(arg))
      || rl.command.apply(rl, [rl.map, order].concat(arg));
  },
  /*
  drop: function (rl) {
    return rl.command(rl.player, 'drop');
  },
   */
  command: function (rl) {
   return [
     "Command: ",
     rl.ready('inputLine', function (line) {
       return this.command(this.system, line);
     })
   ];
  },

  help: function (rl) {
    var num = 0;

    return [
      Object.map(rl.keyMap, function (command, key) {
        if (key.length == 1) {
          return (key + ': ' + command).ljust(20)
            + (++num % 4 ? '' : '\n');
        }
      }).join(''),
      rl.ready('pause')
    ];
  },

  save: function (rl) {
    return [
      "Please select all wiki objects you want to save.",
      rl.ready('selectItems', function (item_ids) {
        return item_ids.map(function (item_id) {
          return (rl.save(rl.loaded[item_id])
            ? "`%s' saved."
            : "Saving `%s' is failed.").format(item_id);
        });
      }, Object.map(rl.loaded, function (value, key) {
        return key;
      }), true)
      ];
  },

  start: function (rl) {
    return rl.eval(this.start, this)
      || rl.command(rl.player, 'start')
      || rl.command(rl.map, 'start')
      || true; // to set default
  },

  test: function (rl) {
    //return rl.command(null);
  }
});
