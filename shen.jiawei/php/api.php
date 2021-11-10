<?php
include_once "./auth.php";
header("Content-Type: application/json");
$db = createDB();
function toColName($input) {
  global $db;
  return str_replace("'", "`", $db->quote($input));
}
$input = json_decode(file_get_contents('php://input'));
$q = $input->q;
$queryTemplate = [];
$queryOptions = [];
if (isset($q->select)) {
  $queryTemplate[] = "SELECT";
  $sel = $q->select;
  if (is_array($sel)) {
    $queryTemplate[] = implode(",", array_map("toColName", $sel));
  } else {
    $queryTemplate[] = "*";
  }
  $queryTemplate[] = "FROM";
}
$queryTemplate[] = toColName($input->table);
if (isset($q->where) && is_array($q->where)) {
  $queryTemplate[] = "WHERE";
  array_walk($q->where, function($o) use(&$queryTemplate, &$queryOptions) {
    if (is_array($o)) {
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
      switch($o) {
        case "AND":
        case "(":
        case ")":
          $queryTemplate[] = $o;
          break;
      }
    }
  });
}

$queryTemplate = implode(" ", $queryTemplate);
// echo '<pre>'; print_r($queryOptions); echo '</pre>';
// echo $queryTemplate;
$query = $db->prepare($queryTemplate);
$query->execute($queryOptions);
echo json_encode($query->fetchAll(PDO::FETCH_ASSOC));