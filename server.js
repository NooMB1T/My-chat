const e = require('express'), h = require('http'), { Server: S } = require('socket.io'), p = require('path');
const a = e(), s = h.createServer(a), o = new S(s, { cors: { origin: "*" } });
a.use(e.static(__dirname));

let _h = [], _u = {}, _db = {}; 

o.on('connection', (k) => {
    k.on('j', (d) => {
        if(!d.ph) return;
        
        // Фікс дублів: Видаляємо старий нік, якщо номер той самий
        for (let name in _db) {
            if (_db[name].ph === d.ph && name !== d.u) {
                delete _db[name]; delete _u[name];
            }
        }

        k.u = d.u;
        _u[d.u] = { id: k.id, av: d.av };
        _db[d.u] = { av: d.av, ph: d.ph }; 
        
        o.emit('ul', { online: _u, all: _db });
        
        // Синхронізація: Відправляємо історію
        k.emit('hs', _h);
    });

    k.on('m', (d) => {
        d.id = 'm_' + Date.now();
        if(d.to) {
            const t = _u[d.to];
            if(t) o.to(t.id).to(k.id).emit('m', d);
        } else {
            _h.push(d); if(_h.length > 100) _h.shift();
            o.emit('m', d);
        }
    });

    k.on('d', (i) => { _h = _h.filter(x => x.id !== i); o.emit('d', i); });
    k.on('disconnect', () => { if(k.u) delete _u[k.u]; o.emit('ul', { online: _u, all: _db }); });
});
s.listen(process.env.PORT || 3000);
