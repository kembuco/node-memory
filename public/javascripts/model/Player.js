if (typeof require !== "undefined") { Backbone = require("../backbone"); }
var Player = Backbone.Model.extend({
    incrementScore: function(score) {
        this.set({score: (this.get("score") || 0) + (score || 1)});    
    }
});
if (typeof exports !== "undefined") { exports.Player = Player; }