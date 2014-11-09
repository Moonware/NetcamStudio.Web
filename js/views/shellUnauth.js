directory.ShellUnauthView = Backbone.View.extend({

    initialize: function () {
    },

    render: function () {
        this.$el.html(this.template());
        return this;
    },

    events: {
    },

    selectMenuItem: function(menuItem) {
        $('.navbar .nav li').removeClass('active');
        if (menuItem) {
            $('.' + menuItem).addClass('active');
        }
    }

});