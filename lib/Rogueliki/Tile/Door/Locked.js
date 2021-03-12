Rogueliki.defineType(
  'Rogueliki.Tile.Door.Locked',
  function (parent) { return {
    locked: true,
    open: function (rl) {
      return this.symbol == '+' && this.locked
        ? "This door is locked."
        : parent.open.call(this, rl);
    }
  }; }
);
