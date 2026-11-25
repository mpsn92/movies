//IMPORTS, LLISTAT I FILTRE
//API

const Movie = require("../models/movie");

// Només aquests camps poden passar de la petició al model.
const allowedFields = [
  "title",
  "year",
  "director",
  "duration",
  "poster",
  "genre",
  "rate",
];

async function listMovies(genre) {
  // Construïm el filtre de confiança, no reutilitzem req.query.
  const filter = {};

  if (typeof genre === "string" && genre.trim() !== "") {
    filter.genre = genre.trim();
  }

  // La consulta asíncrona queda encapsulada i servix l'API i la web.
  return Movie.find(filter).sort({ title: 1 });
}
//CREACIÓ DES DEL FORMULARI
exports.listApi = async (req, res, next) => {
  try {
    // El controlador rep el filtre, consulta el model i respon JSON.
    const movies = await listMovies(req.query.genre);
    return res.json(movies);
  } catch (error) {
    return next(error);
  }
};
function validationErrors(error) {
  // Només exposem a la vista els missatges d'un ValidationError de Mongoose.
  if (error.name !== "ValidationError") return null;

  return Object.fromEntries(
    Object.entries(error.errors).map(([field, detail]) => [
      field,
      detail.message,
    ]),
  );
}

//LECTURA D'UNA PELICULA
exports.showApi = async (req, res, next) => {
  try {
    // :id és un paràmetre de ruta que el model usa per buscar el document.
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      // Un identificador correcte sense document és un recurs inexistent.
      return res.status(404).json({ error: "Pel·lícula no trobada" });
    }

    return res.json(movie);
  } catch (error) {
    return next(error);
  }
};
//PREPARACIÓ SEGURA DE LES DADES
function isObject(value) {
  // Rebutgem null i arrays, que també tenen typeof "object" en JavaScript.
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function movieData(body) {
  if (!isObject(body)) {
    return null;
  }

  // Copiem a un objecte nou: és una llista blanca contra camps no permesos.
  const data = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(body, field)) {
      data[field] = body[field];
    }
  }

  // El formulari envia text; el model espera un array de gèneres.
  if (Object.hasOwn(data, "genre") && typeof data.genre === "string") {
    data.genre = data.genre
      .split(",")
      .map((genre) => genre.trim())
      .filter((genre) => genre !== "");
  }

  return data;
}
//CREACIÓ
exports.createApi = async (req, res, next) => {
  try {
    // Seleccionem i normalitzem les dades abans de contactar amb MongoDB.
    const data = movieData(req.body);

    if (!data) {
      return res
        .status(400)
        .json({ error: "El cos ha de ser un objecte JSON" });
    }

    // create() valida amb l'esquema i inserix el document en la col·lecció.
    const movie = await Movie.create(data);
    return res.status(201).location(`/api/movies/${movie._id}`).json(movie);
  } catch (error) {
    return next(error);
  }
};

//ACTUALITZACIÓ PARCIAL
exports.updateApi = async (req, res, next) => {
  try {
    const data = movieData(req.body);

    if (!data || Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ error: "No hi ha cap camp permés per actualitzar" });
    }

    // PATCH actualitza només les dades acceptades i torna la versió nova.
    const movie = await Movie.findByIdAndUpdate(req.params.id, data, {
      returnDocument: "after",
      // En findByIdAndUpdate(), activem explícitament els validadors.
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({ error: "Pel·lícula no trobada" });
    }

    return res.json(movie);
  } catch (error) {
    return next(error);
  }
};

//ELIMINACIÓ I ERRORS ASÍNCRONS
exports.removeApi = async (req, res, next) => {
  try {
    // La consulta retorna el document eliminat o null si no existia.
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ error: "Pel·lícula no trobada" });
    }

    // 204 indica èxit sense cos de resposta.
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

//WEB

//Escolta la web
exports.listWeb = async (req, res, next) => {
  try {
    const movies = await listMovies(req.query.genre);
    // La web reutilitza la consulta, però la resposta és una vista HTML.
    return res.render("movies/list", { movies, genre: req.query.genre || "" });
  } catch (error) {
    return next(error);
  }
};

//Export Show
exports.showWeb = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      // La interfície web representa el 404 amb una plantilla controlada.
      return res.status(404).render("error", {
        title: "Pel·lícula no trobada",
        message: "No existix cap pel·lícula amb aquest identificador.",
      });
    }

    // La vista rep dades, no accedix directament a MongoDB.
    return res.render("movies/show", { movie });
  } catch (error) {
    return next(error);
  }
};

exports.newWeb = (req, res) => {
  // Un objecte buit permet reutilitzar el mateix formulari per a crear.
  return res.render("movies/form", {
    movie: {},
    errors: {},
    action: "/movies",
  });
};

//Creació i EXPORTAR CONSULTES WEB
exports.createWeb = async (req, res, next) => {
  // La llista blanca evita passar camps no permesos de req.body al model.
  const movie = movieData(req.body);

  if (!movie) {
    return res.status(400).render("movies/form", {
      movie: {},
      errors: { form: "Les dades del formulari no són vàlides." },
      action: "/movies",
    });
  }

  try {
    const createdMovie = await Movie.create(movie);
    return res.redirect(`/movies/${createdMovie._id}`);
  } catch (error) {
    const errors = validationErrors(error);

    if (errors) {
      // La validació es resol ací: no arriba al middleware final d'errors.
      return res.status(400).render("movies/form", {
        movie,
        errors,
        action: "/movies",
      });
    }

    // Un error que no és de validació sí que es delega al gestor final.
    return next(error);
  }
};

//Editar WEB
exports.editWeb = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).render("error", {
        title: "Pel·lícula no trobada",
        message: "No existix cap pel·lícula amb aquest identificador.",
      });
    }

    // El mateix formulari rep ara les dades existents i la ruta d'actualització.
    return res.render("movies/form", {
      movie,
      errors: {},
      action: `/movies/${movie._id}`,
    });
  } catch (error) {
    return next(error);
  }
};

//ACTUALITZAR WEB
exports.updateWeb = async (req, res, next) => {
  // El formulari envia text; movieData() el filtra i normalitza.
  const data = movieData(req.body);

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).render("movies/form", {
      movie: { ...(data || {}), _id: req.params.id },
      errors: { form: "Les dades del formulari no són vàlides." },
      action: `/movies/${req.params.id}`,
    });
  }

  try {
    // L'actualització conserva els validadors del model.
    const movie = await Movie.findByIdAndUpdate(req.params.id, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).render("error", {
        title: "Pel·lícula no trobada",
        message: "No existix cap pel·lícula amb aquest identificador.",
      });
    }

    // Després de modificar, mostrem la representació actualitzada amb un GET.
    return res.redirect(`/movies/${movie._id}`);
  } catch (error) {
    const errors = validationErrors(error);

    if (errors) {
      return res.status(400).render("movies/form", {
        movie: { ...data, _id: req.params.id },
        errors,
        action: `/movies/${req.params.id}`,
      });
    }

    return next(error);
  }
};

//Borrar WEB
exports.removeWeb = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).render("error", {
        title: "Pel·lícula no trobada",
        message: "No existix cap pel·lícula amb aquest identificador.",
      });
    }

    // Després d'esborrar, ja no hi ha detall que mostrar: tornem al llistat.
    return res.redirect("/movies");
  } catch (error) {
    return next(error);
  }
};
