Rogueliki.defineType(
  'Rogueliki.Item.Scroll.Wiki',
  function (parent) { return {
    name: function (rl) {
      var wiki = rl.eval(this.wiki, this);
      return wiki ? "a scroll labeled %s".format(wiki) : "a scroll of blank paper";
    },
    edit: function (rl, content, event) {
      var wiki = rl.eval(this.wiki, this);
      return !content
        ? [
          "You are editing.",
          rl.ready(event || 'inputLine', function (content) {
            return rl.command(this, 'edit', content);
          }.bind(this), rl.wiki.getPage(wiki))
          ]
        : rl.command(this, 'look', function (look) {
          return wiki && rl.wiki.putPage(wiki, content.indexOf('\n') == -1
                                         ? content
                                         : rl.wiki.getPage(wiki) + '\n' + content)
            ? ["You write on %s.".format(look), rl.turn(1)]
            : "You cannot edit %s.".format(look);
        });
    },
    read: function (rl) {
      var wiki = rl.eval(this.wiki, this), content = wiki && rl.wiki.getPage(wiki);
      return parent.read.call(this, rl, content);
    },
    writeOn: function (rl, content, event) {
      var wiki = rl.eval(this.wiki, this);
      return !content
        ? [
          "You are writing.",
          rl.ready(event || 'inputLine', function (content) {
            return rl.command(this, 'writeOn', content);
          }.bind(this))
          ]
        : rl.command(this, 'look', function (look) {
          return wiki && rl.wiki.putPage(wiki, content.indexOf('\n') == -1
                                         ? content
                                         : rl.wiki.getPage(wiki) + '\n' + content)
            ? ["You write on %s.".format(look), rl.turn(1)]
            : "You cannot write on %s.".format(look);
        });
    }
  }; }
);
