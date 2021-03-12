Rogueliki.defineType(
  'Rogueliki.Item.Armor',
  {
    symbol: '[',
    name: "a armor",
    equipOn: "body",
    equip: 1,
    size: 2,
    takeOff: function (rl) {
      return rl.command(rl.player, 'unequip', this);
    },
    unequip: true,
    wear: function (rl) {
      return rl.command(rl.player, 'equip', this);
    }
  }
);
