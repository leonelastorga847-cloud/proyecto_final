const mongoose = require('mongoose');

const libroSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    autor: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, trim: true },
    genero: { type: String, trim: true },
    anio_publicacion: { type: Number, min: 0 },
    ejemplares_disponibles: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, collection: 'libros' }
);

module.exports = mongoose.model('Libro', libroSchema);
