const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let history = []; 

io.on('connection', (socket) => {
    socket.emit('history', history);
    socket.on('msg', (data) => {
        history.push(data);
        if(history.length > 30) history.shift();
        io.emit('msg', data);
    });
});

app.get('/', (req, res) => { res.send('Server Active'); });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Live"));
