var CardView = Backbone.View.extend({
    className: "card",
    
    events: {
        "click": "flip"
    },
    
    initialize: function() {
        _.bindAll(this, "render", "handleMatch");
        
        this.model.bind("change", this.render);
        this.model.bind("change:matched", this.handleMatch);
    },
    
    flip: function() {
        if (!this.model.get("matched") && !this.model.get("flipped") && !this.model.collection.frozen) {
            this.model.set({flipped: true});
        }
    },
    
    handleMatch: function(model, matched) {
        if (matched) {
            $(this.el).addClass("matched");    
        }
    },
    
    render: function() {
        $(this.el).html(ich.card(this.model.toJSON()));
        
        return this;
    }
});