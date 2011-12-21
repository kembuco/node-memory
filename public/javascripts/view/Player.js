var PlayerView = Backbone.View.extend({
    className: "player",
    
    initialize: function() {
        _.bindAll(this, "render");
        
        this.model.bind("change", this.render);
    },
    
    render: function() {
        var player = this.model,
            html = ich.player(player.toJSON());
        
        $(this.el).html(html).toggleClass("active", player.get("active"));
        
        return this;
    }
});