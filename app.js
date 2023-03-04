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


// console.log(rooms);
wss.on('connection', function(ws) {
    
    ws.on('message', function(data) {

        ////
        const obj = JSON.parse(data.toString());
        const type = obj.type;
        const params = obj.params;

        function create(params) {
            // console.log(params);
            const room = genKey(5);
            rooms[room] = [ws];
            ws["room"] = room;
            
            console.log(rooms);
            generalInformation(ws);
        }

        function join(params) {
            // console.log(params);
            const room = params;
            console.log(room);
            if (!Object.keys(rooms).includes(room)) {
              console.warn(`Room ${room} does not exist!`);
              return;
            }
          
            if (rooms[room].length >= maxClients) {
              console.warn(`Room ${room} is full!`);
              return;
            }
          
            rooms[room].push(ws);
            ws["room"] = room;
            
            console.log(rooms.room);

            generalInformation(ws);
        }


        function leave(params) {
            console.log(params);
        }

        function generalInformation(ws) {
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
        ////
    
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                // client.send(data.toString()); // echo back

                if (type === "create") {
                    // console.log('create');
                    create(params)
                } else if (type === "join") {
                    // console.log('joined');
                    join(params);
                } else {
                    console.log('invalid');
                    leave(params) // why?
                }

                // client.send(JSON.stringify(obj));
            }
        });


    });
});

