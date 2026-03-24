const e = require('express'), h = require('http'), { Server: S } = require('socket.io'), p = require('path');
const a = e(), s = h.createServer(a), o = new S(s, { cors: { origin: "*" }, maxHttpBufferSize: 1e8 });
a.use(e.static(__dirname));
let _h = [], _u = {};
a.get('/', (q, r) => r.sendFile(p.join(__dirname, 'index.html')));
a.get('/chat.html', (q, r) => r.sendFile(p.join(__dirname, 'chat.html')));
o.on('connection', (k) => {
    k.on('j', (d) => {
        if(!d.u) return;
        k.u = d.u; k.av = d.av; _u[d.u] = { id: k.id, av: d.av };
        k.join('g'); o.emit('ul', _u); k.emit('hs', _h);
    });
    k.on('m', (d) => {
        d.id = 'm_' + Date.now();
        d.r = { '👍': [], '❤️': [] }; 
        if(d.to) { 
            const t = _u[d.to];
            if(t) o.to(t.id).to(k.id).emit('m', d);
        } else { 
            _h.push(d); if(_h.length > 100) _h.shift();
            o.emit('m', d);
        }
    });
    k.on('d', (i) => {
        const m = _h.find(x => x.id === i);
        if(k.u === 'NooMB1T' || (m && m.u === k.u)) {
            _h = _h.filter(x => x.id !== i);
            o.emit('d', i);
        }
    });
    k.on('re', (d) => {
        const m = _h.find(x => x.id === d.id);
        if(m && !m.r[d.e].includes(k.u)) {
            Object.keys(m.r).forEach(e => {
                const idx = m.r[e].indexOf(k.u);
                if(idx > -1) m.r[e].splice(idx, 1);
            });
            m.r[d.e].push(k.u);
            o.emit('up', m);
        }
    });
    k.on('disconnect', () => { if(k.u) delete _u[k.u]; o.emit('ul', _u); });
});
s.listen(process.env.PORT || 3000);
