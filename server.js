const e = require('express'), h = require('http'), { Server: S } = require('socket.io'), p = require('path');
const a = e(), s = h.createServer(a), o = new S(s, { cors: { origin: "*" } });

a.use(e.static(__dirname));
let _h = [], _u = {}, _bg = "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1974&auto=format&fit=crop";

o.on('connection', (k) => {
    k.on('j', (d) => {
        k.u = d.u;
        _u[d.u] = { id: k.id, av: d.av, ph: d.ph, bio: d.bio || "Пользователь DoveGram" };
        o.emit('ul', _u);
        k.emit('hs', { h: _h, bg: _bg });
    });

    k.on('m', (d) => {
        d.id = 'm_' + Date.now();
        d.re = {}; 
        _h.push(d); if(_h.length > 100) _h.shift();
        o.emit('m', d);
    });

    k.on('typing', (v) => { k.broadcast.emit('is_typing', { u: k.u, v }); });
    k.on('react', (d) => {
        const m = _h.find(x => x.id === d.id);
        if(m) { m.re[d.u] = d.r; o.emit('update_m', m); }
    });
    k.on('d', (id) => { _h = _h.filter(x => x.id !== id); o.emit('d', id); });
    k.on('disconnect', () => { if(k.u) delete _u[k.u]; o.emit('ul', _u); });
});

a.get('*', (q, r) => r.sendFile(p.join(__dirname, 'index.html')));
s.listen(process.env.PORT || 3000);
