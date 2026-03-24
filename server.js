const e = require('express'), h = require('http'), { Server: S } = require('socket.io'), p = require('path');
const a = e(), s = h.createServer(a), o = new S(s, { cors: { origin: "*" } });
a.use(e.static(__dirname));
let _h = [], _u = {};
a.get('/', (q, r) => r.sendFile(p.join(__dirname, 'index.html')));
a.get('/chat', (q, r) => r.sendFile(p.join(__dirname, 'chat.html')));
o.on('connection', (k) => {
    k.on('j', (d) => {
        if(!d.u) return;
        k.u = d.u; _u[d.u] = { id: k.id, av: d.av, ph: d.ph };
        o.emit('ul', _u); k.emit('hs', _h);
    });
    k.on('m', (d) => {
        d.id = 'm_' + Date.now(); d.r = { '👍': [] };
        if(d.to) { 
            const t = _u[d.to]; if(t) o.to(t.id).to(k.id).emit('m', d);
        } else { 
            _h.push(d); if(_h.length > 50) _h.shift(); o.emit('m', d);
        }
    });
    k.on('d', (i) => {
        const m = _h.find(x => x.id === i);
        if(k.u === 'NooMB1T' || (m && m.u === k.u)) { _h = _h.filter(x => x.id !== i); o.emit('d', i); }
    });
    k.on('re', (d) => {
        const m = _h.find(x => x.id === d.id);
        if(m && !m.r['👍'].includes(k.u)) { m.r['👍'].push(k.u); o.emit('up', m); }
    });
    k.on('disconnect', () => { if(k.u) delete _u[k.u]; o.emit('ul', _u); });
});
s.listen(process.env.PORT || 3000);
