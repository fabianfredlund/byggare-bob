import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

const PORT = process.env.PORT || 3005

app.get('/health', (req,res)=>{res.json({ok:true, service:'notification-service'})})

app.post('/notify/email', (req,res)=>{ res.json({ queued: true, channel: 'email', payload: req.body }) })
app.post('/notify/sms', (req,res)=>{ res.json({ queued: true, channel: 'sms', payload: req.body }) })

app.listen(PORT, ()=> console.log(`notification-service listening on :${PORT}`))


