<?php
include_once "./auth.php";

function toColName($input) {
  global $db;
  return str_replace("'", "`", $db->quote($input));
}
function aliasColNames($tableAlias, $colNames) {
  return implode(", ", array_map(function($colName) use($tableAlias) {
    return "$tableAlias.`$colName` `$tableAlias.$colName`";
  }, $colNames));
}

header("Content-Type: application/json");
$db = createDB();
$input = json_decode(file_get_contents('php://input'));

if (isset($input->p)) $p = $input->p;
else if (isset($input->u)) $p = [$input->u];
$multiTable = false;
switch($input->a) {
  case "login":
    $t = 'SELECT `id` FROM `users` WHERE `username`=? AND `password`=md5(?)';
    break;
  case "works":
    $t = 'SELECT w.`id`, w.`name`, w.`tags`, w.`img`, w.`type`, a.`work_id`, COUNT(*) activity_count
          FROM `works` w
          JOIN `activities` a
          ON w.`id` = a.`work_id` 
          WHERE `user_id` = ?
          GROUP BY `work_id`';
    $p = [$input->u];
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
}

$query = $db->prepare($t);
$query->execute($p);
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