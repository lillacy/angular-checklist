<?php
$json = file_get_contents("php://input");

//list0.json is reserved for the template file
$defFileName = 'list0.json';

if(empty($json)){die('Error: No Data');}
//$json = '{"attr":{"title":"To Do List 2","saved":"3/12/2016 19:45:10.430","filename":"list2.json"},"records":[{"Order":"1","Task":"Walk the Dog","Due":"3/12/2016","Priority":"Medium","Done":"1"},{"Order":"2","Task":"Wash Car","Due":"3/12/2016","Priority":"Low","Done":"0"}]}';

$obj = json_decode($json);
$title = $obj->{'attr'}->{'title'};
$fname = $obj->{'attr'}->{'filename'};
if($fname == $defFileName) $fname = '';

//Check for Title
if(empty($title)){die('Error: No Title');}

//Save Location
$dir = 'lists/';
$ftype = 'json';
$fpref = 'list';

if(strlen($fname) > 0){
  //Save existing file
  if(!file_exists($dir . $fname)){
	//Could not find file
    die('Error: File does not exist');
  }
} else {
  //Create new file name
  $maxNum = 0;
  $filelist = scandir($dir, 1);
  for($i=0;$i<count($filelist);$i++){
    $curNum = getFileNum($filelist[$i], $ftype, $fpref);
	if($curNum > $maxNum) { $maxNum = $curNum; }
  }
  $fname = $fpref . ($maxNum + 1) . '.' . $ftype;
  $obj->{'attr'}->{'filename'} = $fname;
}

//Write to file
$filepath = $dir . $fname;
$myfile = fopen($filepath, 'w') or die("Error: Cannot Write File");
fwrite($myfile, json_encode($obj));
fclose($myfile);
echo 'Success! Saved to ' . $fname;
exit();

function getFileNum($fileName, $fileType, $filePreface){
  $retVal = 0;
  $info = new SplFileInfo($fileName);
  if($info->getExtension() == $fileType){
    $fileBase = $info->getBasename('.' . $fileType);
	$lenPref = strlen($filePreface);
	if(substr($fileBase, 0, $lenPref) == $filePreface){
      $fileNum = substr($fileBase, $lenPref);
	  if(is_numeric($fileNum)) { $retVal = $fileNum; }
	}
  }
  return intval($retVal);
}
?>