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

let text = '';

const server = app.listen(3001, () => {
    console.log('Listening on port 3001');
});

const wss =  new WebSocket.Server({
    server: server
});

wss.on('connection', function(ws) {
    ws.on('message', function(data) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                text = text.concat(data.toString())
                client.send(data.toString())
            }
        })
    })
})


// app.listen(3001, () => {
//     console.log('Listening on port 3001');
// })


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


// </body>
// </html>

// <script>
//     const url = `ws://localhost:3001`;
//     const server = new WebSocket(url);

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
//         generateMessageEntry(data, 'Server');

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