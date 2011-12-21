var StatusBar = Backbone.View.extend({
    className: "status",
    
    events: {
        "click .keepon": "initiateContinue",
        "click .restart": "initiateRestart"
    },
    
    initialize: function() {
        _.bindAll(this, "render");
        
        this.model.bind("change", this.render);
    },
    
    render: function() {
        $(this.el).html(this.model.get("status"));
        
        return this;
    },
    
    initiateRestart: function() {
        this.trigger("restart");
    },
    
    initiateContinue: function() {
        this.trigger("continue");
    }
});