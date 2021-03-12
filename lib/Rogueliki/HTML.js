try { JSAN.use('Rogueliki'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded\n' + e; }

Rogueliki.HTML = function (parent) { return function (id, url) {
  Locale.setlocale(Locale.LC_MESSAGES, ''); // setlocale default for all loading

  this.baseElement = document.getElementById(id);
  parent.apply(this, arguments);

  this.system = this.load('Rogueliki.System.HTML');
  this.keyMap = this.load('Rogueliki.KeyMap.HTML');

  try {
    JSAN.use('WikiAPI.Rogueliki.HTML');
    this.wiki = new WikiAPI.Rogueliki.HTML(url);
  } catch (e) {
    this.wiki = null;
  }
}; }(Rogueliki);
Rogueliki.HTML.prototype = new Rogueliki;

try { JSAN.use('Rogueliki.HTML.Setup'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded'; }

// object
Object.extend(Rogueliki.HTML, {

});

// prototype
Object.extend(Rogueliki.HTML.prototype, function (parent) { return {
  draw: function () {
    this.lineElement.innerHTML = this.line.escapeHTML(true) || '&nbsp;' + '<br />\n';
    this.linesElement.innerHTML = this.lines ? this.wiki.convertPageHTML(this.lines) : '';

    this.screenElement.innerHTML = this.map.screen.map(function (rows) {
      return rows.join('');
    }).join('<br />\n');
    var player = this.player, min = parseInt(this.player.time / 60, 10);
    if (!player.other) {
      this.statusElement.innerHTML = 'STR:' + player.strength + ' DEX:' + player.dexterity + ' CON:' + player.constitution
        + ' INT:' + player.intelligence + ' WIS:' + player.wisdom + ' CHA:' + player.charisma + '<br />'
        + 'HP:' + player.hitPoints + '(' + player.maxHitPoints + ') MP:' +  player.magicPoints + '(' + player.maxMagicPoints + ')'
        + ' AC:' + player.armorClass
        + ' Time:' + ('0' + parseInt(min / 60, 10)).slice(-2) + ':' + ('0' + min % 60).slice(-2);
    }
  },
  /*
  load: function (arg) {
    return parent.load.apply(this, arguments);
  },
   */
  loadJS: function (url) {
    var s_load = document.createElement('script');
    s_load.type = 'text/javascript';
    s_load.src = url;
    //s_load.charset = 'UTF-8';
    document.body.appendChild(s_load);
    return this._loaded[url];
  },

  readyInput: function (type, listener, value) {
    var element = type == 'lines' ? this.textAreaElement : this.textBoxElement;
    this.formElement.style.display = 'block';
    element.value = value || '';
    element.style.display = type == 'lines' ? 'block' : 'inline';
    element.focus();
    var before_prevent = this.preventDefault;
    var ie = !!document.all; // for disable 1st keypress on IE *****
    this.preventDefault = ie ? true : false;

    this.onSubmit = function (cancel) {
      this.onSubmit = function () { };
      this.preventDefault = before_prevent;
      this.formElement.style.display = 'none';
      element.style.display = 'none';
      this.eval(this.screenElement.focus, this.screenElement) // if disable focus method
        || window.focus();

      // emulate key method
      this.key(null, cancel || this.eval(listener, null, element.value) || true);
    };

    return function (key_code) {
      if (ie) {
        this.preventDefault = false; // for 1st keypress is unenable on IE *****
      }
      return key_code == 27 && this.onSubmit(true);
    };
  },

  receive: function (param) {
    if (param || this.event == 'Default') { // for overlap of screen
      this.lines = '';
    }
    return parent.receive.apply(this, arguments);
  },

  start: function () {
    // setchrSize
    Rogueliki.chrSize = Locale.setlocale(Locale.LC_MESSAGES).match(/ja|ko|zh/) ? 2 : 1;
    Locale.Gettext.bindtextdomain('Rogueliki', 'locale');

    //var html = this.baseElement.innerHTML;
    this.baseElement.innerHTML = '';

    // add system element
    this.baseElement.appendChild(this.systemElement = document.createElement('div'));
    this.systemElement.className = 'system';
    //this.systemElement.innerHTML = html;

    // add line view element
    this.baseElement.appendChild(this.lineElement = document.createElement('p'));
    this.lineElement.className = 'line';

    // add lines view element
    this.baseElement.appendChild(this.linesElement = document.createElement('div'));
    this.linesElement.className = 'lines';

    // add form element and initialize
    this.baseElement.appendChild(this.formElement = document.createElement('form'));
    this.formElement.className = 'form';
    this.formElement.action = '';
    this.onSubmit = function () { }; // for readyInput
    document.addEventHandler(this.formElement);
    this.formElement.addEventListener('submit', function (e) { // prevent submit
      if (e instanceof Object && e.preventDefault) {
        e.preventDefault(); // for Moz
      }
      this.onSubmit(); // for readyInput
      return false; // for IE *****
    }.bind(this), true);
    this.formElement.style.display = 'none';

    this.formElement.appendChild(this.textBoxElement = document.createElement('input')); // add input line
    this.textBoxElement.size = parseInt(Rogueliki.width / 2, 10);
    this.textBoxElement.style.display = 'none';

    this.formElement.appendChild(this.textAreaElement = document.createElement('textarea')); // add input lines
    this.textAreaElement.cols = Rogueliki.width;
    this.textAreaElement.rows = parseInt(Rogueliki.width / 8, 10);
    this.textAreaElement.style.display = 'none';

    this.submitElement = document.createElement('input'); // add submit button
    this.submitElement.type = 'submit'; // before appendChild. for IE6 *****
    this.formElement.appendChild(this.submitElement);
    this.submitElement.value = 'OK';
    this.submitElement.style.display = 'inline';

    // add screen element
    this.baseElement.appendChild(this.screenElement = document.createElement('p'));
    this.screenElement.className = 'screen';

    // add status element
    this.baseElement.appendChild(this.statusElement = document.createElement('p'));
    this.statusElement.className = 'status';

    var getKeyCode = Rogueliki.HTML.Setup.getKeyCode;
    var branchPrevention = function (e) {
      if (this.preventDefault && e instanceof Object && e.preventDefault) {
        e.preventDefault(); // for Moz *****
      }
      this.key(getKeyCode(e));
      return !this.preventDefault; // for IE *****
    }.bind(this);

    document.addEventListener('keydown', function (e) { // for cursor key on IE only *****
      var key_code = getKeyCode(e);
      return document.all && !window.opera && key_code <= 40 && key_code > 32
        ? branchPrevention(key_code)
        : true;
    }, true);
    document.addEventListener('keypress', function (e) {
      return branchPrevention(e);
    }, true);

    parent.start.call(this);
    this.preventDefault = true;
    this.key(27); // ESC
  },

  // for single process
  /*
  _pause: function () {
    if (!this._paused) {
      return this._paused = true;
    }
  },
  _play: function () {
    return this._paused = false;
  },
   */

  translate: function (msg, msg_plural, n) {
    return msg_plural && n // have not translated yet if called with multiple arguments
      ? Object.extend(new String( // flagged translated {
          Locale.Gettext.ngettext(msg, msg_plural, n)
        ), { _translated: true }) // }
      : msg._translated
        ? msg
        : Object.extend(new String( // flagged translated {
          msg.formatString
            ? String.prototype.format.apply(
              Locale.Gettext.gettext(msg.formatString),
              Array.map(msg.arguments, function (string) { return this.translate(string); }, this)
            )
            : Locale.Gettext.gettext(msg)
        ), { _translated: true }); // }
  },

  update: function (callback) {
    parent.update.call(this, callback || function (obj) {
      var symbol = obj.toString();//.escapeHTML();
      // for optimization
      switch (symbol) {
        case '&':
          symbol = '&amp;';
          break;
        case ' ':
          symbol = '&nbsp;';
          break;
        case '<':
          symbol = '&lt;';
          break;
        case '>':
          symbol = '&gt;';
          break;
        case '"':
          symbol = '&quot;';
          break;
        default:
      }

      var watching = new String(obj == this.player ? '<u>' + symbol + '</u>' : symbol);
      watching.toString = function () {
        //delete this.toString;
        delete watching.toString; // for optimization
        return '<a class="sight">' + this + '</a>';
      };
      return watching;
    });
  }
}; }(Rogueliki.prototype));
