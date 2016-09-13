import animate;
import ui.View;
import ui.ImageView;
import ui.TextView;
import ui.resource.Image as Image;
import src.Gem as Gem;

var x_offset = 32, //variable to set matrix of gem X's offset
	y_offset = 415, //variable to set matrix of gem Y's offset
	gem_margin = 5, //variable to set margin between gems
	board_size = 7; //variable to set how many gems exists inside. (7x7)

exports = Class(ui.ImageView, function (supr) {
	this.init = function (opts) {
		opts = merge(opts, {
			superview: this,
			x: 0,
			y: 0,
			image: "resources/images/ui/background.png"
		});

		supr(this, 'init', [opts]);

		this.build();
	};

	this.build = function () {
		var game = this;

		this.on('app:start', function() {
			startGame.call(game);
		});

		this.buildSubviews(); //To initialize the headers, scoreboard and clock and select cursor

		this._gems = this.buildGemMatrix(); //The matrix of gems that will be showed

		this.interval = 100; //Tick interval, to show "real-time" gaming

		this.selected_gem = null; //Variable to show a select cursor in a gem
		this.input_disabled = false; //Variable to prevent a move while gem streaking

		bindGemEvents.call(this);
	};

	this.buildSubviews = function() {

		this.header = new ui.ImageView({
	      	superview: this,
	        x: 125,
	        y: 1100,
	        image: "resources/images/ui/header.png",
	        width: 500,
	        height: 230
	    });

		this._clock = new ui.TextView({
			superview: this,
			x: 165,
			y: 1200,
			width: 420,
			height: 100,
			size: 65,
			horizontalAlign: "center",
			wrap: false,
			color: '#FFFFEE'
		});

		this.scoreheader = new ui.ImageView({
	      	superview: this,
	        x: 200,
	        y: 0,
	        image: "resources/images/ui/header.png",
	        width: 350,
	        height: 230
	    });

		this._score = new ui.TextView({
			superview: this,
			x: 200,
			y: 50,
			width: 350,
			height: 200,
			size: 65,
			horizontalAlign: "center",
			wrap: false,
			color: '#FFFFEE'
		});

		this.selected_view = new ui.ImageView({
			superview: this,
			image: "resources/images/cursors/selected.png",
			x: 0,
			y: 0,
			width: 101,
			height: 101,
			visible: false
		});
	};

	this.buildGemMatrix = function() {
		var gems = [];

		for (var row = 0; row < board_size; row++) {
			gems.push([]); //pushing a gem view into the matrix by row, and then by column

			for (var col = 0; col < board_size; col++) {
				//method to prevent streaks longer than 2 being generated on initialization

				var forbidden_types = [];

				if (col - 2 > -1) {
					if (gems[row][col - 1].gemtype === gems[row][col - 2].gemtype) {
						forbidden_types.push(gems[row][col - 1].gemtype);
					}
				}

				if (row - 2 > -1) {
					if (gems[row - 1][col].gemtype === gems[row - 2][col].gemtype) {
						forbidden_types.push(gems[row - 1][col].gemtype);
					}
				}

				//this verifies adjacents-directed gems (i.e. the next direct gem close to current one)
				//next to current gem and assure that they aren't equal to current gem.

				var gem = new Gem({ row: row, col: col, forbidden_types: forbidden_types });

				gem.style.y = y_offset + row * (gem.style.height + gem_margin);
				gem.style.x = x_offset + col * (gem.style.width + gem_margin);

				//this adjusts where to put the gem in user interface

				this.addSubview(gem); //adding the gem to interface

				gems[row].push(gem); //adding gem to matrix of gems to detect moves to clear gems
			}
		}

		return gems;
	};
});

function startGame() {
	var game = this;

	this.score = 0;
	this.score_multiplier = 1;
	this.cleared_gems = 0;

	this.game_length = 120000;
	this.game_time = this.game_length;

	this.game_timer = setInterval(function() {
		tick.call(game);
	}, this.interval);

}

//fucntion that verifies end of game each 0.1 second
function tick() {
	if (this.game_time > 0) {
		var time_ratio = this.game_time / this.game_length;

		if (time_ratio <= .125) {
			this._clock.updateOpts({ color: 'red' });
			this._clock.updateOpts({ size: 80 });
		} else {
			this._clock.updateOpts({ color: 'white' });
			this._clock.updateOpts({ size: 65 });
		}

		this._clock.setText("TIME REMAINING: " + Math.ceil(this.game_time/1000).toString());
		this.game_time -= this.interval;

		this._score.setText(this.score);
	} else {
		endGame.call(this);
	}
}

function endGame() {
	clearInterval(this.game_timer);
	this.game_time = this.game_length;
	this.emit('gamescreen:end');
}

function bindGemEvents() {
	var that = this;

	this._gems.forEach(function(row) {
		row.forEach(function(gem) {
			gem.on('gem:clicked', function() {
				handleGemClick.call(that, gem);
			});
		});
	});
}

function bindSomeGemEvents(gems_to_bind) {
	var that = this;

	gems_to_bind.forEach(function(gem) {
		gem.on('gem:clicked', function() {
			handleGemClick.call(that, gem);
		});
	});
}
//verifies what to do when a gem is selected. If there already is a gem select,
//see if adjacent or not and if it will be valid move or not.
function handleGemClick(gem) {
	var game = this;

	if (this.input_disabled === false) {
		if (this.selected_gem !== null || !this.selected_view.style.visible === false) {
			diff_y = gem.row - this.selected_gem.row,
			diff_x = gem.col - this.selected_gem.col;

			if (gem === this.selected_gem) {
				deselectGem.call(this);
			} else if (Math.abs(diff_x) > 1 || Math.abs(diff_y) > 1 || (Math.abs(diff_x) === 1 && Math.abs(diff_y) === 1)) {
				selectGem.call(this, gem);
			} else {
				attemptMove.call(this, gem);
			}

		} else {
			selectGem.call(this, gem);
		}
	}
}
//user interaction when deselecting a gem
function deselectGem() {
	this.selected_gem = null;
	this.selected_view.style.visible = false;
}
//user interaction when selecting a gem
function selectGem(gem) {
	this.selected_gem = gem;
	this.selected_view.style.y = y_offset + this.selected_gem.row * (this.selected_gem.style.height + gem_margin) - 4;
	this.selected_view.style.x = x_offset + this.selected_gem.col * (this.selected_gem.style.width + gem_margin) - 4;
	this.selected_view.style.visible = true;
}
//function to verify a move attempt. If it's valid (they are adjacent gems), validate the move and proceed to
//clean the gems paired and look for future gems chain;
//if not, deselect gem
function attemptMove(gem) {
	var game = this;

	var move_y = gem.row - this.selected_gem.row,
		move_x = gem.col - this.selected_gem.col,
		move = [move_y, move_x];

	var valid_move = validMove.call(this, this.selected_gem, move);
	if (valid_move === false) { valid_move = validMove.call(this, gem, [-move_y, -move_x]); }

	if (valid_move === true) {
		performMove.call(this, this.selected_gem, gem);
		var gems_to_destroy = findGemStreaks.call(this);
		clearGems.call(this, gems_to_destroy);

		this.input_disabled = true; //disables a user input to clear gems
		this.selected_gem = null;
		this.selected_view.style.visible = false;
	} else {
		this.selected_gem = null;
		this.selected_view.style.visible = false;
	}
}
//finding gem streaks: row search first, then columns to return a coordinate [x,y] to function clearGems
function findGemStreaks() {
	var gems = this._gems;
	var gems_to_destroy = [];
	var row_index = 0;

	//search through rows, grabbing horizontal streaks 3 or longer
	gems.forEach(function(row) {
		var col_index = 0;
		var consecutive = 0;

		row.forEach(function(gem) {
			if (col_index > 0) {
				if (gem.gemtype === gems[row_index][col_index - 1].gemtype) {
					consecutive++;

					if (consecutive === 2) {
						gems_to_destroy.push(gems[row_index][col_index - 1]);
						gems_to_destroy.push(gems[row_index][col_index - 2]);
						gems_to_destroy.push(gem);
					} else if (consecutive > 2) {
						gems_to_destroy.push(gem);
					}
				} else {
					consecutive = 0;
				}
			}
			col_index++;
		});

		row_index++;
	});

	//search through columns, grabbing vertical streaks 3 or longer
	//(and only including gems not already added above)
	for (var col = 0; col < board_size; col++) {
		var consecutive = 0;

		for (var row = 0; row < board_size; row++) {
			var gem = gems[row][col];

			if (row > 0) {
				if (gem.gemtype === gems[row - 1][col].gemtype) {
					consecutive++;

					if (consecutive === 2) {
						if (gems_to_destroy.indexOf(gems[row - 1][col]) === -1) {
							gems_to_destroy.push(gems[row - 1][col]);
						}
						if (gems_to_destroy.indexOf(gems[row - 2][col]) === -1) {
							gems_to_destroy.push(gems[row - 2][col]);
						}
						if (gems_to_destroy.indexOf(gem) === -1) {
							gems_to_destroy.push(gem);
						}
					} else if (consecutive > 2) {
						if (gems_to_destroy.indexOf(gem) === -1) {
							gems_to_destroy.push(gem);
						}
					}
				} else {
					consecutive = 0;
				}
			}
		}
	}

	return gems_to_destroy;
}

function clearGems(gems_to_destroy) {
	var game = this;

	this.cleared_gems += gems_to_destroy.length;
	//adds a point system when gem streaking
	if (gems_to_destroy.length === 3) {
		this.score_multiplier = 1;
	} else if (gems_to_destroy.length > 3) {
		this.score_multiplier += gems_to_destroy.length - 3;
	}

	var points = this.score_multiplier * gems_to_destroy.length * 20;
	this.score += points;

	if (points !== 0) {
		var points_view = new ui.TextView({
			superview: this,
			x: 200,
			y: 300,
			width: 350,
			height: 150,
			horizontalAlign: "center",
			size: points,
			text: "COMBO! +" + points,
			color: "white"
		});

		this.addSubview(points_view);

		var points_animation = setInterval(function() {
			points_view.style.y -= 4.5;
		}, 50);

		setTimeout(function() {
			game.removeSubview(points_view);
			clearInterval(points_animation);
		}, 1000);
	}
	//verify the gems to remove and adds a little animation to clear them.
	if (gems_to_destroy.length > 0) {
		var game = this;
		var num_timers_finished = 0;

		gems_to_destroy.forEach(function(gem) {
			var ticker = 0;

			var shrink_animation = setInterval(function() {

				ticker++;

				if (ticker < 5) {
					gem.gem.setImage("resources/images/particles/"+ gem.gemtype+"_gleam.png");
				} else if (ticker < 10) {
					gem.gem.setImage("resources/images/particles/"+ gem.gemtype+"_round.png");
				} else {
					game._gems[gem.row][gem.col] = null;
					game.removeSubview(gem);

					num_timers_finished++;
					clearInterval(shrink_animation);
				}
			}, 20)
		});

		var animation_wait_timer = setInterval(function() {
			if (num_timers_finished === gems_to_destroy.length) {
				fillHole.call(game);
				clearInterval(animation_wait_timer);
			}
		}, 30);
	} else {
		//when finishing to remove gems, enable user input again
		this.input_disabled = false;
	}
}
//when removing a gem, there will be a hole, both in user interface and inside gem matrix
//that will be filled by falling gems from top.
function fillHole() {
	var game = this;
	var gems = this._gems;

	//From second-to-bottom until the top row, look for holes beneath created by gem remove.
	//If there is a hole, step down a gem column until finding another gem beneath.
	for (var row = board_size - 2; row > -1; row--) {
		for (var col = 0; col < board_size; col++) {
			if (gems[row][col] !== null) {
				var gem = gems[row][col];

				var step_down = 1;

				while (row + step_down < board_size && gems[row + step_down][col] === null) {
					fallExistingGem.call(game, gem, [row + step_down, col]);

					step_down++;
				}
			}
		}
	}

	dropNew.call(this);
}
//With holes on the top of stepped down columns, we proceed to fill the top of these stepped down columns
function dropNew() {
	var game = this;
	var gems = this._gems;
	var new_gems = [];

	//From the first column until the last one, search for a empty space with a gem beneath created by a stepped down column to fill holes.
	//If there is an empty space, fill them from this space until the top of the column
	//(because above this space, there will be empty spaces too) with new gems

	for (var col = 0; col < board_size; col++) {
		var num_gems;

		for (var row = board_size - 1; row > -1; row--) {
			if (gems[row][col] === null) {
				num_gems = row + 1;

				for (var i = row; i > -1; i--) {
					var gem = new Gem({ row: i, col: col, forbidden_types: [] });

					gem.style.y = y_offset + i * (gem.style.height + gem_margin);
					gem.style.x = x_offset + col * (gem.style.width + gem_margin);

					gems[i][col] = gem;
					new_gems.push(gem);

					game.addSubview(gem);
					//This will animate a Gem falling and placing on top of the stepped down column.
					gem.fallIn(y_offset + i * (gem.style.height + gem_margin));
				}
			}
		}
	}

	bindSomeGemEvents.call(game, new_gems);

	//This timeout will loop until there are no remaining streaks.
	//It serves to wait while replacing cleared gems to then continue the gem streaking.
	setTimeout(function() {
		clearGems.call(game, findGemStreaks.call(game));
	}, 250);
}
//Swapping the gems, just like a function swap() used in algorithms, to start a move.
function performMove(selected_gem, affected_gem) {
	this._gems[selected_gem.row][selected_gem.col] = affected_gem;
	this._gems[affected_gem.row][affected_gem.col] = selected_gem;

	var temp_row = selected_gem.row;
	var temp_col = selected_gem.col;
	var temp_y = selected_gem.style.y;
	var temp_x = selected_gem.style.x;

	selected_gem.row = affected_gem.row;
	selected_gem.col = affected_gem.col;
	selected_gem.style.y = affected_gem.style.y;
	selected_gem.style.x = affected_gem.style.x;

	affected_gem.row = temp_row;
	affected_gem.col = temp_col;
	affected_gem.style.y = temp_y;
	affected_gem.style.x = temp_x;
}
//Used to move a existing gem, to fill the hole.
function fallExistingGem(gem, destination) {
	this._gems[gem.row][gem.col] = null;
	this._gems[destination[0]][destination[1]] = gem;
	gem.row = destination[0];
	gem.col = destination[1];

	var diff_y = y_offset + gem.row * (gem.style.height + gem_margin) - gem.style.y;

	gem.style.y = y_offset + gem.row * (gem.style.height + gem_margin);
	gem.style.x = x_offset + gem.col * (gem.style.width + gem_margin);

	gem.fallIn(diff_y);
}
//Function to validate a move, verifying if there are at least a triplet of gems.
function validMove(gem, move) {
	var valid_gems = this._gems;
	var starting_row = gem.row; //starting row of gem after move
	var starting_column = gem.col; //starting col of gem after move
	var typeOfGem = gem.gemtype;
	//move = [[-x||0],[-y||0]]. If they are 0, we know if they are horizontally or vertically adjacents.
	if (move[1] === 0) {
		//vertical move
		if (starting_row + 3 * move[0] < board_size && starting_row + 3 * move[0] > -1) {
			if (typeOfGem === valid_gems[starting_row + 2 * move[0]][starting_column].gemtype && typeOfGem === valid_gems[starting_row + 3 * move[0]][starting_column].gemtype) {
				return true;
			}
		}
		if (starting_column + 2 < board_size) {
			if (typeOfGem === valid_gems[starting_row + move[0]][starting_column + 1].gemtype && typeOfGem === valid_gems[starting_row + move[0]][starting_column + 2].gemtype) {
				return true;
			}
		}
		if (starting_column - 2 > -1) {
			if (typeOfGem === valid_gems[starting_row + move[0]][starting_column - 1].gemtype && typeOfGem === valid_gems[starting_row + move[0]][starting_column - 2].gemtype) {
				return true;
			}
		}
		if (starting_column + 1 < board_size && starting_column - 1 > -1) {
			if (typeOfGem === valid_gems[starting_row + move[0]][starting_column - 1].gemtype && typeOfGem === valid_gems[starting_row + move[0]][starting_column + 1].gemtype) {
				return true;
			}
		}
		return false;
	} else {
		//horizontal move
		if (starting_column + 3 * move[1] < board_size && starting_column + 3 * move[1] > -1) {
			if (typeOfGem === valid_gems[starting_row][starting_column + 2 * move[1]].gemtype && typeOfGem === valid_gems[starting_row][starting_column + 3 * move[1]].gemtype) {
				return true;
			}
		}
		if (starting_row + 2 < board_size) {
			if (typeOfGem === valid_gems[starting_row + 1][starting_column + move[1]].gemtype && typeOfGem === valid_gems[starting_row + 2][starting_column + move[1]].gemtype) {
				return true;
			}
		}
		if (starting_row - 2 > -1) {
			if (typeOfGem === valid_gems[starting_row - 1][starting_column + move[1]].gemtype && typeOfGem === valid_gems[starting_row - 2][starting_column + move[1]].gemtype) {
				return true;
			}
		}
		if (starting_row + 1 < board_size && starting_row - 1 > -1) {
			if (typeOfGem === valid_gems[starting_row - 1][starting_column + move[1]].gemtype && typeOfGem === valid_gems[starting_row + 1][starting_column + move[1]].gemtype) {
				return true;
			}
		}
		return false;
	}
}