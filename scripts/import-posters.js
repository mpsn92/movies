require("dotenv").config();

const mongoose = require("mongoose");
const Movie = require("../models/movie");
const movies = require("../movies.json");

const uri = process.env.MONGODB_URI;

async function importPosters() {
  if (!uri) {
    throw new Error("Falta la variable d'entorn MONGODB_URI");
  }

  const posterMovies = movies.filter(
    (movie) =>
      typeof movie.title === "string" &&
      typeof movie.poster === "string" &&
      /^https?:\/\/\S+$/i.test(movie.poster),
  );
  const titles = posterMovies.map((movie) => movie.title);

  try {
    await mongoose.connect(uri);

    const storedMovies = await Movie.find({ title: { $in: titles } })
      .select("title poster")
      .lean();
    const storedByTitle = new Map(
      storedMovies.map((movie) => [movie.title, movie]),
    );
    const operations = posterMovies
      .filter((movie) => {
        const storedMovie = storedByTitle.get(movie.title);
        return storedMovie && !storedMovie.poster;
      })
      .map((movie) => ({
        updateOne: {
          filter: {
            title: movie.title,
            $or: [
              { poster: { $exists: false } },
              { poster: null },
              { poster: "" },
            ],
          },
          update: { $set: { poster: movie.poster } },
        },
      }));

    const result = operations.length
      ? await Movie.bulkWrite(operations)
      : { modifiedCount: 0 };
    const unmatchedTitles = posterMovies
      .filter((movie) => !storedByTitle.has(movie.title))
      .map((movie) => movie.title);

    console.log(`Cartells afegits: ${result.modifiedCount}`);
    if (unmatchedTitles.length) {
      console.warn(
        `No s'han trobat aquestes pel·lícules a MongoDB: ${unmatchedTitles.join(", ")}`,
      );
    }
  } finally {
    await mongoose.disconnect();
  }
}

importPosters().catch((error) => {
  console.error("No s'han pogut importar els cartells:", error.message);
  process.exitCode = 1;
});
