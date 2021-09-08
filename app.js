// Requirements
import express, { urlencoded, json } from 'express';
import cors from 'cors'
import 'dotenv/config'
import mongoose from 'mongoose'

// Import routes
import personalRoute from './routes/personal.js'
import homeRoute from './routes/home.js'
import babyRoute from './routes/baby.js'

// Variables
const app = express()
const port = process.env.PORT || 3000

// Middelware
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/personal', personalRoute)
app.use('/home', homeRoute)
// app.use('/auto', autoRoute)
app.use('/baby', babyRoute)
// app.use('/csok', csokRoute)

// Connect to db
mongoose.connect(process.env.URI, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    },
    err => {
        err ? console.log(err) : console.log('Connected to database')
    }
)

// Start app
app.listen(port, () => console.log(`Listening on ${port}`))