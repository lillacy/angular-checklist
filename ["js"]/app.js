var app = angular.module('ChecklistApp', ['ngAnimate']);
app.controller('listCtrl', function($http, $timeout) {
		
	var checklist = this;
	checklist.items = [];
	checklist.loading = true;
	checklist.menuOpen = false;
    checklist.editListTitle = false;
    checklist.modalType = "none";
	
	checklist.loadingComplete = function(){
	    $timeout(function () {
        	checklist.loading = false;
	    }, 1500);
    };
    
	checklist.openFile = function(file){
		$http({
	        method : "POST",
            url : 'getlistcontents.php',
	        data : "lists/" + file
	    }).then(function mySucces(response) {
	        checklist.items = response.data;
	        checklist.loadingComplete();
	    }, function myError(response) {
		    checklist.loadingComplete();
	        checklist.error = response.statusText;
	        checklist.errorMessage("Checklist File Error: " + checklist.error);
	    });
    };
    
    checklist.errorMessage = function(message){
        checklist.openModal(message, null);
    };
    
    checklist.getPriorityClass = function(priority){
	    switch(priority){
		    case "High":
			    return "p-high";
			    break;
		    case "Medium":
			    return "p-med";
			    break;
		    case "Low":
			    return "p-low";
			    break;
	    }
    };
    
    checklist.editTitleClicked = function(){
	    checklist.editListTitle = true;
    };
    
    checklist.editTitleSave = function(){
	    if(!checklist.titleText == '' && checklist.titleText.length > 4){
		    checklist.items.attr.title = checklist.titleText;
		    checklist.titleText = '';
		    checklist.editListTitle = false;
            checklist.saveCurrentList();
	    } else {
		    checklist.errorMessage("Title must be at least 5 characters long.");
	    }
	    
    };
    
    checklist.editTitleCancel = function(){
	    checklist.editListTitle = false;
    };
    
    checklist.menuBtnClicked = function(menuOpenSts){
        checklist.menuOpen = !menuOpenSts;
        if(!menuOpenSts){
            checklist.openRecentFiles();
        }
    };
    
    checklist.openRecentFiles = function(){
        $http({
            method : "GET",
            url    : "scanlists.php"
        }).then(function (response){
            checklist.recent = response.data;
        });
    };
    
    checklist.openSavedFile = function(file){
	    checklist.loading = true;
        checklist.openFile(file);
        checklist.menuOpen = !checklist.menuOpen;
    };
    
    checklist.createNewList = function(){
	    checklist.loading = true;
        checklist.openFile('list0.json');
        checklist.menuOpen = !checklist.menuOpen;
    };
    
    checklist.saveCurrentList = function(){
        //Copy current items
        var myCurList = checklist.items;
        
        //Get current date and time
        var d = new Date();
        var lSaved = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
        lSaved += ' ' + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
        
        //Update save date and time
        myCurList.attr.saved = lSaved;
        $http.post('savelist.php', myCurList).then(function (response) {
            myResp = response.data;
            if(myResp.substring(0,8) == 'Success!'){
                var fileSaveName = myResp.substring(1+myResp.lastIndexOf(" "));
                checklist.items.attr.filename = fileSaveName;
            } else alert(myResp);
        });
    };
    
    checklist.checkboxClicked = function(){
        $timeout(function () {
        	checklist.saveCurrentList();
	    }, 500);
    };
    
    checklist.trashClicked = function(flname, fltitle){
        if(flname != 'list0.json'){
            var flinfo = [flname, fltitle];
            checklist.openModal('deleteList', flinfo);
        }
    };
    
    checklist.openReorder = function(){
        checklist.reorderList = [];
        for(i=0;i<checklist.items.records.length;i++){
            checklist.reorderList.push(checklist.items.records[i]);
        }
        jQuery('.large-modal').modal('show');
    };
    
    checklist.editOrder = function(type, index){
        switch(type){
            case 'itemUp':
                if(index > 0){
                    var temp = checklist.reorderList[index];
                    checklist.reorderList[index] = checklist.reorderList[(index - 1)];
                    checklist.reorderList[(index - 1)] = temp;
                }
                break;
            case 'itemDown':
                if(index < (checklist.reorderList.length - 1)){
                    var temp = checklist.reorderList[index];
                    checklist.reorderList[index] = checklist.reorderList[(index + 1)];
                    checklist.reorderList[(index + 1)] = temp;
                }
                break;
        }
    };
    
    checklist.saveReorder = function(){
        checklist.items.records = [];
        for(i=0;i<checklist.reorderList.length;i++){
            checklist.reorderList[i].Order = (i + 1);
            checklist.items.records.push(checklist.reorderList[i]);
        }
        checklist.saveCurrentList();
        jQuery('.large-modal').modal('hide');
    };
    
    checklist.openModal = function(type, index){
        switch(type){
            case 'add':
                checklist.modalType = 'edit';
                checklist.modalItem = '';
                checklist.modalDue = new Date();
                checklist.modalPriority = 'Medium';
                checklist.modalIndex = index;
                break;
            case 'edit':
                checklist.modalType = 'edit';
                var item = checklist.items.records[index];
                checklist.modalItem = item.Task;
                if(item.Due != null) {checklist.modalDue = new Date(item.Due);}
                else {checklist.modalDue = item.Due;}
                checklist.modalPriority = item.Priority;
                checklist.modalIndex = index;
                break;
            case 'deleteItem':
                checklist.modalType = 'deleteItem';
                var item = checklist.items.records[index];
                checklist.modalDeleteItem = item.Task;
                checklist.modalDeleteIndex = index;
                break;
            case 'deleteList':
                checklist.modalType = 'deleteList';
                checklist.modalDeleteList = index[1];
                checklist.modalDeleteFile = index[0];
                break;
            case 'deleteChecked':
                checklist.modalType = 'deleteChecked';
                var checkedItems = [];
                for(i=0;i<checklist.items.records.length;i++){
                    if(checklist.items.records[i].Done) checkedItems.push(i);
                }
                checklist.modalCheckedFiles = checkedItems;
                checklist.modalCompletedCount = checkedItems.length;
                break;
            default:
                checklist.modalType = 'message';
                checklist.modalAlertMessage = type;
        }
        jQuery('.small-modal').modal('show');
    };
    
    checklist.saveItem = function(){
        if(!checklist.modalItem == ''){
            if(checklist.modalIndex == null){
                //Add
                var item = {"Order":null,"Task":null,"Due":null,"Priority":null,"Done":false};
                item.Order = checklist.items.records.length + 1;
                item.Task = checklist.modalItem;
                if(checklist.modalDue != null) {item.Due = (checklist.modalDue.getMonth() + 1) + '/' + checklist.modalDue.getDate() + '/' + checklist.modalDue.getFullYear();}
                item.Priority = checklist.modalPriority;
                checklist.items.records.push(item);
                checklist.saveCurrentList();
                jQuery('.small-modal').modal('hide');
            } else {
                //Edit
                checklist.items.records[checklist.modalIndex].Task = checklist.modalItem;
                if(checklist.modalDue != null) {checklist.items.records[checklist.modalIndex].Due = (checklist.modalDue.getMonth() + 1) + '/' + checklist.modalDue.getDate() + '/' + checklist.modalDue.getFullYear();}
                else {checklist.items.records[checklist.modalIndex].Due = null;}
                checklist.items.records[checklist.modalIndex].Priority = checklist.modalPriority;
                checklist.saveCurrentList();
                jQuery('.small-modal').modal('hide');
            }
        } else {
            checklist.errorMessage("No item description was entered.");
        }
    };
    
    checklist.deleteItem = function(){
        checklist.items.records.splice(checklist.modalDeleteIndex, 1);
        for(i=0;i<checklist.items.records.length;i++){
            checklist.items.records[i].Order = (i + 1);
        }
        checklist.saveCurrentList();
        jQuery('.small-modal').modal('hide');
    };
    
    checklist.deleteList = function(){
        //if deleting file that is currently open, first open 'New List' template file
        if(checklist.items.attr.filename == checklist.modalDeleteFile){checklist.openFile('list0.json');}
        
        $http.post('deletelist.php', 'lists/' + checklist.modalDeleteFile).then(function (response) {
            myResp = response.data;
            if(myResp.substring(0,8) == 'Success!'){
                checklist.openRecentFiles();
            } else alert(myResp);
        });
        jQuery('.small-modal').modal('hide');
    };
    
    checklist.deleteChecked = function(){
        for(j=checklist.modalCheckedFiles.length;j>0;j--){
            i = checklist.modalCheckedFiles[j - 1];
            checklist.items.records.splice(i, 1);
        }
        for(i=0;i<checklist.items.records.length;i++){
            checklist.items.records[i].Order = (i + 1);
        }
        checklist.saveCurrentList();
        jQuery('.small-modal').modal('hide');
    };

});

function getFormattedDate(myDate){
    if(myDate == null){
        return null;
    } else {
        var arrDate = myDate.split('/');
        var retDate = new Date(arrDate[2] + '-' + arrDate[1] + '-' + arrDate[0]);
        return retDate;
    }
}
