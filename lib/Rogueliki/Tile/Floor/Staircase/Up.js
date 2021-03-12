Rogueliki.defineType(
  'Rogueliki.Tile.Floor.Staircase.Up',
  {
    symbol: '<',
    look: "a staircase up",
    goUp: function (rl) {
      return (this.upstairs || rl.map.upstairs)
        ? [
          rl.player.other || "You go up stairs.",
          rl.command(this, 'go', this.upstairs || rl.map.upstairs),
          rl.turn(1)
        ]
        : "This staircase seems to crumble any minute.";
    }
  }
);
