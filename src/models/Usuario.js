const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
  },
  { timestamps: true, collection: 'usuarios' }
);

module.exports = mongoose.model('Usuario', usuarioSchema);
