const express = require('express'), http = require('http'), { Server } = require('socket.io');
const app = express(), server = http.createServer(app), io = new Server(server);

app.use(express.static(__dirname));
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
server.listen(3000, () => console.log('DoveGram Live!'));
