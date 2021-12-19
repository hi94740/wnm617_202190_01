<?php
header("Content-Type: application/json");
function done($d) { die(json_encode($d)); }
if (isset($_FILES["image"]) && in_array($_FILES["image"]["type"], ["image/jpeg", "image/jpg", "image/pjpeg", "image/x-png", "image/png", "image/webp"])) {
  if ($_FILES["image"]["error"] > 0) done(["error" => $_FILES["image"]["error"]]);
  else {
    $fileName = microtime(true)."_".random_int(0, 999)."_".$_FILES["image"]["name"];
    move_uploaded_file($_FILES["image"]["tmp_name"], "../img/user/$fileName");
    done(["url" => "img/user/$fileName"]);
  }
} else {
  done(["error" => "Only jpeg and png image is allowed"]);
}