/**
 * Created by areynolds on 6/2/2014.
 */
var applicationAuthCookieName = "gtnexus-todo";
var usernameCookieName = "gtnexus-todo-username";
var passwordCookieName = "gtnexus-todo-password";
var username = null;
var password = null;
var authToken = null;
var orgMemberId = localStorage.getItem('memberId');
var PARTY_ROLE;
/*
 * Presets the username and password fields if the user
 * has the correct credentials. 
 */
$(document).on("pagebeforeshow","#login",function(){


    var credStorage = localStorage.getItem("gtnx-creds");

    if(credStorage == "on"){
        var uname = localStorage.getItem("gtnx-uname");
        var pwd = localStorage.getItem("gtnx-pwd");


        $("#username").val(uname);$("#password").val(pwd);
    }

});
/*
 * Logins into the app. Method retrieves a user enter
 * username and password and attempts to login to GTNexus
 * system. Login is done through a rest call
 */
function login() {
    username = $('#username').val().trim();
    password = $('#password').val().trim();

    if ((!username) || (!password)) {
        alertPopup("Login Attempt not valid");
        return;
    }
    //If username is changed, remove username specific data
    if( username != localStorage.getItem('gtnx-uname') ){
        localStorage.removeItem('user-known');
    }

    authToken = encodeHeader(username, password);

    //set body date authentication when cookies isnt working
    $('body').data('authenticate', authToken);

    createCookie(passwordCookieName, password);
    createCookie(applicationAuthCookieName, authToken);
    createCookie(usernameCookieName, username);
    try{
        var url = "?dataKey=" + APP_SETTINGS.softwareProviderDataKey;
        if( isNetworkAvailable() ){
        	customShowLoading("Logging in...");
        	ajaxConnect(url, 'GET', true, 'json', loginSuccess,
            	completeCallback, setHeader, function(){});
        }
        else
        	showNoConnection();
    }catch(e){
        alertPopup(e);
    }

    event.preventDefault();
    return false;

}
function connectionError(obj , str, errorThrown){
    console.log(obj);
    console.log(str);
    console.log(errorThrown);
	console.log("Connection Error");
    customHideLoading();
    alert("Error with request");
}
/*
 * On success of login rest call. Retrieved locally stored
 * about the user, or if information not available makes
 * REST API calls to get information on user
 */
function loginSuccess(response) {
    console.log('login success');
    //for testing
    localStorage.setItem("gtnx-creds","on");
    localStorage.setItem("gtnx-uname", username);
    localStorage.setItem("gtnx-pwd", password);
    if(localStorage.getItem("user-known")){
        PARTY_ROLE = localStorage.getItem('partyRole');
        initSettings();
    }
    else{
        restAPI.getSelf( function() {} , defineSelf, 'Init App');
    }
}
/*
 * On complete callback of login
 */
function completeCallback(response) {
    if (response.status == 200 || response.status == 201
        || response.status == 202) {
            //var eTag = response.getResponseHeader('Etag');
            customHideLoading();
            console.log('complete call back for login');
    }
    else {
        ajaxResponseErrorHandle(response.status);
    }
}
/**
 *  Method on completion of call to API to find users 'self'. Defines
 *  name and org variables and stores them to avoid future REST calls.
 *  Makes another rest call to determine whether 'self' is a buyer
 *  or a seller
 */
function defineSelf(response){
    if(response.status == 200 || response.status == 201 ||
        response.status == 202 ){
        var json = JSON.stringify(response.responseJSON);
        var js = JSON.parse(json);
        localStorage.setItem('orgName', js.name);
        localStorage.setItem('userId' , js.uid);
        orgMemberId = js.organizationUid;
        localStorage.setItem('memberId', orgMemberId);
        restAPI.getCommunity(function () {
        }, dictateRole, 'Init App Comm');
    }
    else{
        ajaxResponseErrorHandle(response.status);
    }
}
/*
 * Sets the user details based on fields in the Current User CO.
 * If the current org does not have an associated Current User CO, 
 * a new Current User CO is created here. If the Current User CO already
 * exists then its fields are retrieved for use in app
 */
function setUserDetails(response){
    //set orgName for app here
    console.log(response);
    if(response.status == 200 || response.status == 201 ||
        response.status == 202 ){
        var json = JSON.stringify(response.responseJSON);
        var js = JSON.parse(json);
        if(js.create != null){
            orgMemberId = js.create.result.current_party.memberId;
            var orgName = js.create.result.current_party.name;
            var orgUserId = js.create.result.current_username;
            localStorage.setItem('orgName', orgName);
            localStorage.setItem('userId' , orgUserId);
			localStorage.setItem('memberId', orgMemberId);
            restAPI.getCommunity(function () {
            }, dictateRole, 'Init App Comm');
        }
        else if(js.resultInfo.count > 0) {
            console.log(js.result[0].current_party);
            orgMemberId = js.result[0].current_party.memberId;
            var orgName = js.result[0].current_party.name;
            var orgUserId = js.result[0].current_username;
            localStorage.setItem('orgName', orgName);
            localStorage.setItem('userId' , orgUserId);
			localStorage.setItem('memberId' , orgMemberId);
            restAPI.getCommunity(function () {
            }, dictateRole, 'Init App Comm');
        }
        //If no co corresponding to this username exists, must create new one
        else{
            restAPI.createCurrentUser( setUserDetails );
        }
    }
    else{
        ajaxResponseErrorHandle(response.status);
    }
}
/*
 * Complete call back to community rest call. Method
 * tries to figure whether the org is a buyer or a seller
 * based on a party role code field that is attached to each
 * org in the GTNexus community
 */
function dictateRole(response){
    console.log('enter dictate');
    if(response.status == 200 || response.status == 201 ||
        response.status == 202 ){
        var json = JSON.stringify(response.responseJSON);
        var js = JSON.parse(json);
        community = js.result;
        for( var i = 0; i < community.length; i++){
            var party = community[i];
            if( party.memberId == orgMemberId) {
                if (party.partyRoleCode == "Buyer") {
                    PARTY_ROLE = "buyer";
                    break;
                }
                if (party.partyRoleCode == "Seller") {
                    PARTY_ROLE = "seller";
                    break;
                }
            }
        }
        localStorage.setItem('partyRole', PARTY_ROLE);
        localStorage.setItem('user-known', 'TRUE' );
        initSettings();
    }
    else{
        ajaxResponseErrorHandle(response.status);
    }
}
/*
 * Resets login screen to show blank text fields for
 * username and password 
 */
function resetLogin() {
    $("#username").val("");
    $("#password").val("");
}