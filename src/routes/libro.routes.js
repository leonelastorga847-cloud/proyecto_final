const express = require('express');
const Libro = require('../models/Libro');
const Prestamo = require('../models/Prestamo');
const { requireAuth } = require('../middleware/auth');
const { formatDate } = require('../utils/dates');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const libros = await Libro.find().sort({ titulo: 1 });
  res.render('libros/index', { title: 'Books', libros });
});

router.get('/nuevo', (req, res) => {
  res.render('libros/form', { title: 'New book', libro: {}, action: '/libros', method: 'POST' });
});

router.post('/', async (req, res) => {
  try {
    await Libro.create(normalizeLibro(req.body));
    req.session.flash = { type: 'success', message: 'Book created successfully.' };
    res.redirect('/libros');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Could not save the book. Check required fields and unique ISBN.' };
    res.redirect('/libros/nuevo');
  }
});

router.get('/:id', async (req, res) => {
  const libro = await Libro.findById(req.params.id);

  if (!libro) {
    return res.status(404).render('error', { title: 'Book not found', message: 'The requested book does not exist.' });
  }

  const prestamos = await Prestamo.find({ libro_id: libro._id }).sort({ fecha_prestamo: -1 });
  res.render('libros/show', { title: libro.titulo, libro, prestamos, formatDate });
});

router.get('/:id/editar', async (req, res) => {
  const libro = await Libro.findById(req.params.id);

  if (!libro) {
    return res.status(404).render('error', { title: 'Book not found', message: 'The requested book does not exist.' });
  }

  res.render('libros/form', { title: 'Edit book', libro, action: `/libros/${libro._id}?_method=PUT`, method: 'POST' });
});

router.put('/:id', async (req, res) => {
  try {
    await Libro.findByIdAndUpdate(req.params.id, normalizeLibro(req.body), { runValidators: true });
    req.session.flash = { type: 'success', message: 'Book updated successfully.' };
    res.redirect('/libros');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Could not update the book.' };
    res.redirect(`/libros/${req.params.id}/editar`);
  }
});

router.delete('/:id', async (req, res) => {
  await Prestamo.deleteMany({ libro_id: req.params.id });
  await Libro.findByIdAndDelete(req.params.id);
  req.session.flash = { type: 'success', message: 'Book and associated loans deleted.' };
  res.redirect('/libros');
});

function normalizeLibro(body) {
  return {
    titulo: body.titulo,
    autor: body.autor,
    isbn: body.isbn,
    genero: body.genero || undefined,
    anio_publicacion: body.anio_publicacion || undefined,
    ejemplares_disponibles: body.ejemplares_disponibles,
  };
}

module.exports = router;
