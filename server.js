const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" }, 
    maxHttpBufferSize: 1e8 
});

const mongoURI = "mongodb+srv://Dove:DoveChatIloveYou@dovechat.si1vone.mongodb.net/chat_db?retryWrites=true&w=majority&appName=DoveChat";

mongoose.connect(mongoURI).then(() => console.log("БД Підключена!")).catch(err => console.log(err));

const Msg = mongoose.model('Msg', { u: String, t: String, c: String, h: String, d: { type: Date, default: Date.now } });

let users = [];

io.on('connection', (socket) => {
    socket.on('join', async (name) => {
        socket.uname = name;
        if(!users.find(u => u.name === name)) users.push({ id: socket.id, name });
        io.emit('list', users);
        const history = await Msg.find().sort({d: 1}).limit(50);
        socket.emit('history', history);
    });

    socket.on('msg', async (data) => {
        const newMsg = new Msg(data);
        await newMsg.save();
        io.emit('msg', data);
    });

    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit('list', users);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Сервер запущено на посилання dovechat.onrender.com"));
