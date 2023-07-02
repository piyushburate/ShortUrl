const mysql = require("mysql")

var database = mysql.createConnection({
    host: "localhost",
    database: "shorturl",
    user: "root",
    password: ""
})

database.connect(function (err) {
    if (err) throw err
    console.log("MySQL Database Connected!")
})

module.exports = database