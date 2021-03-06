/*	Global settings
 *  
 *  Global variables that dictate environment & global object types
 *
 */
console.log('NEW APP HERE');
var APP_SETTINGS = {
    //EXAMPLE - https://platform-demo.gtnexus.com
    host : 'https://commerce-supportq.qa.gtnexus.com' ,                                      //ENTER GTNEXUS SERVER URL HERE
    //EXAMPLE b8b9d6e519319c4337be5d8d39866d1974c13909
    softwareProviderDataKey : 'b8b9d6e559319c4887be5d8d39866d1974c139ef',                   //ADD ORG SPECIFIC DATAKEY HERE
    //EXAMPLE $TASKS1
    taskObjectType : '$TaskS1' ,                           //ADD TASK GLOBAL IDENTIFIER HERE
    //EXAMPLE $LISTS1
    listObjectType : '$ListS1' ,                           //ADD LIST GLOBAL IDENTIFER HERE
    //EXAMPLE $CurrentUserS1
    currentUserObjectType : '$CurrentUserS1'                      //ADD CURRENT USER GLOBAL IDENTIFER HERE
};

//Default api version - change if you are not using 310
//App is untested for any other api version than 310
var API_VERSION = '310';
//Append API WebService endpoint to url
APP_SETTINGS.host += "/rest/" + API_VERSION + "/";



function initSettings(){
	//Buyer Side
	if(PARTY_ROLE == "buyer")
		setBuyerSettings();
	//Seller Side
	else
		setSellerSettings();
}

/*
 * Sets specific seller display settings
 */
function setSellerSettings(){
	$('#tasklist a[name="backbtn"]').hide();
	$('#beforeAddPg').hide();
	setLogoutPopup();
	$('.actionMsg').text('');
	$.mobile.changePage("#tasklist", { transition: "pop" });
}
/*
 * Sets specific buyer display settings
 */
function setBuyerSettings(){
	setLogoutPopup();
	$('#tasklist a[name="backbtn"]').show();
	$('#beforeAddPg').show();
	$('.actionMsg').text('');
	requireRESTfulService = true;
	$.mobile.changePage("#home", { transition: "pop" });
}
/*
 * Sets up a logout popup screen that will display when the
 * menu button is pressed. Logout screen also shows specific
 * information pertaining to the user of the app
 */
function setLogoutPopup(){
	$('.logoutpopup').children('h4, h5').empty();
	var $alpha = $('<h4> ' + localStorage.getItem('orgName') + ' </h4>');
	var $beta = $('<h5> ' + localStorage.getItem('userId') + ' </h5> ');
	var $gamma = $('<h5> Role : ' + localStorage.getItem('partyRole') + ' </h5>');
	$('.logoutpopup').prepend($gamma);
	$('.logoutpopup').prepend($beta);
	$('.logoutpopup').prepend($alpha);
}
