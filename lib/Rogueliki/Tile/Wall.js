Rogueliki.defineType(
  'Rogueliki.Tile.Wall',
  {
    symbol: ' ',
    block: function (rl) {
      return rl.player.other || "There is a wall blocking your way.";
    }
  }
);
