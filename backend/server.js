const express = require('express')
const app = express()

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(4000, () => {
  console.log('API rodando na porta 4000')
}) 