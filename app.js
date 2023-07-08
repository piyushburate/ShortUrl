// Requires
const express = require("express")
const session = require("express-session")
const path = require("path")
const database = require("./mysql_db_connection")

// Variables
let app = express()
let port = 3000
let statusCodes = {
    OK: 100,
    DB_ERROR: 50,
    AUTH_ERORR: 10,
    ERROR: 0
}

// Set use
app.use("/static", express.static(path.resolve(__dirname, "src", "static")))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: (new Date().getTime() + (30 * 86400 * 1000)) }
}))

let databaseRequest = async (query) => {
    let p = await new Promise((resolve) => database.query(query, (err, res) => {
        if (err) {
            resolve({
                status: false,
                statusCode: statusCodes.DB_ERROR,
                result: err.errno + " " + err.code + ": " + err.sqlMessage
            })
        } else {
            resolve({ status: true, statusCode: statusCodes.OK, result: res })
        }
    }))
    let response = await p
    return response
}

// API GET requests
app.get("/api/db/links", async (req, res) => {
    if (!req.session.loggedin) {
        res.send({
            status: false,
            statusCode: statusCodes.AUTH_ERORR,
            result: "Login required to get database data."
        })
    } else {
        var query = `SELECT id, code, link, DATE_FORMAT(datetime, '%b %e, %Y') AS 'datetime', clicks, link_active FROM links WHERE uid = ${req.session.uid}`
        let data = await databaseRequest(query)
        res.send({
            status: data.status,
            statusCode: data.statusCode,
            result: data.result
        })
    }
})
app.get("/api/db/links/:id", async (req, res) => {
    if (!req.session.loggedin) {
        res.send({
            status: false,
            statusCode: statusCodes.AUTH_ERORR,
            result: "Login required to get database data."
        })
    } else {
        var query = `SELECT title, code, link, DATE_FORMAT(datetime, '%b %e, %Y') AS 'datetime', clicks, link_active FROM links WHERE uid = ${req.session.uid} && id = ${req.params.id}`
        let data = await databaseRequest(query)
        res.send({
            status: data.status,
            statusCode: data.statusCode,
            result: data.result
        })
    }
})

app.get("/api/session/:data", (req, res) => {
    var status = true, statusCode = 100, result = null
    if (req.session.loggedin == true) {
        switch (req.params.data) {
            case "username":
                result = req.session.username
                break;
            case "email":
                result = req.session.email
                break;
            case "uid":
                result = req.session.uid
                break;
            default:
                status = false
                statusCode = statusCodes.ERROR
                result = "Data not found."
                break;
        }
    } else {
        status = false
        statusCode = statusCodes.AUTH_ERORR
        result = "Login required to get database data."
    }
    res.send({ status: status, statusCode: statusCode, result: result })

})

// GET requests
app.get("/user", async (req, res) => {
    if (req.session.loggedin) {
        res.redirect("/user/" + req.session.username)
    } else {
        res.redirect("/login")
    }
})
app.get("/user/:username", (req, res) => {
    if (req.session.loggedin) {
        if (req.session.username == req.params.username) {
            res.redirect("/user/" + req.session.username + "/overview")
        } else {
            res.redirect("/error")
        }
    } else {
        res.redirect("/login")
    }
})

app.get("/user/:username/*", (req, res) => {
    if (req.session.loggedin) {
        if (req.session.username == req.params.username) {
            res.sendFile(path.resolve(__dirname, "src", "index.html"))
        } else {
            res.redirect("/error")
        }
    } else {
        res.redirect("/login")
    }
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


// POST requests
app.post("/authLogin", async (req, res) => {
    var username = req.body.username
    var password = req.body.password
    var query = `SELECT uid, username, email FROM users WHERE username = '${username}' AND password = '${password}'`
    let data = await databaseRequest(query)
    if (data.status) {
        if (data.result.length == 1) {
            req.session.loggedin = true
            req.session.username = data.result[0].username
            req.session.email = data.result[0].email
            req.session.uid = data.result[0].uid
            res.send({
                status: data.status,
                statusCode: data.statusCode,
                result: "Login successful!"
            })
        } else if (data.result.length == 0) {
            res.send({ status: false, statusCode: statusCodes.ERROR, result: "Invalid username or password." })
        } else {
            res.send({ status: false, statusCode: statusCodes.ERROR, result: "An internal error occured! Please try again" })
        }
    } else {
        res.send(data)
    }
})

app.post("/authSignup", async (req, res) => {
    const { name, email, username, password } = req.body
    var query = `SELECT * FROM users WHERE username = '${username}'`
    let data = await databaseRequest(query)
    if (data.status) {
        if (data.result.length == 0) {
            var query2 = `INSERT INTO users (username, name, email, password) VALUES ('${username}', '${name}', '${email}', '${password}')`
            let data2 = await databaseRequest(query2)
            if (data2.status) {
                res.send({ status: true, statusCode: 100, result: "Signup successful!", username: username, password: password })
            } else {
                res.send(data2)
            }
        } else if (data.result.length == 1) {
            res.send({ status: false, statusCode: statusCodes.ERROR, result: "Username already taken!" })
        } else {
            res.send({ status: false, statusCode: statusCodes.ERROR, result: "An internal error occured! Please try again" })
        }
    } else {
        res.send(data)
    }
})

app.post("/createShortLink", async (req, res) => {
    if (!req.session.loggedin) {
        res.send({
            status: false,
            statusCode: statusCodes.AUTH_ERORR,
            result: "Login required to get database data."
        })
    } else {
        const { longurl, shorturl, title } = req.body
        var query = `SELECT * FROM links WHERE code = '${shorturl}'`
        let data = await databaseRequest(query)
        if (data.status) {
            if (data.result.length == 0) {
                var query2 = `INSERT INTO links (code, link, uid, title) VALUES ('${shorturl}', '${longurl}', '${req.session.uid}', '${title}')`
                let data2 = await databaseRequest(query2)
                if (data2.status) {
                    res.send({ status: true, statusCode: 100, result: "Short link created successfully!" })
                } else {
                    res.send(data2)
                }
            } else if (data.result.length == 1) {
                res.send({ status: false, statusCode: statusCodes.ERROR, result: "Short URL code already taken!" })
            } else {
                res.send({ status: false, statusCode: statusCodes.ERROR, result: "An internal error occured! Please try again" })
            }
        } else {
            res.send(data)
        }
    }
})

app.post("/updateShortLink", async (req, res) => {
    if (!req.session.loggedin) {
        res.send({
            status: false,
            statusCode: statusCodes.AUTH_ERORR,
            result: "Login required to get database data."
        })
    } else {
        const { longurl, shorturl, title, link_active } = req.body
        var query = `SELECT * FROM links WHERE code = '${shorturl}' && uid = ${req.session.uid}`
        let data = await databaseRequest(query)
        if (data.status) {
            if (data.result.length == 1) {
                var query2 = `UPDATE links SET code = '${shorturl}', link = '${longurl}', title = '${title}', link_active = ${link_active} WHERE code = '${shorturl}' && uid = ${req.session.uid}`
                let data2 = await databaseRequest(query2)
                if (data2.status) {
                    res.send({ status: true, statusCode: 100, result: "Short link updated successfully!" })
                } else {
                    res.send(data2)
                }
            } else {
                res.send({ status: false, statusCode: statusCodes.ERROR, result: "An internal error occured! Please try again" })
            }
        } else {
            res.send(data)
        }
    }
})

app.use("/error", (req, res) => {
    res.sendFile(path.resolve(__dirname, "src", "index.html"))
})

app.get("/:link_code", async (req, res) => {
    var query = `SELECT link FROM links WHERE code = '${req.params.link_code}' AND link_active = TRUE`
    let data = await databaseRequest(query)
    if (data.status) {
        if (data.result.length == 1) {
            var query2 = `UPDATE links SET clicks = clicks + 1 WHERE code = '${req.params.link_code}'`
            let data2 = await databaseRequest(query2)
            if (!data2.status) {
                console.log(data2.result);
            }
            res.redirect(data.result[0].link)
        } else {
            res.redirect("/error")
        }
    } else {
        res.redirect("/error")
    }
})
// Application Entry Point
app.use("/", (req, res) => {
    if (req.session.loggedin) {
        res.redirect("/user/" + req.session.username)
    } else {
        res.redirect("/login")
    }
})

// Start Server
app.listen(port, () => {
    console.log("Listening server at http://localhost:" + port)
})