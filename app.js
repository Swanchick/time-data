const express = require('express')
const expressLayouts = require("express-ejs-layouts")
const fileUpload = require('express-fileupload');

const app = express()
const port = 5000

app.use(expressLayouts)
app.set("view engine", "ejs")
app.use(fileUpload());

app.get("/", (req, res) => {
    res.render("index", {testString: "a"})
})

app.post("/upload", (req, res) => {
    if (!req.files){
        console.log("File not found!")
        
        return
    }

    let file = req.files.image

    file.mv(`./src/${file.name}`, (err) => {
        if (err){
            console.log(err)
            return res.status(500).send(err);
        }

        res.send('File uploaded!');
    })
})

app.listen(port, () => console.info(`App is listening at port: ${port}.`))