async function loadAdmin(){
  const res = await fetch('/api/admin/data');
  const {channels,reviews} = await res.json();
  const chL = document.getElementById('chList');
  chL.innerHTML = '<h2>Каналы</h2>';
  channels.forEach(c=>{
    const div = document.createElement('div');
    div.innerHTML = `${c.title} 
      <button onclick="mod('channel',${c.id},'reject')">Удалить</button>`;
    chL.appendChild(div);
  });
  const rL = document.getElementById('revList');
  rL.innerHTML = '<h2>Отзывы</h2>';
  reviews.forEach(r=>{
    const div = document.createElement('div');
    div.innerHTML = `<i>${r.channel_id}</i> — ${r.nickname||'Аноним'}: ${r.text}
      <button onclick="mod('review',${r.id},'approve')">OK</button>
      <button onclick="mod('review',${r.id},'reject')">X</button>`;
    rL.appendChild(div);
  });
}
async function mod(type,id,action){
  await fetch('/api/admin/mod',{method:'POST',headers:{'Content-Type':'application/json'},body: JSON.stringify({type,id,action})});
  loadAdmin();
}
loadAdmin();
