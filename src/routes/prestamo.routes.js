const express = require('express');
const Libro = require('../models/Libro');
const Prestamo = require('../models/Prestamo');
const { requireAuth } = require('../middleware/auth');
const { toDateInput, formatDate } = require('../utils/dates');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const prestamos = await Prestamo.find().populate('libro_id').sort({ fecha_prestamo: -1 });
  res.render('prestamos/index', { title: 'Loans', prestamos, formatDate });
});

router.get('/nuevo', async (req, res) => {
  const libros = await Libro.find({ ejemplares_disponibles: { $gt: 0 } }).sort({ titulo: 1 });
  res.render('prestamos/form', {
    title: 'New loan',
    prestamo: { estado: 'Activo' },
    libros,
    action: '/prestamos',
    method: 'POST',
    toDateInput,
  });
});

router.post('/', async (req, res) => {
  try {
    const prestamoData = normalizePrestamo(req.body);
    await new Prestamo(prestamoData).validate();

    if (prestamoData.estado === 'Activo') {
      const libro = await Libro.findOneAndUpdate(
        { _id: prestamoData.libro_id, ejemplares_disponibles: { $gt: 0 } },
        { $inc: { ejemplares_disponibles: -1 } }
      );

      if (!libro) {
        throw new Error('No available copies for selected book.');
      }
    }

    await Prestamo.create(prestamoData);
    req.session.flash = { type: 'success', message: 'Loan created successfully.' };
    res.redirect('/prestamos');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Could not save the loan. Check required fields.' };
    res.redirect('/prestamos/nuevo');
  }
});

router.get('/:id/editar', async (req, res) => {
  const [prestamo, libros] = await Promise.all([
    Prestamo.findById(req.params.id),
    Libro.find().sort({ titulo: 1 }),
  ]);

  if (!prestamo) {
    return res.status(404).render('error', { title: 'Loan not found', message: 'The requested loan does not exist.' });
  }

  res.render('prestamos/form', {
    title: 'Edit loan',
    prestamo,
    libros,
    action: `/prestamos/${prestamo._id}?_method=PUT`,
    method: 'POST',
    toDateInput,
  });
});

router.put('/:id', async (req, res) => {
  try {
    const current = await Prestamo.findById(req.params.id);

    if (!current) {
      return res.status(404).render('error', { title: 'Loan not found', message: 'The requested loan does not exist.' });
    }

    const next = normalizePrestamo(req.body);
    await new Prestamo(next).validate();
    await restoreActiveCopy(current);

    if (next.estado === 'Activo') {
      const libro = await Libro.findOneAndUpdate(
        { _id: next.libro_id, ejemplares_disponibles: { $gt: 0 } },
        { $inc: { ejemplares_disponibles: -1 } }
      );

      if (!libro) {
        await consumeActiveCopy(current);
        throw new Error('No available copies for selected book.');
      }
    }

    await Prestamo.findByIdAndUpdate(req.params.id, next, { runValidators: true });
    req.session.flash = { type: 'success', message: 'Loan updated successfully.' };
    res.redirect('/prestamos');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Could not update the loan.' };
    res.redirect(`/prestamos/${req.params.id}/editar`);
  }
});

router.delete('/:id', async (req, res) => {
  const prestamo = await Prestamo.findById(req.params.id);

  if (prestamo) {
    await restoreActiveCopy(prestamo);
    await Prestamo.findByIdAndDelete(req.params.id);
  }

  req.session.flash = { type: 'success', message: 'Loan deleted.' };
  res.redirect('/prestamos');
});

async function restoreActiveCopy(prestamo) {
  if (prestamo.estado === 'Activo') {
    await Libro.findByIdAndUpdate(prestamo.libro_id, { $inc: { ejemplares_disponibles: 1 } });
  }
}

async function consumeActiveCopy(prestamo) {
  if (prestamo.estado === 'Activo') {
    await Libro.findByIdAndUpdate(prestamo.libro_id, { $inc: { ejemplares_disponibles: -1 } });
  }
}

function normalizePrestamo(body) {
  return {
    libro_id: body.libro_id,
    lector_nombre: body.lector_nombre,
    lector_email: body.lector_email,
    fecha_prestamo: body.fecha_prestamo,
    fecha_devolucion: body.fecha_devolucion,
    estado: body.estado,
  };
}

module.exports = router;
