directory.MultiView = Backbone.View.extend({
    tagName: "div",
    className: "multiViewContainer",

    startCameraIndex: 0,

    initialize:function () {

        this.cams = [];

        // associate #multiViewGrid value with table layout
        this.multiViewGridObj = {
            1: {rows: 1, columns: 1, containBigCell: false},
            2: {rows: 1, columns: 2, containBigCell: false},
            3: {rows: 1, columns: 3, containBigCell: false},
            4: {rows: 2, columns: 2, containBigCell: false},
            5: {rows: 2, columns: 3, containBigCell: false},
            6: {rows: 2, columns: 4, containBigCell: false},
            7: {rows: 3, columns: 3, containBigCell: false},
            8: {rows: 3, columns: 4, containBigCell: false},
            9: {rows: 3, columns: 3, containBigCell: true},
            10: {rows: 4, columns: 4, containBigCell: true}
        };

        this.selectedMode = NetcamStates.MULTIVIEW_MODE;

        var self = this;
        // add on stage menu drop down list
        setTimeout( function(){
            var iconSelect = new IconSelect("my-icon-select",
                {'selectedIconWidth':51,
                    'selectedIconHeight':42,
                    'selectedBoxPadding':0,
                    'iconsWidth':51,
                    'iconsHeight':42,
                    'boxIconSpace':0,
                    'vectoralIconNumber':5,
                    'horizontalIconNumber':2});

            var icons = [];
            icons.push({'iconFilePath':'img/icons/1.png', 'iconValue':'1'});
            icons.push({'iconFilePath':'img/icons/2.png', 'iconValue':'2'});
            icons.push({'iconFilePath':'img/icons/3.png', 'iconValue':'3'});
            icons.push({'iconFilePath':'img/icons/4.png', 'iconValue':'4'});
            icons.push({'iconFilePath':'img/icons/5.png', 'iconValue':'5'});
            icons.push({'iconFilePath':'img/icons/6.png', 'iconValue':'6'});
            icons.push({'iconFilePath':'img/icons/7.png', 'iconValue':'7'});
            icons.push({'iconFilePath':'img/icons/8.png', 'iconValue':'8'});
            icons.push({'iconFilePath':'img/icons/9.png', 'iconValue':'9'});
            icons.push({'iconFilePath':'img/icons/10.png', 'iconValue':'10'});

            iconSelect.refresh(icons);

            document.getElementById('my-icon-select').addEventListener('changed', function(e){
                self.onChangeGrid(e);
            });
            iconSelect.setSelectedIndex(self.selectedMode - 1);
            self.iconSelect = iconSelect;
        }, 50);

        /*
        var self = this;
        this.model.on("reset", this.render, this);
        this.model.on("add", function (camera) {
            self.$el.append(new directory.CameraView({model:camera}).render().el);
        });
        */

        // change layout on resize
        if ($(window).width() >= 768) {
            this.isMobile = false;
        } else {
            this.isMobile = true;
        }

        var live = this;
        $(window).on('resize.multi',function() {
            if (!$("#my-icon-select")){
                $(window).off('resize.multi');
                return;
            }
            if ((live.isMobile && $(window).width() >= 768) || (!live.isMobile && $(window).width() < 768)) {
                var outPopUp = $('.outPopUp');
                if (outPopUp != null) {
                    _.each(self.cams, function(camera, key) {
                        if (camera.isZoomed) {
                            camera.onClick();
                        }
                    }, this);
                }
                live.isMobile = !live.isMobile;
                live.drawElements();
            }
        });
    },

    events: {
        'changed #multiViewGrid': 'onChangeGrid',
        'click #previousCameraPage': 'onPrevPage',
        'click #nextCameraPage': 'onNextPage'
    },

    render:function () {

        //console.log('Rendering MultiView...');

        this.$el.html(this.template());

        var self = this;

        // we only create camera views and store them in array

        _.each(self.model.models, function (camera, key) {

            var cCam = new directory.CameraView({
                    model:camera,
                    allowZoom: true
                });

            self.cams.push(cCam);

        }, self);

        setTimeout(function() {
            self.drawElements();
        }, 100);

        return this;
    },

    drawElements: function(){
        var dynContentTable = $("#dynamicContentTable");

        var val = this.selectedMode;

        // contain number of rows and columns
        var layout = this.multiViewGridObj[val];

        dynContentTable.empty();

        var lastIndex = this.startCameraIndex + layout.rows * layout.columns;

        if (layout.containBigCell) {
            lastIndex -= (layout.rows - 1) * (layout.columns - 1);
        }

        if (lastIndex > this.cams.length)
            lastIndex = this.cams.length;

        // create table's rows and columns
        var tableContent = '';
        var colContent = '';
        var row;
        var column;
        var percentCellWidth;
        var percentCellHeight;

        if ($(window).width() >= 768) {
            percentCellWidth = 100 / layout.columns;
            percentCellHeight = 100 / layout.rows;

            for (column = 0; column < layout.columns; column++) {
                colContent +=  '<col width="' + percentCellWidth + '%" />';
            }

            var columnsHTML;
            if (!layout.containBigCell) {
                for (row = 0; row < layout.rows; row++) {
                    columnsHTML = '';
                    for (column = 0; column < layout.columns; column++) {
                        columnsHTML += '<td style="width: ' + percentCellWidth + '%; height: ' + percentCellHeight + '%;"/>';
                    }
                    tableContent += '<tr style="height: ' + percentCellHeight + '%;">' + columnsHTML + '</tr>';
                }
            } else {
                //first row with big cell
                columnsHTML = '<td colspan="' + (layout.columns - 1) + '" rowspan="' + (layout.rows - 1)
                    + '" style="width: ' + percentCellWidth * (layout.columns - 1)
                    + '%; height: ' + percentCellHeight * (layout.rows - 1) + '%;"/>'
                    + '<td style="width: ' + percentCellWidth + '%; height: ' + percentCellHeight + '%;"/>';
                tableContent += '<tr style="height: ' + percentCellHeight + '%;">' + columnsHTML + '</tr>';

                columnsHTML = '';
                for (row = 1; row < layout.rows - 1; row++) {
                    columnsHTML = '<td style="width: ' + percentCellWidth + '%; height: ' + percentCellHeight + '%;"/>';
                    tableContent += '<tr style="height: ' + percentCellHeight + '%;">' + columnsHTML + '</tr>';
                }

                //last row
                columnsHTML = '';
                for (column = 0; column < layout.columns; column++) {
                    columnsHTML += '<td style="width: ' + percentCellWidth + '%; height: ' + percentCellHeight + '%;"/>';
                }
                tableContent += '<tr style="height: ' + percentCellHeight + '%;">' + columnsHTML + '</tr>';
            }

        } else {
            colContent += '<col width="100%"/>';
            for (row = 0; row < layout.rows * layout.columns; row++) {
                tableContent += '<tr><td></td></tr>';
            }
        }
        dynContentTable.append(colContent);

        dynContentTable.append(tableContent);
        // put cameras in table's cells
        var i = this.startCameraIndex;
        var cams = this.cams;
        var self = this;
        dynContentTable.find('td').each(function(){
            var $cell = $(this);
            if (i >= lastIndex) {
                return false;
            }
            var camera = cams[i];
            if (layout.containBigCell && (i == self.startCameraIndex)) {
                camera.setCellPercentSize(percentCellWidth * (layout.columns - 1), percentCellHeight * (layout.rows - 1));
            } else {
                camera.setCellPercentSize(percentCellWidth, percentCellHeight);
            }

            camera.initClickListener();

            $cell.append(camera.render().el);

            i++;
        });

        var prevEnabled;
        if (this.startCameraIndex > 0)
            prevEnabled = null;
        else
            prevEnabled = "disabled";

        $('#previousCameraPage').attr('disabled', prevEnabled);

        var nextEnabled;
        if (lastIndex < this.cams.length )
            nextEnabled = null;
        else
            nextEnabled = "disabled";

        $('#nextCameraPage').attr('disabled', nextEnabled);

    },

    onPrevPage: function(){

        var layout = this.multiViewGridObj[this.iconSelect.getSelectedValue()];

        this.startCameraIndex -= 1;
        if (this.startCameraIndex < 0)
            this.startCameraIndex = 0;

        this.drawElements();
    },

    onNextPage: function(){

        var layout = this.multiViewGridObj[this.iconSelect.getSelectedValue()];

        this.startCameraIndex += 1;

        this.drawElements();
    },

    onClose: function()
    {
        _.each(this.cams, function(camera, key) {
            camera.close();
        }, this);

        this.cams = [];

        console.log('CameraPanel Closed!');
    },

    onChangeGrid: function(event){

        this.startCameraIndex = 0;

        if (this.iconSelect) {
            this.selectedMode = this.iconSelect.getSelectedValue();
            NetcamStates.MULTIVIEW_MODE = this.selectedMode;
        }

        this.drawElements();

    },

    getGridWidthFromWH: function(value){
        // newGrid format: w x h (3 x 3)

        var width = value.substr(0,1);

        return width
    }
});


directory.CamListDropdownlist = Backbone.View.extend({
    tagName: 'select',
    className: 'customSelect',

    events: {
        'change': function(event){
            var selectedCamName = event.target.value;
            //console.log("Camera selected: " + selectedCamName);
            this.trigger('onCameraSelected', [selectedCamName])
        }
    },

    initialize: function(){
        this.collection.on('change', this.render, this);
        this.hasAll = false;
    },

    render: function(targetId){
        this.$el.empty();

        //console.log ("Rendering Dropdowns Template [src " + targetId + "]");

        this.$el.html(this.template({cameras: this.collection.models, currentId: targetId, hasAll: this.hasAll}));

        return this;
    }
});

directory.SingleView = Backbone.View.extend({

    events:{
        'change #streamTypeSelector': 'onStreamTypeSelect'
    },

    initialize: function() {

    },

    render:function () {
        //console.log('Rendering SingleView...');

        var isMotDet = this.model.attributes.Status.IsMotionDetector;
        var showPTZ = this.model.attributes.Status.HasPTZ & directory.loggedUser.ptzEnabled;

        //TODO: Implement Show PTZ
        this.$el.html(this.template({isMotionDetection: isMotDet, showPTZ: showPTZ}));

        var self = this;

        setTimeout(function() {
            self.currentCamera = new directory.CameraView({
                model:self.model,
                allowZoom: false
            });

            self.currentCamera.setCellPercentSize(100, 100);
            $('#liveSource').prepend(self.currentCamera.render().el);

            self.currentCamera.switchAudio();

            //console.log('Rendering DropDown for ' + self.currentCamera.model.attributes.Id );
            //model: self.currentCamera

            var cameraDropdownlist = new directory.CamListDropdownlist({collection: directory.cameras});
            cameraDropdownlist.render(self.currentCamera.model.attributes.Id);

            self.listenTo(cameraDropdownlist, 'onCameraSelected', self.onCameraSelected);

            $('#camListHolder').html('<span>Source:</span><br/>');
            $('#camListHolder').append(cameraDropdownlist.el);

            var cameraControls = new directory.PanTiltZoomView({
                model:self.model
            });

            $("#cameraControls").html(cameraControls.render().el);

        },50);

        return this;
    },

    onCameraSelected: function(args){
        var id = args[0];

        directory.router.navigateToSource(id);
    },

    onStreamTypeSelect: function(event){
        var streamTypeName = event.target.value;

        switch(streamTypeName){
            case "JPEG":
                this.currentCamera.setStreamType(directory.StreamType.JPEG);
                this.currentCamera.switchAudio();
                break;
            case "MOTION":
                this.currentCamera.setStreamType(directory.StreamType.MOTION);
                this.currentCamera.switchAudio();
                break;
            case "MJPEG":
                this.currentCamera.setStreamType(directory.StreamType.MJPEG);
                this.currentCamera.switchAudio();
                break;
            case "LIVE":
                this.currentCamera.setStreamType(directory.StreamType.LIVE);
                this.currentCamera.closeAudio();
                break;
            default:
                throw new Error('Wrong stream type name selected');
                break;
        }
    },

    onClose: function()
    {
        if (this.currentCamera) {
            this.currentCamera.closeAudio();
        }

        //console.log('Camera Live View >> Running = false');
    }

});