var wiki_rpc;

function hash2wiki() {
  var param = location.hash.replace(/^#/, '').split('/'), before_wiki_rpc = wiki_rpc, rpc_and_param = [];

  if ((wiki_rpc = param[0]) != before_wiki_rpc) {
    switch (wiki_rpc) {
    case 'XMLRPC':
      JSAN.use('WikiAPI.XMLRPC');
      rpc_and_param.push(new WikiAPI.XMLRPC('wiki.php'));
      break;
    case 'TiddlyWiki.Files':
      JSAN.use('WikiAPI.TiddlyWiki.Files');
      rpc_and_param.push(new WikiAPI.TiddlyWiki.Files('TiddlyWiki.htm', './wiki/'));
      break;
    default:
      wiki_rpc = '';
      //JSAN.use('WikiAPI.Rogueliki.HTML');
      //rpc_and_param.push(new WikiAPI.Rogueliki.HTML('./wiki/')); // for 
      rpc_and_param.push(false); // for property of WikiAPI.Rogueliki.HTML
    }
  } else {
    rpc_and_param.push(false);
  }

  /*
    F = false

    before (arguments): aaa/bbb/ccc
    after (hash param): aaa/bbb/ddd
    return            :[ F , F ,ddd]

    before (arguments): aaa/bbb/ccc/ddd
    after (hash param): aaa/eee/ccc/ddd
    return            :[ F ,eee, F , F ]

    before (arguments): aaa/bbb/ccc/ddd
    after (hash param): bbb/eee/ccc/ddd
    return            :[bbb,eee,ccc,ddd]
   */

  var loaded = wiki_rpc == before_wiki_rpc;
  for (var i = 1; i <= arguments.length; ++i) {
    rpc_and_param.push(param[i] && (!loaded || param[i] != arguments[i - 1]) && decodeURIComponent(param[i]));
  }

  return rpc_and_param;
}

function wiki2hash(wiki, wiki2) {
  wiki2 ? set_hash(wiki_rpc, wiki, wiki2) : set_hash(wiki_rpc, wiki);
}

function set_hash() {
  var array = [], hash_array = location.hash.replace(/^#/, '').split('/'), update = false;

  for (var i = 0; i < arguments.length; ++i) {
    if (hash_array[i] != (array[i] = encodeURIComponent(arguments[i]))) {
      update = true;
    }
  }

  if (update) {
    location.hash = array.join('/');
  }

  return array;
}
