directory.EventViewerView = Backbone.View.extend({

    events:{
        'change #eventDisplaySelector': 'onEventDisplaySelector',
        'change #eventCriticalitySelector': 'onEventCriticalitySelector'
    },

    render:function () {
        this.$el.html(this.template());
        directory.websiteAPI.jsonGetEventLogs();
        this.model = directory.eventLogs;
        return this;
    },

    remove: function () {

    },

    onEventDisplaySelector: function(event) {
        NetcamAPIVars.EVENT_LOGS_ROW_NUMBER = event.target.value;
        directory.websiteAPI.jsonGetEventLogs();
   },

    onEventCriticalitySelector: function(event) {
        NetcamAPIVars.EVENT_LOGS_MIN_CRIT = event.target.value;
        directory.websiteAPI.jsonGetEventLogs();
    },

    drawElements: function(){

        var self = this;
        var $tbody = $(self.$el).find('tbody').empty();
        _.each(self.model.models, function (user) {

            $tbody.append("<tr></tr>");
            $(self.$el).find('th').each(function() {
                var $attr = $(this).data('attribute');

                var value = user.attributes[$attr];
                if ($attr == "TimeStamp") {
                    value = directory.getFullFormattedDateFromString(value);
                }

                var td = '<td>' + value + '</td>';


                //if ($attr == "Hostname") {
                //    if (user.attributes[$attr] == null) {
                //        td = '<td>Local</td>';
                //    }
                //}

                if ($attr == "Criticality") {
                    $tbody.find("tr:last").append('<td><img src="' + self.getImgSrc(user.attributes[$attr]) + '" width="32" height="32" /></td>');
                } else {
                    $tbody.find("tr:last").append(td);
                }
            });
        });
    },
    getImgSrc: function(crit) {
        var src;
        if (crit == 0) {
            src = WebUIConfig.IMG_BULLET_GRAY;
        } else if (crit == 1) {
            src = WebUIConfig.IMG_BULLET_GREEN;
        } else if (crit == 2) {
            src = WebUIConfig.IMG_BULLET_ORANGE;
        } else {
            src = WebUIConfig.IMG_BULLET_RED;
        }
        return src;
    },
    onClose: function() {
        //console.log('Event viewer close...');
   }

});