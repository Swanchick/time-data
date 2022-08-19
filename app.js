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
    
    res.render("index")
})

app.get("/files", async (req, res) => {
    let _uuid = req.cookies.uuid
    
    if (!_uuid){
        res.redirect("/")
        return
    }


    let images = fs.readdirSync(`${dir}/${_uuid}`)

    res.render("files", {images: images, uuid: _uuid})
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

        res.send('File uploaded!')
    })

    await sleep(60_000)

    fs.unlinkSync(filePath)
})

app.listen(port, '0.0.0.0', () => console.info(`App is listening at port: ${port}.`))