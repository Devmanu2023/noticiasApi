// app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/noticias', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conectado a MongoDB');
});

// Esquema de Noticia
const NoticiaSchema = new mongoose.Schema({
  nombre: String,
  foto: String,
  descripcion: String,
  comentarios: [{ body: String, date: Date }],
});

const Noticia = mongoose.model('Noticia', NoticiaSchema);

app.use(bodyParser.json());

// Ruta para obtener todas las noticias
app.get('/api/noticias', async (req, res) => {
  try {
    const noticias = await Noticia.find();
    res.json(noticias);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ruta para crear una nueva noticia
app.post('/api/noticias', async (req, res) => {
  const noticia = new Noticia({
    nombre: req.body.nombre,
    foto: req.body.foto,
    descripcion: req.body.descripcion,
    comentarios: req.body.comentarios || [],
  });

  try {
    const nuevaNoticia = await noticia.save();
    res.status(201).json(nuevaNoticia);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Ruta para obtener una noticia por su ID
app.get('/api/noticias/:id', getNoticia, (req, res) => {
  res.json(res.noticia);
});

// Middleware para obtener una noticia por su ID
async function getNoticia(req, res, next) {
  let noticia;
  try {
    noticia = await Noticia.findById(req.params.id);
    if (noticia == null) {
      return res.status(404).json({ message: 'Noticia no encontrada' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.noticia = noticia;
  next();
}

// Ruta para actualizar una noticia
app.patch('/api/noticias/:id', getNoticia, async (req, res) => {
  if (req.body.nombre != null) {
    res.noticia.nombre = req.body.nombre;
  }
  if (req.body.foto != null) {
    res.noticia.foto = req.body.foto;
  }
  if (req.body.descripcion != null) {
    res.noticia.descripcion = req.body.descripcion;
  }
  if (req.body.comentarios != null) {
    res.noticia.comentarios = req.body.comentarios;
  }

  try {
    const updatedNoticia = await res.noticia.save();
    res.json(updatedNoticia);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Ruta para eliminar una noticia
app.delete('/api/noticias/:id', getNoticia, async (req, res) => {
  try {
    await res.noticia.remove();
    res.json({ message: 'Noticia eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
