const express = require('express')
const multer = require('multer')
const path = require('path')

const db = require('./db')
const { title } = require('process')

const app = express()
const port = 3000

app.use(express.static("static"))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.set("view engine", "ejs")
app.set("views", "views")

let products = []

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})

app.get('/', (req, res) => {
    db.query("SELECT * FROM products", (err, rows) => {
        let products = rows

        products.forEach((product) => {
            product.image = JSON.parse(product.image)
        })
        res.render("index", {products})
    })
})

app.post("/add", upload.fields([{name: "image"}]), (req, res) => {
    let data = req.body
    console.log(data)
    data.image = req.files.image.map((file) => file.filename)
    data.image = JSON.stringify(data.image)
    db.query("INSERT INTO products SET ?", data, (err) => { 
    res.status(201)
    res.end()  
    })
})

app.get("/post/:id", (req, res,) =>{
    const postId = req.params.id

    db.query(
        `
        SELECT p.*, c.id AS commentId, c.author, c.comment
        FROM products p
        LEFT JOIN comments c ON c.post_id = p.id
        WHERE p.id = ?`,
        postId,
        (err, rows) => {
            if (err || rows.length === 0) return res.status(404).render("notfound")
            let product = {
                id: rows[0].id,
                title: rows[0].title,
                description: rows[0].description,
                image: JSON.parse(rows[0].image),
                comments: rows.map((row) => {
                    return {
                        id: row.commentId,
                        author: row.author,
                        comment: row.comment
                    }
                })
            }
            console.log(product)
            res.render("post", { product } )
        }

    )
})

app.post("/comment", (req, res) => {
    let data = req.body
    db.query("INSERT INTO comments SET ?", data, (err) => {
        res.status(201)
        res.end()
    })
})

app.use((req, res, next) => {
    res.status(404)
    res.render("notfound")
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})