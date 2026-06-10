# BiblioApp

BiblioApp es una aplicacion web para administrar un catalogo de libros y sus prestamos. Fue desarrollada como proyecto final de Base de Datos Avanzado usando MongoDB Atlas 7.0.x, Node.js, Express, Mongoose y EJS.

## Resumen

El sistema permite registrar usuarios, iniciar sesion, administrar libros y administrar prestamos relacionados con libros mediante referencias `ObjectId`.

| Area | Implementacion |
| --- | --- |
| Backend | Node.js, Express |
| Base de datos | MongoDB Atlas 7.0.x |
| ODM | Mongoose |
| Vistas | EJS |
| Autenticacion | `express-session` + `bcrypt` |
| Relacion | `prestamos.libro_id` referencia a `libros._id` |

## Funcionalidades

- Registro de usuarios con contrasena hasheada usando `bcrypt`.
- Login y logout con sesiones.
- Redireccion automatica a `/login` cuando no hay sesion activa.
- Dashboard con total de libros y prestamos activos.
- CRUD completo de libros.
- CRUD completo de prestamos.
- Select de libros disponibles al crear prestamos.
- Actualizacion de ejemplares disponibles al crear, editar o eliminar prestamos activos.
- Detalle de libro con listado de prestamos asociados.
- Modal de confirmacion para eliminar registros.
- Seed inicial con usuario demo, libros y prestamos.

## Estructura

```text
proyecto_final/
├── public/
│   ├── app.js
│   └── styles.css
├── src/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── views/
│   ├── seed.js
├── .env.example
├── package.json
├── server.js
└── README.md
```

## Instalacion

Instala las dependencias:

```bash
npm install
```

Copia el archivo de ejemplo de variables de entorno:

```bash
copy .env.example .env
```

Configura `.env` con tu conexion de MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/biblioapp?retryWrites=true&w=majority
SESSION_SECRET=change-this-secret
PORT=3000
```

Si tu equipo falla resolviendo URLs `mongodb+srv://`, se puede usar la URI completa `mongodb://` con los hosts del replica set de Atlas.

## Seed

Carga los datos iniciales:

```bash
npm run seed
```

El seed crea:

- Usuario demo: `demo@demo.com / Demo1234`.
- 6 libros con campos completos.
- 4 prestamos con referencias validas a libros existentes.

## Ejecutar

Modo desarrollo:

```bash
npm run dev
```

Modo produccion:

```bash
npm start
```

Abre la aplicacion en:

```text
http://localhost:3000
```

## Rutas

| Ruta | Pagina | Acceso | Operacion |
| --- | --- | --- | --- |
| `/login` | Login | Publico | - |
| `/register` | Registro | Publico | - |
| `/dashboard` | Dashboard | Sesion | - |
| `/libros` | Listado de libros | Sesion | Read |
| `/libros/nuevo` | Nuevo libro | Sesion | Create |
| `/libros/:id` | Detalle de libro | Sesion | Read |
| `/libros/:id/editar` | Editar libro | Sesion | Update |
| `/prestamos` | Listado de prestamos | Sesion | Read |
| `/prestamos/nuevo` | Nuevo prestamo | Sesion | Create |
| `/prestamos/:id/editar` | Editar prestamo | Sesion | Update |
| Modal en listados | Confirmar eliminacion | Sesion | Delete |

## Modelos

### Usuario

| Campo | Tipo | Requerido | Nota |
| --- | --- | --- | --- |
| `nombre` | String | Si | Nombre del usuario |
| `email` | String | Si | Unico |
| `password_hash` | String | Si | Hash generado con `bcrypt` |

### Libro

| Campo | Tipo | Requerido | Nota |
| --- | --- | --- | --- |
| `titulo` | String | Si | Titulo del libro |
| `autor` | String | Si | Autor del libro |
| `isbn` | String | Si | Unico |
| `genero` | String | No | Genero literario |
| `anio_publicacion` | Number | No | Ano de publicacion |
| `ejemplares_disponibles` | Number | Si | Copias disponibles |

### Prestamo

| Campo | Tipo | Requerido | Nota |
| --- | --- | --- | --- |
| `libro_id` | ObjectId | Si | Referencia a `Libro` |
| `lector_nombre` | String | Si | Nombre del lector |
| `lector_email` | String | Si | Email del lector |
| `fecha_prestamo` | Date | Si | Fecha de prestamo |
| `fecha_devolucion` | Date | Si | Fecha de devolucion |
| `estado` | String | Si | `Activo` o `Devuelto` |

## Relacion entre colecciones

La relacion entre libros y prestamos se implementa por referencia. Cada documento de `prestamos` guarda el campo `libro_id` con el `_id` del documento relacionado en `libros`.

```js
{
  _id: ObjectId('...'),
  libro_id: ObjectId('...'),
  lector_nombre: 'Ana Garcia',
  lector_email: 'ana@email.com',
  fecha_prestamo: ISODate('2026-06-01'),
  fecha_devolucion: ISODate('2026-06-15'),
  estado: 'Activo'
}
```

Se usa referencia porque un libro existe de forma independiente y puede tener muchos prestamos durante el tiempo. Embeber todos los prestamos dentro del libro haria crecer el documento indefinidamente.

## Indices

Los indices unicos se declaran en los esquemas de Mongoose:

```js
isbn: { type: String, required: true, unique: true }
email: { type: String, required: true, unique: true }
```

Equivalente en MongoDB:

```js
db.libros.createIndex({ isbn: 1 }, { unique: true })
db.usuarios.createIndex({ email: 1 }, { unique: true })
```

## Checklist de entrega

- [x] MongoDB Atlas configurado.
- [x] Colecciones `libros` y `prestamos` con datos de seed.
- [x] Usuario demo funcional.
- [x] CRUD completo en ambas entidades.
- [x] Contrasenas hasheadas con `bcrypt`.
- [x] Rutas protegidas con redireccion a `/login`.
- [x] Indices unicos para `isbn` y `email`.
- [x] Validacion de campos obligatorios.
- [x] README del proyecto.

## Despliegue

La aplicacion puede desplegarse en Render, Railway, Fly.io u otro proveedor compatible con Node.js.

Variables requeridas en produccion:

```env
MONGODB_URI=...
SESSION_SECRET=...
PORT=3000
```

Comando de inicio:

```bash
npm start
```
