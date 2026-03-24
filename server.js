const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Храним последние 20 сообщений в памяти (пока сервер не рестартнет)
let history = []; 

io.on('connection', (socket) => {
    // Сразу отправляем историю новичку
    socket.emit('history', history);

    socket.on('msg', (data) => {
        history.push(data);
        if(history.length > 20) history.shift(); // Лимит истории
        io.emit('msg', data); // Рассылаем всем
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Работаем без БД!"));
