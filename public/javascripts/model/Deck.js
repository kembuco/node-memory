if (typeof require !== "undefined") { Backbone = require("../backbone"); }
var Deck = Backbone.Collection.extend({
    frozen: false,
    
    comparator: function(card) {
        return card.get("weight");
    },
    
    setFrozen: function(freeze) { this.frozen = freeze; },
    freeze: function() { this.frozen = true; },
    thaw: function() { this.frozen = false; }
});
if (typeof exports !== "undefined") { exports.Deck = Deck; }