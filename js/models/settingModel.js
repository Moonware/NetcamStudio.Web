directory.SettingModel = Backbone.Model.extend({

    defaults: {

    },

    initialize:function () {
        //this.reports = new directory.ReportsCollection();
        //this.reports.parent = this;

        console.log("New setting created...");
    },

    sync: function(method, model, options) {
        if (method === "read") {
            directory.settingStore.findByName(this.key, function (data) {
                options.success(data);
            });
        }
    }

});

directory.SettingCollection = Backbone.Collection.extend({

    model: directory.SettingModel,

    sync: function(method, model, options) {
        if (method === "read") {
            directory.settingStore.findByName(options.data.name, function (data) {
                options.success(data);
            });
        }
    }

});

directory.SettingMemoryStore = function (successCallback, errorCallback) {

    this.findByName = function (searchKey, callback) {
        var settings = this.settings.filter(function (element) {
            var fullName = element.firstName + " " + element.lastName;
            return fullName.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
        });
        callLater(callback, users);
    }

    this.findById = function (id, callback) {
        var settings = this.settings;
        var user = null;
        var l = settings.length;
        for (var i = 0; i < l; i++) {
            if (settings[i].id === id) {
                user = settings[i];
                break;
            }
        }
        callLater(callback, user);
    }

    // Used to simulate async calls. This is done to provide a consistent interface with stores that use async data access APIs
    var callLater = function (callback, data) {
        if (callback) {
            setTimeout(function () {
                callback(data);
            });
        }
    }

    this.settings = [
        {"id": 1, "firstName": "Test", "lastName": "Test"}
    ];

    callLater(successCallback);
}

directory.settingStore = new directory.SettingMemoryStore();