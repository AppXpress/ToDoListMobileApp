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
restServiceURL['SUPPORTQ'] = "http://commerce-supportq.qa.gtnexus.com/rest/310";

var softwareProviderDataKey = "ecc1b12ce5f5e2aa173648a03d7aa4607d52e847";

var applicationHostName = "QA2";

var taskGlobalType = "$TaskQ3";

var currentUserGlobalType = "$CurrentUserQ1";

var listGlobalType = "$TodoListQ1";

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
