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

        return this;
    },


    drawElements: function(){
        //var timelineContent = $("#timelineContent");
        //timelineContent.empty();

        var firstItem = directory.timelineItems.toJSON()[0];

        createStoryJS({
            type:               'timeline',
            width:              '100%',
            height:             '100%',
            source:             firstItem,
            embed_id:           'ncs-timeline',
            start_at_end :      false,
            start_zoom_adjust : 3,
            debug:              true,
            font:               'Pacifico-Arimo'
        });
    },

    refreshModel: function() {
        directory.websiteAPI.jsonGetTimelineItems();
    },

    onClose: function()
    {

    }
});
