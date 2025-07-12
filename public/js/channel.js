async function init(){
  const pid = new URLSearchParams(location.search).get('id');
  if(!pid){
    renderForm();
    return;
  }
  const res = await fetch(`/api/channels/${pid}`);
  const data = await res.json();
  const c = data.channel;
  const out = document.getElementById('content');
  out.innerHTML = `
    <h1>${c.title}</h1>
    <a href="${c.tg_link}" target="_blank">Перейти в Telegram</a>
    <p>${c.description||''}</p>
    <h2>Отзывы</h2>`;
  data.reviews.forEach(r=>{
    const div = document.createElement('div');
    div.className='review';
    div.innerHTML = `<b>${r.nickname||'Аноним'}:</b> <p>${r.text}</p>`;
    out.appendChild(div);
  });
  out.innerHTML += `
    <h3>Оставить отзыв</h3>
    <input id="nick" placeholder="Ник (или оставить пустым)">
    <textarea id="txt" placeholder="Текст отзыва"></textarea>
    <button id="btn">Отправить</button>`;
  document.getElementById('btn').onclick = async ()=>{
    await fetch(`/api/channels/${pid}/review`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        nickname: document.getElementById('nick').value,
        text: document.getElementById('txt').value
      })
    });
    alert('Отзыв отправлен на модерацию');
  };
}
function renderForm(){
  document.getElementById('content').innerHTML = `
    <h1>Добавить канал</h1>
    <input id="title" placeholder="Название">
    <input id="link" placeholder="https://t.me/username">
    <textarea id="desc" placeholder="Описание"></textarea>
    <h2>Теги</h2>
    <div id="tagContainer"></div>
    <button id="addTagBtn">Добавить тег</button>
    <button id="sendBtn">Добавить канал</button>`;
  const tags = [];
  const tagContainer = document.getElementById('tagContainer');
  document.getElementById('addTagBtn').onclick = ()=>{
    const inp = document.createElement('input');
    inp.placeholder = 'Тег'; tagContainer.appendChild(inp);
  };
  document.getElementById('sendBtn').onclick = async ()=>{
    const tvals = [...tagContainer.querySelectorAll('input')].map(i=>i.value).filter(Boolean);
    await fetch('/api/channels',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        title:document.getElementById('title').value,
        tg_link:document.getElementById('link').value,
        description:document.getElementById('desc').value,
        tags: tvals
      })
    });
    alert('Канал отправлен на модерацию');
    history.back();
  };
}
init();
