directory.ServiceStatus = Backbone.Model.extend({

    defaults: {

    },

    initialize:function () {

        console.log('New Service Status object created...');

        this.on('sync', function(){
            console.log('Service Status object received');

            _.each(this.model, function (pInfo) {
                console.log('SS >> ' + pInfo);
            });

            if ((directory.administrationView != undefined) && (directory.administrationView.serverStatusTable != undefined))
            {
                directory.administrationView.serverStatusTable.refreshTable();
            }
        });
    }

});

directory.ProcessInfo = Backbone.Model.extend({

    defaults: {

    },

    initialize:function () {
        console.log('New Process Info object created...');

        this.on('sync', function(){
            console.log('Process Info object received');

            if ((directory.administrationView != undefined) && (directory.administrationView.serverStatusTable != undefined))
            {
                directory.administrationView.serverStatusTable.refreshTable();
            }
        });
    }

});