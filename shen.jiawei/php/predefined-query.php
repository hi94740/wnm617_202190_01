<?php
include_once "./auth.php";
header("Content-Type: application/json");
$db = createDB();
function toColName($input) {
  global $db;
  return str_replace("'", "`", $db->quote($input));
}
$input = json_decode(file_get_contents('php://input'));

if (isset($input->p)) $p = $input->p;
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
    $t = 'SELECT a.`id`,c.`id`,c.`lat`,c.`lng`,c.`work_id`,c.`date_create`
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
}

$query = $db->prepare($t);
$query->execute($p);
echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));