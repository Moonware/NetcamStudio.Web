directory.TimelineItems = Backbone.Model.extend({

    defaults: {

    },

    initialize:function () {
    }

});

directory.TimelineItemsCollection = Backbone.Collection.extend({

    model: directory.TimelineItems,

    initialize:function () {

        this.on('sync', function(){
            console.log('Timeline Items collection received');

            // update the media and thumbnail value with url + token
            this.each(function(timelineObject) {
                var timeline = timelineObject.get("timeline");

                if (timeline !== undefined)
                {
                    var timelineDates = timeline.date;

                    if (timelineDates !== undefined)
                    {
                        var currCpt = 0;

                        $.each(timelineDates, function(index, currentAsset) {

                            if (currentAsset !== undefined && currentAsset.asset !== undefined)
                            {
                                if (currentAsset.asset.media !== undefined) {

                                    /*
                                    var videoObjectId = "videoObject_" + currCpt;
                                    currCpt++;

                                    var videoPlayerView = new directory.VideoPlayerView({
                                        posterURL: 'http://' + directory.hostName + ':' + directory.httpPort + currentAsset.asset.thumbnail + '?authToken=' + directory.loggedUser.sessionToken,
                                        sourceURL: 'http://' + directory.hostName + ':' + directory.httpPort + currentAsset.asset.media + '?authToken=' + directory.loggedUser.sessionToken,
                                        videoId: videoObjectId,
                                        mode: 'flash'
                                    });

                                    currentAsset.asset.media = '<div>' + videoPlayerView.render(false).el.innerHTML + '</div>';

                                    console.log('VPlayer >> ' + currentAsset.asset.media);
                                    */

                                    currentAsset.asset.media = directory.httpPrefix + '://' + directory.hostName + ':' + directory.httpPort + currentAsset.asset.media + '?authToken=' + directory.loggedUser.sessionToken;

                                    //currentAsset.asset.media = 'http://' + directory.hostName + ':' + directory.httpPort + currentAsset.asset.media + '?authToken=' + directory.loggedUser.sessionToken;
                                }

                                if (currentAsset.asset.thumbnail !== undefined) {
                                    currentAsset.asset.thumbnail = directory.httpPrefix + '://' + directory.hostName + ':' + directory.httpPort + currentAsset.asset.thumbnail + '?authToken=' + directory.loggedUser.sessionToken;
                                }
                            }

                        });
                    }
                }
            });

            if (directory.timelineView != undefined)
            {
                directory.timelineView.drawElements();
            }
        });
    }
});
