directory.ConnectedUsersView = Backbone.View.extend({

    events:{
    },

    render:function () {
        directory.websiteAPI.jsonGetConnectedUsers();

        return this;
    },

    refreshTable:function()
    {
        var rowsCount = $(this.$el).find('tbody').find('tr').length;

        var modelLength = this.model.models.length;

        if (modelLength != rowsCount) {
            this.addTable();
        } else {
            this.refreshTableContent();
        }
    },

    getImgURL: function(filename) {
        return 'http://' + directory.hostName + ':' + directory.httpPort + '/UserIcons/'+ filename;
    },

    addTable: function() {
        this.$el.html(this.template());

        var self = this;

        var $tbody = $(self.$el).find('tbody');
        _.each(self.model.models, function (user) {
            //not need process info and service status
            if (user.attributes["UserIcon"]) {

                $tbody.append("<tr></tr>");
                $(self.$el).find('th').each(function() {
                    var $attr = $(this).data('attribute');
                    if ($attr == "UserIcon") {
                        $tbody.find("tr:last").append('<td data-attribute="' + $attr +'"><img src="' + self.getImgURL(user.attributes[$attr]) +'"/></td>');
                    } else {
                        var value = user.attributes[$attr];
                        if ($attr == "SessionStarted") {
                            value = directory.getFullFormattedDateFromString(value);
                        }
                        $tbody.find("tr:last").append('<td data-attribute="' + $attr +'">' + value + '</td>');
                    }
                });
            }
        });
    },
    refreshTableContent: function() {
        var self = this;
        var i = 0;
        $(self.$el).find('tbody').find('tr').each(function() {
            var user = self.model.models[i];
            var $row = $(this);

            $row.find('td').each(function() {
                var $attr = $(this).data('attribute');
                if ($attr != "UserIcon") {
                    var value = user.attributes[$attr];
                    if ($attr == "SessionStarted") {
                        value = directory.getFullFormattedDateFromString(value);
                    }
                    $(this).html(value);
                }
            });
            i++;
        });
    }
});

directory.ServerStatusView = Backbone.View.extend({
    events:{
    },

    render:function () {

        directory.websiteAPI.jsonGetProcessInfo();
        directory.websiteAPI.jsonGetServiceStatus();

        return this;
    },

    refreshTable: function() {
        this.$el.html(this.template());

        var self = this;

        if (directory.processInfo != undefined)
        {
            if (directory.processInfo.attributes['CPU'] != undefined) {
                $('#serverStatusCPU').text(directory.processInfo.attributes['CPU']);
            }
        };

        if (directory.serviceStatus != undefined)
        {
            if (directory.serviceStatus.attributes['FreeDiskSpace'] != undefined) {
                $('#serverStatusFreeSpace').text(Math.round(parseInt(directory.serviceStatus.attributes['FreeDiskSpace'])/1024/1024/1024).toString() + "GB");
            }

            if (directory.serviceStatus.attributes['ConnectedUsers'] != undefined) {
                $('#serverStatusConnectedUsers').text(directory.serviceStatus.attributes['ConnectedUsers']);
            }
        };

    }
});