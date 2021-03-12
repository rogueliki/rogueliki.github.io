if (typeof WikiAPI == 'undefined') { var WikiAPI = {}; }
if (typeof WikiAPI.Creole == 'undefined') {
  WikiAPI.Creole = function (wiki, depth, blog) {
    if (wiki instanceof Object) {
      for (var i in wiki) {
        this[i] = wiki[i];
      }
    } else {
      this.wiki = wiki;
      this.depth = depth;
      this.blog = blog;
    }

    // set default
    this.wiki = this.wiki || 'wiki/';
    this.depth = this.depth || 0;
    this.blog = Boolean(this.blog);
  };
}

WikiAPI.Creole.VERSION = '0.0.1';

try {
  if (!String.prototype.escapeHTML) {
    JSAN.use('String.Escape');
  }
  if (!Array.prototype.map) {
    JSAN.use('Array.Iterative');
  }
} catch (e) {
  throw 'WikiAPI.Creole requires JSAN to be loaded\n' + e;
}

WikiAPI.Creole.prototype.interwiki = {
  'wikipedia.ja': function (name) { return 'http://ja.wikipedia.org/wiki/' + encodeURIComponent(name); }
};

WikiAPI.Creole.prototype.replaceLink = function (link_name, call_link) {
  var name = link_name.match(/([^|]*)\|?(.*)/),
    wiki = name[1].match(/([^:]*):?(.*)/),
    url = name[1].match(/^(https?|mailto|javascript):/),
    interwiki = wiki[2] && this.interwiki[wiki[1]];
  return '<a href="' + ((url && name[1])
                        || (interwiki || call_link).call(this, interwiki && wiki[2] || name[1])).escape('"') + '">'
    + this.replaceInline(name[2] || name[1]) + '</a>';
};

WikiAPI.Creole.prototype.replaceImage = function (link_name) {
  var name = link_name.match(/([^|]*)\|?(.*)/);
  return '<img src="' + name[1] +'" alt="' + name[2] + '" />';
};

WikiAPI.Creole.prototype.replaceInline = function (inline, call_link) {
  //return inline;
  return inline
    // bold
    .replace(/\*\*(.*?)\*\*/gm, function (match, inline) {
      return '<strong>' + inline + '</strong>';
    })
    // italic
    .replace(/\/\/(.*?)\/\//gm, function (match, inline) {
      return '<em>' + inline + '</em>';
    });
};

WikiAPI.Creole.prototype.convertPageHTML = function (content, call_link) {
  call_link = call_link || function (name) {
    return this.wiki + encodeURIComponent(name);
  };
  var self = this, pre = [], tt = [], bracket = [], image = [], url = [];
  return content
    .escapeHTML()
    .replace(/\r?\n/g, '\n')
    .concat('\n') // for pasing
    // pre
    .replace(/^{{{\n((.*\n)*?)}}}\n/gm, function (match, lines) {
      return (pre.push(lines), '<pre></pre>'); // for pasing end
    })
    // tt
    .replace(/{{{(.*?)}}}/gm, function (match, inline) {
      return (tt.push(inline), '{{{}}}'); // for pasing end
    })
    // image
    .replace(/{{(.*?)}}/g, function (match, name) {
      return (image.push(name), '{{}}'); // for pasing end
    })
    // bracket
    .replace(/\[\[(.*?)\]\]/g, function (match, name) {
      return (bracket.push(name), '[[]]'); // for pasing end
    })
    // url
    .replace(/\b((https?|mailto|javascript):\/\/[-!#$%&\'()*+,./0-9:;=?@A-Z_a-z~]+[-#$%&()*+/0-9=@A-Z_a-z~])/g, function (name, href) {
      return (url.push(href), 'u<r>l'); // for pasing end
    })
    // blockquote
    .replace(/^(&gt;.*\n)+/gm, function (lines) {
      return '<blockquote>\n' + lines.replace(/^&gt;/gm, '') + '</blockquote>\n';
    })
    // head
    .replace(/^(\=+)(.*?)=*$/gm, function (match, star, inline) {
      var head = star.length + (this.depth || 0);
      return '<h' + head + '>' + inline + '</h' + head + '>';
    })
    // hr
    .replace(/^-{4,}.*$/gm, function () {
      return '<hr />\n';
    })
    // order list
    .replace(/^( *#.*\n)+/gm, function (list) {
      var before = 0;
      return '<ol>\n' + list.replace(/^ *#/gm, '').split('\n').map(function (line, key, array) {
        var depth = line.replace(/^(#*).*/gm, '$1').length, tag = depth - before < 0 ? '</ol>' : '<ol>', tags = [];
        // for firefox
        var tags = [];
        for (var i = Math.abs([depth - before, before = depth][0]); i > 0; --i) {
          tags.push(tag);
        }
        //return new Array(Math.abs([depth - before, before = depth][0])).map(function () { return tag; }).join('') // initial failedin firefox
        return tags.map(function () { return tag; }).join('') // for firefox
          + (key == array.length - 1 ? '' : '<li>' + self.replaceInline(line.replace(/^#*(.*)/gm, '$1')) + '</li>\n');
      }).join('') + '</ol>\n';
    })
    // unorder list
    .replace(/^( *\*.*\n)+/gm, function (list) {
      var before = 0;
      return '<ul>\n' + list.replace(/^ *\*/gm, '').split('\n').map(function (line, key, array) {
        var depth = line.replace(/^(\**).*/gm, '$1').length, tag = depth - before < 0 ? '</ul>' : '<ul>';
        // for firefox
        var tags = [];
        for (var i = Math.abs([depth - before, before = depth][0]); i > 0; --i) {
          tags.push(tag);
        }
        //return new Array(Math.abs([depth - before, before = depth][0])).map(function () { return tag; }).join('') // initial failed in firefox
        return tags.map(function () { return tag; }).join('') // for firefox
          + (key == array.length - 1 ? '' : '<li>' + self.replaceInline(line.replace(/^\**(.*)/gm, '$1')) + '</li>\n');
      }).join('') + '</ul>\n';
    })
    // table
    .replace(/^(\|.*\n)+/gm, function (table) {
      return '<table>\n' + table.replace(/^\|/gm, '').slice(0, -1).split('\n').map(function (line) {
        return '<tr>' + line.replace(/\|?$/, '').split('|').map(function (inline) {
          return inline.match(/^=/)
            ? '<th>' + self.replaceInline(inline.replace(/^=/, '')) + '</th>'
            : '<td>' + self.replaceInline(inline) + '</td>';
        }).join('') + '</tr>\n';
      }).join('') + '</table>\n';
    })
    // br
    .replace(/^([^<>\n].*\n)+/gm, function (lines) {
      return '<p>' + self.replaceInline(lines.slice(0, -1).replace(/\n/g, this.blog ? '<br />' : ''))
        .replace(/<br \/>/g, '<br />\n') + '</p>\n';
    })
    .replace(/\\\\/g, '<br />')
    // wiki name
    .replace(/(~?)([A-Z][a-z]+){2,}\b/gm, function (name, escape) {
      return escape ? name.substring(1) : self.replaceLink(name, call_link);
    })
    // url
    .replace(/u<r>l/g, function (match) {
      var href = url.shift();
      return '<a href="' + href + '">' + href + '</a>';
    })
    // bracket
    .replace(/\[\[\]\]/g, function (match) {
      return self.replaceLink(bracket.shift(), call_link);
    })
    // image
    .replace(/{{}}/g, function (match) {
      return self.replaceImage(image.shift());
    })
    // tt
    .replace(/{{{}}}/g, function (match) {
      return '<tt>' + tt.shift() + '<\/tt>';
    })
    // pre
    .replace(/<pre><\/pre>/g, function (match) {
      return '<pre>' + pre.shift().replace(/~}}}/g, '}}}') + '<\/pre>';
    })
    /*
    // bracket name only
    .replace(/\[\[([^<>]*?)\]\]/g, function (match, name) {
      return self.replaceLink(name, call_link);
    })
     */
    .slice(0, -1); // remove '\n'
};
