<?php
$fpath = file_get_contents("php://input");
//$fpath = 'lists/list1.json';

if(empty($fpath)){die('Error: No File Path');}

if(!file_exists($fpath)){die('Error: File Does Not Exist');}

$json = file_get_contents($fpath);
$obj = json_decode($json);
$title = $obj->{'attr'}->{'title'};

if(empty($title)){die('Error: No Title');};

$saved = $obj->{'attr'}->{'saved'};
$flnam = $obj->{'attr'}->{'filename'};
$rcrds = $obj->{'records'};

header('Content-Type: application/json');

//Output Data
echo '{"attr":{"title":"' . $title . '","saved":"' . $saved . '","filename":"' . $flnam . '"},"records":[';
for($i=0;$i<count($rcrds);$i++){
    $order = $rcrds[$i]->{'Order'};
    $itmds = $rcrds[$i]->{'Task'};
    $duedt = $rcrds[$i]->{'Due'};
    $prity = $rcrds[$i]->{'Priority'};
    $tskdn = $rcrds[$i]->{'Done'};
    echo '{"Order":"' . $order . '","Task":"' . $itmds . '","Due":"' . $duedt . '","Priority":"' . $prity . '","Done":' . convertDone($tskdn) . '}';
    if(($i+1)<count($rcrds)) echo ',';
}
echo ']}';
exit();

function convertDone($myVal){
    if(is_numeric($myVal)){
        if($myVal > 0) return "true";
        else return "false";
    } else {
        if($myVal) return "true";
        else return "false";
    }
}

?>