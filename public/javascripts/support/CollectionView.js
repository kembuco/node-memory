CollectionView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, "add", "addAll", "remove", "refresh", "itemRendered");
        
        this.collection.bind("add", this.add);
        this.collection.bind("remove", this.remove);
        this.collection.bind("refresh", this.refresh);
    },
    
    add: function(model) {
        var el = new (this.itemView)({model: model}).render().el;
        
        el.id = model.cid;
        
        $(this.el).append(el);
    },
    
    addAll: function(collection) {
        collection.each(this.add);
    },
    
    remove: function(model) {
        this.$("#" + model.cid).remove();
    },
    
    refresh: function(collection) {
        $(this.el).html("");
        
        this.addAll(collection);
    }
});