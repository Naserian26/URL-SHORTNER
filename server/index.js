const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()

const linkRoutes = require('./routes/linkRoutes')
const { redirectLink } = require('./controllers/linkController')

const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/links', linkRoutes)
app.get('/:code', redirectLink)

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})