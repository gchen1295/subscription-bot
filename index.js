const express = require('express')
const app = express()
const fs = require('fs')
const https = require('https')
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.post('/shopify', (req, res) => {
  console.log(req.body)
  res.status(200)
  res.send("OK")
})

app.get('/', (req, res) => {
  res.send('Hello')
})

// https.createServer({
//   key: fs.readFileSync('server.key'),
//   cert: fs.readFileSync('server.cert')
// }, app).listen(PORT, ()=>{
//   console.log(`App listening on port ${PORT}`)
// })
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})