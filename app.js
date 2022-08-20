const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const fileUpload = require('express-fileupload')
const bodyParser = require("body-parser")
const fs = require("fs")
const cookieParser = require("cookie-parser")
const { uuid } = require("uuidv4")
const path = require('path')

const app = express()
const port = 5000
const dir = "./public/img/"

app.set("view engine", "ejs")
app.use(expressLayouts)
app.use(cookieParser())
app.use(fileUpload())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static( "public" ))

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


app.get("/", async (req, res) => {
    if (!req.cookies.uuid){
        let id = uuid()

        res.cookie("uuid", id)
    }
    
    res.render("index", {pageName: "Home"})
})

app.get("/images", async (req, res) => {
    let _uuid = req.cookies.uuid
    
    if (!_uuid){
        res.redirect("/")
        return
    }

    let _dir = `${dir}/${_uuid}`

    if (!fs.existsSync(_dir)){
        fs.mkdirSync(_dir)
    }

    let images = fs.readdirSync(`${dir}/${_uuid}`)

    res.render("files", {images: images, uuid: _uuid, pageName: "Images"})
})

app.get("/images/:name", async (req, res) => {
    let _uuid = req.cookies.uuid
    
    if (!_uuid){
        res.redirect("/")
        return
    }

    console.log(req.params.name)

    // let _dir = `${dir}${_uuid}/${req.params.name}`
    
    let _dir = `${__dirname}/public/img/${_uuid}/${req.params.name}`

    if (!fs.existsSync(_dir)){
        res.redirect("/")
        return
    }

    res.sendFile(_dir)
})

app.post("/", async (req, res) => {    
    if (!req.cookies.uuid)
        return
    
    if (!req.files){
        console.log("File not found!")
        
        return
    }

    let _dir = `${dir}${req.cookies.uuid}/`


    if (!fs.existsSync(_dir)){
        fs.mkdirSync(_dir)
    }

    let file = req.files.image
    let filePath = `${_dir}${file.name}`
    file.mv(filePath, (err) => {
        if (err){
            console.log(err)
            return res.status(500).send(err)
        }

        res.redirect("/")
    })

    await sleep(300_000)

    fs.unlinkSync(filePath)
})

app.listen(port, '0.0.0.0', () => console.info(`App is listening at port: ${port}.`))