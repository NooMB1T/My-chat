const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" }, maxHttpBufferSize: 1e8 });

app.use(express.static(__dirname));

let history = []; 

io.on('connection', (socket) => {
    socket.on('join', (room) => {
        socket.join(room);
        const roomMsgs = history.filter(m => m.r === room);
        socket.emit('history', roomMsgs);
    });

    socket.on('msg', (data) => {
        history.push(data);
        if(history.length > 100) history.shift();
        io.to(data.r).emit('msg', data); 
    });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'chat.html')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Live"));
