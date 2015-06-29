/**
 * Created by areynolds on 6/2/2014.
 */
/*
 * Makes a RESTful service call to create a new list on the GTNexus
 * platform. Title is extracted from user enter textfield
 */
function initList(){
    /*
    try{
        var title = $('#listTitle').val().trim();
        customShowLoading('Create list...');
        var url = listGlobalType + "/?dataKey=" + softwareProviderDataKey;
        url += "&action=create";
        var rawData = {
            "type" : listGlobalType ,
            "title" : title ,
			//List must have a licensee field, in this case the field buyer is
			//tied to the current org. The current org is populated because the current
			//orgs member Id is stored in orgMemberId on entry into the app
			"buyer" : { 
				"memberId" : orgMemberId 
			}
        };
        //Converts the javascript array to JSON format
        var jsonStr = JSON.stringify(rawData);
        ajaxConnectPost(applicationHostName, url, jsonStr, true, 'json', createListSuccess,
            backToHome, setHeader, connectionError);

    }catch(e){
        alertPopup(e);
    }
    */
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