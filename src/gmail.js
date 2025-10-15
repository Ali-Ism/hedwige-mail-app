const { google } = require('googleapis');
const { toBase64Url } = require('./utils');

function gmailClient(auth) {
  return google.gmail({ version: 'v1', auth });
}

async function getProfile(auth) {
  const oauth2 = google.oauth2({ version: 'v2', auth });
  const { data } = await oauth2.userinfo.get();
  return data;
}

async function listMessages(auth, { q = '', maxResults = 10 } = {}) {
  const gmail = gmailClient(auth);
  const { data } = await gmail.users.messages.list({ userId: 'me', q, maxResults });
  const messages = data.messages || [];
  const details = await Promise.all(messages.map(async m => {
    const { data: msg } = await gmail.users.messages.get({
      userId: 'me', id: m.id, format: 'metadata',
      metadataHeaders: ['From', 'To', 'Subject', 'Date']
    });
    const headers = {};
    (msg.payload.headers || []).forEach(h => { headers[h.name] = h.value; });
    return { id: m.id, snippet: msg.snippet, headers, internalDate: msg.internalDate };
  }));
  return details;
}

function extractPlainText(payload) {
  if (!payload) return '';
  if (payload.mimeType === 'text/plain' && payload.body && payload.body.data)
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  if (payload.parts) {
    for (const p of payload.parts) {
      const t = extractPlainText(p);
      if (t) return t;
    }
  }
  return '';
}

async function getMessage(auth, id) {
  const gmail = gmailClient(auth);
  const { data } = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
  const headers = {};
  (data.payload.headers || []).forEach(h => { headers[h.name] = h.value; });
  const text = extractPlainText(data.payload);
  return { id: data.id, snippet: data.snippet, headers, text };
}

async function sendMessage(auth, { to, subject, body }) {
  const gmail = gmailClient(auth);
  const raw = `To: ${to}\nSubject: ${subject}\n\n${body}`;
  const encoded = toBase64Url(raw);
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encoded } });
  return { ok: true };
}

module.exports = { getProfile, listMessages, getMessage, sendMessage };
