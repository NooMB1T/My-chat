const e = require('express'), h = require('http'), { Server: S } = require('socket.io'), p = require('path');
const a = e(), s = h.createServer(a), o = new S(s, { cors: { origin: "*" } });
a.use(e.static(__dirname, { maxAge: '1d' })); // Кэширование для скорости

let _h = [], _u = {}, _all = {}; // _all - все зарегистрированные

a.get('/', (q, r) => r.sendFile(p.join(__dirname, 'index.html')));
a.get('/chat', (q, r) => r.sendFile(p.join(__dirname, 'chat.html')));

o.on('connection', (k) => {
    k.on('j', (d) => {
        if(!d.u) return;
        k.u = d.u;
        _u[d.u] = { id: k.id, av: d.av };
        _all[d.u] = { av: d.av, ph: d.ph }; // Сохраняем в базу "всех"
        o.emit('ul', { online: _u, all: _all }); 
        k.emit('hs', _h);
    });

    k.on('m', (d) => {
        d.id = 'm_' + Date.now();
        d.seen = false;
        if(d.to) {
            const t = _u[d.to];
            if(t) o.to(t.id).to(k.id).emit('m', d);
        } else {
            _h.push(d); if(_h.length > 100) _h.shift();
            o.emit('m', d);
        }
    });

    k.on('read', (id) => { o.emit('read_ok', id); }); // Статус прочитано
    k.on('t', (s) => { k.broadcast.emit('t', { u: k.u, s }); });
    k.on('d', (i) => { _h = _h.filter(x => x.id !== i); o.emit('d', i); });

    k.on('disconnect', () => { if(k.u) delete _u[k.u]; o.emit('ul', { online: _u, all: _all }); });
});
s.listen(process.env.PORT || 3000);
