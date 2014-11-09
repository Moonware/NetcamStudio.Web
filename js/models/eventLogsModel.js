directory.EventLogs = Backbone.Model.extend({

    defaults: {

    },

    initialize:function () {

    }

});

directory.EventLogsCollection = Backbone.Collection.extend({

    model: directory.EventLogs,

    initialize:function () {
        console.log('New Event Logs Collection object created...');

        this.on('sync', function(){
            console.log('Event Logs collection received');

            if (directory.eventViewerView != undefined)
            {
                directory.eventViewerView.drawElements();
            }
        });
    }
});
