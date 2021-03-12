Rogueliki.onLoad({
  type: 'Rogueliki.Tile.Floor.Staircase.Down',

  arrive: function (rl) {
   return !this.downstairs
     && (this.downstairs = rl.load('Rogueliki.Map.PrivateRoom'),
         this.downstairs.upstairs = rl.map,
         rl.register(this.downstairs, rl.player.id ? rl.player.id.replace(/^(\w+:)?(.*)$/, '$2') : 'Guest'),
         ["The staircase flash.", rl.turn(1)]);
  },

  goDown: function (rl) {
    return this.downstairs && [
      "You go down stairs.",
      rl.command(this, 'go', this.downstairs),
      rl.turn(1)
    ];
  }
});
