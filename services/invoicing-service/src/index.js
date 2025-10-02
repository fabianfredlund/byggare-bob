import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

const PORT = process.env.PORT || 3004

app.get('/health', (req,res)=>{res.json({ok:true, service:'invoicing-service'})})

let invoices = []
app.get('/invoices', (req,res)=> res.json(invoices))
app.post('/invoices', (req,res)=>{ const inv={id:invoices.length+1, status:'draft', ...req.body}; invoices.push(inv); res.status(201).json(inv) })

app.listen(PORT, ()=> console.log(`invoicing-service listening on :${PORT}`))


