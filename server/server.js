
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const app = express();

// Middleware de CORS para permitir solicitudes de otros orígenes
app.use(cors());

// Configuración de almacenamiento de Multer con la ruta absoluta
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:\\Users\\Lucas\\Desktop\\Ambulantes Urkupiña\\assets'); // Ruta absoluta
    },
    filename: (req, file, cb) => {
        cb(null, `foto_${Date.now()}.png`);
    }
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'assets'))); // Asegúrate de que la ruta está configurada correctamente
app.use(express.json({ limit: '10mb' }));

// Ruta para manejar la carga de imágenes
app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        console.log("No se ha cargado ninguna imagen");
        return res.status(400).send({ success: false, message: 'No se ha cargado ninguna imagen.' });
    }
    console.log('Imagen cargada:', req.file.path);
    res.status(200).send({ success: true, filePath: `/assets/${req.file.filename}` });
});

app.listen(3003, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
