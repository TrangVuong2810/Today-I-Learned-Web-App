const mysql = require("mysql2");
const connection = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "28102004",
  database: "today_i_learned",
});

module.exports = connection;
