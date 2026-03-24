const e = require('express');
const h = require('http');
const { Server: S } = require('socket.io');
const p = require('path');
const a = e();
const s = h.createServer(a);
const o = new S(s, { cors: { origin: "*" }, maxHttpBufferSize: 1e8 });
a.use(e.static(__dirname));
let _h = []; 
let _u = {}; 
a.get('/', (q, r) => r.sendFile(p.join(__dirname, 'index.html')));
a.get('/chat.html', (q, r) => r.sendFile(p.join(__dirname, 'chat.html')));
a.get('/chat', (q, r) => r.sendFile(p.join(__dirname, 'chat.html')));
o.on('connection', (k) => {
    k.on('join', (d) => {
        k.u = d.u;
        _u[k.id] = d.u;
        k.join('global');
        o.emit('ul', Object.values(_u));
        k.emit('hs', _h);
    });
    k.on('m', (d) => {
        d.id = Date.now().toString();
        d.r = { '👍':0, '❤️':0, '😂':0 };
        _h.push(d);
        if(_h.length > 100) _h.shift();
        o.emit('m', d); 
    });
    k.on('t', (v) => {
        k.broadcast.emit('t', { u: k.u, v });
    });
    k.on('d', (i) => {
        _h = _h.filter(m => m.id !== i);
        o.emit('d', i);
    });
    k.on('re', (d) => {
        const m = _h.find(x => x.id === d.id);
        if(m) { m.r[d.e]++; o.emit('up', m); }
    });
    k.on('disconnect', () => {
        delete _u[k.id];
        o.emit('ul', Object.values(_u));
    });
});
const P = process.env.PORT || 3000;
s.listen(P);
