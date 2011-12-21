(function() {
	var _flipped = new Backbone.Collection(),
        _gameData = new Backbone.Model(),
        _players =  new PlayerList(),
        _deck = new Deck(),
        _initialized = false,
        _socket,
        _gameId,
        _player,
        
        // "Private" functions
        _isaWinner = function() {
            return _players.getActivePlayer().get("score") > (_deck.size() / 4);
        },
        
        _outtaCards = function(tollerance) {
            return _deck.select(function(card) { return !card.get("matched"); }).length == (tollerance || 0);
        },
        
        _activeClient = function() {
            return _player.id == _players.getActivePlayer().id; 
        },
        
        _onInitialized = function(response, playerId) {
            _player = response.you;
            
            _players.refresh(response.game.players);
            _deck.refresh(response.game.deck);
            _deck.setFrozen(!_activeClient());
        },
        
        _handleRemoteFlip = function(model) {
            _deck.get(model).set(model);
        }
        
        _continuePlaying = function(matched) {
            _gameData.set({status: matched ? "You found a match!  Keep going." : "Not a match.  Your turn is over."});
            
            // Wait for a bit before finishing the UI interaction
            _.delay(function() {
                // Set the matched flag on the cards and clear the flipped list
                // Since flipped is just a clone of the real cards we have to update the real card in the deck
                _flipped.each(function(card) {
                    _deck.get(card).set({matched: matched});
                });
                _flipped.refresh();
                
                // Clear status
                _gameData.set({status: ""});
                
                _deck.invoke("set", {flipped: false});
                if (_activeClient()) {
                    _deck.thaw();
                }
            }, 1500);
        },
        
        _handleFlip = function(model, revealed) {
            if (!revealed) { return; }
            
            // Sync with the server
            //console.log(_activeClient())
            if (_activeClient()) {
                _socket.emit("change:flipped", {gameId: _gameId, model: model});
            }
            
            if (_flipped.add(model.clone()).size() == 2) {
                var matched = (model.get("image") == _flipped.at(0).get("image"));
                
                // Freeze the deck so the user cannot continue flipping cards
                _deck.freeze();
                
                // Award user points or switch player
                if (matched) {
                    _players.getActivePlayer().incrementScore();                    
                } else {
                    _players.switchActivePlayer();
                }
                
                // Check to see if the active player just won the game
                if (_outtaCards(2)) {
                    _gameData.set({status: ich.gameOver(_players.getActivePlayer().toJSON())});
                } else if (matched && _isaWinner() && !_gameData.get("hasWinner")) {
                    _gameData.set({status: ich.win(_players.getActivePlayer().toJSON())});
                    
                    _gameData.set({hasWinner: true});
                } else {
                    _continuePlaying(matched);
                }
            }
        },
        
        _restart = function() {
            window.location.reload(true);
        },
        
        _carryOn = function() {
            _continuePlaying(true);
        },
        
        _error = function(message) {
            alert(message);
        };

	Game = Backbone.Controller.extend({
		routes: {
			"/play": "play",
			"/play/:playerId/:gameId": "play"
		},

		play: function(playerId, gameId) {
			if (_initialized) return;

			var container = $("#memory"),
			memory = new MemoryView({collection: _deck}).render(),
			scoreboard = new ScoreboardView({collection: _players}).render(),
			statusbar = new StatusBar({model: _gameData, game: this}).render();

			_gameId = gameId;

			// Render UI elements
			container.append(scoreboard.el);
			container.append(memory.el);
			container.append(statusbar.el);

			// Handle card being flipped over
			_deck.bind("change:flipped", _handleFlip);

			_players.bind("change:switched", function() {
				_deck.setFrozen(!_activeClient());
			});

			// Handle winning scenario
			statusbar.bind("restart", _restart);
			statusbar.bind("continue", _carryOn);
            
            // Setup server interaction
            _socket = io.connect(window.location.protocol + "//" + window.location.host);

            _socket.on("connect", function() {
                _socket.emit("initialize", {playerId: playerId, gameId: gameId});
            });

            _socket.on("initialized", function(data) {
            	data.status == 200 ? _onInitialized(data) : _error(data.message);
            });

            _socket.on("change:flipped", function(data) {
            	_handleRemoteFlip(data.model);
            });

            _socket.on("player:add", function(data) {
            	_players.add(data.model);
            });

            _socket.on("player:remove", function(data) {
            	_players.remove(_players.get(data.model));
            });
            
            _initialized = true;
		}
	});
})();