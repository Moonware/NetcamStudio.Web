directory.LibraryItems = Backbone.Model.extend({

    defaults: {
    },

    initialize:function () {
    }

});

directory.LibraryItemsCollection = Backbone.Collection.extend({

    model: directory.LibraryItems,

    initialize:function () {

        this.on('sync', function(){
            console.log('Library Items collection received');

            if (directory.libraryView != undefined)
            {
                directory.libraryView.drawElements();
            }
        });
    }
});
