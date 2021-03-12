try { JSAN.use('Rogueliki'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded\n' + e; }

Rogueliki.Base = function (rl) {
  if (rl) {
    if (Rogueliki.SINGLE) {
      this.constructer.prototype.rl = rl;
    } else {
      this.rl = rl;
    }
  }
};

Object.extend(Rogueliki.Base.prototype, {
  type: 'Rogueliki.Base',

  toLiteral: function (real_literal) {
    var obj = Rogueliki.simplify(this);
    return Object.toLiteral(typeof obj == 'string' && Rogueliki.typeMap[obj] || obj);
  }
});
