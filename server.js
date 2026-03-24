const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Указываем серверу брать статические файлы из текущей папки
app.use(express.static(path.join(__dirname, '.')));

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

// Маршрут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Маршрут для чата (на всякий случай)
app.get('/chat.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'chat.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Live"));
