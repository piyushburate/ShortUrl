// Requires
const express = require("express")
const path = require("path")
const database = require("./mysql_db_connection")

// Variables
let app = express()
let port = 3000

// Set Static folder
app.use("/static", express.static(path.resolve(__dirname, "src", "static")))

// Database API Points
app.get("/api/db/:uid/links", (req, res) => {
    console.log("db");
    var query = `SELECT id, code, link, DATE_FORMAT(datetime, '%b %e, %Y') AS 'datetime', clicks, link_active FROM links WHERE uid = ${req.params.uid}`
    database.query(query, (err, rows) => {
        if (err || rows.length == 0) {
            res.send("404 NOT FOUND")
        } else {
            res.send(rows)
        }
    })
})
app.get("/api/db/:uid/links/:id", (req, res) => {
    console.log("db2");
    var query = `SELECT title, code, link, DATE_FORMAT(datetime, '%M %e, %Y %l:%i %p') AS 'datetime', clicks, link_active FROM links WHERE uid = ${req.params.uid} AND id = ${req.params.id}`
    database.query(query, (err, rows) => {
        if (err || rows.length == 0) {
            res.send("404 NOT FOUND")
        } else {
            res.send(rows)
        }
    })
})

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


app.get("/:link_code", (req, res) => {
    console.log("next");
    var query = `SELECT link FROM links WHERE code = '${req.params.link_code}' AND link_active = TRUE`
    database.query(query, (err, rows) => {
        if (err || rows.length == 0) {
            res.send("404 NOT FOUND <script>console.log(" + err + ")</script>")
        } else {
            database.query("UPDATE links SET clicks = clicks + 1", (err) => {
                if (err) {
                    res.send("Error <script>console.log(" + err + ")</script>")
                } else {
                    res.redirect(rows[0].link)
                }
            })
        }
    })
})

app.use("/", (req, res) => {
    res.redirect("/login")
})

// Start Server
app.listen(port, () => {
    console.log("Listening server at http://localhost:" + port)
})