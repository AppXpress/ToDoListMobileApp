/*	Global settings
 *  
 *  Global variables that dictate environment & global object types
 * 
 * 
 */
var restServiceURL = new Object();
restServiceURL["SF"] = "https://test.salesforce.com/services/oauth2/token";
restServiceURL["PROD"] = "../prod/rest/"; //"http://api.tradecard.com/rest/";
restServiceURL["CQA"] = "../cqa/rest/"; //"http://cqa.tradecard.com/rest/";
restServiceURL["SUPORT"] = "../support/rest/"; //"http://support.tradecard.com/rest/";
restServiceURL["TRAINING"] = "../training/rest/"; //"http://training.tradecard.com/rest/";
restServiceURL["QA"] = "http://commerce.qa.tradecard.com/rest/310/";
restServiceURL["QA2"] = "http://commerce.qa2.tradecard.com/rest/310/";
restServiceURL["SUPPORTQ"] = "https://commerce-supportq.qa.gtnexus.com/rest/310/";

var softwareProviderDataKey = "b8b9d6e559319c4887be5d8d39866d1974c139ef";

var applicationHostName = "SUPPORTQ";

var taskGlobalType = "$TaskS1";

var currentUserGlobalType = "$CurrentUserS1";

var listGlobalType = "$ListS1";

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
