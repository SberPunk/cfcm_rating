const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const db = new sqlite3.Database('db.sqlite');

db.exec(fs.readFileSync('schema.sql', 'utf8'));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Поиск каналов с фильтрацией по тегу
app.get('/api/channels', (req, res) => {
  const q = `%${req.query.q||''}%`;
  const tag = req.query.tag;
  let sql = `SELECT c.id, c.title, c.tg_link, c.description,
    GROUP_CONCAT(t.name) as tags FROM channels c
    LEFT JOIN channel_tags ct ON c.id=ct.channel_id
    LEFT JOIN tags t ON ct.tag_id=t.id
    WHERE c.title LIKE ?`;
  const params = [q];
  if(tag){
    sql += ` AND EXISTS (
      SELECT 1 FROM channel_tags ct2 JOIN tags t2 ON ct2.tag_id=t2.id
      WHERE ct2.channel_id=c.id AND t2.name=?
    )`;
    params.push(tag);
  }
  sql += ' GROUP BY c.id ORDER BY c.id DESC';
  db.all(sql, params, (_, rows)=>res.json(rows));
});

// Добавить канал с тегами
app.post('/api/channels', (req, res) => {
  const { title, tg_link, description, tags } = req.body;
  db.run(`INSERT INTO channels(title, tg_link, description) VALUES(?,?,?)`, [title, tg_link, description], function(err){
    if(err) return res.status(500).json({error: err.message});
    const cid = this.lastID;
    (tags||[]).forEach(name => {
      db.run(`INSERT OR IGNORE INTO tags(name) VALUES(?)`, [name]);
      db.get(`SELECT id FROM tags WHERE name=?`, [name], (_, row)=>{
        db.run(`INSERT OR IGNORE INTO channel_tags(channel_id, tag_id) VALUES(?,?)`, [cid, row.id]);
      });
    });
    res.json({id: cid});
  });
});

// Получить теги
app.get('/api/tags', (req, res) => {
  db.all(`SELECT name FROM tags ORDER BY name`, (_, rows)=>res.json(rows.map(r=>r.name)));
});

// Получить один канал + отзывы
app.get('/api/channels/:id', (req, res) => {
  const cid = req.params.id;
  db.get(`SELECT * FROM channels WHERE id=?`, [cid], (e, ch) => {
    if(!ch) return res.status(404).end();
    db.all(`SELECT nickname, text FROM reviews WHERE channel_id=? AND approved=1`, [cid], (_, rv)=>res.json({channel: ch, reviews: rv}));
  });
});

// Добавить отзыв (на модерацию)
app.post('/api/channels/:id/review', (req, res) => {
  const cid = req.params.id;
  const { nickname, text } = req.body;
  db.run(`INSERT INTO reviews(channel_id, nickname, text, approved) VALUES(?,?,?,0)`, [cid, nickname||null, text], function(err){
    if(err) return res.status(500).json({error: err.message});
    res.json({id: this.lastID});
  });
});

// --- Админ API
app.get('/api/admin/data', (req, res) => {
  db.all(`SELECT * FROM channels`, (_, ch)=>{
    db.all(`SELECT r.id, r.channel_id, r.nickname, r.text, r.approved, c.title AS channel_title
      FROM reviews r JOIN channels c ON r.channel_id=c.id`, (_, rev)=>{
      db.all(`SELECT * FROM tags`, (_, tg)=>res.json({channels: ch, reviews: rev, tags: tg}));
    });
  });
});

// Модерация каналов и отзывов
app.post('/api/admin/mod', (req, res) => {
  const { type, id, action } = req.body; // type='channel'|'review', action='approve'|'reject'
  const table = type==='channel'?'channels':'reviews';
  const col = type==='channel'?'id':'id';
  if(type==='review'){
    if(action==='approve'){
      db.run(`UPDATE reviews SET approved=1 WHERE id=?`, [id], ()=>res.json({ok:1}));
    } else {
      db.run(`DELETE FROM reviews WHERE id=?`, [id], ()=>res.json({ok:1}));
    }
  } else {
    if(action==='reject'){
      db.run(`DELETE FROM channels WHERE id=?`, [id], ()=>res.json({ok:1}));
    } else {
      // approve для канала = оставить как есть (видимым)
      res.json({ok:1});
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('Server on', port));
