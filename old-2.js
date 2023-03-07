const express = require('express');
const WebSocket = require('ws');
const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

const server = app.listen(3001, () => {
    console.log('Listening on port 3001');
});

const wss =  new WebSocket.Server({
    server: server
});

const maxClients = 5;
let rooms = {};

function genKey(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length));
    }
    return result;
}

function create(params, ws) {
  // console.log(params);
  const room = genKey(5);
  console.log(`roomID: ${room}`);
  rooms[room] = [ws];
  ws["room"] = room;
  
  
  // console.log(rooms);
  // console.log(wss.client.room);
  generalInformation(ws);
}

function join(params, ws) {
  // console.log(params);
  const room = params.code;
  // console.log(room);
  // console.log(rooms);
  if (!Object.keys(rooms).includes(room)) {
    console.warn(`Room ${room} does not exist!`);
    return;
  }

  if (rooms[room].length >= maxClients) {
    console.warn(`Room ${room} is full!`);
    return;
  }

  rooms[room].push(ws);
  // console.log(`Length: after join`);
  // console.log(rooms);
  // console.log('Length end');
  ws["room"] = room;
  
  console.log(rooms);

  generalInformation(ws);
}


function leave(params, ws) {
  console.log(params);
}

function generalInformation(ws) {
  // console.log('GN');
  // console.log(rooms);
  let obj;
  if (ws["room"] === undefined){
      obj = {
          "type": "info",
          "params": {
            "room": ws["room"],
            "no-clients": rooms[ws["room"]].length,
          }
        }
  } else {
      obj = {
          "type": "info",
          "params": {
            "room": "no room",
          }
        }
  }
  ws.send(JSON.stringify(obj));
}

wss.on('connection', function(ws) {
  console.log(wss.clients.size);
    ws.on('message', function(data) {

        const obj = JSON.parse(data.toString());
        const type = obj.type;
        const params = obj.params;

        if (type === "create") {
            console.log('create');
            create(params, ws)
        } else if (type === "join") {
            console.log('joined');
            join(params, ws);
        } else {
              console.log('invalid');
              leave(params, ws) // why?
        }

        // console.log(wss.clients.size);
        // wss.clients.forEach(function each(client) {
        //     // broadcast
        //     // filter option -> has
        //     // && client !== ws
        //     if (client.readyState === WebSocket.OPEN ) {
        //         // console.log(data.toString());
        //         client.send('1'); // echo back

        //     }
        // });


    });
});

// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta http-equiv="X-UA-Compatible" content="IE=edge">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Text Colab</title>
// </head>
// <body>
//     <h1>Text Colab</h1>

//     <div id="messages"></div>
//     <input id="message" type="text">
//     <button id="send">Send Message</button>

//     <br>
//     <br>
//     <br>

//     <button id="create" >Create</button>
//     <br>
//     <br>
//     <input type="text" name="room-code" id="room-code">
//     <button id="join" >Join</button>
//     <br>
//     <br>
//     <button id="leave">Leave</button>

// </body>
// </html>

// <script>
//     const url = `ws://localhost:3001`;
//     const server = new WebSocket(url); //websocket server

//     ////////////////////////Other/////
//     const createButton = document.getElementById('create');
//     const joinButton = document.getElementById('join');
//     const leaveButton = document.getElementById('leave');

//     createButton.addEventListener('click', function (e) {
//         server.send('{ "type": "create" }');
//         // console.log('created');
//     });

//     joinButton.addEventListener('click', function (e) {
//         const code = document.getElementById("room-code").value;
//         const obj = { "type": "join" , "params": { "code": code }}
//         server.send(JSON.stringify(obj));
//         // console.log('joined');
        
//     });

//     leaveButton.addEventListener('click', function (e) {
//         server.send('{ "type": "leave" }');
//         console.log('leave');
//     });





//     /////////////////////////////////

//     const message = document.getElementById('messages');
//     const input = document.getElementById('message');
//     const button = document.getElementById('send');

//     button.disabled = true;
//     button.addEventListener('click', sendMessage, false);

//     server.onopen = function() {
//         button.disabled = false
//     }

//     server.onmessage = function(event) {
//         const { data } = event;
//         console.log(JSON.parse(data));
//         // generateMessageEntry(data, 'Server');

//     }

//     function generateMessageEntry(msg, type) {
//         const newMessage = document.createElement('div');
//         newMessage.innerText = `${type} says ${msg}`;
//         message.appendChild(newMessage)
//     }

//     function sendMessage() {
//         const text = input.value;
//         generateMessageEntry(text, 'Client');
//         server.send(text)
//     }
// </script>