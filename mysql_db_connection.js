const mysql = require("mysql")

const mysql_db_creds = {
    host: "localhost",
    database: "shorturl",
    user: "root",
    password: ""
}

var mysql_db = mysql.createConnection(mysql_db_creds)

mysql_db.connect(function (err) {
    if (err) {
        console.log(err)
    } else {
        console.log("MySQL Database Connected!")
    }
})

module.exports = {mysql_db, mysql_db_creds}