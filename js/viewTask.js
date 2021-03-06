/**
 * Created by areynolds on 6/13/2014.
 */
var action = null;
var currentTask;
/*
 * Displays a task. For the task to be displayed, a rest call is made
 * to fetch a specific $TaskQ3 from the GTNexus platform. Import to note
 * that what specifices a specific $TaskQ3 is its UID, which is being
 * stored with data that is associated with the html body
 */
function showTask(){
    try{
        var url = APP_SETTINGS.taskObjectType + "/?dataKey=" + APP_SETTINGS.softwareProviderDataKey;
        console.log("click list uid " + $('body').data("listuid"));

        //Get uid of task clicked on
        url += "&id=" + $('body').data("taskuid");
        customShowLoading("Fetching task...");
        console.log(url);
        ajaxConnect(url, 'GET', true, 'json', fetchListSuccess,
            displayTask, setHeader, connectionError);
    }catch(e){
        alertPopup(e);
    }
}

/*
 * On completed retrieval of a $TaskS1 object, its data is
 * utilized to correctly display it. For example, the tasks
 * title and description are pulled from the returned JSON
 * and displayed in the corrct html elements. 
 */
function displayTask(response){
    if( response.status == 200 || response.status == 201 ||
        response.status == 202 ){

        emptyTaskScreen();
        //Get the response JSON
        var req = JSON.stringify(response.responseJSON);
        //Parse the JSON into a javascript associative array
        currentTask = JSON.parse(req);
        
        $('#editable input').val( currentTask.title);
        $('#editable textarea').val( currentTask.description);
        $('#addnotes').val( currentTask.notes);
        showDefined();
        
        /*Different Types of Tasks - 
         * 		Buyer Side - Completed, Incompleted
         * 		Seller Side - Completed, Incompleted
         */
        console.log(currentTask);
        
        if( PARTY_ROLE == "buyer" ){
        	var assignTxt;
        	if(currentTask.state == "unassigned") {
            	assignTxt = $('<a href="#popupAssign" data-rel="popup"> Assign Task </a>');
            	if(!community)
                	restAPI.getCommunity(function(){} , initAssignPopup, "Locating community...");
            	else
                	initAssignPopup();
        	}
                //else if( currentTask.boolUnassigned == "true" && currentTask.state == "completed" ){
            //    assignTxt = $('<h3> Task was never assigned </h3>');
           // }
       		else
            	assignTxt = $('<h3> Task Assigned to : ' + currentTask.assignee.name + '</h3>');
            $("#showIndivTask").append(assignTxt);
        	//Buyer Complete
        	if( currentTask.state == "completed" ){
        		setBuyerCompleteTask();
        		$('#topeditbtn').text('').hide();
        		$('.display20').hide();
        		appendCompleteTimeStamp( currentTask.__metadata.modifyTimestamp );
        	}
        	//Buyer incomplete
        	else{
        		$('#editbtn').text('Save Changes');
        		$('.display20').show();
        		setBuyerIncompleteTask();
        		$('#topeditbtn').text('Edit').show();
        	}
        	
        }
        else{
        	$('.display20').hide();
        	$('#topeditbtn').text('').hide();
        	//Seller complete
        	if( currentTask.state == "completed"){
        		setSellerCompleteTask();
        		appendCompleteTimeStamp( currentTask.__metadata.modifyTimestamp );
        	}
        	//Seller incomplete
        	else{
        		setSellerIncompleteTask();
        	}
        }   
 
        $('#completeStatus').checkboxradio('refresh');
    }
    else{
        ajaxResponseErrorHandle(response.status);
    }
    customHideLoading();
}
/*
 * Called every time a new task is displayed. Clears out data
 * in certain html elements so they can be filled with the correct
 * data of the new task to be displayed
 */
function emptyTaskScreen(){
    $('#showIndivTask').children('p, h1, a, h3, h4').empty();
    $('#addnotes').empty();
}
/*
 * Sets the DOM to be displayed as a buyer task that has
 * been completed
 */
function setBuyerCompleteTask(){
	$('.display20').hide();
    $('#noteCollapsible').hide();
    $("#completeStatus").prop("value", "complete");
    $("#completeStatus").prop("checked", true);
    $("#completelbl").text("Reopen Task");
}
/*
 * Sets the DOM to be displayed as a buyer task that has
 * not yet been completed. Sets different variations depending
 * on which workflow state the task currently is in
 */
function setBuyerIncompleteTask( ){
    var state = currentTask.state;
	if( state == "tasked"){
			console.log('tasked');
    	    $("#taskbtn").addClass('ui-disabled');
        	$("#taskbtn").text("Tasked");
    } else if( state == "assigned"){
    		console.log('assigned');
        	$("#taskbtn").text("Task it");
        	$('#taskbtn').removeClass('ui-disabled');
    //task must be completed or unassigned
    } else {
        	console.log('in here');
        	$('.display20').hide();
        	$('#noteCollapsible').hide();
    }
    $('.taskBusiness').show();
    $("#completeStatus").prop("value", "open");
    $("#completelbl").text("Complete Task");
    $("#completeStatus").prop('checked', false);
}
/*
 * Sets the DOM to show a completed task from the
 * seller side
 */
function setSellerCompleteTask(){
	$('.taskBusiness').hide();
    $('#noteCollapsible').hide();
}
/*
 * Sets the DOM to show an incomplete task from the
 * seller side
 */
function setSellerIncompleteTask(){
	$('.taskBusiness').show();
    $("#completeStatus").prop("value", "open");
    $("#completelbl").text("Complete Task");
    $("#completeStatus").prop('checked', false);
}
/*
 * Makes a rest call to either transition the task towards
 * complete state or to reopen the task back towards an
 * assigned state
 */
function taskComplete(){
    var msg;
    if( currentTask.state == "unassigned" ){
        alert("Cannot complete; no assignee");
        $("#completeStatus").prop('checked', false);
        customHideLoading();
        return;
    }

    if( currentTask.state == "completed")
        msg = "Re opening task";
    else if( currentTask.state == "tasked " || currentTask.state == "assigned")
        msg = "Moving Task to History...";

    changeTask( currentTask , msg );
}

/*
 * Makes the rest call to notify the server that the
 * task has changed states. 
 */
function changeTask(task , msg ){
    try{
        var set = $('#completeStatus').val();
        console.log( "rtn Complete " + task.state );
        //If complete, transition to completed. If incomplete, transition to assigned
        if( set == "open")
            restAPI.updateTask(callSuccessTask, transitWorkflowComplete,task, msg);
        else
            restAPI.updateTask(callSuccessTask, transitWorkflowReopen,task, msg);

    }catch(e){
        alertPopup(e);
    }
}
/*
 * If the pop-up on the new task screen has not already been
 * loaded with the GTNexus community, does so. The community
 * is obtained with a rest call to the API
 */
var loadedAssignPopup = false;
function initAssignPopup(response){
    //Call coming from restful service
    if(response){
        var res = JSON.stringify(response.responseJSON);
        community = JSON.parse(res).result;
    }
    if( loadedAssignPopup ){
        return;
    }
    //Community now established
    for( var i = 0; i < community.length; i++) {
        var party = community[i];
        if( party.partyRoleCode != "FinalDestination" &&
            party.partyRoleCode != "DeliverTo") {
            var showString = party.partyRoleCode + " / " + party.name;
            var $listItem = $('<li> <a href="#viewTask">' + showString + '</a>');
            $listItem.attr('id', "a" + party.memberId);
            console.log('member id is : ' + party.memberId);
            $listItem.click(function () {
                updateAssignee(this.id);
            });
            $('#popupAssignList').append($listItem);
        }
    }
    loadedAssignPopup = true;
    $('#popupAssignList').listview('refresh');
    customHideLoading();
}
/*
 * Gets the UID of the party that was selected by the user
 */
function updateAssignee(memId){
    var selectedID = memId.substring(1);
    addAssignee(currentTask , selectedID);
}


/*
 * Gets the party that has been selected to be assigned
 * to the task. Then, sends a rest call to update the $TaskQ3
 * object. The specific task has now been transitioned to the
 * assigned state
 */
function addAssignee( rtrn , memberID){
    var assigneeObj;
    for (var i = 0; i < community.length; i++) {
        if (community[i].memberId == memberID) {
            assigneeObj = community[i];
        }
    }
    console.log(' obj ' + assigneeObj);
    console.log(' name ' + assigneeObj.name);
    try {
        //rtrn.boolUnassigned = "false";
        rtrn.assignee = assigneeObj;
        restAPI.updateTask(callSuccessTask, firstTransitionTask, rtrn, "Saving changes...");
    }
    catch(e){
        alertPopup(e);
    }
}
/*
 * Sets the task to the assigned state
 */
function firstTransitionTask(response){
    var res = JSON.stringify(response.responseJSON);
    var js = JSON.parse(res).data;
    var eTag = js.fingerprint;
    console.log(eTag);
    var taskUID = js.uid;
    console.log(taskUID);
    $('body').data('eTag', "\""+eTag+"\"");
    $('body').data('taskuid', taskUID);
    //Transition Task to the 2nd state - the Assigned but Uncompleted State
    restAPI.transitionTask( function() {} , completeAssignmentOfTask , js , "assign");
}
/*
 * Indicates to the program that the task has been changed and
 * the page now must be refreshed to accurately portray the changed
 * task
 */
function completeAssignmentOfTask(){
	requireRESTfulService = true;
	customHideLoading();
	refreshPage();
}
/*
 * Makes a rest call to transition a Task to the Tasked Workflow step
 */
function transitionToTasked(){
    if( currentTask.state == "unassigned")
        alertPopup("Cannot task. Need Assignee Party");
    else
        restAPI.transitionTask( function () {} , showTask , currentTask , "task");
}
/*
 * Sends a rest call to transition the task to complete
 */
function transitWorkflowComplete(response){
        var json = JSON.stringify(response.responseJSON);
        var js = JSON.parse(json).data;
        console.log(response);
        console.log(json);
        console.log('complete' + js);
        restAPI.transitionTask(function () {}, completeCallLocate, js, "complete");
}
/*
 * Sends a rest call to transition the task back to assigned
 */
function transitWorkflowReopen(response){
    if( $('#completeStatus').val() == "complete") {
        var json = JSON.stringify(response.responseJSON);
        var js = JSON.parse(json).data;
        restAPI.transitionTask(function () {}, completeCallLocate, js, "reopen");
    }
}
/*
 * Changes the page to the previous page, depending on whether
 * the previous page was history or tasklist
 */
function completeCallLocate(response){
    customHideLoading();
    if( $('#completeStatus').val() == 'complete'){
    	$('.actionMsg').text('Task ReOpened');
        $.mobile.changePage('#viewHistory');
    }
    else{
    	action = "Task Completed";
    	var activePage = $.mobile.activePage.attr('id');
    	if( activePage == "viewtask")
	        $.mobile.changePage('#tasklist');
	    else	
	    	refreshPage();
    }
}
/*
 * Shows an editable task screen
 */
function showEditable(){
	//If Seller, cannot edit the task
	if( PARTY_ROLE == "seller"){ return;}
    $('#topeditbtn').text('View');
    $('#defined').hide();
    $('#editable').show();
    $('#noteCollapsible').collapsible('expand');
    $('.viewTaskBottom').hide();
    requireRESTfulService = true;
}
/*
 * Displays a defined, non-editable task screen
 */
function showDefined(){
	$('#topeditbtn').text('Edit');
    $('#defined').show();
    $('#editable').hide();
    $('#addnotesbtn').show();
    $('.viewTaskBottom').show();
    $('#noteCollapsible').collapsible('collapse');
    $('#noteCollapsible').show();
    $('#defined h1').text( $('#editableTitle').val() );
    $('#defined p').text( $('#editableDesc').val() );
}
/*
 * Appends timestamp to task - timestamp indicates when
 * the task was transitioned to the completed workflow state
 * Then, displays the timestamp
 */
function appendCompleteTimeStamp( ts ){
	console.log('ts = ' + ts);
	var spl = ts.split('-');
	var spl2 = spl[2].split(' ');
	var composeMsg = 'Task Completed : ';
	composeMsg += getMonth(parseInt(spl[1])) + ' '+ spl2[0] + ',';
	composeMsg += spl[0];
    $("#showIndivTask").append('<h4> ' +composeMsg + '</h4>');
	
}
/*
 * Rest call to get a task
 */
function addNotes(){
    restAPI.getTaskByUid(function() {} , completeAddNotes , 'Adding notes');
}
/*
 * Rest call to update the task with the newly inputed notes
 */
function completeAddNotes(response){
    var json = JSON.stringify(response.responseJSON);
    var js = JSON.parse(json);
    js.notes = $('#addnotes').val();
    restAPI.updateTask( function() {} , customHideLoading , js, 'Saving...');
}

function listTaskCheckAction(){
    restAPI.getTaskByUid(function() {} ,function(response){
        if( response.status == 200 || response.status == 201 ||
            response.status == 202 ) {

            var getData = JSON.stringify(response.responseJSON);
            console.log("get data here : " + getData);
            currentTask = JSON.parse(getData);
            taskComplete();
        }
    }, "Getting task...");
}
