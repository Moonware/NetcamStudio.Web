directory.Camera = Backbone.Model.extend({

    isPTZAvailable: false,

    defaults: {

    },

    //urlRoot:"http://localhost:8124/Json/GetCameras",

    initialize:function () {
        console.log('----------------------------');
        console.log('New Camera object created...');
        console.log('----------------------------');

        $.each(this.attributes, function(index, value) {
            console.log('Camera Attributes [' + index + '] : ' + value);
        });

        $.each(this.collection, function(index, value) {
            console.log('Camera Collections [' + index + '] : ' + value);
        });

        console.log('');

        this.isPTZAvailable = this.attributes.Status.HasPTZ;
        this.hasAudio = this.attributes.Status.HasAudio;
        this.isRecording = this.attributes.Status.IsRecording;
    }

});

directory.CameraCollection = Backbone.Collection.extend({

    model: directory.Camera,

    initialize:function () {
        console.log('New CameraCollection object created...');

        this.on('sync', function(){
            console.log('Camera collection received');

            directory.router.navigateToSource(0);
        });
    }
    /*,
    urlRoot: "http://localhost:8124/Json/GetCameras"
    */
});

var originalSync = Backbone.sync;
Backbone.sync = function (method, model, options) {
    if (method === "read") {
        options.dataType = "jsonp";
        return originalSync.apply(Backbone, arguments);
    }

};