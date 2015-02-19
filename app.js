var boardSize = 16;
var numMines = 25;
var clickCounter = 0;
var maxClicks = boardSize * boardSize - numMines;
var board;
var users = [];
initBoard();
//var textboxValue = 'default';
var id = 0;
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(80);

app.configure(function() {
  app.use(express.static(__dirname+"/public"));
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.emit('id', ++id);
  var usr = new user(id, true, 0);
  users.push(usr);
  socket.emit('board', JSON.stringify(new boardStat()));
  io.sockets.emit('newuser', JSON.stringify(usr));
  socket.on('move', function(data) {
    var move = checkTile(data);
    if(move != null){
        io.sockets.emit('event', JSON.stringify(move));
    }
  });

  socket.on('disconnect', function() {
  	console.log('Disconnected');
  });
  //socket.emit('news', {text:textboxValue,id:0});
  //socket.on('value', function(data){
    //textboxValue = data.text;
    //io.sockets.emit('news', data);
  //});
});
/*var boardSize = 10;
var numMines = 20;
var board;
var users = new Array();
*/
function user(id, isLive, points){
	this.id = id;
	this.points = points;
	this.isLive = isLive;
}

function tile(hasMine){
	this.hasMine = hasMine;
	this.isOpen = false;
	this.numMines;
}

function boardStat(){
	this.boardSize = boardSize;
	this.board = getOutBoard();
	this.userList = users;
}

function outTile(hadMine, isOpen, numMines){
	this.hadMine = hadMine;
	this.isOpen = isOpen;
	this.numMines = numMines;
}

function getOutBoard(){
	var outBoard = new Array(boardSize);
	for(var i = 0; i < boardSize; i++){
		outBoard[i] = new Array(boardSize);
		for(var j = 0; j < boardSize; j++){
			var t = board[i][j];
			if(t.isOpen){
				outBoard[i][j] = new outTile(t.hasMine, true, t.numMines);
			}else{
				outBoard[i][j] = new outTile(false, false, 0);
			}
		}
	}
	return outBoard;
}

function createBoard(){
	board = new Array(boardSize);
	for(var i = 0; i < boardSize; i++){
		board[i] = new Array(boardSize);
		for(var j = 0; j < boardSize; j++){
			board[i][j] = new tile(false);
		}
	}
}

function tileEvent(user, hasMine, i, j, numMines){
	this.yCoord = i;
	this.xCoord = j;
	this.user = user;
	this.hasMine = hasMine;
	this.numMines = numMines;
}

function checkTile(data){
    var p = JSON.parse(data);
    var i = p.yCoord;
    var j = p.xCoord;
    var userId = p.userID;
    var user;
    for(var n = 0;n<users.length;n++){
        if(users[n].id == userId){
            user = users[n];
        }
    }

	if(user.isLive){
		if(i >= 0 && i < boardSize && j >= 0 && j < boardSize){
			if(!board[i][j].isOpen){
				var tile = new tileEvent(user, false, i, j, 0);
                //t = {yCoord:i, xCoord:j, user:user.id, hasMine:false, numMines:0};
				if(board[i][j].hasMine){
					tile.hasMine = true;
					user.isLive = false
				}else{
                    clickCounter++;
					tile.hasMine = false;
                    tile.numMines = board[i][j].numMines;
					user.points++;
                    if(clickCounter == maxClicks){
                        gameOver();
                    }
				}
				board[i][j].isOpen = true;
				return tile;
			}else return new tileEvent(user, board[i][j].hasMine, i, j, board[i][j].numMines);
		}
		else return null;
	}else return null;	
}

function gameOver(){
    var winnerScore = 0;
    var winnerId;
    for(var i = 0; i < users.length; i++)
    {
        if(users[i].points > winnerScore)
        {
            winnerScore = users[i].points;
            winnerId = users[i].id;
        }
    }
    io.sockets.emit('gameover', JSON.stringify(winnerId));
}

function populateBoard(){
	var p = 0;
	while(p < numMines){
		var i = Math.floor(Math.random()*boardSize);
		var j = Math.floor(Math.random()*boardSize);
		//document.getElementById('hello').innerHTML= i;
		//document.getElementById("hello").innerHTML += j;
		//document.getElementById("hello").innerHTML += '<br>';
		if(board[i][j].hasMine == false){
			board[i][j].hasMine = true;
			p++;
		}
	}
}

function getMineVals(){
	for(var i = 0; i < boardSize; i++){
		for(var j = 0; j < boardSize; j++){
			var numMines = 0;
			for(var k = -1; k <= 1; k++){
				for(var p = -1; p <= 1; p++){
					if((k + i) >= 0 && (k + i) < boardSize && (p + j) >= 0 && (p + j) < boardSize){
						if(board[i+k][j+p].hasMine){
							numMines++;
						}
					}
				}
			}
			board[i][j].numMines = numMines;
		}
	}
}

function initBoard(){
	createBoard();
	populateBoard();
	getMineVals();
}

function getBoard(){
	
	var boardOut = '';

	for(var i = 0; i < boardSize; i++){
		for(var j = 0; j < boardSize; j++){
			boardOut += (board[i][j].hasMine ? '_' : board[i][j].numMines);
		}
		boardOut += "<br>";
	}
	bs = new boardStat();
	return JSON.stringify(bs);
	//return boardOut;
}
