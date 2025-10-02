import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import fetch from 'node-fetch'
import { connectRealtime, bridgeTwilioToOpenAI } from './realtime.js'
import { transcribeWithWhisperFromUrl } from './openai.js'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

const PORT = process.env.PORT || 3002

app.get('/health', (req,res)=>{res.json({ok:true, service:'voice-ai-service'})})

app.post('/voice/twilio/webhook', (req,res)=>{
  res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="sv-SE">Hej! Du pratar med Byggare Bobs assistent. Beskriv gärna ditt ärende efter tonen.</Say>
  <Start><Stream url="wss://${req.headers.host}/voice/stream" /></Start>
  <Record maxLength="90" playBeep="true" action="/voice/voicemail" method="POST" />
</Response>`)
})

// Voicemail handler -> transcribe via OpenAI Whisper, extract intent, create CRM entities
app.post('/voice/voicemail', async (req,res)=>{
  const recordingUrl = req.body?.RecordingUrl
  res.type('text/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<Response><Say>Tack! Vi hör av oss snarast.</Say></Response>`)
  try {
    const transcript = await transcribeRecording(recordingUrl)
    const entities = await extractEntitiesFromTranscript(transcript)
    const contact = await createOrUpdateContact(entities)
    const project = await createProjectFromIntent(contact, entities, transcript)
    const appt = await proposeAppointment(entities)
    await notifyStaff(contact, project, appt, transcript)
    await saveCall({ recordingUrl, transcript, intent: entities.intent, projectId: project.id, appt })
    console.log('voicemail processed', { contact, project, appt })
  } catch (e) {
    console.error('voicemail processing failed', e)
  }
})

// Intent extraction stub using OpenAI (text input) – to be wired to Realtime later
app.post('/voice/intent', async (req,res)=>{
  const { transcript } = req.body || {}
  if (!transcript) return res.status(400).json({ error: 'missing transcript' })
  // naive rule-based stub
  const lower = transcript.toLowerCase()
  let intent = 'general_inquiry'
  if (lower.includes('läcka') || lower.includes('rör')) intent = 'plumbing_issue'
  if (lower.includes('el') || lower.includes('ström')) intent = 'electric_issue'
  if (lower.includes('offert') || lower.includes('pris')) intent = 'quote_request'
  res.json({ intent })
})

// ---- Helpers (stubs; replace with real OpenAI integrations) ----
const CRM_URL = process.env.CRM_URL || 'http://localhost:3001'
const SCHED_URL = process.env.SCHEDULING_URL || 'http://localhost:3003'
const NOTIFY_URL = process.env.NOTIFICATION_URL || 'http://localhost:3005'
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080'

async function transcribeRecording(url){
  try {
    if (!url) return 'Tomt meddelande'
    return await transcribeWithWhisperFromUrl(url)
  } catch (e) {
    console.warn('fallback transcript due to error:', e.message)
    return `Röstmeddelande: ${url}`
  }
}

async function extractEntitiesFromTranscript(transcript){
  const lower = transcript.toLowerCase()
  const intent = lower.includes('läcka') ? 'plumbing_issue' : (lower.includes('el') ? 'electric_issue' : 'general_inquiry')
  const preferred = lower.includes('imorgon') ? 'tomorrow 09:00' : 'asap'
  return { intent, first_name: 'Okänd', last_name: '', phone: '', description: transcript, preferred_time: preferred }
}

async function createOrUpdateContact(entities){
  const res = await fetch(`${CRM_URL}/contacts`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ first_name: entities.first_name, last_name: entities.last_name, phone: entities.phone, email: '' }) })
  return await res.json()
}

async function createProjectFromIntent(contact, entities, transcript){
  const title = entities.intent === 'plumbing_issue' ? 'VVS ärende' : entities.intent === 'electric_issue' ? 'El ärende' : 'Allmänt ärende'
  const res = await fetch(`${CRM_URL}/projects`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ title, status:'new', description: transcript, contact_id: contact.id }) })
  return await res.json()
}

async function proposeAppointment(entities){
  const start = new Date(Date.now() + 24*60*60*1000)
  const end = new Date(start.getTime() + 60*60*1000)
  const res = await fetch(`${SCHED_URL}/appointments`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ title: 'Besök', start_at: start.toISOString(), end_at: end.toISOString() }) })
  return await res.json()
}

async function notifyStaff(contact, project, appt, transcript){
  try {
    await fetch(`${NOTIFY_URL}/notify/email`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ to:'staff@example.com', subject:`Nytt ärende: ${project.title}`, text:`Kontakt: ${contact.first_name} ${contact.last_name}\nTranskript: ${transcript}\nFöreslagen tid: ${appt.start_at}` }) })
  } catch (e) { console.warn('notify failed', e) }
}

async function saveCall({ recordingUrl, transcript, intent, projectId, appt }){
  try {
    await fetch(`${GATEWAY_URL}/_events`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ type:'calls.transcribed', recordingUrl, transcript, intent, projectId, appt, ts: Date.now() }) })
  } catch (e) { console.warn('saveCall/broadcast failed', e) }
}

// Twilio Media Stream WS endpoint
import { WebSocketServer } from 'ws'
import http from 'http'
const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/voice/stream' })
wss.on('connection', async (twilioWs)=>{
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey){ twilioWs.close(); return }
  bridgeTwilioToOpenAI({ twilioWs, openaiApiKey: apiKey })
})

server.listen(PORT, ()=> console.log(`voice-ai-service listening on :${PORT}`))


