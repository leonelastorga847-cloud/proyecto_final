const bcrypt = require('bcrypt');
require('dotenv').config();

const { connectDb } = require('./config/db');
const Usuario = require('./models/Usuario');
const Libro = require('./models/Libro');
const Prestamo = require('./models/Prestamo');

const librosSeed = [
  { titulo: 'Cien años de soledad', autor: 'Gabriel Garcia Marquez', isbn: '9780307474728', genero: 'Realismo magico', anio_publicacion: 1967, ejemplares_disponibles: 4 },
  { titulo: 'Rayuela', autor: 'Julio Cortazar', isbn: '9788466331909', genero: 'Novela', anio_publicacion: 1963, ejemplares_disponibles: 3 },
  { titulo: 'Ficciones', autor: 'Jorge Luis Borges', isbn: '9780141183848', genero: 'Cuentos', anio_publicacion: 1944, ejemplares_disponibles: 5 },
  { titulo: 'El tunel', autor: 'Ernesto Sabato', isbn: '9789500397441', genero: 'Novela psicologica', anio_publicacion: 1948, ejemplares_disponibles: 2 },
  { titulo: 'La ciudad y los perros', autor: 'Mario Vargas Llosa', isbn: '9788437600046', genero: 'Novela', anio_publicacion: 1963, ejemplares_disponibles: 6 },
  { titulo: 'Pedro Paramo', autor: 'Juan Rulfo', isbn: '9780802133908', genero: 'Novela', anio_publicacion: 1955, ejemplares_disponibles: 3 },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required.');
  }

  await connectDb(process.env.MONGODB_URI);
  await Promise.all([Usuario.deleteMany({}), Libro.deleteMany({}), Prestamo.deleteMany({})]);

  const password_hash = await bcrypt.hash('Demo1234', 10);
  await Usuario.create({ nombre: 'Demo User', email: 'demo@demo.com', password_hash });

  const libros = await Libro.insertMany(librosSeed);

  await Prestamo.insertMany([
    { libro_id: libros[0]._id, lector_nombre: 'Ana Garcia', lector_email: 'ana@email.com', fecha_prestamo: new Date('2026-06-01'), fecha_devolucion: new Date('2026-06-15'), estado: 'Activo' },
    { libro_id: libros[1]._id, lector_nombre: 'Luis Perez', lector_email: 'luis@email.com', fecha_prestamo: new Date('2026-05-20'), fecha_devolucion: new Date('2026-06-04'), estado: 'Devuelto' },
    { libro_id: libros[2]._id, lector_nombre: 'Carla Ruiz', lector_email: 'carla@email.com', fecha_prestamo: new Date('2026-06-03'), fecha_devolucion: new Date('2026-06-17'), estado: 'Activo' },
    { libro_id: libros[3]._id, lector_nombre: 'Martin Lopez', lector_email: 'martin@email.com', fecha_prestamo: new Date('2026-06-05'), fecha_devolucion: new Date('2026-06-19'), estado: 'Activo' },
  ]);

  console.log('Seed completed: demo@demo.com / Demo1234');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
