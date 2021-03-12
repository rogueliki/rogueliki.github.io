if (typeof ActiveXObject != 'undefined' && typeof XMLHttpRequest == 'undefined') {
  XMLHttpRequest = function () { try { return new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) { return  new ActiveXObject("Microsoft.XMLHTTP"); } };
}

if (typeof WikiAPI == 'undefined') { var WikiAPI = {}; }
if (typeof WikiAPI.Rogueliki == 'undefined') { WikiAPI.Rogueliki = {}; }
if (typeof WikiAPI.Rogueliki.HTML == 'undefined') {
  WikiAPI.Rogueliki.HTML = function (dir, lang, wiki) {
    this.dir = dir || 'wiki/';
    this.lang = lang || 'en';
    this.wiki = wiki instanceof Object ? wiki : {};
    this.wikis = wiki instanceof Object ? [wiki] : [];
  };
}

try {
  JSAN.use('Array.Iterative'); // Array.prototype.forEach
  JSAN.use('Locale'); // Locale.setlocale
  JSAN.use('String.Escape'); // String.escapeHTML
} catch (e) {
  throw 'WikiAPI.Rogueliki.HTML requires JSAN to be loaded\n' + e;
}

WikiAPI.Rogueliki.HTML.VERSION = '0.0.1';

// prototype
WikiAPI.Rogueliki.HTML.prototype.setlocale = Locale.setlocale;

WikiAPI.Rogueliki.HTML.prototype._assignNamespace = function (name, object, force) {
  var parent = function () { return this; }();
  name.split('.').forEach(function (value, key, array) {
    parent = parent[value] == null
      ? array.length - 1 == key // object undefined
        ? parent[value] = object
        : parent[value] = {}
      : array.length - 1 == key // object defined
        ? parent[value] = force
          ? object
          : parent[value]
        : parent[value];
  });
  return parent;
};

WikiAPI.Rogueliki.HTML.prototype._getURL = function (url) {
  var req = new XMLHttpRequest;
  try {
    req.open('GET', encodeURI(url), false);
    req.send(null);
    return req.status == 200 || req.status == 304 || req.status == 0 || req.status == null
      ? req.responseText
      : '';
  } catch (e) {
    return '';
    throw 'GetURLError: ' + url + '\n' + e;
  }
};

WikiAPI.Rogueliki.HTML.prototype._getPath = function (wiki_name) {
  return this.dir + wiki_name.replace(/(.*:)?(.*)/, function (match, space, name) {
    return (space ? encodeURIComponent(space.slice(0, -1)) + '/' : '') + encodeURIComponent(name);
  });
};

WikiAPI.Rogueliki.HTML.prototype._getPage = function (page_name) {
  return this._getURL(this._getPath(page_name) + '.txt');
};

WikiAPI.Rogueliki.HTML.prototype._getObject = function (object_name, padding) {
  this._assignNamespace(padding, function (obj) { return obj; }, false);
  try {
    return eval(this._getURL(this._getPath(object_name) + '.js'));
  } catch (e) {
    return;
  }
};

WikiAPI.Rogueliki.HTML.prototype.getPage = function (page_name) {
  var lang = this.setlocale(Locale.LC_MESSAGES), local_name = page_name + '.' + lang;
  for (var i = 0; i < this.wikis.length; ++i) {
    var wiki = this.wikis[i], result;
    if (result = wiki.getPage
        && (lang != this.lang && wiki.getPage(local_name) || wiki.getPage(page_name))) {
      return result;
    }
  }
  return lang != this.lang && this._getPage(local_name) || this._getPage(page_name);
};

WikiAPI.Rogueliki.HTML.prototype.getPageHTML = function (page_name) {
  var lang = this.setlocale(Locale.LC_MESSAGES), local_name = page_name + '.' + lang;
  for (var i = 0; i < this.wikis.length; ++i) {
    var wiki = this.wikis[i], result;
    if (result = wiki.getPageHTML
        && (lang != this.lang && wiki.getPageHTML(local_name) || wiki.getPageHTML(page_name))) {
      return result;
    }
  }
  return this.convertPageHTML(this.getPage(page_name));
};

WikiAPI.Rogueliki.HTML.prototype.getObject = function (object_name, padding) {
  padding = padding || 'Rogueliki.onLoad';
  var lang = this.setlocale(Locale.LC_MESSAGES), local_name = object_name + '.' + lang;
  for (var i = 0; i < this.wikis.length; ++i) {
    var wiki = this.wikis[i], result;
    if (result = wiki.getObject
        && (lang != this.lang && wiki.getObject(local_name, padding) || wiki.getObject(object_name, padding))) {
      return result;
    }
  }
  return lang != this.lang && this._getObject(local_name, padding) || this._getObject(object_name, padding);
};

WikiAPI.Rogueliki.HTML.prototype.convertPageHTML = function (content, call_link) {
  var self = this, anchor = function (wiki_name) {
    var name = wiki_name.match(/(.*?)(\.[a-z]{2})?$/);
    return '<a href="'
      + (call_link || function (name) { return this.dir + name; }).call(self, name[1]).escape('"') + '">'
        + name[1] + '</a>' + (name[2] || '');
  };
  return content
    .escapeHTML(true) // chomped '\n' in IE6
    .replace(/\r?\n/g, '\n')
    .concat('\n') // for pasing
    // hr
    .replace(/^-{4,}.*$/gm, function () {
      return '<hr />\n';
    })
    // br
    .replace(/^([^<>\n].*\n)+/gm, function (lines) {
      return '<p>' + lines.slice(0, -1).replace(/\n/g, '<br />\n') + '</p>\n';
    })
    // wiki name
    .replace(/\b([A-Z][a-z]+){2,}\b/g, function (name) {
      return anchor(name);
    })
    // bracket name (with wiki name)
    .replace(/\[\[(.*?)\]\]/g, function (match, name) {
      return name.match(/[<>]/) ? name : anchor(name);
    })
    // bracket name only
    /*
    .replace(/\[\[([^<>]*)\]\]/g, function (match, name) {
      return anchor(name);
    })
     */
    .slice(0, -1); // remove '\n'
};

WikiAPI.Rogueliki.HTML.prototype.putPage = function (page_name, content) {
  var lang = this.setlocale(Locale.LC_MESSAGES), local_name = page_name + '.' + lang;
  for (var i = 0; i < this.wikis.length; ++i) {
    var wiki = this.wikis[i], result;
    if (result = wiki.putPage && wiki.putPage(lang != this.lang ? local_name : page_name, content)) {
      return result;
    }
  }
  return false;
};

WikiAPI.Rogueliki.HTML.prototype.putObject = function (object_name, content, padding) {
  padding = padding || 'Rogueliki.onLoad';
  var lang = this.setlocale(Locale.LC_MESSAGES), local_name = object_name + '.' + lang;
  for (var i = 0; i < this.wikis.length; ++i) {
    var wiki = this.wikis[i], result;
    if (result = wiki.putObject && wiki.putObject(this.lang != lang ? local_name : object_name, content, padding)) {
      return result;
    }
  }
  return false;
};
