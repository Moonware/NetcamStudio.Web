directory.LoginView = Backbone.View.extend({

    events:{
        "click #loginBtn":"loginClick"
    },

    render:function () {
        var isLocal = String(getURLVar('isLocal'));

        var isLoc = false;

        if ((isLocal == 'true') || (isLocal == 'True'))
        {
            isLoc = true;
        }

        this.$el.html(this.template({isLocal: isLoc}));

        setTimeout(function() {
            if($.cookie('hostName')) {
                $('#hostNameInput').val($.cookie('hostName'));
            } else {
                $('#hostNameInput').val(WebUIConfig.HOST);
            }

            if($.cookie('httpPort')) {
                $('#httpPortNumber').val($.cookie('httpPort'));
            } else {
                $('#httpPortNumber').val(WebUIConfig.HTTP_PORT);
            }

            if($.cookie('password')) {
                $('#loginPassword').val($.cookie('password'));
            } else {
                $('#loginPassword').val(WebUIConfig.PASSWORD);
            }

            if($.cookie('login')) {
                $('#loginUsername').val($.cookie('login'));
            } else {
                $('#loginUsername').val(WebUIConfig.LOGIN);
            }

            if ($.cookie('savepassword')) {
                $('#savePassword').attr('checked', true);
            }
        }, 100);
        return this;
    },

    loginClick:function (event) {

        var isLocal = String(getURLVar('isLocal'));

        var hostName = getHost();
        var httpPort = getPort();

        if ((isLocal != 'true') && (isLocal != 'True'))
        {
            var hostName = $('#hostNameInput').val();
            var httpPort = $('#httpPortNumber').val();
        }

        if (hostName != undefined && httpPort != 'undefined'){
            directory.hostName = hostName;
            directory.httpPort = httpPort;
        }

        directory.websiteAPI.jsonLogin(directory.hostName, directory.httpPort,
            $('#loginUsername').val(), $('#loginPassword').val(), false);

        event.preventDefault();
        return false;
    }

});
