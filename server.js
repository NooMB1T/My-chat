const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Эта строка заставляет сервер "видеть" твои файлы index.html и chat.html
app.use(express.static(__dirname));

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

// Эта строка говорит серверу: "Когда заходят на сайт, покажи index.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Live"));
