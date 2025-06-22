const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { decryptRSA } = require('./rsadecrypt'); // importa la función de descifrado RSA
const { generarYGuardarClaves } = require('./rsautils'); // importa la función
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const usuarios = [
  { ndoc: '75165901', password: 'rodrigo' },
  { ndoc: '75689638', password: 'hatsumi' },
];


// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente' });
});


app.get('/api/generate-pk', (req, res) => {
  const { n, e } = generarYGuardarClaves();
  res.json({
    n: n.toString(), // para que el frontend lo reciba bien
    e: e.toString() // para que el frontend lo reciba bien
  });
});




app.post('/api/login', (req, res) => {
  try {
    const { encryptedData, secretKeycl } = req.body;
    console.log("Clave encriptada con RSA: ", secretKeycl);
    const privatePath = path.join(__dirname, 'keys', 'private.txt');
    const privateContent = fs.readFileSync(privatePath, 'utf-8');
    const [nStr, dStr] = privateContent.trim().split(',');
    const n = BigInt(nStr);
    const d = BigInt(dStr);
    const secretKey = decryptRSA(secretKeycl, n, d); // Debe ser de 32 bytes para AES-256


    // 1. Separar IV (hex) y datos (base64)
    const [ivHex, encryptedText] = encryptedData.split(':');

    // 2. Convertir a Buffers
    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(secretKey, 'utf8');

    // 3. Descifrar
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      key,
      iv
    );

    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    // 4. Parsear datos
    const formData = JSON.parse(decrypted);
    console.log('Datos recibidos:', formData);

    // Validar usuario
    const usuario = usuarios.find(u => u.ndoc === formData.ndoc && u.password === formData.password);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({ success: true});

  } catch (error) {
    console.error('Error al descifrar:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message
    });
  }
});
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});