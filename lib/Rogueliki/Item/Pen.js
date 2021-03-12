Rogueliki.defineType(
  'Rogueliki.Item.Pen',
  {
    symbol: '(',
    name: "a pen",
    apply: function (rl, item) {
      return rl.command(this, 'writeWith');
    },
    writeWith: function (rl, item) {
      return !item
        ? [
          "What do you want write on?",
          rl.ready('selectItemHere', function (item) {
            return this.command(item, 'writeOn')
              || "That is a silly thing to write on.";
          })
        ]
        : rl.command(item, 'writeOn');
    }
  }
);
