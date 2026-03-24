const e = require('express'), h = require('http'), { Server: S } = require('socket.io'), p = require('path');
const a = e(), s = h.createServer(a), o = new S(s, { cors: { origin: "*" } });
a.use(e.static(__dirname));

let _msgs = {}; // Сообщения по комнатам: { 'global': [...], 'room1': [...] }
let _users = {}; // Юзеры в сети
let _db = {};    // Глобальная база юзеров (для "синхронизации")

o.on('connection', (k) => {
    k.on('j', (d) => {
        k.u = d.u; k.ph = d.ph;
        _users[d.u] = { id: k.id, av: d.av, ph: d.ph };
        _db[d.ph] = { u: d.u, av: d.av }; // Сохраняем в "телефонную книгу" сервера
        
        k.join('global'); // По умолчанию все в глобальном
        o.emit('ul', { online: _users, db: _db });
        k.emit('hs', _msgs['global'] || []);
    });

    // Вход в конкретную комнату
    k.on('join_room', (r) => {
        k.leaveAll(); k.join(r);
        k.emit('hs', _msgs[r] || []);
    });

    k.on('m', (d) => {
        d.id = 'm_' + Date.now();
        const r = d.room || 'global';
        if(!_msgs[r]) _msgs[r] = [];
        _msgs[r].push(d);
        if(_msgs[r].length > 50) _msgs[r].shift();
        
        o.to(r).emit('m', d);
    });

    k.on('d', (id) => {
        // Удаление (только для админа NooMB1T или автора)
        o.emit('d', id);
    });

    k.on('disconnect', () => { delete _users[k.u]; o.emit('ul', { online: _users, db: _db }); });
});

a.get('*', (q, r) => r.sendFile(p.join(__dirname, 'index.html')));
s.listen(process.env.PORT || 3000);
