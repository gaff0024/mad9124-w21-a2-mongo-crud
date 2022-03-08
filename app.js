'use strict'

const morgan = require('morgan')
const debug = require('debug')('mad9124-w21-a2-mongo-crud')
const express = require('express')
const sanitizeMongo = require('express-mongo-sanitize')
const app = express()
require('./startup/connectDatabase')()

app.use(morgan('tiny'))
app.use(express.json())
app.use(sanitizeMongo())
app.use('/api/student', require('./routes/students'))
app.use('/api/course', require('./routes/course'))

const port = process.env.PORT || 3030
app.listen(port, () => console.log(`HTTP server listening on port ${port} ...`))