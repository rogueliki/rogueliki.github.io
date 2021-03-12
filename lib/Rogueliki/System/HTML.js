Rogueliki.defineType(
  'Rogueliki.System.HTML',
  {
    locale: function (rl) {
      return [
        "Please input a locale string.",
        rl.ready('inputLine', function (line) {
          var locale = line.substring(0, 2);
          Rogueliki.chrSize = locale.match(/ja|ko|zh/) ? 2 : 1;
          Locale.setlocale(Locale.LC_MESSAGES, locale)
            return "Locale is set to %s.".format(locale);
        }, Locale.setlocale(Locale.LC_MESSAGES))
      ];
    },
    start: function (rl) {
      rl.preventDefault = true;
    },
    toggleDebug: function (rl) {
      return (rl.debug = !rl.debug)
        ? "Debug mode started."
        : "Debug mode stopped.";
    },
    toggleKeyDefault: function (rl) {
      return (rl.preventDefault = !rl.preventDefault)
        ? "Default key input is disabled."
        : "Default key input is enabled.";
    }
  }
);
