directory.LibraryView = Backbone.View.extend({

    events:{
        'change #libraryDisplaySelector': 'onLibraryDisplaySelector',
        'click #startDateHolder': 'onStartDateClicked'
    },

    const:{

    },

    initialize:function () {
        NetcamAPIVars.LIBRARY_PAGE_NUMBER = 1;

        //this.model.fetch();
        this.libItems = [];
    },

    render:function () {
        this.$el.html(this.template());

        directory.websiteAPI.jsonGetLibraryItemsInfo();

        var self = this;
        setTimeout(function()
        {
            $('#startDateHolder').datetimepicker()
                .on('changeDate', function (ev) {

                    console.log('StartDate date changed...');

                    if (ev.date.valueOf() > NetcamAPIVars.libraryEndDate.valueOf()) {
                        // 86400000 is one day in seconds
                        NetcamAPIVars.libraryEndDate = new Date(new Date().setTime(ev.date.getTime() + 86400000));
                    }
                    NetcamAPIVars.libraryStartDate = new Date(ev.date);

                    self.refreshDatePickerValue();
                    self.refreshModel();

                    $('#startDateHolder').datetimepicker('hide');
                });

            $('#endDateHolder').datetimepicker()
                .on('changeDate', function (ev) {
                    if (ev.date.valueOf() < NetcamAPIVars.libraryStartDate.valueOf()) {
                        NetcamAPIVars.libraryStartDate = new Date(new Date().setTime(ev.date.getTime() - 86400000));
                    }
                    NetcamAPIVars.libraryEndDate = new Date(ev.date);

                    self.refreshDatePickerValue();
                    self.refreshModel();

                    $('#endDateHolder').datetimepicker('hide');
                });
        }, 300);


        return this;
    },

    createLibItemsArray: function(startIndex, endIndex) {
        var self = this;
        self.libItems = [];

        if (endIndex > self.model.models.length) {
            endIndex = self.model.models.length;
        }

        if (startIndex > endIndex) {
            startIndex = endIndex;
        }

        for (var i = startIndex; i < endIndex; i++) {
            var libItem = new directory.LibraryItemView({
                model:self.model.models[i]
            });

            self.libItems.push(libItem);
        }
    },

    drawElements: function(){
        var libraryContent = $("#libraryContent");
        libraryContent.empty();

        var self = this;

        var pagesNum = Math.ceil(NetcamAPIVars.LIBRARY_RECORDS_NUMBER / NetcamAPIVars.LIBRARY_ITEMS_NUMBER) + 1;
        if (NetcamAPIVars.LIBRARY_PAGE_NUMBER + 1 > pagesNum) {
            NetcamAPIVars.LIBRARY_PAGE_NUMBER = 1;
        }

        var startLibIndex = (NetcamAPIVars.LIBRARY_PAGE_NUMBER - 1) * NetcamAPIVars.LIBRARY_ITEMS_NUMBER;
        var endIndex = startLibIndex + NetcamAPIVars.LIBRARY_ITEMS_NUMBER;
        this.createLibItemsArray(startLibIndex, endIndex);

        var len = this.libItems.length;
        for (var i = 0; i < len; i++ ) {
            var libItem = this.libItems[i];
            libraryContent.append(libItem.render().el);
        }

        var cameraDropdownlist = new directory.CamListDropdownlist({collection: directory.cameras,
            model: directory.cameras.at(NetcamAPIVars.LIBRARY_SOURCE_ID)});
        cameraDropdownlist.hasAll = true;
        cameraDropdownlist.render();
        self.listenTo(cameraDropdownlist, 'onCameraSelected', self.onCameraSelected);
        $('#libCamListHolder').html('<span>Source:</span><br/>');
        $('#libCamListHolder').append(cameraDropdownlist.el);

        this.refreshDatePickerValue();

        $('#libraryPagination').empty();

        var startPage = NetcamAPIVars.LIBRARY_PAGE_NUMBER - 4;
        var endPage = NetcamAPIVars.LIBRARY_PAGE_NUMBER + 4;

        if (startPage <= 0) {
            endPage -= (startPage - 1);
            startPage = 1;
        }
        if (endPage > pagesNum - 1) {
            endPage = pagesNum - 1;
        }
        var li;
        var active;
        if (startPage > 1) {
            li = $('<li data-page="1"><a>1</a></li>');
            li.on('click', function() {
                NetcamAPIVars.LIBRARY_PAGE_NUMBER = $(this).data('page');
                self.drawElements();
            });
            $('#libraryPagination').append(li);

            li = $('<li><a>...</a></li>');
            $('#libraryPagination').append(li);

        }

        for (var i = startPage; i <= endPage; i++) {
            active = '';
            if (i == NetcamAPIVars.LIBRARY_PAGE_NUMBER) {
                active='class="active"';
            }
            var li = $('<li ' + active + ' data-page="' + i + '"><a>' + i + '</a></li>');
            if (i != NetcamAPIVars.LIBRARY_PAGE_NUMBER) {
                li.on('click', function() {
                    NetcamAPIVars.LIBRARY_PAGE_NUMBER = $(this).data('page');
                    self.drawElements();
                });
            }
            $('#libraryPagination').append(li);
        }

        if (endPage < pagesNum - 1) {
            li = $('<li><a>...</a></li>');
            $('#libraryPagination').append(li);

            li = $('<li data-page="' + (pagesNum - 1) +'"><a>' + (pagesNum - 1) +'</a></li>');
            li.on('click', function() {
                NetcamAPIVars.LIBRARY_PAGE_NUMBER = $(this).data('page');
                self.drawElements();
            });
            $('#libraryPagination').append(li);
        }
    },

    refreshDatePickerValue: function() {
        $('#startDateHolder').datetimepicker().data('datetimepicker').setDate(NetcamAPIVars.libraryStartDate);
        $('#endDateHolder').datetimepicker().data('datetimepicker').setDate(NetcamAPIVars.libraryEndDate);
    },

    onCameraSelected: function(args){
        NetcamAPIVars.LIBRARY_SOURCE_ID = args[0];
        this.refreshModel();
    },

    onStartDateClicked: function() {
        //console.log('StartDate clicked...');
    },

    onLibraryDisplaySelector: function(event) {
        NetcamAPIVars.LIBRARY_ITEMS_NUMBER = parseInt(event.target.value);
        this.refreshModel();
    },

    refreshModel: function() {
        directory.websiteAPI.jsonGetLibraryItemsInfo();
    },

    onClose: function()
    {

    }
});

directory.LibraryItemView = Backbone.View.extend({

    events:{
    },

    const:{

    },

    initialize:function () {
        this.isZoomed = false;
    },

    render:function () {

        var self = this;

        self.drawElements();

        return this;
    },

    onClick: function () {
        if (this.isZoomed) {
            $('.outPopUp').remove();
            $('.overlay').remove();
        } else {
            if( $('.overlay').length == 0 ){
                $('body').append('<div class="overlay"></div>');
            }
            $('body').append('<div class="outPopUp"></div>');

            var self = this;
            var data = _.clone(this.model.attributes);

            // check if this video or image
            if (data.ItemType == 1) {
                // image

                $('.outPopUp').html('<div class="cameraContainerAbsolute" ' +
                    'style="width: 100%; height: 100%;">' +
                    '<img src="' + directory.getLibraryURL(data.Id, data.ItemType, false) + '"/></div>');

                $('.outPopUp').on('click', function(){
                    self.onClick();
                });
            } else {

                var videoObjectId = "videoObject_" + data.Id;
                var videoPlayerView = new directory.VideoPlayerView({
                    posterURL: directory.getLibraryURL(data.Id, data.ItemType, true),
                    sourceURL: directory.getLibraryURL(data.Id, data.ItemType, false),
                    videoId: videoObjectId,
                    mode: 'flash'
                });
                $('.outPopUp').html('<div class="cameraContainer" style="width: 100%; height: 100%;"></div>');
                $('.cameraContainer').html(videoPlayerView.render().el);
                $('.cameraContainer').append('<img src="./img/close.png" class="closeButton" tabindex="1" onclick=""/>');
                $('.closeButton').on('click touchend', function(){
                    videoPlayerView.onClose();
                    self.onClick();
                });
            }
        }

        this.isZoomed = !this.isZoomed;
    },

    drawElements: function() {
        var data = _.clone(this.model.attributes);
        var type = data.ItemType == 1 ? "Image" : "Video";
        <!-- [' + data.Id + "] -->
        this.$el.html('<p align="center"><img width="95%" style="border:1px solid black" src="' + directory.getLibraryURL(data.Id, data.ItemType, true) + '"/><br />#' + data.SourceId + " - " + type + " - " +  directory.getFullFormattedDateFromString(data.TimeStamp) + " - " + (data.Duration / 1000).toFixed(1) + 's' + '</p>');

        var self = this;
        this.$el.on('click', function(){
            self.onClick();
        });
    },

    remove: function () {

    }
});