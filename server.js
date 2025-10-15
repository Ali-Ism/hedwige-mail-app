require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { makeOAuth2Client, authUrl, exchangeCode } = require('./src/auth');
const { getProfile, listMessages, getMessage, sendMessage } = require('./src/gmail');

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

function getOAuthClient() {
  return makeOAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  });
}

function requireAuth(req, res, next) {
  if (!req.session.tokens) return res.status(401).json({ error: 'unauthenticated' });
  const oauth2 = getOAuthClient();
  oauth2.setCredentials(req.session.tokens);
  req.auth = oauth2;
  next();
}

// OAuth
app.get('/auth/google', (req, res) => {
  const url = authUrl(getOAuthClient(), process.env.GOOGLE_SCOPES);
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res, next) => {
  try {
    const oauth2 = getOAuthClient();
    const tokens = await exchangeCode(oauth2, req.query.code);
    req.session.tokens = tokens;
    res.redirect('/');
  } catch (e) { next(e); }
});

// API routes
app.get('/api/me', requireAuth, async (req, res, next) => {
  try { res.json(await getProfile(req.auth)); } catch (e) { next(e); }
});

app.get('/api/messages', requireAuth, async (req, res, next) => {
  try {
    const { q = '', max = 10 } = req.query;
    res.json(await listMessages(req.auth, { q, maxResults: Number(max) }));
  } catch (e) { next(e); }
});

app.get('/api/messages/:id', requireAuth, async (req, res, next) => {
  try { res.json(await getMessage(req.auth, req.params.id)); } catch (e) { next(e); }
});

app.post('/api/send', requireAuth, async (req, res, next) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) return res.status(400).json({ error: 'Missing fields' });
    await sendMessage(req.auth, { to, subject, body });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

app.post('/api/logout', (req, res) => { req.session.destroy(() => res.json({ ok: true })); });

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'server_error', detail: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🦉 Hedwige 2.0 running on http://localhost:${port}`));
