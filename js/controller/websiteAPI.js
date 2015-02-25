var WebsiteAPI = function(){

    var getJsonRequestURL = function (){
        return directory.httpPrefix + '://' + directory.hostName + ':' + directory.httpPort + '/Json';
    };

    var addAuth = function(object){
        object['authToken'] = directory.loggedUser.sessionToken;
        return object;
    };

    var toParam = function(data){
        var delimiter = "&";

        var response = "";

        for (var key in data){
            var value = data[key];

            if (response != "")
                response += delimiter;

            response += key + "=" + value;
        }

        return response;
    };

    this.jsonLogin = function(serverHost, serverPort, username, password, savePassword){

        console.log('jsonLogin > ' + serverHost + ', ' + serverPort + ', ' + savePassword );

        try {
            // username / password
            var queryParams = 'username=' + username + '&password=' + password;
            var jsonCommand = getJsonRequestURL() +  '/Login?' + queryParams;

            $.ajax({
                url: jsonCommand,
                type: 'GET',
                datatype: 'json',
                success: function(data) {

                    directory.activity.startTracking();

                    if (data != undefined)
                    {
                        /*
                        $.each(data, function(index, value) {
                            console.log('Login Response [' + index + '] : ' + value);
                        });
                        */

                        if (data.IsAuthenticated == true)
                        {
                            console.log('Session Token Received : ' + data.SessionToken);

                            $.cookie('hostName', serverHost, { expires: 365 });
                            $.cookie('httpPort', serverPort, { expires: 365 });
                            $.cookie('login', username, { expires: 365 });

                            if ($('#savePassword').is(':checked')) {
                                $.cookie('password', password, { expires: 365 });
                                $.cookie('savepassword', '1', { expires: 365 });
                            } else {
                                $.removeCookie('password');
                                $.removeCookie('savepassword');
                                $('#loginPassword').val(WebUIConfig.PASSWORD);
                            }

                            directory.loggedUser.serverHost = serverHost;
                            directory.loggedUser.serverPort = serverPort;
                            directory.loggedUser.serverUsername = username;

                            var canPTZ = false;

                            if (data.Roles !== undefined) {

                                $.each(data.Roles, function (index, value) {

                                    //console.log('Role[' + index + '] >> ' + value.Name);

                                    if ((value.Name !== undefined) && ((value.Name == "Administrator" || value.Name == "Control PTZ")))
                                    {
                                        canPTZ = true;
                                    }
                                });
                            }

                            // TODO: Check in roles
                            directory.loggedUser.ptzEnabled = canPTZ;

                            directory.loggedUser.serverQueryUrl = directory.HTTP_PREFIX + '://' + serverHost + ':' + serverPort + '/Json/';

                            if (savePassword)
                            {
                                directory.loggedUser.serverPassword = password;
                            }
                            else
                            {
                                console.log('Password not saved >> ' + savePassword);
                                directory.loggedUser.serverPassword = '';
                            }

                            directory.loggedUser.sessionToken = data.SessionToken;
                            directory.loggedUser.sessionTokenTimestamp = new Date();

                            // Automatically Get Cameras List from Server
                            directory.websiteAPI.jsonGetCameras();

                            directory.connectedUsers = new directory.ConnectedUsersCollection();

                            directory.processInfo = new directory.ProcessInfo();
                            directory.serviceStatus = new directory.ServiceStatus();

                            directory.eventLogs = new directory.EventLogsCollection();
                            directory.libraryItems = new directory.LibraryItemsCollection();

                            directory.timelineItems = new directory.TimelineItemsCollection();

                            // Automatically Get Users List from Server
                            //directory.websiteAPI.jsonGetConnectedUsers();

                            // Automatically Get Event Logs from Server
                            //directory.websiteAPI.jsonGetEventLogs();

                            //directory.websiteAPI.jsonGetProcessInfo();

                            //directory.websiteAPI.jsonGetServiceStatus();

                            //directory.websiteAPI.jsonGetLibraryItemsInfo();

                            // Update the ShellView as user is logged in
                            directory.shellView = new directory.ShellAuthView();

                            //$('body').html(directory.shellView.render().el);
                            $('#virtualBody').html(directory.shellView.render().el);

                            // When we update the full body, we lose the Flash Object used for audio :(

                            // Therefore, we move audio initialization in there

                            //directory.router.navigate("/", true)
                            //directory.router.navigateToSource(0);
                        }
                        else
                        {
                            var errorMsg = data.FailedLoginMessage;
                            alert('Login Failed. Reason: ' + errorMsg);
                        }
                    }
                },

                error: function(err) {
                    console.log('Login Failed: ' + err);

                    /*
                    $.each(err, function(index, value) {
                        console.log('Login Response [' + index + '] : ' + value);
                    });
                    */

                    var errMsg = '';
                    if (err.status == 0)
                    {
                        errMsg = 'Cannot connect to server';
                    }
                    else
                    {
                        errMsg = 'Error ' + err.status + ' - ' + err.statusText;
                    }

                    alert('Login Failed. Reason : ' + errMsg);

                },

                beforeSend: function(xhr) {

                    // xhr.setRequestHeader("QueryString", queryParams);

                }

            });

        } catch (err) {
            console.log('Login Exception: ' + err);
        }
    };

    this.jsonGetConnectedUsers = function() {
        directory.connectedUsers.url = getJsonRequestURL() + "/GetConnectedUsers?authToken=" + directory.loggedUser.sessionToken;

        console.log('directory.connectedUsers.url >> ' + directory.connectedUsers.url);

        directory.connectedUsers.fetch();

    };

    this.jsonGetProcessInfo = function() {
        directory.processInfo.url = getJsonRequestURL() + "/GetProcessInfo?authToken=" + directory.loggedUser.sessionToken;

        console.log('directory.processInfo.url >> ' + directory.processInfo.url);

        directory.processInfo.fetch();
    };

    this.jsonGetServiceStatus = function() {
        directory.serviceStatus.url = getJsonRequestURL() + "/GetServiceStatus?authToken=" + directory.loggedUser.sessionToken;

        console.log('directory.serviceStatus.url >> ' + directory.serviceStatus.url);

        directory.serviceStatus.fetch();
    };

    this.jsonGetEventLogs = function() {
        directory.eventLogs.url = getJsonRequestURL() + "/GetEventLogs?numRecords=" + NetcamAPIVars.EVENT_LOGS_ROW_NUMBER
            + "&minCrit=" + NetcamAPIVars.EVENT_LOGS_MIN_CRIT +"&authToken=" + directory.loggedUser.sessionToken;

        console.log('directory.eventLogs.url >> ' + directory.eventLogs.url);

        directory.eventLogs.fetch();
    };

    this.jsonGetTimelineItems = function() {
        directory.timelineItems.url = getJsonRequestURL() + "/GetTimelineForPeriod?numRecords=9999"
        + "&sourceId=" + NetcamAPIVars.LIBRARY_SOURCE_ID + "&startDate=" + NetcamAPIVars.Yesterday.getTime()
        + "&endDate=" + NetcamAPIVars.Tomorrow.getTime()
        + "&authToken=" + directory.loggedUser.sessionToken;

        console.log('directory.timelineItems.url >> ' + directory.timelineItems.url);

        directory.timelineItems.fetch();
    };

    this.jsonGetLibraryItems = function() {
        directory.libraryItems.url = getJsonRequestURL() + "/GetItemsForPeriod?numRecords=9999"
            + "&sourceId=" + NetcamAPIVars.LIBRARY_SOURCE_ID + "&startDate=" + NetcamAPIVars.libraryStartDate.getTime()
            + "&endDate=" + NetcamAPIVars.libraryEndDate.getTime()
            + "&authToken=" + directory.loggedUser.sessionToken;

        console.log('directory.libraryItems.url >> ' + directory.libraryItems.url);
        console.log(NetcamAPIVars.libraryStartDate);

        directory.libraryItems.fetch();
    };

    this.jsonGetLibraryItemsInfo = function() {
        try {
            // username / password
            var jsonCommand = getJsonRequestURL() + "/GetItemInfoForPeriod?sourceId=" + NetcamAPIVars.LIBRARY_SOURCE_ID
                + "&startDate=" + NetcamAPIVars.libraryStartDate.getTime()
                + "&endDate=" + NetcamAPIVars.libraryEndDate.getTime()
                + "&authToken=" + directory.loggedUser.sessionToken;

            console.log('GetLibraryItemsInfo >> ' + jsonCommand);

            var self = this;

            $.ajax({
                url: jsonCommand,
                type: 'GET',
                datatype: 'json',
                success: function(data) {
                    NetcamAPIVars.LIBRARY_RECORDS_NUMBER = data.NumRecords;
                    self.jsonGetLibraryItems();
                },

                error: function(err) {
                    console.log('GetLibraryItemsInfo Failed: ' + err);

                    $.each(err, function(index, value) {
                        console.log('GetLibraryItemsInfo Response [' + index + '] : ' + value);
                    });

                }

            });

        } catch (err) {
            console.log('Get Library Items Info Exception: ' + err);
        }
    };

    this.jsonStartStopRecording = function(id, enabled) {

        var enableStr = enabled ? "true" :"false";
        try {
            // username / password
            var jsonCommand = getJsonRequestURL() + "/StartStopRecording?enabled=" + enableStr + "&sourceId=" + id
                + "&authToken=" + directory.loggedUser.sessionToken;

            console.log('StartStopRecording >> ' + jsonCommand);

            var self = this;

            $.ajax({
                url: jsonCommand,
                type: 'GET',
                datatype: 'json',
                success: function(data) {

                },

                error: function(err) {
                    console.log('StartStopRecording Failed: ' + err);

                    $.each(err, function(index, value) {
                        console.log('StartStopRecording Response [' + index + '] : ' + value);
                    });

                }

            });

        } catch (err) {
            console.log('Get StartStopRecording Exception: ' + err);
        }
    };

    this.jsonGetCameras = function(){
        directory.cameras = new directory.CameraCollection();
        directory.cameras.url = getJsonRequestURL() + "/GetCameras?authToken=" + directory.loggedUser.sessionToken;

        console.log('directory.cameras.url >> ' + directory.cameras.url);

        directory.cameras.fetch();
    };

    this.PtzCommand = {
        Left: 'Left',
        Right: 'Right',
        Up: 'Up',
        Down: 'Down',
        ZoomIn: 'ZoomIn',
        ZoomOut: 'ZoomOut'
    };

    this.SendPTZCommandJson = function (cameraId, cameraCommand){

        var commandUrl = getJsonRequestURL() + "/SendPTZCommandJson"

        var data = {
            sourceId: cameraId,
            command: cameraCommand,
            x: 0,
            y: 0
        };

        addAuth(data);

        var params = toParam(data);

        try{
            $.ajax({
                url: commandUrl,
                type: 'GET',
                datatype: 'json',
                data: params,
                success: function(data) {

                },
                error: function (error){

                }
            });
        }
        catch (error){

        }
    };

};
