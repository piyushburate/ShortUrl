// Requires
const express = require("express")
const path = require("path")
const database = require("./mysql_db_connection")

// Variables
let app = express()
let port = 8081

// Set Static folder
app.use("/static", express.static(path.resolve(__dirname, "src", "static")))

// Database requests
app.get("/db", (req, res)=>{
    database.query("SELECT * FROM users", (err, rows)=>{
        if (err) throw err
        res.send(rows)
    })
})

// Set Entry Point
app.get("/*", (req, res)=>{
    res.sendFile(path.resolve(__dirname, "src", "index.html"))
})

// Start Server
app.listen(port, ()=>{
    console.log("Listening server at http://localhost:" + port)
})