var MemoryView = CollectionView.extend({
    tag: "div",
    className: "board",
    itemView: CardView,
    
    refresh: function() {
        CollectionView.prototype.refresh.apply(this, arguments);
        
        $(this.el).append(this.make("div", {className: "clear"}));
    }
});