const { link } = require("fs");
const path = require("path");
const db = require(path.join(__dirname, "..", "config", "db", "index"));

class FactController {
  //[GET]
  getFacts(req, res) {
    db.connect();
    const id = req.params.categoryId;
    let sqlQuery;
    id == 0
      ? (sqlQuery = `SELECT f.*, c.cat_name, c.color
                    FROM facts f
                    JOIN fact_category fc ON f.id = fc.fact_id
                    JOIN categories c ON c.id = fc.category_id`)
      : (sqlQuery = `SELECT f.*, c.cat_name, c.color
                    FROM facts f
                    JOIN fact_category fc ON f.id = fc.fact_id
                    JOIN categories c ON c.id = fc.category_id
                    WHERE c.id = ${id}`);

    db.query(sqlQuery, function (error, facts) {
      if (error) {
        console.error("Error retrieving facts from category", error);
        return res.status(500).send("Error executing query");
      }
      res.send(facts);
    });
  }

  postNewFact(req, res) {
    db.connect();

    const { fact_content, link_source, categoryId } = req.body;

    let query = `INSERT INTO facts (fact_content, link_source) VALUES
                ('${fact_content}',
                '${link_source}');`;

    db.query(query, function (error, result) {
      if (error) {
        console.error("Error inserting fact:", error);
        return res.status(500).send("Error executing query");
      } else {
        const newFactId = result.insertId;
        console.log("Fact inserted successfully with ID:", newFactId);

        query = `INSERT INTO fact_category (fact_id, category_id) VALUES
            (${newFactId}, ${categoryId}); `;

        db.query(query, function (error, result) {
          if (error) {
            console.error("Error inserting fact_category:", error);
          } else {
            query = `SELECT * FROM facts where id = ${newFactId}; `;
            db.query(query, function (error, result) {
              if (!error) res.send(result);
            });
          }
        });
      }
    });
  }

  updateVote(req, res) {
    db.connect();

    const factId = req.params.factId;
    const voteName = req.params.voteName;

    let query = `UPDATE facts SET ${voteName} =  ${voteName} + 1
                WHERE id = ${factId};`;

    db.query(query, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Lỗi cập nhật vote");
      } else {
        query = `SELECT f.*, c.cat_name, c.color
                  FROM facts f
                  JOIN fact_category fc ON f.id = fc.fact_id
                  JOIN categories c ON c.id = fc.category_id
                  WHERE f.id = ${factId};`;
        db.query(query, function (error, result) {
          if (!error) res.send(result);
        });
      }
    });
  }
}

module.exports = new FactController();
