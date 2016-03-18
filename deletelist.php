<?php
$fpath = file_get_contents("php://input");
//$fpath = 'lists/list1.json';

if(empty($fpath)){die('Error: No File Path');}

if(!file_exists($fpath)){die('Error: File Does Not Exist');}

if(unlink($fpath)) echo 'Success!';
else echo 'Error: Could Not Delete';

exit();
?>