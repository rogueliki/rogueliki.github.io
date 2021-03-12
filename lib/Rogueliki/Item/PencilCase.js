Rogueliki.defineType(
  'Rogueliki.Item.PencilCase',
  {
    symbol: '(',
    name: "a pencil case",
    apply: function (rl, item) {
      return rl.command(this, 'editWith');
    },
    editWith: function (rl, item) {
      return !item
        ? [
          "What do you want edit?",
          rl.ready('selectItemHere', function (item) {
            return this.command(item, 'edit')
              || "That is a silly thing to edit.";
          })
        ]
        : rl.command(item, 'edit');
    }
  }
);
