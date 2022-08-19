const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const fileUpload = require('express-fileupload')
const bodyParser = require("body-parser")
const fs = require("fs")

const app = express()
const port = 5000
const dir = "./src/"


app.use(expressLayouts)
app.set("view engine", "ejs")
app.use(fileUpload())
app.use(bodyParser.urlencoded({ extended: false }))

app.get("/", (req, res) => {
    console.log()
    
    res.render("index")
})

app.post("/upload", (req, res) => {    
    if (!req.files){
        console.log("File not found!")
        
        return
    }

    let key = req.body.key
    let _dir = `${dir}${key}/`


    if (!fs.existsSync(_dir)){
        fs.mkdirSync(_dir)
    }

    let file = req.files.image

    file.mv(`${_dir}${file.name}`, (err) => {
        if (err){
            console.log(err)
            return res.status(500).send(err)
        }

        res.send('File uploaded!')
    })
})

app.listen(port, '0.0.0.0', () => console.info(`App is listening at port: ${port}.`))