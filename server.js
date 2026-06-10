const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

const { connectDb } = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const libroRoutes = require('./src/routes/libro.routes');
const prestamoRoutes = require('./src/routes/prestamo.routes');

const app = express();
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure MongoDB Atlas.');
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'development-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoUri }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 4,
    },
  })
);

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.get('/', (req, res) => {
  res.redirect(req.session.usuario ? '/dashboard' : '/login');
});

app.use(authRoutes);
app.use(dashboardRoutes);
app.use('/libros', libroRoutes);
app.use('/prestamos', prestamoRoutes);

app.use((req, res) => {
  res.status(404).render('error', { title: 'Page not found', message: 'The requested page does not exist.' });
});

const port = process.env.PORT || 3000;

connectDb(mongoUri).then(() => {
  app.listen(port, () => {
    console.log(`BiblioApp running on http://localhost:${port}`);
  });
});
