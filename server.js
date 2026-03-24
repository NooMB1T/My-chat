const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: "*" }
});

app.use(express.static(__dirname));

let messages = []; // Сховище Глобального чату
let users = {};

io.on('connection', (socket) => {
    // Вхід у систему
    socket.on('join', (data) => {
        socket.username = data.u;
        users[data.u] = { id: socket.id, av: data.av, ph: data.ph };
        io.emit('ul', users); // Оновити список онлайн
        socket.emit('hs', messages); // Віддати історію чату
    });

    // Обробка повідомлень (текст + фото)
    socket.on('msg', (m) => {
        const fullMsg = { 
            u: m.u, 
            t: m.t, 
            img: m.img || null, 
            id: Date.now(), 
            re: [] 
        };
        messages.push(fullMsg);
        if (messages.length > 100) messages.shift();
        io.emit('msg', fullMsg);
    });

    // Реакції
    socket.on('add_re', (data) => {
        io.emit('update_re', data);
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            delete users[socket.username];
            io.emit('ul', users);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`DoveGram Core on port ${PORT}`));
