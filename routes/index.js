var routes = {};
var letterPath = '';
// Routes //

routes.home = function(req, res){
	res.render('home', {});
}

routes.GETstart = function(req, res){
	letterPath = '';
	console.log('Letter path reset');
	var id = req.query.s;
	if(!checkID(id)){
		id = getRandomID();
	}
	var maze = getMaze(id);
	res.redirect('/step?s=' + maze.id + '&x=0&y=0');
}

routes.GETstep = function(req, res){
	var id = req.query.s;
	var x = parseInt(req.query.x);
	var y = parseInt(req.query.y); // defaults to 0, 0

	var maze = getMaze(id);

	if (x < 0 || y < 0 || x == undefined || y == undefined || 
		x > maze.maze.length-1 || y > maze.maze.length-1 ||
		maze.maze[y][x] != 0){ // bad input defaults to 0, 0
		x = 0; y = 0; letterPath = '';
	}
	var letter = getEncode(x, y);
	letterPath = letterPath.concat(letter);
	console.log('Letter path:', letterPath);

	var adjacent = getAdjacent(x, y, maze.maze);
	maze.maze[y][x] = 8;

	res.render('step', {
		maze: maze, 
		x: x, 
		y: y, 
		path: letterPath,
		adjacent: adjacent,
		letter: letter,
		end: checkEnd(x, y, maze.maze.length)
	});
}

routes.GETsolve = function(req, res){
	var id = req.query.s;
	console.log('id:', id);
	var maze = getMaze(id);
	var path = findPath(maze.maze);
	res.render('solve', {maze: maze, solution: path});
}

routes.GETcheck = function(req, res){
	var id = req.query.s;
	var guess = req.query.guess;

	if (!checkID(id)){
		res.render('check', {invalidID: true});
	}

	var maze = getMaze(id);

	res.render('check', {
		maze: maze, 
		solution: guess, 
		end: checkEncode(guess[guess.length-1], maze.maze.length)});
}

module.exports = routes;


// Helper functions //
var checkEnd = function(x, y, mazeLength){
	if (x == mazeLength-1 && y == mazeLength-1){
		console.log("End has been reached");
		return true;
	} else {
		return false;
	}
}

var getAdjacent = function(x, y, maze){
	var adjacentPoints = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
	var points = [];
	for (i = 0; i < adjacentPoints.length; i++){
		if (checkAdjacent(x, y, adjacentPoints[i].x, adjacentPoints[i].y, maze)){
			points.push({
				x: adjacentPoints[i].x + x, 
				y: adjacentPoints[i].y + y
			});
		}
	}
	return points;
}

var checkAdjacent = function(origx, origy, x, y, maze){
	var newx = origx + x;
	var newy = origy + y;
	if (newx < 0 || newy < 0 || newx > maze.length-1 || newy > maze.length-1) { // Check bounds
		return false; 
	} else if (maze[newy][newx] == 1) { // Check if step is valid
		return false;
	} else { 
		return true; 
	}
}

var checkStep = function(x, y, maze){
	if (maze[x][y] === 0){ return true; }
	else { return false; }
}


var getMaze = function(id){ // 'validity' is either null or true and is used for GETcheck
	// Beginning is always (0, 0), end is always (maze.length-1, maze.length-1)
	// Mazes are no bigger than 16 * 16

	// TODO: generate random maze 
	// TODO: convert binary id to hex '55F79E3C'
	var validID = checkID(id);
	if (!validID){
		id = '550111101111001111000111100';
	}

	var length = id.length - 2;
	var height = parseInt(id[0], 16); // to int
	var width = parseInt(id[1], 16);

	var maze = [];
	var count = 2;
	for (i = 0; i < height; i++){
		var row = [];
		for (j = 0; j < width; j++){
			row[j] = parseInt(id[count]);
	    	count++;
		}
		maze[i] = row;
	}
	return {id: id, maze: maze};
}


var examples = ['550111101111001111000111100', '770100001010110101011010101101010000100011011100000', '66011000011010001010100010111000111110'];

var getRandomID = function(){
	return examples[Math.floor(Math.random() * examples.length)];
}

var checkID = function(id){
	if (id == undefined || id == null){ //if maze id is invalid
		return false;
	}
	var length = id.length - 2;
	var height = parseInt(id[0], 16); // to int
	var width = parseInt(id[1], 16);
	if (id[2] != '0' || id[id.length-1] != '0' || //if maze doesn't have valid start and end
		height > 16 || width > 16 || length/height !== width){ //if maze is not correct configuration
		return false;
	}
	return true;
}

var findPath = function(maze){
	var PF = require('pathfinding');
	var grid = new PF.Grid(maze);
	var finder = new PF.AStarFinder();
	var path = finder.findPath(0, 0, maze.length-1, maze.length-1, grid); 
	var encode = '';
	for (i = 0; i < path.length; i++){
		encode = encode.concat(getEncode( path[i][0], path[i][1] ));
	}
	return {path: path, encode: encode};
}



var getEncode = function(x, y){
	return enc[y][x];
}

var checkEncode = function(letter, mazeSize){
	// Note: with the way 'enc' currently is, this would possibly return true even if you're not
	// at the end, since different points are encoded the same way
	console.log(enc[mazeSize-1][mazeSize-1]);
	if (enc[mazeSize-1][mazeSize-1] == letter) { return true; }
	else { return false; }
}

// Does this have to be letters?
var enc = [
			['a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e'], 
			['f', 'g', 'h', 'i', 'j',   'f', 'g', 'h', 'i', 'j', 	'f', 'g', 'h', 'i', 'j', 	'f', 'g', 'h', 'i', 'j'], 
			['k', 'l', 'm', 'n', 'o',   'k', 'l', 'm', 'n', 'o', 	'k', 'l', 'm', 'n', 'o',	'k', 'l', 'm', 'n', 'o'], 
			['p', 'q', 'r', 's', 't',   'p', 'q', 'r', 's', 't',	'p', 'q', 'r', 's', 't', 	'p', 'q', 'r', 's', 't'], 
			['u', 'v', 'w', 'x', 'y',   'u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y'],
			
			['a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e'], 
			['f', 'g', 'h', 'i', 'j', 	'f', 'g', 'h', 'i', 'j', 	'f', 'g', 'h', 'i', 'j', 	'f', 'g', 'h', 'i', 'j'], 
			['k', 'l', 'm', 'n', 'o', 	'k', 'l', 'm', 'n', 'o', 	'k', 'l', 'm', 'n', 'o', 	'k', 'l', 'm', 'n', 'o'], 
			['p', 'q', 'r', 's', 't', 	'p', 'q', 'r', 's', 't', 	'p', 'q', 'r', 's', 't', 	'p', 'q', 'r', 's', 't'], 
			['u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y'],
		
			['a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e'], 
			['f', 'g', 'h', 'i', 'j', 	'f', 'g', 'h', 'i', 'j', 	'f', 'g', 'h', 'i', 'j',	'f', 'g', 'h', 'i', 'j'], 
			['k', 'l', 'm', 'n', 'o', 	'k', 'l', 'm', 'n', 'o', 	'k', 'l', 'm', 'n', 'o', 	'k', 'l', 'm', 'n', 'o'], 
			['p', 'q', 'r', 's', 't', 	'p', 'q', 'r', 's', 't', 	'p', 'q', 'r', 's', 't', 	'p', 'q', 'r', 's', 't'], 
			['u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y'],
		
			['a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e', 	'a', 'b', 'c', 'd', 'e'], 
			['f', 'g', 'h', 'i', 'j', 	'f', 'g', 'h', 'i', 'j', 	'f', 'g', 'h', 'i', 'j', 	'f', 'g', 'h', 'i', 'j'], 
			['k', 'l', 'm', 'n', 'o', 	'k', 'l', 'm', 'n', 'o', 	'k', 'l', 'm', 'n', 'o', 	'k', 'l', 'm', 'n', 'o'], 
			['p', 'q', 'r', 's', 't', 	'p', 'q', 'r', 's', 't', 	'p', 'q', 'r', 's', 't', 	'p', 'q', 'r', 's', 't'], 
			['u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y', 	'u', 'v', 'w', 'x', 'y']			
			];	