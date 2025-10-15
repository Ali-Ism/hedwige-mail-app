const meDiv = document.getElementById('me');
const connectBtn = document.getElementById('connectBtn');
const inbox = document.getElementById('inbox');
const msgPre = document.getElementById('message');
const qInput = document.getElementById('query');
const refreshBtn = document.getElementById('refresh');
const sendForm = document.getElementById('sendForm');
const sendStatus = document.getElementById('sendStatus');

connectBtn.onclick = () => location.href = '/auth/google';

async function fetchJSON(url, options) {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

async function init() {
  try {
    const me = await fetchJSON('/api/me');
    meDiv.innerHTML = `<img src="${me.picture||''}"/> ${me.name||me.email}`;
    connectBtn.style.display = 'none';
    await loadInbox();
  } catch {
    meDiv.textContent = 'Not connected';
  }
}

async function loadInbox() {
  inbox.innerHTML = 'Loading...';
  try {
    const qs = qInput.value ? `?q=${encodeURIComponent(qInput.value)}` : '';
    const list = await fetchJSON(`/api/messages${qs}`);
    inbox.innerHTML = '';
    list.forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `<b>${m.headers.Subject||'(No subject)'}</b><br/>
        <small>${m.headers.From||''} — ${new Date(Number(m.internalDate)).toLocaleString()}</small><br/>
        <span>${m.snippet||''}</span>`;
      li.onclick = () => openMessage(m.id);
      inbox.appendChild(li);
    });
  } catch {
    inbox.innerHTML = 'Error loading inbox';
  }
}

async function openMessage(id) {
  msgPre.textContent = 'Loading...';
  const m = await fetchJSON(`/api/messages/${id}`);
  const meta = `From: ${m.headers.From||''}\nTo: ${m.headers.To||''}\nSubject: ${m.headers.Subject||''}\n----\n`;
  msgPre.textContent = meta + (m.text || m.snippet || '(No text)');
}

refreshBtn.onclick = loadInbox;

sendForm.onsubmit = async (e) => {
  e.preventDefault();
  sendStatus.textContent = 'Sending...';
  const data = Object.fromEntries(new FormData(sendForm).entries());
  try {
    await fetchJSON('/api/send', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    sendStatus.textContent = '✅ Sent!';
    sendForm.reset();
  } catch (e) {
    sendStatus.textContent = '❌ Error: ' + e.message;
  }
};

init();
