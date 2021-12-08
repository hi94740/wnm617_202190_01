<?php
include_once "./auth.php";

function toColName($input) {
  $input = explode(".", $input);
  $input = array_map(function($c) {
    global $db;
    return str_replace("'", "`", $db->quote($c));
  }, $input);
  return implode(".", $input);
}
function aliasColNames($tableAlias, $colNames) {
  return implode(", ", array_map(function($colName) use($tableAlias) {
    return "$tableAlias.`$colName` `$tableAlias.$colName`";
  }, $colNames));
}
function makeInsert($table, $cols) {
  return "INSERT INTO `$table`
  (".implode(", ", $cols).", date_create)
  VALUES
  (".implode(", ", array_map(function($c) { return ":$c"; }, $cols)).", NOW())";
}
function where($p, $wrap = true, $connector = "AND") {
  $where = ['', []];
  if (isset($p->where)) {
    $queryTemplate = [];
    $queryOptions = [];
    array_walk($p->where, function($o) use(&$queryTemplate, &$queryOptions) {
      if (is_array($o)) {
        if (is_array($o[1])) {
          switch($o[0]) {
            case "=":
              $values = $o[1];
              if ($values[0] == "password") {
                $queryTemplate[] = toColName($values[0]).$o[0].'md5(?)';
              }
              else {
                $queryTemplate[] = toColName($values[0]).$o[0].'?';
              }
              $queryOptions[] = $values[1];
              break;
          }
        } else {
          $values = $o;
          if ($values[0] == "password") {
            $queryTemplate[] = toColName($values[0]).'=md5(?)';
          }
          else {
            $queryTemplate[] = toColName($values[0]).'=?';
          }
          $queryOptions[] = $values[1];
        }
      } else {
        switch($o) {
          case "AND":
          case "(":
          case ")":
            $queryTemplate[] = $o;
            break;
        }
      }
    });
    $where = [implode(" ", $queryTemplate), $queryOptions];
    if ($wrap) $where[0] = " $connector ($where[0])";
  }
  return $where;
}

header("Content-Type: application/json");
$db = createDB();
$input = json_decode(file_get_contents('php://input'));

if (isset($input->p)) $p = $input->p;
$multiTable = false;
$inserted = false;
switch($input->a) {
  case "login":
    $t = 'SELECT `id` FROM `users` WHERE `username`=? AND `password`=md5(?)';
    break;
  case "works":
    $where = where($input->p);
    $t = "SELECT w.`id`, w.`name`, w.`tags`, w.`img`, w.`type`, activity_count
          FROM `works` w
          LEFT JOIN (SELECT w.`id`, COUNT(*) activity_count
          FROM `works` w
          JOIN `activities` a
          ON w.`id` = a.`work_id` 
          GROUP BY `work_id`) ac
          ON ac.`id` = w.`id`
          WHERE `user_id` = ?$where[0]";
    $p = [$input->u, ...$where[1]];
    break;
  case "one_most_recent_activity_of_each_work":
    $t = 'SELECT c.`id`,c.`lat`,c.`lng`
          FROM `works` a
          JOIN  `activities` c
          ON a.`id` = c.`work_id`
          JOIN (
              SELECT `work_id`, GROUP_CONCAT(`id` ORDER BY `date_create` DESC) grouped
              FROM `activities`
              GROUP BY `work_id`
          ) b
          ON a.`id` = b.`work_id`
          AND FIND_IN_SET(c.`id`, grouped) = 1
          WHERE a.`user_id` = ?
          ORDER BY c.`lat` DESC';
    $p = [$input->u];
    break;
  case "activity":
    $t = 'SELECT '
          .aliasColNames("a", ['title', 'description', 'images']).', '
          .aliasColNames("w", ['name', 'type']).'
          FROM `activities` a
          JOIN `works` w
          ON a.`work_id` = w.`id`
          AND w.`user_id` = ?
          WHERE a.`id` = ?';
    $p = [$input->u, $input->p];
    $multiTable = true;
    break;
  case "activity_list":
    $where = where(isset($input->p[1]) ? $input->p[1] : []);
    $t = 'SELECT a.`id`, a.`title`, UNIX_TIMESTAMP(a.`date_create`) `date_create`
          FROM `activities` a
          JOIN `works` w
          ON w.`user_id` = ?
          AND a.`work_id` = w.`id`
          WHERE a.`work_id` = ?'.$where[0].'
          ORDER BY a.`date_create` DESC';
    $p = [$input->u, $input->p[0], ...$where[1]];
    break;
  case "add_work":
    $query = $db->prepare('SELECT `user_id` FROM `works` WHERE `user_id` = ?');
    $query->execute([$input->u]);
    $result = $query->fetchAll(PDO::FETCH_ASSOC);
    if (count($result) == 0) die("user not authorized");
    $t = makeInsert("works", ["name", "type", "tags", "user_id"]);
    $p->user_id = $input->u;
    $p = (array) $p;
    $inserted = true;
    break;
}

$query = $db->prepare($t);
$query->execute($p);
if ($inserted) die($db->lastInsertId());
$result = $query->fetchAll(PDO::FETCH_ASSOC);
if ($multiTable) $result = array_map(function($r) {
  $e = [];
  $keys = array_keys($r);
  array_walk($keys, function($k) use(&$e, $r) {
    $k2 = explode(".", $k);
    if (!isset($e[$k2[0]])) $e[$k2[0]] = [];
    $e[$k2[0]][$k2[1]] = $r[$k];
  });
  return $e;
}, $result);
echo json_encode($result);