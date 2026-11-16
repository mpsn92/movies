const express = require("express");
const moviesController = require("../controllers/movies");

// El router associa URL i mètode HTTP amb una acció del controlador.
const router = express.Router();

router.get("/", moviesController.listApi);
router.get("/:id", moviesController.showApi);
router.post("/", moviesController.createApi);
router.patch("/:id", moviesController.updateApi);
router.delete("/:id", moviesController.removeApi);

// app.js muntarà aquest router davall de /api/movies.
module.exports = router;
