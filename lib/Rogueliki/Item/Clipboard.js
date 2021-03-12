Rogueliki.defineType(
  'Rogueliki.Item.Clipboard',
  {
    symbol: '(',
    name: "a clipboard",
    apply: function (rl, item) {
      return rl.command(this, 'clip');
    },
    clip: function (rl, item) {
      return !item
          ? [
            "What do you want clip?",
            rl.ready('selectItemHere', function (item) {
              return rl.command(item, 'clip')
                || item.symbol != '?' && "That is a silly thing to clip."
                || rl.command(this, 'clip', item);
            }.bind(this))
          ]
          : (rl.remove(item),
             this.add(item),
             ["You clip %s.".format(rl.command(item, 'look')), rl.turn(1)]);
    },
    edit: function (rl, item, content) {
      return this.items instanceof Array && 0 < this.items.length
        ? [
          "What do you want edit?",
          rl.ready('selectItem', function (item) {
            return this.command(item, 'edit', null, 'inputLines')
              || "That is a silly thing to edit.";
          }, this.items)
          ]
        : "This board doesn't clip anythig.";
    },
    read: function (rl) {
      return this.items instanceof Array && 0 < this.items.length
        ? [
          "What do you want read?",
          rl.ready('selectItem', function (item) {
            return this.command(item, 'read');
          }, this.items)
          ]
        : "This board doesn't clip anythig.";
    },
    writeOn: function (rl, item, content) {
      return this.items instanceof Array && 0 < this.items.length
        ? [
          "What do you want write on?",
          rl.ready('selectItem', function (item) {
            return this.command(item, 'writeOn', null, 'inputLines')
              || "That is a silly thing to write on.";
          }, this.items)
          ]
        : "This board doesn't clip anythig.";
    }
  }
);
