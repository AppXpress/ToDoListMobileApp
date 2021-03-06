/**
 * Created by areynolds on 6/10/2014.
 */

/*
 * Object that will have functions to simplify the majority
 * of the rest calls for the application
 */
var AppXpress = function() {

    //Initialize global identifiers of custom objects for REST API calls
    this.softwareProviderDataKey = APP_SETTINGS.softwareProviderDataKey;
    this.taskGID = APP_SETTINGS.taskObjectType;
    this.currentUserGID = APP_SETTINGS.currentUserObjectType;
    this.listGID = APP_SETTINGS.listObjectType;
    /*
        Ensures the user can successfully log onto the GTN system
     */
    this.logIn = function(successFn, callbackFn){
        try{
            var urlParam = "?dataKey=" + this.softwareProviderDataKey;
            ajaxConnect(urlParam, 'GET', true, 'json', successFn,
                callbackFn, setHeader, function(){});
        }
        catch(e){
            alertPopup(e);
        }
    }


	/*
	 * Makes a rest call the gets a specific task custom object
	 * based on its unique UID. A tasks UID is stored in data associated
	 * with the html body
	 */
    this.getTaskByUid = function(success, complete, msg) {
        try{
            var url = this.taskGID + "/?dataKey=" + this.softwareProviderDataKey;
            url += "&id=" + $('body').data("taskuid");
            customShowLoading(msg);
            console.log(url);
            ajaxConnect(url, 'GET', true, 'json', success,
                complete, setHeader, connectionError);
        }catch(e){
            alertPopup(e);
        }
    };
    /*
     * Makes a rest call to create a new task and specifying certain fields
     * of the custom object according to user enter values
     */
    this.addTask = function( success, complete, title, descr, assignee, anchor ){
    	try{
        	var newTask = {
            	"type" : this.taskGID ,
            	"title": title,
            	"description": descr ,
            	"listuid" : $('body').data('listuid') ,
            	"assignee": assignee ,
                "anchor": {
                    "type": "OrderDetail",
                    "transactionId": anchor
                }
        	};
        	var url = this.taskGID + "/?dataKey=" + this.softwareProviderDataKey;
        	url += "&action=create";

	        var jsonStr = JSON.stringify(newTask);
    	    customShowLoading("Adding task...");
        	ajaxConnectPost(url, jsonStr, true, 'json', success,
            	complete, setHeader, connectionError);
	    }catch(e){
     	   alertPopup(e);
    	}    	
    };
    this.addList = function( success, loadmsg ){
        try{
            var title = $('#listTitle').val().trim();
            customShowLoading(loadmsg);
            var url = this.listGID + "/?dataKey=" + this.softwareProviderDataKey;
            var rawData = {
                "type" : this.listGID ,
                "title" : title ,
                "active" : "true" ,
                //List must have a licensee field, in this case the field buyer is
                //tied to the current org. The current org is populated because the current
                //orgs member Id is stored in orgMemberId on entry into the app
                "buyer" : {
                    "memberId" : orgMemberId
                }
            };
            //Converts the javascript array to JSON format
            var jsonStr = JSON.stringify(rawData);
            ajaxConnectPost( url, jsonStr, true, 'json', function(){},
                success, setHeader, connectionError);

        }catch(e){
            alertPopup(e);
        }
    }

    this.getListByUid = function(listuid) {};
	/*
	 * Makes rest call that retrieves all of the lists associated
	 * with the organization using the app
	 */
    this.getLists = function(success,complete){
    	try{
        	var url = this.listGID + "/?dataKey=" + this.softwareProviderDataKey;
        	//url += "&oql=" + encodeURIComponent('active="true"');
            url += "&oql=" + encodeURIComponent('1=1');
        	customShowLoading("Fetching user information...");
        	console.log(url);
        	ajaxConnect( url, 'GET', true, 'json', success,
           		complete, setHeader, connectionError);
    	}catch(e){
        	alertPopup(e);
    	}
    };
	/*
	 * Makes a rest call that gets all of the tasks associated with
	 * a specific list. List is specific by its unique UID
	 */
    this.getTasksInList = function(success, complete, loadmsg){
        try{
            var url = this.taskGID + "/?dataKey=" + this.softwareProviderDataKey;
            var oql = "listuid="+ $('body').data("listuid");
            oql = encodeURIComponent(oql);
            url += "&oql=" + oql;
            customShowLoading(loadmsg);
            console.log(url);
            ajaxConnect( url, 'GET', true, 'json', success,
                complete, setHeader, connectionError);
            customHideLoading();

        }catch(e){
            alertPopup(e);
        }
    };
	/*
	 * Makes a rest call that updates a task custom object based
	 * on the passed in json held in the parameter jsonStr. The rest call
	 * updates the object successfully because it identifies the objects
	 * fingerprint and adds it to the eTag body data which is later used
	 * to set the If-Match URL header
	 */
    this.updateTask = function(success, complete, jsonStr, loadMsg){
        var url = this.taskGID + "/" + $('body').data('taskuid') + "/?dataKey=" + this.softwareProviderDataKey;
        $('body').data("eTag", "\""+jsonStr.fingerprint+"\"");
        var j = JSON.stringify(jsonStr);
        customShowLoading(loadMsg);
        console.log("URL " + url);
        console.log( j );
        ajaxConnectPost(url, j, true, 'json', success,
            complete, setHeader, connectionError);

    };

    this.updateList = function(){};
	/*
	 * Makes a rest call to retrieve the entire GTNexus community that
	 * is available to the user organization of the app
	 */
    this.getCommunity = function(success,complete,loadMsg) {
        var url = "party/list?dataKey=" + this.softwareProviderDataKey;
        customShowLoading(loadMsg);
        ajaxConnect(url, 'Get',true,'json', success,
        complete, setHeader, connectionError);
    };
	/*
	 * Makes a rest call to transition a specific task custom object
	 * to a specific state. The state is specified by the action parameter
	 */
    this.transitionTask = function(success,complete, jsonResp , action) {
        var url = this.taskGID + "/" + $('body').data('taskuid') + "/transition/";
        url += "wf_" + action;
        url += "/?dataKey=" + this.softwareProviderDataKey;
        var eTag = jsonResp.fingerprint;
        $('body').data('eTag', "\"" + eTag + "\"");
        jsonResp = JSON.stringify(jsonResp);
        console.log('url ' + url);
        ajaxConnectPost(url, jsonResp, true, 'json', success,
            complete, setHeader, connectionError);

        customHideLoading();
    };
	/*
	 * Makes a rest call on tasks based on an OQL command. The OQL command
	 * is specified by what the user enters into textfields. The OQL command
	 * is set to equal oql in the URL parameter and is encoded via the javascript
	 * function encodeURIComponent
	 */
    this.getTasksBySearch = function(success,complete){
        try{
            var url = this.taskGID + "/?dataKey=" + this.softwareProviderDataKey;

            var oql = '';
            if( $('#searchTaskName').val() != ''){

                var tQuery = 'title contains "' + $('#searchTaskName').val() + '"';
                oql += tQuery;
            }
            if( $('#searchTaskAssignee').val() != ''){
                if(oql.length > 1){
                    oql += ' and ';
                }
                var taQuery = 'assignee.name contains"' + $('#searchTaskAssignee').val() + '"';
                oql += taQuery;
            }
            if( $('#searchState').val() != ''){
                alertPopup( "it is : " + $('#searchState').val() );
                alertPopup('in here');
                if(oql.length > 4){
                    oql += ' and ';
                }
                var sQuery = 'state="' + $('#searchState').val() + '"';
                oql+= sQuery;

            }
            oql = encodeURIComponent(oql);
            url += "&oql=" + oql;

            customShowLoading("Fetching tasks...");
            console.log(url);
            ajaxConnect(url, 'GET', true, 'json', success,
                complete, setHeader, connectionError);
            customHideLoading();

        }catch(e){
            alertPopup(e);
        }
    };

	/*
	 * Makes a rest call based on an OQL command specified by the
	 * oqlStr parameter
	 */
    this.getOrgInformation = function(oqlStr , success, complete ){
        try {
            var url = this.currentUserGID + "/?dataKey=" + this.softwareProviderDataKey;
            var oql = encodeURIComponent(oqlStr);
            url += "&oql=" + oql;
            customShowLoading('Init App');
            ajaxConnect(url, 'GET', true, 'json', success,
                complete, setHeader, connectionError);
            customHideLoading();
        }catch(e){
            alertPopup(e);
        }
    };
    /*
     * Makes a rest call to create a Current User customer object
     * on the GTNexus platform. This custom object holds information
     * about the apps user to be later used by the application. It is
     * a workaround because there is no way in which to directly make
     * a rest call to get information on the current user
     */
    this.createCurrentUser = function( complete ){
        try {
            var url = this.currentUserGID + "/?dataKey=" + this.softwareProviderDataKey;
            url += "&action=create";
            customShowLoading('Init App');
            var jsonStr = {
                "type" : "$CurrentUserQ1"
            };
            jsonStr = JSON.stringify(jsonStr);
            ajaxConnectPost(url, jsonStr, true, 'json', function(){},
                complete, setHeader, connectionError);
            customHideLoading();
        }catch(e){
            alertPopup(e);
        }
    };
    /*
     * Makes a rest call to get all of the tasks associated with the 
     * apps user
     */
    this.getSellerTasks = function( success, complete, loadmsg){
    	try{
            var url = this.taskGID + "/?dataKey=" + this.softwareProviderDataKey;
            var oqlStr = "1=1";
            oqlStr = encodeURIComponent(oqlStr);
            url += "&oql=" + oqlStr;
            customShowLoading(loadmsg);
            console.log(url);
            ajaxConnect(url, 'GET', true, 'json', success,
                complete, setHeader, connectionError);
            customHideLoading();

        }catch(e){
            alertPopup(e);
        }
    };

    this.getSelf = function( success, complete, loadmsg){
        try {
            var url = "User/self/?dataKey=" + this.softwareProviderDataKey;
            customShowLoading(loadmsg);
            ajaxConnect( url, 'GET', true, 'json', success,
                complete, setHeader, connectionError);
            customHideLoading();
        }catch(e){
            alertPopup(e);
        }
    }
    this.getLastOrders = function( success, complete, loadmsg, days) {
        try {
            var url = "OrderDetail/?dataKey=" + this.softwareProviderDataKey;
            var oqlStr = "OrderTerms.orderDate.Issue IN @(Last "+days+" days)";
            oqlStr = encodeURIComponent(oqlStr);
            url += "&oql=" + oqlStr;
            customShowLoading(loadmsg);
            console.log(url);
            ajaxConnect(url, 'GET', true, 'json', success,
                complete, setHeader, connectionError);
            customHideLoading();
        }
        catch (e) {
            alertPopup(e);
        }
    }
};


/*
 * Initializes an empty object that can be continuously called
 * to perform the majority of the restful services for the app
 */
var restAPI = new AppXpress();