const mongoose = require('mongoose');

const prestamoSchema = new mongoose.Schema(
  {
    libro_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Libro', required: true },
    lector_nombre: { type: String, required: true, trim: true },
    lector_email: { type: String, required: true, lowercase: true, trim: true },
    fecha_prestamo: { type: Date, required: true },
    fecha_devolucion: { type: Date, required: true },
    estado: { type: String, required: true, enum: ['Activo', 'Devuelto'], default: 'Activo' },
  },
  { timestamps: true, collection: 'prestamos' }
);

module.exports = mongoose.model('Prestamo', prestamoSchema);
