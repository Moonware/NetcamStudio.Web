directory.ConnectedUser = Backbone.Model.extend({

    defaults: {

    },

    initialize:function () {
    }

});

directory.ConnectedUsersCollection = Backbone.Collection.extend({

    model: directory.ConnectedUser,

    initialize:function () {
        console.log('New Connected Users Collection object created...');

        this.on('sync', function(){
            console.log('Connected Users collection received');

            if ((directory.administrationView != undefined) && (directory.administrationView.connectedUsersTable != undefined))
            {
                directory.administrationView.connectedUsersTable.refreshTable();
            }
            //directory.router.navigateToSource(0);
        });
    }
});