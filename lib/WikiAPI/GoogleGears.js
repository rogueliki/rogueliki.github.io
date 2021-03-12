if (typeof WikiAPI == 'undefined') { var WikiAPI = {}; }
if (typeof WikiAPI.GoogleGears == 'undefined') {
  WikiAPI.GoogleGears = function (db) {
    this.db = this._init(db || 'wikirpc');
    if (!this.db) {
      throw new Error('WikiAPI.GoogleGears requires Google Gears');
    }
  };
}

WikiAPI.GoogleGears.VERSION = '0.0.1';

// prototype
WikiAPI.GoogleGears.prototype._init = function (db_name) {
  if (!window.google || !google.gears) {
    return;
  }

  var db = google.gears.factory.create('beta.database', '1.0');

  if (db) {
    db.open(db_name);
    db.execute('create table if not exists pages (name tinytext, content text, timestamp time)');
  }

  return db;
};

WikiAPI.GoogleGears.prototype.getPage = function (page_name) {
  var rs = this.db.execute('select * from pages where name = ?', [page_name]);
  return rs.isValidRow() ? rs.field(1) : '';
};

WikiAPI.GoogleGears.prototype.putPage = function (page_name, content) {
  var rs = this.db.execute('select * from pages where name = ?', [page_name]);
  return rs.isValidRow()
    ? this.db.execute('update pages set content = ? where name = ?', [content, page_name])
    : this.db.execute('insert into pages values (?, ?)', [page_name, content]);
};

WikiAPI.GoogleGears.prototype.getAllPages = function () {
  var rs = this.db.execute('select name from pages order by name'), all_pages = [];
  while (rs.isValidRow()) {
    all_pages.push(rs.field(0));
    rs.next();
  }
  return all_pages;
};
