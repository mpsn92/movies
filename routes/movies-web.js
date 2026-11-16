const express = require("express");
const moviesController = require("../controllers/movies");

// Aquest router només publica les accions HTML del controlador.
const router = express.Router();

router.get("/", moviesController.listWeb);
// La ruta literal ha d'anar abans de /:id perquè "new" no siga un id.
router.get("/new", moviesController.newWeb);
router.post("/", moviesController.createWeb);
router.get("/:id/edit", moviesController.editWeb);
// Els formularis HTML usen POST per modificar o eliminar dades.
router.post("/:id", moviesController.updateWeb);
router.post("/:id/delete", moviesController.removeWeb);
router.get("/:id", moviesController.showWeb);

// app.js el munta amb el prefix /movies.
module.exports = router;
