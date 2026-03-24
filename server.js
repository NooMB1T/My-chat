const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" }, maxHttpBufferSize: 1e8 });

const mongoURI = "mongodb+srv://Dove:DoveChatIloveYou@dovechat.si1vone.mongodb.net/chat_db?retryWrites=true&w=majority&appName=DoveChat";
mongoose.connect(mongoURI).then(() => console.log("DB OK")).catch(err => console.log(err));

const Msg = mongoose.model('Msg', { u: String, t: String, c: String, h: String, d: { type: Date, default: Date.now } });

let users = [];

io.on('connection', (socket) => {
    socket.on('join', async (n) => {
        socket.uname = n;
        if(!users.find(u => u.name === n)) users.push({ id: socket.id, name: n });
        io.emit('list', users);
        const h = await Msg.find().sort({d: 1}).limit(50);
        socket.emit('history', h);
    });

    socket.on('msg', async (d) => {
        await new Msg(d).save();
        io.emit('msg', d);
    });

    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit('list', users);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server Live"));
