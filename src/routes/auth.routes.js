const express = require('express');
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const { redirectIfAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.post('/login', redirectIfAuthenticated, async (req, res) => {
  const { password } = req.body;
  const email = normalizeEmail(req.body.email);
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
  const nombre = req.body.nombre?.trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  try {
    if (!nombre || !email || !password) {
      req.session.flash = { type: 'error', message: 'Complete all required fields.' };
      return res.redirect('/register');
    }

    if (password.length < 6) {
      req.session.flash = { type: 'error', message: 'Password must have at least 6 characters.' };
      return res.redirect('/register');
    }

    const existingUser = await Usuario.findOne({ email });

    if (existingUser) {
      req.session.flash = { type: 'error', message: 'That email is already registered.' };
      return res.redirect('/register');
    }

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

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

module.exports = router;
