const { google } = require('googleapis');

function makeOAuth2Client({ clientId, clientSecret, redirectUri }) {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function authUrl(oauth2, scopes) {
  return oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes.split(',').map(s => s.trim())
  });
}

async function exchangeCode(oauth2, code) {
  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);
  return tokens;
}

module.exports = { makeOAuth2Client, authUrl, exchangeCode };
