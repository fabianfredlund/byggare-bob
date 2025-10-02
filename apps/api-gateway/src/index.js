import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'api-gateway', time: new Date().toISOString() });
});

// Minimal JWT-protected route sample
app.get('/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ user: payload });
  } catch (e) {
    res.status(401).json({ error: 'invalid token' });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'welcome', ts: Date.now() }));
});

// simple in-memory pub to all clients
function broadcast(event){
  wss.clients.forEach(c=>{ try { c.send(JSON.stringify(event)) } catch{} })
}

// endpoint for services to emit events (no auth for dev)
app.post('/_events', (req,res)=>{ broadcast(req.body); res.json({ ok:true }) })

server.listen(PORT, () => {
  console.log(`api-gateway listening on :${PORT}`);
});

// simple proxy stubs to CRM/Scheduling/Invoicing services for local dev
import fetch from 'node-fetch';

const services = {
  crm: process.env.CRM_URL || 'http://crm-service:3001',
  scheduling: process.env.SCHEDULING_URL || 'http://scheduling-service:3003',
  invoicing: process.env.INVOICING_URL || 'http://invoicing-service:3004',
};

app.use('/crm', async (req, res) => {
  const url = services.crm + req.url;
  const r = await fetch(url, { method: req.method, headers: { 'content-type': 'application/json' }, body: ['GET','HEAD'].includes(req.method)? undefined : JSON.stringify(req.body) });
  const text = await r.text();
  res.status(r.status).type(r.headers.get('content-type') || 'application/json').send(text);
});

app.use('/scheduling', async (req, res) => {
  const url = services.scheduling + req.url;
  const r = await fetch(url, { method: req.method, headers: { 'content-type': 'application/json' }, body: ['GET','HEAD'].includes(req.method)? undefined : JSON.stringify(req.body) });
  const text = await r.text();
  res.status(r.status).type(r.headers.get('content-type') || 'application/json').send(text);
});

app.use('/invoicing', async (req, res) => {
  const url = services.invoicing + req.url;
  const r = await fetch(url, { method: req.method, headers: { 'content-type': 'application/json' }, body: ['GET','HEAD'].includes(req.method)? undefined : JSON.stringify(req.body) });
  const text = await r.text();
  res.status(r.status).type(r.headers.get('content-type') || 'application/json').send(text);
});


