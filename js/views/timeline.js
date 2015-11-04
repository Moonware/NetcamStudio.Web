directory.TimelineView = Backbone.View.extend({

    events:{
        'click #startDateHolder': 'onStartDateClicked'
    },

    const:{

    },

    initialize:function () {
        this.timelineItems = [];
    },

    render:function () {
        this.$el.html(this.template());

        directory.websiteAPI.jsonGetTimelineItems();
        //directory.websiteAPI.jsonGetLibraryItems();

        return this;
    },


    drawElements: function(){
        var self = this;

        //console.log("M >> " + JSON.stringify(self.model.models));

        var startTime = self.model.models[0].attributes["startDate"];
        var endTime = self.model.models[0].attributes["endDate"];

        if (new Date(endTime) - new Date(startTime) > 86400000)
        {
            // If we have more than 24h we put last 24h on screen by default...
            startTime = new Date(endTime) - 86400000;
        }

        var jsonModel = self.model.toJSON();
        var data = jsonModel[0].data;

        // .push({date: new Date(ts), duration: item.attributes["Duration"], id: item.attributes["Id"], sourceId: item.attributes["SourceId"]});

        // tweaks all dates as JS dates
        _.each(data, function(item)
        {
            _.each(item.attributes, function(attr)
            {
                attr.date = new Date(attr.date);
            }, this);

        }, this);

        //console.log("Start >> " + startTime);
        //console.log("End >> " + endTime);

        var color = d3.scale.category20();
        // create chart function

        // bind data with DOM
        var timelineContent = document.getElementById('ncs-timeline');

        var parentWidth = timelineContent.offsetWidth;

        var lastHoverId = -1;
        var lastRect = null;

        var eventDropConfig = {
            start: new Date(0),
            end: new Date(),
            minScale: 0,
            maxScale: Infinity,
            width: parentWidth, //1000,
            margin: {
                top: 60,
                left: 150,
                bottom: 20,
                right: 20
            },
            locale: null,
            axisFormat: null,
            tickFormat: [
                [".%L", function(d) { return d.getMilliseconds(); }],
                [":%S", function(d) { return d.getSeconds(); }],
                ["%I:%M", function(d) { return d.getMinutes(); }],
                ["%I %p", function(d) { return d.getHours(); }],
                ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
                ["%b %d", function(d) { return d.getDate() != 1; }],
                ["%B", function(d) { return d.getMonth(); }],
                ["%Y", function() { return true; }]
            ],
            eventHover: function(obj, event){

                if (lastHoverId != obj.__data__.id) {
                    lastHoverId = obj.__data__.id

                    //console.log("H: " + JSON.stringify(obj));

                    divToolTip.html(
                        //"ID: " + obj.__data__.id + '<br/>' +
                        //"Source ID: " + obj.__data__.sourceId + '<br/>' +
                        "Date: " + obj.__data__.date + '<br/>' +
                        "Duration: " + (obj.__data__.duration / 1000).toFixed(1) + 's<br/>' +
                        "<div id='imgContainer' class='centeredDiv'>" +
                            '<img class="borderedImage fitHeight" src=' + directory.getLibraryURL(obj.__data__.id, 1, true) + '>' +
                        "</div>"
                    );

                    if (lastRect != null)
                    {
                        d3.select(lastRect).classed("hover", false);
                    }

                    d3.select(obj).classed("hover", true);
                    lastRect = obj;

                    //divToolTip.transition().duration(250).style("opacity", 0.95);
                }
            },
            eventHoverLeave: function(){
                //if (lastRect != null)
                //{
                //    d3.select(lastRect).classed("hover", false);
                //}

                //if (lastHoverId != -1) {
                    //lastHoverId = -1;

                    //divToolTip.transition().duration(200).style("opacity", 0);
                //}
            },
            eventZoom: null,
            eventClick: function(obj){
                console.log("C: " + JSON.stringify(obj));

                var videoDiv = $('#ncs-timeline-preview');
                // same as divToolTip !

                var videoObjectId = "videoObject_" + obj.__data__.id;
                var videoPlayerView = new directory.VideoPlayerView({
                    posterURL: directory.getLibraryURL(obj.__data__.id, 1, true),
                    sourceURL: directory.getLibraryURL(obj.__data__.id, 0, false),
                    videoId: videoObjectId,
                    mode: 'html5'
                });

                // with autoplay :)
                videoDiv.html(videoPlayerView.render(true, true).el);
            },
            hasDelimiter: true,
            hasTopAxis: true,
            hasBottomAxis: function (data) {
                return data.length >= 10;
            },
            eventLineColor: 'black',
            eventColor: null
        };

        var eventDropsChart = d3.chart.eventDrops(eventDropConfig)
            .eventLineColor(function (datum, index) {
                return color(index);
            })
            .start(new Date(startTime))
            .end(new Date(endTime));


        //var element = d3.select(timelineContent).append('div').datum(data);
        var element = d3.select(timelineContent).datum(data);

        // draw the chart
        eventDropsChart(element);

        var divToolTip = d3.select(document.getElementById('ncs-timeline-preview'));
    },

    refreshModel: function() {
        //directory.websiteAPI.jsonGetTimelineItems();
    },

    onClose: function()
    {

    }
});
