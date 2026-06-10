const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const { redirectIfAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.post('/login', redirectIfAuthenticated, async (req, res) => {
  const { email, password } = req.body;
  const usuario = await Usuario.findOne({ email });

  if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
    req.session.flash = { type: 'error', message: 'Email or password is incorrect.' };
    return res.redirect('/login');
  }

  req.session.usuario = { id: usuario._id.toString(), nombre: usuario.nombre, email: usuario.email };
  res.redirect('/dashboard');
});

router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.post('/register', redirectIfAuthenticated, async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);
    await Usuario.create({ nombre, email, password_hash });
    req.session.flash = { type: 'success', message: 'Account created. You can now sign in.' };
    res.redirect('/login');
  } catch (error) {
    req.session.flash = { type: 'error', message: 'Could not create account. Check the fields and try again.' };
    res.redirect('/register');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
