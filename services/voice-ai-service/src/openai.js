import fetch from 'node-fetch'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

export async function transcribeWithWhisperFromUrl(url){
  // Downloads audio and sends to Whisper transcription API
  const audioRes = await fetch(url)
  const audioBuf = Buffer.from(await audioRes.arrayBuffer())

  const form = new FormData()
  form.append('file', new Blob([audioBuf]), 'audio.wav')
  form.append('model', 'whisper-1')
  form.append('language', 'sv')

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form
  })
  if (!res.ok){
    const t = await res.text()
    throw new Error(`Whisper failed ${res.status}: ${t}`)
  }
  const json = await res.json()
  return json.text
}


