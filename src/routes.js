const path = require("path");

const categoryController = require("./controllers/CategoryController");
const factController = require("./controllers/FactController");

function route(app) {
  app.get("/categories", categoryController.getAllCategory);

  app.get("/facts/:categoryId", factController.getFacts);

  app.post("/facts/postNewFact", factController.postNewFact);

  app.put("/updateVote/:factId/:voteName", factController.updateVote);
}

module.exports = route;
