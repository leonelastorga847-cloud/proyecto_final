const express = require('express');
const Libro = require('../models/Libro');
const Prestamo = require('../models/Prestamo');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', requireAuth, async (req, res) => {
  const [totalLibros, prestamosActivos] = await Promise.all([
    Libro.countDocuments(),
    Prestamo.countDocuments({ estado: 'Activo' }),
  ]);

  res.render('dashboard', { title: 'Dashboard', totalLibros, prestamosActivos });
});

module.exports = router;
