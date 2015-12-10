/**
 * Created by areynolds on 6/2/2014.
 */
/*
 * Makes a RESTful service call to create a new list on the GTNexus
 * platform. Title is extracted from user enter textfield
 */
function initList(){
    restAPI.addList( backToHome, 'Creating List...');
}
/*
 * Sends the mobile page back to the apps homepage and
 * indicates that said page needs to be updated
 */
function backToHome(response){
	if ( response.status == 200 || response.status == 201 ||
		response.status == 202 ){
		requireRESTfulService = true;
		action = 'List added!';
	}
	else
		ajaxResponseErrorHandle(response.status);
	//alert( response.status );
    customHideLoading();
    $.mobile.changePage("#home");
}

function createListSuccess(response){
    //Do on successful creation of list
}