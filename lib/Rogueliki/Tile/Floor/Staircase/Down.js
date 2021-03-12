Rogueliki.defineType(
  'Rogueliki.Tile.Floor.Staircase.Down',
  {
    symbol: '>',
    look: "a staircase down",
    goDown: function (rl) {
      return (this.downstairs || rl.map.downstairs)
        ? [
          rl.player.other || "You go down stairs.",
          rl.command(this, 'go', this.downstairs || rl.map.downstairs),
          rl.turn(1)
        ]
        : "This staircase seems to crumble any minute.";
    }
  }
);
