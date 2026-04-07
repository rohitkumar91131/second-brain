require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./db')

const authRoutes = require('./routes/auth')
const notesRoutes = require('./routes/notes')
const blocksRoutes = require('./routes/blocks')
const tasksRoutes = require('./routes/tasks')
const projectsRoutes = require('./routes/projects')
const goalsRoutes = require('./routes/goals')
const journalRoutes = require('./routes/journal')
const resourcesRoutes = require('./routes/resources')
const deviceRoutes = require('./routes/device')
const userRoutes = require('./routes/user')

const app = express()

const ALLOWED_ORIGINS = [
  'https://secondbrain.rohits.online',
  'http://localhost:3000',
  'http://10.0.2.2:3000',
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/device', deviceRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/blocks', blocksRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/goals', goalsRoutes)
app.use('/api/journal', journalRoutes)
app.use('/api/resources', resourcesRoutes)
app.use('/api/user', userRoutes)

// Connect DB and start
const PORT = process.env.PORT || 4000
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Second Brain Node API running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err)
    process.exit(1)
  })
