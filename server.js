const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" }, maxHttpBufferSize: 1e8 });

app.use(express.static(__dirname));

let history = []; 
let users = {}; 

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.username = data.u;
        users[socket.id] = data.u;
        socket.join('global');
        io.emit('userList', Object.values(users));
        socket.emit('history', history);
    });

    // Отримання повідомлення
    socket.on('msg', (data) => {
        data.id = Date.now().toString(); // Унікальний ID
        data.r = { '👍':0, '❤️':0, '😂':0 }; // Реакції
        history.push(data);
        if(history.length > 100) history.shift();
        io.emit('msg', data); 
    });

    // Хтось друкує
    socket.on('typing', (isTyping) => {
        socket.broadcast.emit('typing', { u: socket.username, isTyping });
    });

    // Видалення повідомлення
    socket.on('del', (id) => {
        history = history.filter(m => m.id !== id);
        io.emit('del', id);
    });

    // Реакції
    socket.on('react', (data) => {
        const msg = history.find(m => m.id === data.id);
        if(msg) {
            msg.r[data.emoji]++;
            io.emit('updateMsg', msg);
        }
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('userList', Object.values(users));
    });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Live"));
