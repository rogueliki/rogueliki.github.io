Rogueliki.defineType(
  'Rogueliki.Tile.Door',
  {
    symbol: '+',
    block: function (rl, dir) {
      switch (this.symbol) {
        case '+':
          return rl.player.other || "The door is closed.";
        case '-':
        case '|':
          return dir.skew && (rl.player.other || "A door cannot be entered diagonally.");
      }
    },
    close: function (rl) {
      switch (this.symbol) {
        case '+':
          return rl.player.other || "The door is already closed.";
        case '-':
        case '|':
          this.symbol = '+';
          this.transparent = false;
          rl.see(this, true).forEach(function (pos) {
            delete rl.map._cache[pos[1]][pos[0]].see;
          });
          return ["The door closes.", rl.turn(1)];
        case '.':
          return rl.player.other || "This door is broken.";
      }
    },
    open: function (rl) {
      switch (this.symbol) {
        case '+':
          // loose
          this.symbol =
            this.y != 0 && rl.map.tile(this.x, this.y -1).block
               ? '-'
               : '|';
          this.transparent = true;
          rl.see(this, true).forEach(function (pos) {
            delete rl.map._cache[pos[1]][pos[0]].see;
          });
          return ["The door opens.", rl.turn(1)];
        case '-':
        case '|':
          return rl.player.other || "The door is already open.";
        case '.':
          return rl.player.other || "This door is broken.";
      }
    }
  }
);
