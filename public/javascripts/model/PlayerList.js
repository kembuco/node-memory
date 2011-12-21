if (typeof require !== "undefined") { Backbone = require("../backbone"); Player = require("./Player").Player; }
var PlayerList = Backbone.Collection.extend({
    model: Player,
    
    allBut: function(id) {
        return this.select(function(player) { return player.get("sessionId") != id; });
    },
    
    getActivePlayer: function() {
        if (!this.activePlayer) {
            this.activePlayer = this.find(function(player){ return player.get("active"); });
        }
        return this.activePlayer;
    },
    
    switchActivePlayer: function() {
        var active = this.getActivePlayer(),
            next = (this.last() == active ? this.first() : this.at(this.indexOf(active) + 1));
            
        active.set({active: false});
        this.activePlayer = next.set({active: true});
        
        this.trigger("change:switched", next, active);
    },
    
    remove: function(players, options) {
        if (!_.isArray(players) && players.get("active")) {
            this.switchActivePlayer();
        }
        
        Backbone.Collection.prototype.remove.apply(this, arguments);
    }
});
if (typeof exports !== "undefined") { exports.PlayerList = PlayerList; }