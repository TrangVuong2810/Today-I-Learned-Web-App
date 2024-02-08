const path = require("path");
const db = require(path.join(__dirname, "..", "config", "db", "index"));

class CategoryController {
  //[GET]
  getAllCategory(req, res) {
    db.connect();

    const sqlQuery = `SELECT * FROM categories`;

    db.query(sqlQuery, function (error, categories) {
      if (error) {
        console.error("Error retrieving categories from album", error);
        return res.status(500).send("Error executing query");
      }
      if (categories.length === 0) {
        return res.status(404).send("No categories found");
      }

      res.send(categories);
    });
  }
}

module.exports = new CategoryController();
