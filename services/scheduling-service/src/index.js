import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

const PORT = process.env.PORT || 3003

app.get('/health', (req,res)=>{res.json({ok:true, service:'scheduling-service'})})

// stub availability and appointment routes
let appointments = []
app.get('/appointments', (req,res)=> res.json(appointments))
app.post('/appointments', (req,res)=>{ const a={id:appointments.length+1, title:req.body.title, start_at:req.body.start_at, end_at:req.body.end_at, status:'proposed'}; appointments.push(a); res.status(201).json(a) })

app.listen(PORT, ()=> console.log(`scheduling-service listening on :${PORT}`))


