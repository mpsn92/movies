require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Movie = require("./models/movie");
const nunjucks = require("nunjucks");
const path = require("node:path");

const moviesApiRouter = require("./routes/movies-api");
const moviesWebRouter = require("./routes/movies-web");

// L'aplicació coordina middleware i routers; no conté el CRUD de Movies.
const app = express();
const PORT = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

// No iniciem el servidor sense la configuració sensible necessària.
if (!uri) {
  console.error("Falta la variable d'entorn MONGODB_URI");
  process.exit(1);
}

// Connectem Nunjucks amb Express i mantenim l'escapament HTML actiu.
nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
});
app.set("view engine", "njk");

// Els analitzadors preparen req.body abans que cap ruta el necessite.
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
// Només els recursos de public/ es poden descarregar directament.
app.use(express.static(path.join(__dirname, "public")));

// Cada prefix delega la petició en el router de la seua interfície.
app.use("/api/movies", moviesApiRouter);
app.use("/movies", moviesWebRouter);

// Esta funció només s'executa si cap ruta anterior ha enviat una resposta.
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Ruta no trobada" });
  }

  return res.status(404).render("error", {
    title: "Pàgina no trobada",
    message: "La pàgina sol·licitada no existix.",
  });
});

// Quatre paràmetres identifiquen aquest middleware com a gestor d'errors.
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // Traduïm errors coneguts a respostes segures per al client.
  let status = 500;
  let message = "S’ha produït un error intern.";

  if (error.type === "entity.parse.failed") {
    status = 400;
    message = "El cos de la petició no és vàlid.";
  } else if (error.type === "entity.too.large") {
    status = 413;
    message = "El cos supera el límit permés.";
  } else if (error.name === "ValidationError") {
    status = 400;
    message = "Les dades no són vàlides.";
  } else if (error.name === "CastError") {
    status = 400;
    message = "L’identificador o una dada no té un format vàlid.";
  }

  console.error(error);

  // La mateixa incidència es representa en JSON o HTML segons la interfície.
  if (req.path.startsWith("/api/"))
    return res.status(status).json({ error: message });
  return res.status(status).render("error", {
    title: "Error",
    message,
  });
});
//codi de consultes, afegir, borrar
const campsPermesos = [
  "title",
  "year",
  "director",
  "duration",
  "genre",
  "rate",
  "poster",
];

app.use(express.json({ limit: "100kb" }));

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function movieData(body) {
  const data = {};
  for (const camp of campsPermesos)
    if (Object.hasOwn(body, camp)) data[camp] = body[camp];
  return data;
}

/*
app.get("/movies", (req, res) => {
  const { genre } = req.query;
  const resultat =
    typeof genre === "string"
      ? movies.filter((movie) =>
          movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase()),
        )
      : movies;
  return res.json(resultat);
});

app.get("/movies/:id", (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ error: "Identificador no vàlid" });
  }
  const movie = movies.find((element) => element.id === req.params.id);
  if (!movie) return res.status(404).json({ error: "Pel·lícula no trobada" });
  return res.json(movie);
});

app.post("/movies", (req, res) => {
  if (
    !req.body ||
    typeof req.body !== "object" ||
    Array.isArray(req.body) ||
    !req.body.title
  ) {
    return res.status(400).json({ error: "Cal un objecte JSON amb title" });
  }
  const movie = { id: crypto.randomUUID() };
  for (const camp of campsPermesos)
    if (Object.hasOwn(req.body, camp)) movie[camp] = req.body[camp];
  movies.push(movie);
  return res.status(201).json(movie);
});

app.patch("/movies/:id", async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ error: "Identificador no vàlid" });
  }
  if (!isPlainObject(req.body))
    return res.status(400).json({ error: "El cos ha de ser un objecte JSON" });
  const update = movieData(req.body);
  if (Object.keys(update).length === 0)
    return res.status(400).json({ error: "No hi ha camps per actualitzar" });
  const movie = await Movie.findByIdAndUpdate(req.params.id, update, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!movie) return res.status(404).json({ error: "Pel·lícula no trobada" });
  for (const camp of campsPermesos)
    if (Object.hasOwn(req.body, camp)) movie[camp] = req.body[camp];
  return res.json(movie);
});

app.delete("/movies/:id", async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ error: "Identificador no vàlid" });
  }
  const movie = await Movie.findByIdAndDelete(req.params.id);
  const index = movies.findIndex((element) => element.id === req.params.id);
  if (index === -1)
    return res.status(404).json({ error: "Pel·lícula no trobada" });
  movies.splice(index, 1);
  return res.status(204).end();
});
*/
app.use((req, res) => res.status(404).json({ error: "Ruta no trobada" }));
const server = app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("No s'ha pogut iniciar el servidor:", error.message);
  process.exitCode = 1;
});
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.parse.failed")
    return res.status(400).json({ error: "El cos ha de ser JSON vàlid" });
  if (error.type === "entity.too.large")
    return res.status(413).json({ error: "El cos supera el límit permés" });
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Dades no vàlides",
      details: Object.values(error.errors).map((detail) => detail.message),
    });
  }
  console.error(error);
  return res.status(500).json({ error: "Error intern del servidor" });
});
async function start() {
  try {
    // Evitem acceptar peticions fins que MongoDB estiga disponible.
    await mongoose.connect(uri);
    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No s’ha pogut connectar a MongoDB:", error.message);
    process.exit(1);
  }
}

start();
