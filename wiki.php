<?php

// Using PEAR :: Package :: XML_RPC
// http://pear.php.net/package/XML_RPC
require_once('XML/RPC.php');
require_once('XML/RPC/Server.php');

$_GLOBALS['XML_RPC_defencoding'] = 'UTF-8';
$dir = 'wiki';
$plain = $_GET['plain'];

$expire = 60 * 60 * 24 * 7;
$users = array();
//$users = array('guest' => md5('guest'));
$user = '';

function login($user = 0, $pass = 0) {
  global $users, $expire;
  session_start();
  if ($user and $pass) {
    if (md5($pass) == $users[$user]) {
      // regenerate session-ID for session fixation attack
      if (version_compare(phpversion(), '5.1.0', '<')) {
        session_destroy();
        session_set_cookie_params($expire);
        session_start();
        session_regenerate_id();
      } else {
        session_regenerate_id(true);
      }

      if (version_compare(phpversion(), '4.3.3', '<')) {
        setcookie(session_name(), session_id(), $expire);
      }

      $_SESSION['user'] = $user;
      $_SESSION['certified'] = true;
      return $user;
    }
  } else {
    if (isset($_SESSION['certified'])) {
      return $_SESSION['user'];
    }
  }
  session_destroy();
  return false;
}

function logout() {
  session_start();
  $_SESSION = array();
  setcookie(session_name(), '', time() - 42000, '/');
  session_destroy();
}

function str2file($str) {
  return preg_replace('/^(\w+:)?(.*)$/e', 'str2ascii("$1")."/".str2ascii("$2")', $str);
}

function str2ascii($str) {
  return preg_replace_callback(
    '/[^\w-_.!~\'()]/',
    create_function(
      '$word',
      'return \'%\' . strtoupper(implode(\'\', unpack(\'H2\', $word[0])));'
    ),
    $str
  );
}

function get_all_pages($params) {
  global $dir, $plain;
  $list = array();

  $fp = fopen($dir . '/RecentChanges.txt', 'r');
  flock($fp, LOCK_SH);
  while (!feof($fp)) {
    $line = substr(rtrim(fgets($fp)), 20) // strip date section
      and array_push($list, str_replace(array('[[', ']]'), '', $line));
  }
  fclose($fp);

  return $plain
    ? implode("\n", $list)
    : new XML_RPC_Response(XML_RPC_encode($list));
}

function get_page($params) {
  global $dir, $plain;
  $page = $params->getParam(0);

  $log = file_get_contents($dir . '/' . str2file($page->scalarval()) . '.txt');

  return $plain
    ? $log
    : new XML_RPC_Response(XML_RPC_encode($log));
}

function get_object($params) {
  global $dir, $plain;
  $page = $params->getParam(0);
  $padding = $params->getParam(1);

  $log = file_get_contents($dir . '/' . str2file($page->scalarval()) . '.js');
  $log = preg_replace('/^\S*?\(/', ($padding ? $padding->scalarval() : '') . '(', $log);

  return $plain
    ? $log
    : new XML_RPC_Response(XML_RPC_encode($log));
}

if (!function_exists('file_put_contents')) {
  define('FILE_APPEND', 1);
  function file_put_contents($file, $content, $flag) {
    if (!($fp = fopen($file, ($flag & FILE_APPEND) ? 'a' : 'w'))) {
      return false;
    }
    flock($fp, LOCK_EX);
    $written = fwrite($fp, is_array($content) ? implode($content) : $content);
    fclose($fp);
    return $written;
  }
}

function put_page($params) {
  global $dir, $plain;
  $page = $params->getParam(0);
  $content = $params->getParam(1);
  $reserved = array('RecentChanges');
  $result = 0;

  $log = preg_replace('/\r?\n/', "\n", $content->scalarval());

  if (array_search($page->scalarval(), $reserved) === FALSE
      and file_put_contents($dir . '/' . str2file($page->scalarval()) . '.txt', $log)) {
    update_changes($page->scalarval());
    $result = 1;
  }

  return $plain
    ? $result
    : new XML_RPC_Response(new XML_RPC_Value($result, 'boolean'));
}

function put_object($params) {
  global $dir, $plain;
  $page = $params->getParam(0);
  $content = $params->getParam(1);
  $padding = $params->getParam(2);
  $reserved = array('RecentChanges');
  $result = 0;

  $log = preg_replace('/\r?\n/', "\n", $content->scalarval());
  $log = ($padding ? $padding->scalarval() : '') . "(\n" . $log . "\n);\n";

  if (array_search($page->scalarval(), $reserved) === FALSE
      and file_put_contents($dir . '/' . str2file($page->scalarval()) . '.js', $log)) {
    //update_changes($page->scalarval());
    $result = 1;
  }

  return $plain
    ? $result
    : new XML_RPC_Response(new XML_RPC_Value($result, 'boolean'));
}

function update_changes($str) {
  global $dir;
  $log = date('Y-m-d H:i:s ') . '[[' . $str . "]]\n";

  if ($fp = fopen($dir . '/RecentChanges.txt', 'r+')) {
    flock($fp, LOCK_EX);
    while (!feof($fp)) {
      $line = fgets($fp);
      str_replace(array('[[', ']]'), '', substr(rtrim($line), 20)) != $str
        and $log .= $line;
    }
    fseek($fp, 0, SEEK_SET);
    fwrite($fp, $log);
    ftruncate($fp, ftell($fp));
    fclose($fp);
  }
}

if (!isset($_GET['html'])) {
  error_reporting(E_ERROR & E_PARSE); // suppress Warning XML/RPC/Server.php header
  header('Content-Type: text/xml; charset=UTF-8'); // dou jou
  
  $functions = array(
    'wiki.getAllPages' => array('function' => 'get_all_pages'),
    'wiki.getPage' => array('function' => 'get_page'),
    'wiki.getObject' => array('function' => 'get_object')
  );

  if (login()) {
    $functions['wiki.putPage'] = array('function' => 'put_page');
    $functions['wiki.putObject'] = array('function' => 'put_object');
  }

  $server = new XML_RPC_Server($functions);
} elseif (isset($_GET['submit'])) {
  if ($_POST['submit'] == 'logout') {
    logout();
    $user = login();
  } else {
    $user = login($_POST['user'], $_POST['pass']);
  }
?>
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
  <meta http-equiv="refresh" content="1;URL=wiki.php?html=1" />
  <title>wiki</title>
</head>

<body>
 <?php echo $user ? 'Hello, ' . $user . '.' : 'You are not login.' ?>
 Request Processing...
</body>
</html>
<?php
} else {
  $user = login();
?>
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">

<head>
  <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
  <title>wiki</title>
</head>

<body>
<?php echo $user ? 'Hello, ' . $user . '.' : 'You are not login.' ?>
<form action="wiki.php?html=1&submit=1" method="post">
User: <input type="text" size="10" name="user" /> <br />
Password: <input type="password" size="10" name="pass" /> <br />
<input type="submit" value="login" name="submit" />
<input type="submit" value="logout" name="submit" />
</form>
</body>

</html>
<?php
}
?>
