directory.CameraView = Backbone.View.extend({

    tagName: "div",
    className: "cameraContainer",

    allowZoom: false,

    events: {
        'resize': function()
        {
        }
    },

    previousClassName: null,

    onClick: function(){

        if (this.allowZoom != true)
            return;

        this.$el.toggleClass('outPopUp');
        var self = this;

        if (this.isZoomed){

            this.$el.toggleClass(this.previousClassName);

            /*
            this.$el.find('div').each(function(){
                $(this).attr('style', 'width:' + self.containerSize.width + '%; height: ' +self.containerSize.height + '%;');
            });
            */

            $('.overlay').remove();

            if (this.$prev != null)
                this.$prev.after(this.$el);
            else if (this.$next != null)
                this.$next.before(this.$el);
            else
                this.$parent.append(this.$el);

            this.$prev = null;
            this.$next = null;
            this.$parent = null;
            directory.isFullScreenMode = false;
        } else {

            var regexp = /cameraContainer/gi;
            var classNames = this.$el.attr('class');
            var result = regexp.exec(classNames);

            this.previousClassName = result[0];

            this.$el.toggleClass(this.previousClassName);

            /*
            this.$el.find('div').each(function(){
                $(this).attr('style', 'width:100%; height: 100%;');
            });
            */

            if( $('.overlay').length == 0 ){
                $('body').append('<div class="overlay"></div>');
            }

            this.$prev = this.$el.prev();

            if (this.$prev.length == 0){
                this.$prev = null;
                this.$next = this.$el.next();

                if (this.$next.length == 0){
                    this.$next = null;

                    this.$parent = this.$el.parent();
                }
            }

            $('body').append(this.$el);
            directory.isFullScreenMode = true;
        }

        this.isZoomed = !this.isZoomed;

        //directory.router.navigateToSource(this.id);
    },

    initClickListener: function(){
        var self = this;

        this.$el.on('click', function(){
            self.onClick();
        });
    },

    initialize: function(options){
        this.model.on("change", this.render, this);
        this.model.on("destroy", this.close, this);

        this.streamType = -1;

        this.isZoomed = false;

        this.allowZoom = options.allowZoom;

        this.containerSize = {width: 100, height: 100};
    },

    render:function () {

        var data = _.clone(this.model.attributes);

        //this.id = data.Id;
        this.name = '#'+data.Id + " - " + data.SourceName;

        this.playJPEG();
        this.streamType = directory.StreamType.JPEG;

        this.createControlPanel();

        return this;
    },

    loadImage : function(){

        var fullUrl = "";

        switch (this.streamType){
            case directory.StreamType.JPEG:
                fullUrl = directory.getJpegURL(this.model.attributes.Id);
                break;
            case directory.StreamType.MOTION:
                fullUrl = directory.getMotionURL(this.model.attributes.Id);
                break;
            case directory.StreamType.MJPEG:
                fullUrl = directory.getMJpegURL(this.model.attributes.Id);
                break;
        }

        var self = this;

        if (this.streamType == directory.StreamType.JPEG || this.streamType == directory.StreamType.MOTION)
        {
            $('#liveImage' + this.model.attributes.Id).one('load',function() {
                if (directory.isFullScreenMode && !self.isZoomed) {
                    self.checkEscapeFromFullScreen();
                } else {
                    setTimeout(function(){
                        self.loadImage();
                    }, 40);
                }
            });
        }

        $('#liveImage' + this.model.attributes.Id).attr('src', fullUrl);
    },

    checkEscapeFromFullScreen: function() {
        var self = this;
        if (directory.isFullScreenMode && !self.isZoomed) {
            setTimeout(function() {
                self.checkEscapeFromFullScreen();
            }, 250);
        } else {
            self.loadImage();
        }
    },

    onClose: function()
    {
        this.model.unbind("change", this.render);
        this.model.unbind("destroy", this.close);

        //console.log('Camera ' + this.id + ' >> Running = false');
        this.running = false;

    },

    setStreamType: function(streamType){
        // Streamtype equals to one of StreamTypeModel types

        switch(streamType){
            case directory.StreamType.JPEG:
                this.playJPEG();
                this.streamType = directory.StreamType.JPEG;
                break;
            case directory.StreamType.MOTION:
                this.playJPEG();
                this.streamType = directory.StreamType.MOTION;
                break;
            case directory.StreamType.MJPEG:
                this.playMJPEG();
                break;
            case directory.StreamType.LIVE:
                this.playLIVE();
                break;
            default:
                throw new Error('Passed unidentified StreamType');
                break;
        }

        //this.createControlPanel();
    },

    setCellPercentSize: function(percentCellWidth, percentCellHeight){
         this.containerSize = {width: percentCellWidth, height: percentCellHeight};
    },

    addCameraImage: function(){
        this.$el.html("<img src='"+ WebUIConfig.IMG_LOADING_PATH +"' "
            + "title='" + this.name + "' id='liveImage" + this.model.attributes.Id + "' class='webCamImage'>");

        // handle error on loading image
        var self = this;
        $('#liveImage' + this.model.attributes.Id).error(function () {
            $(this).unbind("error").attr("src", WebUIConfig.IMG_OFFLINE_PATH);
            self.running = false;
        });
    },

    createControlPanel: function() {

        //console.log('createControlPanel...');

        var isRecording = this.model.isRecording;
        var record = "<button id='recordButton' type='button' data-type='" + (isRecording? 'record' : 'norecord')
            +"' class='btn btn-small" + (isRecording? ' controlPanelButtonActive' : '') +"'>"
            +    "<span class='glyphicon glyphicon-facetime-video'></span>"
            +   "</button>";


        var volume = '';
        if (this.model.hasAudio) {
            volume = "<button id='volumeButton' type='button' data-type='volume-up' class='btn btn-small'>"
                +    "<span class='glyphicon glyphicon-volume-up'></span>"
                +   "</button>";
        }

        var buttons = record + volume;
        $('#cameraControlPanel').html(buttons);

        var self = this;
        $('#recordButton').on('click', function() {
            var type = $(this).data('type');
            if (type == 'norecord') {
                $(this).addClass('controlPanelButtonActive');
                $(this).data('type', 'record');

                directory.websiteAPI.jsonStartStopRecording(self.model.attributes.Id, true);
                self.model.isRecording = true;
            } else {
                $(this).removeClass('controlPanelButtonActive');
                $(this).data('type', 'norecord');

                directory.websiteAPI.jsonStartStopRecording(self.model.attributes.Id, false);
                self.model.isRecording = false;
            }

        });

        if (this.model.hasAudio) {
            $('#volumeButton').on('click', function() {
                var type = $(this).data('type');
                if (type == 'volume-off') {
                    $(this).html("<span class='glyphicon glyphicon-volume-up'></span>");
                    $(this).data('type', 'volume-up');
                } else {
                    $(this).html("<span class='glyphicon glyphicon-volume-off'></span>");
                    $(this).data('type', 'volume-off');
                }
                self.switchAudio();
            });
        }
    },

    addVideoObject:function() {
        var videoObjectId = "videoObject_" + this.model.attributes.Id;

        this.videoPlayerView = new directory.VideoPlayerView({
            posterURL: directory.getJpegURL(this.model.attributes.Id),
            sourceURL: directory.getLiveURL(this.model.attributes.Id),
            videoId: videoObjectId,
            mode: 'html5'
        });

        this.$el.html("<div id='singleVideoContainer' class='singleVideoContainer'></div>");

        $('#singleVideoContainer').html(this.videoPlayerView.render(true).el);

        return videoObjectId;
    },

    playJPEG: function(){

        if (this.streamType == directory.StreamType.LIVE)
        {
            if (this.videoPlayerView != undefined)
            {
                this.videoPlayerView.onClose();
                this.videoPlayerView.$el.remove();
            }
        }

        this.addCameraImage();

        this.running = true;

        var self = this;

        setTimeout(function(){self.loadImage()}, 50);
    },

    playMJPEG: function(){

        if (this.streamType == directory.StreamType.LIVE)
        {
            if (this.videoPlayerView != undefined)
            {
                this.videoPlayerView.onClose();
                // we need to clear video element
                this.videoPlayerView.$el.remove();
            }
        }

        this.streamType = directory.StreamType.MJPEG;

        this.running = false;
        this.addCameraImage();
        this.loadImage();
    },

    playLIVE: function(){

        this.running = false;

        if (this.streamType == directory.StreamType.JPEG || this.streamType == directory.StreamType.MOTION || this.streamType == directory.StreamType.MJPEG){
            // we need to remove image element
            $('#liveImage' + this.model.attributes.Id).remove();
        }

        this.addVideoObject();
        this.streamType = directory.StreamType.LIVE;
    },

    switchAudio: function() {
        if (!this.model.hasAudio) {
            return;
        }

        if (this.audio) {
            soundManager.unload('aSound');
            soundManager.destroySound('aSound');

            this.audio = null;
        } else {

            aUrl = directory.getAudioURL(this.model.attributes.Id);
            console.log("Audio Request >> " + aUrl);

            this.audio = soundManager.createSound({
                id: 'aSound',
                url: aUrl
            });

            this.audio.play();
        }
    },

    closeAudio: function() {
        if (this.audio) {
            soundManager.unload('aSound');
            soundManager.destroySound('aSound');

            this.audio = null;
        }
    }

});

directory.VideoPlayerView = Backbone.View.extend({

    tagName: "div",
    className: "fullsizePlayer",

    initialize: function(options){
        this.options = options;
    },

    render: function(initPlayer){

        this.$el.html(this.template({
            posterURL: this.options.posterURL,
            sourceURL: this.options.sourceURL,
            videoId: this.options.videoId,
            mode: this.options.mode
        }));

        var self = this;

        if (initPlayer) {
            setTimeout(function () {

                var obj = {};
                if (self.options.mode == 'html5') {
                    obj = {'techOrder': ['html5', 'flash']};
                } else {
                    obj = {'techOrder': ['flash', 'html5']};
                }

                console.log('Calling VideoJS(' + self.options.videoId + ')');

                videojs(self.options.videoId, obj, function () {
                    console.log('Called VideoJS(' + self.options.videoId + ')');
                });

            }, 50);
        }

        return this;
    },
    onClose: function()
    {
        //console.log('VideoPlayerView >> onClose');

        // if videos exist loop through videos and dispose them

        $('.video-js').each( function() {
            // setup video object instance
            var videoObj = videojs(jQuery(this).attr('id'));
            videoObj.dispose();
        });

    }
});

directory.PanTiltZoomView = Backbone.View.extend({
    initialize: function(){

    },

    events: {
        "click #zoomIn": "zoomIn",
        "click #zoomOut": "zoomOut",
        "click #panLeft": "panLeft",
        "click #panRight": "panRight",
        "click #tiltUp": "tiltUp",
        "click #tiltDown": "tiltDown"
    },

    render: function(){

        var data = _.clone(this.model.attributes);

        //this.id = data.Id;
        this.$el.html(this.template());

        return this;
    },

    zoomIn: function(event){
        directory.websiteAPI.SendPTZCommandJson(this.model.attributes.Id, directory.websiteAPI.PtzCommand.ZoomIn);
    },

    zoomOut: function(event){
        directory.websiteAPI.SendPTZCommandJson(this.model.attributes.Id, directory.websiteAPI.PtzCommand.ZoomOut);
    },

    panLeft: function(event){
        directory.websiteAPI.SendPTZCommandJson(this.model.attributes.Id, directory.websiteAPI.PtzCommand.Left);
    },

    panRight: function(event){
        directory.websiteAPI.SendPTZCommandJson(this.model.attributes.Id, directory.websiteAPI.PtzCommand.Right);
    },

    tiltUp: function(event){
        directory.websiteAPI.SendPTZCommandJson(this.model.attributes.Id, directory.websiteAPI.PtzCommand.Up);
    },

    tiltDown: function(event){
        directory.websiteAPI.SendPTZCommandJson(this.model.attributes.Id, directory.websiteAPI.PtzCommand.Down);
    }

});
