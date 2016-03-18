<?php
    header('Content-Type: application/json');
    
    $dir = 'lists/';
    $ftype = 'json';
    $fpref = 'list';

    $myListTitles = array();
    $myListFlName = array();
    $myListSvTime = array();
    
    $filelist = scandir($dir);
    for($i=0;$i<count($filelist);$i++){
        if(isValidFileType($filelist[$i], $ftype, $fpref)){
            $filepath = $dir . $filelist[$i];
            $json = file_get_contents($filepath);
            $obj = json_decode($json);
            $title = $obj->{'attr'}->{'title'};
            $saved = $obj->{'attr'}->{'saved'};
            $flnam = $obj->{'attr'}->{'filename'};
            if(!empty($title) && !empty($saved) && $flnam != 'list0.json'){
                $myDate = parseElement($saved, ' ', 1);
                $myTime = parseElement($saved, ' ', 2);
                array_push($myListTitles, $title);
                array_push($myListFlName, $flnam);
                array_push($myListSvTime, mktime(parseElement($myTime, ':', 1), parseElement($myTime, ':', 2), parseElement(parseElement($myTime, ':', 3), '.', 1), parseElement($myDate, '/', 1), parseElement($myDate, '/', 2), parseElement($myDate, '/', 3)));
            }
        }
    }
    
    //Sort by Most Recent Saved
    array_multisort($myListSvTime, SORT_DESC, $myListTitles, $myListFlName);
    
    //Output Data
    echo '{"Lists":[';
    $numItems = count($myListTitles);
    for($i=0;$i<$numItems;$i++){
        if($i>0) echo ',';
        echo '{"Title":"' . $myListTitles[$i] . '","Saved":"' . date('m/d/Y g:i:s A', $myListSvTime[$i]) . '","Filename":"' . $myListFlName[$i] . '"}';
    }
    echo ']}';
    
    die();

function parseElement($myString, $delim, $itmCount){
    $elements = explode($delim, $myString, ($itmCount + 1));
    $retVal = $elements[($itmCount-1)];
    if(is_numeric($retVal)) return intval($retVal);
    else return $retVal;
}

function isValidFileType($fileName, $fileType, $filePreface){
    $retVal = false;
    $lenPref = strlen($filePreface);
    
    $info = new SplFileInfo($fileName);
    if($info->getExtension() == $fileType){
        $fileBase = $info->getBasename('.' . $fileType);
        if(substr($fileBase, 0, $lenPref) == $filePreface){
            $retVal = true;
        }
    }
    return $retVal;
}
?>