try { JSAN.use('Rogueliki.Setup'); } catch (e) { throw 'Rogueliki requires JSAN to be loaded\n' + e; }

Rogueliki.KeyMap = function (add) {
  Object.extend(this, add || {});
};

// object
Object.extend(Rogueliki.KeyMap, {

});

// prototype
Object.extend(Rogueliki.KeyMap.prototype, {
  'a': 'apply',                'A': '',
  'b': 'walkSouthWest',        'B': '',
  'c': 'close',                'C': '',
  'd': 'drop',                 'D': 'dropSeveral',
  'e': 'eat',                  'E': 'engrave',
  'f': 'fight',                'F': '',
  'g': '',                     'G': '',
  'h': 'walkWest',             'H': '',
  'i': 'listItem',             'I': '',
  'j': 'walkSouth',            'J': '',
  'k': 'walkNorth',            'K': '',
  'l': 'walkEast',             'L': '',
  'm': '',                     'M': '',
  'n': 'walkSouthEast',        'N': '',
  'o': 'open',                 'O': '',
  'p': '',                     'P': '',
  'q': '',                     'Q': '',
  'r': 'read',                 'R': '',
  's': '',                     'S': 'save',
  't': '',                     'T': 'takeOff',
  'u': 'walkNorthEast',        'U': '',
  'v': '',                     'V': '',
  'w': 'wield',                'W': 'wear',
  'x': '',                     'X': '',
  'y': 'walkNorthWest',        'Y': '',
  'z': '',                     'Z': '',
  ',': 'pickUp',               '.': 'rest',
  '#': 'command',              '?': 'help',
  '<': 'goUp',                 '>': 'goDown',
  37: 'walkWest',              38: 'walkNorth',
  39: 'walkEast',              40: 'walkSouth',
  13: 'say',
  direction: {}
});

// direction prototype
Object.extend(Rogueliki.KeyMap.prototype.direction, {
  'h': { x: -1, y:  0 }, 'y': { x: -1, y: -1, skew: true }, 'k': { x:  0, y: -1 }, 'u': { x:  1, y: -1, skew: true },
  'l': { x:  1, y:  0 }, 'n': { x:  1, y:  1, skew: true }, 'j': { x:  0, y:  1 }, 'b': { x: -1, y:  1, skew: true },
  '.': { x:  0, y:  0 },
  37 : { x: -1, y:  0 }, 38 : { x:  0, y: -1 }, 39 : { x:  1, y:  0 }, 40 : { x:  0, y:  1 }
});
