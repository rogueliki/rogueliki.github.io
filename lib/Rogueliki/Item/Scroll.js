Rogueliki.defineType(
  'Rogueliki.Item.Scroll',
  {
    symbol: '?',
    name: "a scroll of blank paper",
    edit: function (rl, content, event) {
      return !content
        ? [
          "You are editing.",
          rl.ready(event || 'inputLine', function (content) {
            return rl.command(this, 'writeOn', content);
          }.bind(this), this.content)
          ]
        : [
          ["You write on %s.".format(rl.command(this, 'look')), rl.turn(1)],
          this.name = "a scroll",
          this.content = content
        ][0];
    },
    read: function (rl, content) {
      return !(content = content || this.content)
        ? "This is blank."
        : content.indexOf('\n') == -1
          ? ["You read: \"%s\".".format(content), rl.turn(1)]
          : ["You read:", content, rl.turn(1)];
    },
    writeOn: function (rl, content, event) {
      return !content
        ? [
          "You are writing.",
          rl.ready(event || 'inputLine', function (content) {
            return rl.command(this, 'writeOn', content);
          }.bind(this))
          ]
        : [
          ["You write on %s.".format(rl.command(this, 'look')), rl.turn(1)],
          this.name = "a scroll",
          this.content = content
        ][0];
    }
  }
);
