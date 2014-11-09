directory.SourceView = Backbone.View.extend({

    events:{
        "click #showMeBtn":"showMeBtnClick",
        "click #serverBtn":"serverBtnClick",
        "click #getSourcesBtn":"getSourcesBtnClick"
    },

    render:function () {
        if (this.model == undefined)
        {
            this.model = new directory.UserModel();
        }
        if (this.model.serverUsername == undefined)
        {
            this.model.serverUsername = "n/a";
        }

        if (this.model.sessionToken == undefined)
        {
            this.model.sessionToken = "";
        }

        this.$el.html(this.template(this.model));
        //this.$el.html(this.template());

        return this;
    },

    showMeBtnClick:function () {
        console.log("show me...");
        directory.shellView.search();
    },

    serverBtnClick:function () {
        console.log("server");
        //directory.shellView.search();
    },

    getSourcesBtnClick:function () {
        this.jsonGetCameras();
    }
    ,
    jsonGetCameras:function(){

        try {
            //var currentSettings =  Ext.getStore('SettingsStore').getAt(0);

            // username / password
            var queryParams = 'authToken=' + directory.loggedUser.sessionToken;

            var jsonCommand = directory.loggedUser.serverQueryUrl + 'GetCameras?' + queryParams;

            console.log('Get Cameras >> ' + jsonCommand);

            $.ajax({
                url: jsonCommand,
                type: 'GET',
                datatype: 'json',
                success: function(data) {

                    if (data != undefined)
                    {

                        $.each(data, function(index, value) {
                            console.log('GetCameras Response [' + index + '] : ' + value);
                        });

                    }
                },
                error: function(err) {
                    console.log('GetCameras Failed: ' + err);
                },
                beforeSend: function(xhr) {
                    /*
                     xhr.setRequestHeader("QueryString", queryParams);
                     */
                }

            });

        } catch (err) {
            console.log('GetCameras Exception: ' + err);
        }
    }


});