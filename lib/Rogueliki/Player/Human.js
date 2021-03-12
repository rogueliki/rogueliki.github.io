Rogueliki.defineType(
  'Rogueliki.Player.Human',
  {
    symbol: '@',
    name: "the human",
    automate: function (rl) {
      return rl.perform('counterattacker');
    },
    fight: {
      "kick": 'kick'
    },
    wield: 2
  }
);
