const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

let messages = [], users = {};

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.username = data.u;
        users[data.u] = { id: socket.id, av: data.av, ph: data.ph };
        io.emit('ul', users);
        socket.emit('hs', messages);
    });

    socket.on('msg', (m) => {
        messages.push(m);
        if (messages.length > 50) messages.shift();
        io.emit('msg', m);
    });

    socket.on('disconnect', () => {
        if (socket.username) { delete users[socket.username]; io.emit('ul', users); }
    });
});

module.exports = server;
