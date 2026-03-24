const e = require('express'), h = require('http'), { Server: S } = require('socket.io'), p = require('path');
const a = e(), s = h.createServer(a), o = new S(s, { cors: { origin: "*" }, maxHttpBufferSize: 1e8 });
a.use(e.static(__dirname));
let _h = [], _u = {};
a.get('/', (q, r) => r.sendFile(p.join(__dirname, 'index.html')));
a.get('/chat.html', (q, r) => r.sendFile(p.join(__dirname, 'chat.html')));
a.get('/chat', (q, r) => r.sendFile(p.join(__dirname, 'chat.html')));
o.on('connection', (k) => {
    k.on('j', (d) => {
        if(!d.u) return;
        k.u = d.u; _u[d.u] = k.id; k.join('g');
        o.emit('ul', Object.keys(_u));
        k.emit('hs', _h);
    });
    k.on('m', (d) => {
        d.id = 'm_' + Date.now() + Math.random().toString(36).substr(2, 4);
        d.r = { '👍':0, '❤️':0 };
        if(d.to) { 
            const sid = _u[d.to];
            if(sid) o.to(sid).to(k.id).emit('m', d);
        } else { 
            _h.push(d); if(_h.length > 60) _h.shift();
            o.emit('m', d);
        }
    });
    k.on('d', (i) => { _h = _h.filter(x => x.id !== i); o.emit('d', i); });
    k.on('re', (d) => {
        const m = _h.find(x => x.id === d.id);
        if(m) { m.r[d.e]++; o.emit('up', m); }
    });
    k.on('disconnect', () => { if(k.u) delete _u[k.u]; o.emit('ul', Object.keys(_u)); });
});
s.listen(process.env.PORT || 3000);
