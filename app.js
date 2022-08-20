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

const typesOfFiles = ["jpg", "png", "jpeg"]

app.set("view engine", "ejs")
app.use(expressLayouts)
app.use(cookieParser())
app.use(fileUpload())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static( "public" ))

// Async function which i will used
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main page
app.get("/", async (req, res) => {
    // Check if cient has uuid, if not then i create new uuid for client and save this in cookie files
    if (!req.cookies.uuid){
        let id = uuid()

        res.cookie("uuid", id)
    }
    
    res.render("index", {pageName: "Home"})
})

// Show all images which you load in
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

// Show image by parametr
app.get("/images/:name", async (req, res) => {
    let _uuid = req.cookies.uuid
    
    // Check uuid of client, again
    if (!_uuid){
        res.redirect("/")
        return
    }
    
    let _dir = `${__dirname}/public/img/${_uuid}/${req.params.name}`

    // Check if file path is exist
    if (!fs.existsSync(_dir)){
        res.redirect("/")
        return
    }

    // If server has this file, that will send image
    res.sendFile(_dir)
})

// load image to server
app.post("/", async (req, res) => {    
    
    // Check if client has uuid
    if (!req.cookies.uuid)
        return
    
    // Check of valid this file
    if (!req.files){
        console.log("File not found!")
        
        return
    }

    let _dir = `${dir}${req.cookies.uuid}/`


    // Check if exist directory which i will put the image
    if (!fs.existsSync(_dir)){
        fs.mkdirSync(_dir)
    }

    let file = req.files.image
    let filePath = `${_dir}${file.name}`
    
    // parse from file name type of this file
    let type = file.name.split(".")[1]

    // Check valid type
    if (!typesOfFiles.includes(type)){
        res.redirect("/")
        return
    }
    
    // Save the image
    file.mv(filePath, (err) => {
        if (err){
            console.log(err)
            return res.status(500).send(err)
        }

        res.redirect("/")
    })

    // Then i am waiting for delete the image for 5 minutes
    await sleep(300_000)

    // Delete image
    fs.unlinkSync(filePath)
})

app.listen(port, '0.0.0.0', () => console.info(`App is listening at port: ${port}.`))