/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , _ = require('./public/javascripts/underscore')._
  , Backbone = require('./public/javascripts/backbone')
  , Player = require("./public/javascripts/model/Player").Player
  , PlayerList = require("./public/javascripts/model/PlayerList").PlayerList
  , Deck = require("./public/javascripts/model/Deck").Deck;

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', routes.index);

// Game state
var games = new Backbone.Collection(),
    players = new PlayerList();
    
// Player "database". Remove when possible.
(function() {
    players.refresh([
        {id: 1, username: "Vasa", score: 0},
        {id: 2, username: "Kevin", score: 0}
    ]);
})();

// Business Logic
var initializeGame = function(socket, playerId, gameId) {
    var game = games.get(gameId),
        player = players.get(playerId).clone(),
        participants;
    
    if (!game) {
        game = new Backbone.Model({
            id: gameId,
            players: new PlayerList(),
            deck: new Deck(generateCards())
        });
        
        games.add(game);
    }
    
    participants = game.get("players");
    if (participants.length < 2) {
        player.set({sessionId: socket.id, active: participants.length == 0});
        player.socket = socket;
        
        // Add player to the game
        participants.add(player);
        
        // Setup player removal for disconnect and add to game
        socket.removeFromGame = function() {
            participants.remove(player);
        };
        
        participants.bind("all", function(event, model) {
            if (_.include(["add", "remove"], event)) {
                socket.emit("player:" + event, {model: model});
            }
        });

        socket.emit("initialized", {status: 200, game: game, you: player});
    } else {
        socket.emit("initialized", {status: 500, message: "Three's a crowd"});    
    }
}

// Creates the "deck".  This can go away when we start using images for the cards.
var generateCards = function() {
    var cards = [];
    
    for(var j = 0; j < 2; j++) {
	    for(var i = 0; i < 8; i++) {
	        cards.push({id: i + 1 + (j == 1 ? 8 : 0), image: String.fromCharCode(i + 65), matched: false, flipped: false, weight: Math.floor(Math.random() * 16)});
	    }
    }

    return cards;
};

var passGameMessage = function(sender, evt, message) {
    var others = games.get(message.gameId).get("players").allBut(sender.id);
    
    if (others.length > 0) {
        _(others).chain().pluck("socket").invoke("emit", evt, message);
    }
};

// Application initialization
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var io = require('socket.io').listen(app);
io.sockets.on('connection', function (socket) {

	socket.on("initialize", function(data) {
		initializeGame(socket, data.playerId, data.gameId);
	});

	socket.on("change:flipped", function(data) {
		passGameMessage(socket, "change:flipped", data);      	
	});

	socket.on('disconnect', function(){
		if (socket.removeFromGame) {
			socket.removeFromGame();
		}
	});
});
