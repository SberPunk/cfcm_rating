async function loadTags(){
  const res = await fetch('/api/tags');
  const arr = await res.json();
  const sel = document.getElementById('tag');
  arr.forEach(t=>{
    const o = document.createElement('option');
    o.value = t; o.textContent = t;
    sel.appendChild(o);
  });
}
async function load(){
  const q = document.getElementById('q').value;
  const tag = document.getElementById('tag').value;
  const res = await fetch(`/api/channels?q=${encodeURIComponent(q)}&tag=${encodeURIComponent(tag)}`);
  const arr = await res.json();
  const out = document.getElementById('results');
  out.innerHTML = '';
  arr.forEach(ch=>{
    const d = document.createElement('div');
    d.className = 'card';
    d.innerHTML = `<h2>${ch.title}</h2><p>${ch.description||''}</p>
    <button onclick="openChannel(${ch.id})">Подробнее</button>`;
    out.appendChild(d);
  });
}
function openChannel(id){
  location.href = `channel.html?id=${id}`;
}
document.getElementById('btn-add').onclick = ()=>location.href='channel.html';
document.getElementById('q').oninput = load;
document.getElementById('tag').onchange = load;
loadTags().then(load);
