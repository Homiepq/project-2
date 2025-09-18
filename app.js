const express = require('express')
const app = express()
const port = 3000

app.use(express.static("static"))
app.use(express.json())

let products = []

app.get('/', (req, res) => {
    res.writeHead(200, {"Content-Type": "text/html"})
    res.send("Hello World!")
})

app.post("/add", (req, res) => {
    let data = req.body
    products.push(data)
    res.status(200)
    res.redirect("/")
})

app.post("/ads", (req, res) => {
    res.status(200)
    res.setHeader("Content-Type", "application/json")
    res.json(products).end()
})

app.use((req, res, next) => {
    res.status(404)
    res.sendFile("notFound.html", {root: "static"})
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})