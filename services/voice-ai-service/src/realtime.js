// Skeleton helper for OpenAI Realtime WS connection
import WebSocket from 'ws'

// Bridge Twilio Media Streams <-> OpenAI Realtime
export async function bridgeTwilioToOpenAI({ twilioWs, openaiApiKey }){
  const url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview'
  const ai = new WebSocket(url, { headers: { Authorization: `Bearer ${openaiApiKey}` } })

  ai.on('open', ()=> {
    // Twilio sends base64 PCM. Forward as-is; in a real impl, set correct encodings and initial session params
    twilioWs.on('message', (msg)=> ai.send(msg))
  })
  ai.on('message', (msg)=> {
    // Forward assistant audio back to Twilio
    try { twilioWs.send(msg) } catch {}
  })
  ai.on('close', ()=> { try { twilioWs.close() } catch {} })
  ai.on('error', ()=> { try { twilioWs.close() } catch {} })

  twilioWs.on('close', ()=> { try { ai.close() } catch {} })
  twilioWs.on('error', ()=> { try { ai.close() } catch {} })
}

export function connectRealtime({ apiKey, url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview' }){
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    ws.on('open', ()=> resolve(ws))
    ws.on('error', reject)
  })
}


