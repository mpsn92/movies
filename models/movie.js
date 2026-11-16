const mongoose = require("mongoose");

// El model concentra l'estructura, la validació i l'accés a MongoDB.
const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El títol és obligatori"],
      trim: true,
      minlength: [1, "El títol no pot estar buit"],
      maxlength: [200, "El títol no pot superar 200 caràcters"],
    },
    year: {
      type: Number,
      required: [true, "L'any és obligatori"],
      min: [1888, "L'any ha de ser 1888 o posterior"],
    },
    director: {
      type: String,
      required: [true, "El director o directora és obligatori"],
      trim: true,
      maxlength: [120, "El nom no pot superar 120 caràcters"],
    },
    duration: {
      type: Number,
      required: [true, "La duració és obligatòria"],
      min: [1, "La duració ha de ser positiva"],
    },
    poster: {
      type: String,
      trim: true,
      match: [/^https?:\/\/\S+$/i, "La URL del cartell ha de començar per http o https"],
    },
    genre: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    rate: {
      type: Number,
      min: [0, "La puntuació mínima és 0"],
      max: [10, "La puntuació màxima és 10"],
      default: 5,
    },
  },
  // Mongoose manté aquestes dates; el client no les pot aportar amb movieData().
  { timestamps: true },
);

// Exportem el model CommonJS que faran servir els controladors.
module.exports = mongoose.model("Movie", movieSchema);
