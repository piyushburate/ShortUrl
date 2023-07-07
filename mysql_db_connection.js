const mysql = require("mysql")

var database = mysql.createConnection({
    host: "localhost",
    database: "shorturl",
    user: "root",
    password: ""
})
// var database = mysql.createConnection({
//     host: "sql6.freesqldatabase.com",
//     database: "sql6630821",
//     user: "sql6630821",
//     password: "hy4wPCdlVg"
// })

database.connect(function (err) {
    if (err) {
        console.log(err)
    } else {
        console.log("MySQL Database Connected!")
    }
})

module.exports = database