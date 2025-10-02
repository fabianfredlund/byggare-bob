import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { query } from './db.js'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

const PORT = process.env.PORT || 3001

app.get('/health', (req,res)=>{res.json({ok:true, service:'crm-service'})})

app.get('/contacts', async (req,res)=>{
  const rows = await query('select id, first_name, last_name, phone, email from contacts order by created_at desc')
  res.json(rows)
})
app.post('/contacts', async (req,res)=>{
  const { first_name, last_name, phone, email } = req.body
  const rows = await query('insert into contacts (first_name, last_name, phone, email) values ($1,$2,$3,$4) returning id, first_name, last_name, phone, email',[first_name, last_name, phone, email])
  res.status(201).json(rows[0])
})

app.get('/projects', async (req,res)=>{
  const rows = await query('select id, title, status, description from projects order by created_at desc')
  res.json(rows)
})
app.post('/projects', async (req,res)=>{
  const { title, status = 'new', description } = req.body
  const rows = await query('insert into projects (title, status, description) values ($1,$2,$3) returning id, title, status, description',[title, status, description])
  res.status(201).json(rows[0])
})

app.listen(PORT, ()=> console.log(`crm-service listening on :${PORT}`))
