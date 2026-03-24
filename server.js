const e = require('express'), h = require('http'), { Server: S } = require('socket.io'), p = require('path');
const a = e(), s = h.createServer(a), o = new S(s, { cors: { origin: "*" } });
a.use(e.static(__dirname));

let _msgs = {}, _u = {}, _db = {}; 

o.on('connection', (k) => {
    k.on('j', (d) => {
        k.u = d.u; k.ph = d.ph;
        _u[d.u] = { id: k.id, av: d.av, ph: d.ph };
        _db[d.ph] = { u: d.u, av: d.av };
        k.join('global');
        o.emit('ul', { online: _u, db: _db });
        k.emit('hs', _msgs['global'] || []);
    });

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

    k.on('d', (id) => o.emit('d', id));
    k.on('disconnect', () => { delete _u[k.u]; o.emit('ul', { online: _u, db: _db }); });
});

a.get('*', (q, r) => r.sendFile(p.join(__dirname, 'index.html')));
s.listen(process.env.PORT || 3000);
