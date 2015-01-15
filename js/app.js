var directory = {

    hostName: WebUIConfig.HOST,
    httpPort: WebUIConfig.HTTP_PORT,

    views: {},

    models: {
        /*"user" : "user"*/
    },

    isFullScreenMode: false,

    loadTemplates: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (directory[view]) {
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    directory[view].prototype.template = _.template(data);
                }, 'html'));
            } else {
                alert(view + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    },

    getJpegURL: function(cameraId){
        var uniq1 = Math.random();

        return "http://" + directory.hostName + ":" + directory.httpPort + "/jpeg/" + cameraId + "?uniq=" + uniq1 + "&authToken=" + directory.loggedUser.sessionToken;
    },

    getAudioURL: function(cameraId){
        var uniq1 = Math.random();

        return "http://" + directory.hostName + ":" + directory.httpPort + "/audio/" + cameraId + "?uniq=" + uniq1 + "&authToken=" + directory.loggedUser.sessionToken;
    },

    getMJpegURL: function(cameraId){
        var uniq1 = Math.random();

        return "http://" + directory.hostName + ":" + directory.httpPort + "/mjpeg/" + cameraId + "?uniq=" + uniq1 + "&authToken=" + directory.loggedUser.sessionToken;
    },

    getLiveURL: function(cameraId){
        return "http://" + directory.hostName + ":" + directory.httpPort + "/live/" + cameraId + "?authToken=" + directory.loggedUser.sessionToken;
    },

    getLibraryURL: function(id, itemType, isThumb) {
        var thumb = isThumb? "Thumb/" : "";
        var ext =  itemType == 1 ?  "jpg" : "mp4";
        if (isThumb) ext = "jpg";

        return "http://" + directory.hostName + ":" + directory.httpPort + "/Library/" + thumb + id +"." + ext + "?authToken=" + directory.loggedUser.sessionToken;
    },

    /*
    fetchAdminSettings: function() {
        directory.jsonGetProcessInfo();
        directory.jsonGetServiceStatus();

        //if (directory.processInfo)
        //    directory.processInfo.fetch();

        //if (directory.serviceStatus)
        //    directory.serviceStatus.fetch();

        //if (directory.processInfo)
        //    directory.processInfo.add(directory.serviceStatus.models);
    },
    */

    getFormattedDate: function(date) {
        var year = date.getFullYear();
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : '0' + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : '0' + day;
        return year + '-' + month + '-' + day;
    },

    getFullFormattedDateFromString: function(date) {
        date = date.replace('T', ' ');
        date = date.substring(0, date.indexOf('.'));

        var regexp = /(\d+)-(\d+)-(\d+) (.+)/i;
        var arr = date.match(regexp);
        var newDate = arr[3] + "/" + arr[2] + "/" + arr[1] + " " + arr[4];
        return newDate;
    }

};

// Add close() function to every views
Backbone.View.prototype.close = function(){
    this.remove();
    this.unbind();

    if (this.onClose){
        this.onClose();
    }
};

directory.Router = Backbone.Router.extend({

    routes: {
        "":                 "login",
        "about":            "about",
        "login":            "login",
        "logout":           "login",
        "contact":          "contact",
        "admin":            "admin",
        "event":            "event",
        "library":          "library",
        "library/:id":      "library",
        "source":           "source",
        "source/:id":       "source",
        "timeline":         "timeline"
    },

    initialize: function () {

        this.logout();

        // Close the search dropdown on click anywhere in the UI
        $('body').click(function () {
            $('.dropdown').removeClass("open");
        });

        this.$content = $("#content");
    },

    event: function () {
        directory.shellView.selectMenuItem('event-menu');

        directory.eventViewerView = new directory.EventViewerView({model: directory.eventLogs});

        this.showView(directory.eventViewerView);
    },

    admin: function () {
        directory.shellView.selectMenuItem('admin-menu');

        //directory.fetchAdminSettings();

        directory.administrationView = new directory.AdministrationView({model: directory.connectedUsers});

        this.showView(directory.administrationView);
    },

    library: function (id) {
        if (id != undefined) {
            NetcamAPIVars.LIBRARY_PAGE_NUMBER = id;
        }
        directory.shellView.selectMenuItem('library-menu');
        directory.libraryView = new directory.LibraryView({model: directory.libraryItems});
        this.showView(directory.libraryView);
    },

    timeline: function () {
        directory.shellView.selectMenuItem('timeline-menu');
        directory.timelineView = new directory.TimelineView({model: directory.timelineItems});
        this.showView(directory.timelineView);
    },

    about: function () {
        directory.shellView.selectMenuItem('about-menu');

        // Since the about view never changes, we instantiate it and render it only once
        if (!directory.aboutView) {
            directory.aboutView = new directory.AboutView();
        } else {
            console.log('Reusing about view');
            directory.aboutView.delegateEvents(); // delegate events when the view is recycled
        }

        this.showView(directory.aboutView);
    },

    logout: function() {
        // Create an empty User (not logged)
        directory.loggedUser = new directory.UserModel();

        // Create the Unauth version of ShellView
        directory.shellView = new directory.ShellUnauthView();

        //$('body').html(directory.shellView.render().el);
        $('#virtualBody').html(directory.shellView.render().el);

        // Clear the CameraCollection
        directory.cameras = new directory.CameraCollection();
    },

    login: function () {
        // directory.shellView.selectMenuItem('login-menu');

        // reset user info [= Logout]
        this.logout();

        // Since the login view never changes, we instantiate it and render it only once
        if (!directory.loginView) {
            directory.loginView = new directory.LoginView();
            directory.loginView.render();
        } else {
            console.log('reusing login view');
            directory.loginView.delegateEvents(); // delegate events when the view is recycled
        }
        // reload from jquery (changes after a login)
        this.$content = $("#content");
        this.$content.html(directory.loginView.el);
    },

    contact: function () {
        directory.shellView.selectMenuItem('contact-menu');

        if (!directory.contactView) {
            directory.contactView = new directory.ContactView();
            directory.contactView.render();
        }

        this.showView(directory.contactView);
    },

    source: function (id) {
        if (id == undefined)
        {
            directory.shellView.selectMenuItem('multiview-menu');
        }
        else
        {
            directory.shellView.selectMenuItem('singleview-menu');
        }

        if (directory.cameras == undefined)
        {
            console.log('Not connected / authenticated');
        }
        else
        {
            console.log('Displaying source ' + id + ' / ' + directory.cameras.length);

            if (id == undefined)
            {
                this.camPanel = new directory.MultiView({model: directory.cameras});
                this.showView(this.camPanel);
            }
            else
            {
                var cCam = directory.cameras.at(id);

                if (cCam && cCam.attributes)
                {
                    console.log('Selected Camera [' + id + '] ' + ' / ' + directory.cameras.length + cCam.attributes.Id + ' ' + cCam.attributes.SourceName);

                    this.showView(new directory.SingleView({model: cCam}));
                }
                else
                {
                    directory.router.navigate("/login", true);
                }
            }
        }
    },

    showView: function(view) {

        if (this.currentView){
            this.currentView.close();
        }

        if ((directory.loggedUser != undefined) && (directory.loggedUser.sessionToken != undefined))
        {
            this.currentView = view;
            this.currentView.render();

            // reload from jquery (changes after a login)
            this.$content = $("#content");
            this.$content.html(this.currentView.el);
        }
        else
        {
            directory.router.navigate("/login", true);
        }
    },

    navigateToSource: function (id){
        $('#singleViewMenuButton').attr('href', "#source/"+id);
        this.navigate("#source/" + id, {trigger: true});
    }

});

$(document).on("ready", function () {
    directory.loadTemplates(["AboutView", "LoginView", "ContactView", "ShellAuthView", "ShellUnauthView",
        "SingleView", "MultiView", "CamListDropdownlist",
        "VideoPlayerView", "PanTiltZoomView", "AdministrationView", "ConnectedUsersView", "EventViewerView",
        "ServerStatusView", "LibraryView", "TimelineView"],
        function () {
            directory.websiteAPI = new WebsiteAPI();

            directory.router = new directory.Router();

            Backbone.history.start();

            // If we do it here, every time the page changes, the body is wiped :s
            soundManager.setup({
                debugMode : false,
                debugFlash : false,
                url: 'lib/soundmanager2/swf/',
                flashVersion: 9,
                // optional: 9 for shiny features (default = 8)
                useHTML5Audio : true,
                // optional: ignore Flash where possible, use 100% HTML5 mode
                //preferFlash: false,
                //useFlashBlock : false, // optionally, enable when you're ready to dive in
                useHighPerformance: true,
                onready: function() {
                    // Ready to use; soundManager.createSound() etc. can now be called.
                    console.log('SoundManager initialized and ready to use...');
                }
            });

        });

});

directory.activity = {

    isTracking: false,

    lastAction: 0,

    startTracking: function(){
        this.lastAction = (new Date()).getTime();

        this.isTracking = true;

        var self = this;

        /*
        $('body').on('click', function(event){
            var now = (new Date()).getTime();

            if ((now - self.lastAction) > 5 * 60 * 1000){
                self.stopTracking();

                alert("You've been idle for a while. Please log in again.");

                directory.router.logout();
            } else {
                self.lastAction = now;
            }
        });
        */
    },

    stopTracking: function(){
        this.isTracking = false;
        this.lastAction = 0;

        /*
        $('body').off('click');
        */
    }
};




