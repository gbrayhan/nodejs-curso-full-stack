const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World from express')
})

app.get('/health', (req, res) => {
    res.send('it is up!')
})
app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`)
})