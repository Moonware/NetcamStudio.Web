directory.AdministrationView = Backbone.View.extend({

    events:{
        'change #adminViewGrid': 'onChangeGrid'
    },

    const:{
        CONNECTED_USER: '1',
        SERVER_STATUS: '2'
    },

    render:function () {
        this.$el.html(this.template());

        this.connectedUsersTable = new directory.ConnectedUsersView({model: directory.connectedUsers});
        this.serverStatusTable = new directory.ServerStatusView();

        self = this;

        setTimeout(function()
        {
            // time to render the template
            self.drawElements();
        }, 100);


        return this;
    },

    drawElements: function(){
        var adminContent = $("#adminContent");

        adminContent.empty();
        var mode = $("#adminViewGrid").val();

        //console.log('Rendering admin panel >> ' + mode);

        switch (mode){
            case this.const.CONNECTED_USER:
                adminContent.append(this.connectedUsersTable.render().el);
                break;
            case this.const.SERVER_STATUS:
                adminContent.append(this.serverStatusTable.render().el);
                break;
            default:
                break;
        }
    },

    onChangeGrid: function(event){
        this.drawElements();
    },

    remove: function () {

    }
});