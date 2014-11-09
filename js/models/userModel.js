directory.UserModel = Backbone.Model.extend({

    defaults: {
        userName: 'Unknown'
    },

    initialize:function () {
        console.log("New user created with default value '" + this.defaults.userName + "'...");
    }

});



