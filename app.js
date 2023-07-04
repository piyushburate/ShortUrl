// Requires
const express = require("express")
const path = require("path")
const database = require("./mysql_db_connection")

// Variables
let app = express()
let port = 3000

// Set Static folder
app.use("/static", express.static(path.resolve(__dirname, "src", "static")))

// Set Entry Points
app.get("/user/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "src", "index.html"))
})

app.get("/login", (req, res) => {
    res.sendFile(path.resolve(__dirname, "src", "index.html"))
})

app.get("/signup", (req, res) => {
    res.sendFile(path.resolve(__dirname, "src", "index.html"))
})

app.use("/", (req, res) => {
    // res.send("404 Not Found")
    res.redirect("/login")
})

app.get("/:link_code", (req, res, next) => {
    console.log("next");
    var query = `SELECT link FROM links WHERE code = '${req.params.link_code}'`
    database.query(query, (err, rows) => {
        if (err || rows.length == 0) {
            // console.log(err);
            res.send("404 NOT FOUND")
        } else {
            res.redirect(rows[0].link)
            // res.send(rows[0].link)
        }
    })
})


// Start Server
app.listen(port, () => {
    console.log("Listening server at http://localhost:" + port)
})