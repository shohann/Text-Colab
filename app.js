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
                console.log(text);
                client.send(data.toString())
            }
        })
    })
})


// app.listen(3001, () => {
//     console.log('Listening on port 3001');
// })