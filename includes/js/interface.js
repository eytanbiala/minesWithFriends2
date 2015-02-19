function gameOver(guestid) {
    alert("Game Over! Congratulation to Guest " + guestid);
}
function dead() {
    alert("You're Dead!");
}

function move(square) {
	var div_tag = document.createElement('div');
	var spliter = square.id.split(':');
	var y = spliter[0];
	var x = spliter[1];
	var json = JSON.stringify({"xCoord":x, "yCoord":y, "userID":id});
    socket.emit('move', json);
	console.log(id);
	/*var squareAT = layout["board"][y][x];
	if (squareAT["hadMine"] == true) {
		square.innerHTML = "*";
	} else if (squareAT["numMines"] != 0) {
		square.innerHTML = squareAT["numMines"];
	} else {
		square.className = "tiny button secondary grey shiftup";
	}*/
}

function update(coordy, coordx, user, hasMine, numMine) {
	var coordinate = coordy + ":" + coordx;
	var square = document.getElementById(coordinate);
	var userbox = document.getElementById(user.id);
    console.log(id);
    console.log(user);
	if (hasMine) {
		square.innerHTML = "*";
        if(user.id == id){
            dead();
        }
	} else {
		square.innerHTML = numMine;
        console.log(userbox);
	    userbox.firstChild.innerHTML = "Guest: " + user.id + " Points: " + user.points;
	}
	square.className = "tiny button secondary grey shiftup";
}

function appendUser(user) {
    console.log(user);
	var div = document.createElement("div");
	var p = document.createElement("p");
	div.id = user.id;
	div.className = "section";
	p.className = "title";
	p.innerHTML = "Guest: " + user.id + " Points: " + user.points;
	div.appendChild(p);
	document.getElementById("users").appendChild(div);
}

function updateUser(users) {
    console.log(users);
	var i = 0;
	for (; i < users.length; i++) {
		appendUser(users[i]);
	}
}

function createBoard(json) {
    //console.log(json);
    layout = JSON.parse(json);
	var users = layout["userList"];
	var length = layout["boardSize"];
    if(users.length > 0) {	
        updateUser(users);
    }
	for (var row = 0; row < length; row++) {
    	var array = document.createElement("div");
    	array.className = "large-12 columns";
    	for (var column = 0; column < length; column++) {
	    	var square = document.createElement("a");
	    	square.className = "tiny button secondary shiftup";
	    	square.id = row+":"+column;
	    	square.innerHTML = "&nbsp;";
	    	var squareAT = layout["board"][row][column];
	    	if (squareAT["isOpen"]) {
	    		if (squareAT["hadMine"] == true) {
	    			square.innerHTML = "*";
	    		} else if (squareAT["numMines"] != 0) {
    				square.innerHTML = layout["board"][row][column]["numMines"];
    			} else {
                    square.innerHTML = 0;
                }

				square.className = "tiny button secondary grey shiftup";
		    }
		    square.onclick = function() { move(this); }
	    	array.appendChild(square);
	    }
    	document.getElementById("minesweeper").appendChild(array);
    }
	
}
