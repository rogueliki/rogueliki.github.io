Rogueliki.defineType(
  'Rogueliki.Item.Sword',
  {
    symbol: ')',
    name: "a sword",
    equip: true,
    fight: {
      "slash": 'slash'
    },
    size: 1,
    slash: function (rl) {
      return Rogueliki.roll(1, 6);
    },
    unequip: true,
    unwield: function (rl, unequiper) {
      return rl.command(this, 'unequip', unequiper);
    },
    wield: function (rl, equiper) {
      return rl.command(this, 'equip', equiper);
    }
  }
);
