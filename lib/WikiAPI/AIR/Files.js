if (typeof WikiAPI == 'undefined') { var WikiAPI = {}; }
if (typeof WikiAPI.AIR == 'undefined') { WikiAPI.AIR = {}; }
if (typeof WikiAPI.AIR.Files == 'undefined') {
  WikiAPI.AIR.Files = function (dir_url) {
    try {
      this.dir = new window.runtime.flash.filesystem.File(dir_url || 'app-strage:/wiki');
      if (!this.dir.isDirectory) {
        this.dir.createDirectory();
      }
    } catch (e) {
      throw 'WikiAPI.AIR.Files requires Adobe Integrated Runtime';
    }
  };
}

WikiAPI.AIR.Files.VERSION = '0.0.1';

// prototype
WikiAPI.AIR.Files.prototype._getFile = function (wiki_name, suffix) {
  return this.dir.resolve(wiki_name.replace(/^(\w+:)?(.*)$/, function (match, space, name) {
    return (space ? encodeURIComponent(space.slice(0, -1)) + '/' : '') + encodeURIComponent(name);
  }) + (suffix || '.txt'));
};

WikiAPI.AIR.Files.prototype.getPage = function (page_name) {
  var stream = new window.runtime.flash.filesystem.FileStream(), content = '';
  try {
    stream.open(this._getFile(page_name), 'read');
    content = stream.readMultiByte(stream.bytesAvailable, 'utf-8');
    stream.close();
    return content;
  } catch (e) {
    return '';
  }
};

WikiAPI.AIR.Files.prototype.putPage = function (page_name, content) {
  var stream = new window.runtime.flash.filesystem.FileStream();
  try {
    stream.open(this._getFile(page_name), 'write');
    stream.writeMultiByte(content, 'utf-8');
    stream.close();
    return true;
  } catch (e) {
    return false;
  }
};

WikiAPI.AIR.Files.prototype.getAllPages = function () {
  var name = '', list = this.dir.listDirectory(), all_pages = [];
  for (var i = 0; i < list.length; ++i) {
    name = list[i].url.substring(list[i].url.lastIndexOf('/') + 1);
    if (name.match(/\.txt$/)) {
      all_pages.push(name);
    }
  }
  return all_pages;
};
