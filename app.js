// Requires
const express = require("express")
const session = require("express-session")
const path = require("path")
const database = require("./mysql_db_connection")

// Variables
let app = express()
let port = 3000
let error404 = "404 Not Found"

// Set use
app.use("/static", express.static(path.resolve(__dirname, "src", "static")))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

// API GET requests
app.get("/api/db/:uid/links", (req, res) => {
    if (!req.session.loggedin) throw "Error";
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
    if (!req.session.loggedin) throw "Error";
    var query = `SELECT title, code, link, DATE_FORMAT(datetime, '%M %e, %Y %l:%i %p') AS 'datetime', clicks, link_active FROM links WHERE uid = ${req.params.uid} AND id = ${req.params.id}`
    database.query(query, (err, rows) => {
        if (err || rows.length == 0) {
            res.send("404 NOT FOUND")
        } else {
            res.send(rows)
        }
    })
})

app.get("/api/session/data", (req, res) => {
    if (req.session.loggedin == true) {
        var data = {
            status: "ok",
            username: req.session.username,
            email: req.session.email,
            uid: req.session.uid,
        }
        res.send(data)
    } else {
        var data = {
            status: "error",
            error: "Loggin required to get session data."
        }
        res.send(data)
    }

})

// GET requests
app.get("/user/*", (req, res) => {
    if (!req.session.loggedin) {
        res.redirect("/login")
        res.end()
    } else if (req.url.split("/", 3)[2] != req.session.username) throw error404
    res.sendFile(path.resolve(__dirname, "src", "index.html"))
})

app.get("/login", (req, res) => {
    if (req.session.loggedin == true) {
        res.redirect("/user/" + req.session.username)
    } else {
        res.sendFile(path.resolve(__dirname, "src", "index.html"))
    }
})

app.get("/signup", (req, res) => {
    if (req.session.loggedin == true) {
        res.redirect("/user/" + req.session.username)
    } else {
        res.sendFile(path.resolve(__dirname, "src", "index.html"))
    }
})

app.get("/logout", (req, res) => {
    if (req.session.loggedin == true) {
        req.session.destroy()
    }
    res.redirect("/login")
})

app.get("/:link_code", (req, res) => {
    var query = `SELECT link FROM links WHERE code = '${req.params.link_code}' AND link_active = TRUE`
    database.query(query, (err, rows) => {
        if (err || rows.length == 0) {
            res.send("404 NOT FOUND <script>console.log(" + err + ")</script>")
        } else {
            database.query("UPDATE links SET clicks = clicks + 1", (err2, rows2) => {
                if (err2) {
                    res.send("Error <script>console.log(" + err2 + ")</script>")
                } else {
                    res.redirect(rows[0].link)
                }
            })
        }
    })
})

// POST requests
app.post("/authLogin", (req, res) => {
    var username = req.body.username
    var password = req.body.password
    // console.log(req.body);
    var query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`
    database.query(query, (err, rows) => {
        if (err) {
            res.send({
                status: "error",
                error: err
            })
        } else if (rows.length == 0) {
            res.send({
                status: "error",
                error: "Invalid Username or Password!"
            })
        } else {
            req.session.loggedin = true
            req.session.username = rows[0].username
            req.session.email = rows[0].email
            req.session.uid = rows[0].uid
            res.send({
                status: "ok",
                result: "Log in successful!"
            })
        }
    })
})

app.post("/authSignup", (req, res) => {
    // console.log("signup");
    const { name, email, username, password } = req.body
    // console.log(username);
    var query = `SELECT * FROM users WHERE username = '${username}'`
    database.query(query, (err, rows) => {
        if (err) {
            res.send({
                status: "error",
                error: err
            })
        } else if (rows.length > 0) {
            res.send({
                status: "error",
                error: "Username already taken!"
            })
        } else {
            var query2 = `INSERT INTO users (username, name, email, password) VALUES ('${username}', '${name}', '${email}', '${password}')`
            database.query(query2, (err2, rows2) => {
                if (err2) {
                    res.send({
                        status: "error",
                        error: err2
                    })
                } else {
                    res.send({
                        status: "ok",
                        username: username,
                        password: password,
                        result: "Sign up successful!"
                    })
                }
            })
        }
    })
})

// Application Entry Point
app.use("/", (req, res) => {
    if (req.session.loggedin == true) {
        res.redirect("/user/" + req.session.username)
    } else {
        res.redirect("/login")
    }
})

// Start Server
app.listen(port, () => {
    console.log("Listening server at http://localhost:" + port)
})