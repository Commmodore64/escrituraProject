import axios from 'axios';
import { exec } from 'child_process';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import fetch from 'node-fetch';
import path from 'path';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
const PORT = 3001;

// Configuración de multer para manejar la carga de archivos
const upload = multer({ dest: 'uploads/' });

// URL y datos de autenticación
const authUrl = 'http://srppn.chihuahua.gob.mx/rpp/WebAPI/Servicios/AdmonUsuarios/Autentifica';
const authData = {
  "userName": "10NT008",
  "password": "0802NOT"
};

let cookie = null;  // Almacena la cookie de autenticación

async function authenticate() {
  try {
    const authResponse = await axios.post(authUrl, authData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Verifica que el encabezado `set-cookie` exista
    if (!authResponse.headers || !authResponse.headers['set-cookie']) {
      throw new Error('No se recibieron cookies en la respuesta de autenticación');
    }

    const setCookieHeader = authResponse.headers['set-cookie'].find(cookie => cookie.includes('.AspNet.ApplicationCookie'));

    if (!setCookieHeader) {
      throw new Error('No se encontró la cookie de autenticación en la respuesta');
    }

    // Guarda la cookie para futuras solicitudes
    cookie = setCookieHeader;
    console.log('Autenticación exitosa, cookie almacenada.');
  } catch (error) {
    console.error('Error al autenticarse:', error.message);
  }
}

app.get('/api/consultaInmuebles', async (req, res) => {
  const { FOLIOREAL } = req.query;
  const url = `http://srppn.chihuahua.gob.mx/rpp/WebAPI/Servicios/ConsultaAvanzada/consultaInmuebles?FOLIOREAL=${FOLIOREAL}&BUSCAR=LL&TODOS=S&page=1&start=0&limit=5`;

  try {
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      }
    });

    let data = await response.json();

    // Si el token está expirado, reautenticar y repetir la solicitud
    if (data.Message === 'Authorization has been denied for this request.') {
      console.log('Token expirado. Reautenticando...');
      await authenticate();

      // Reintentar la solicitud con el nuevo token
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie
        }
      });

      data = await response.json();
    }

    res.json(data);
  } catch (error) {
    console.error('Error en la solicitud al servidor externo:', error);
    res.status(500).json({ error: 'Error al consultar el servidor externo' });
  }
});

// Endpoint para cargar y procesar el archivo PDF
app.post('/api/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const processedFilePath = path.join('uploads', 'processed_file.pdf');

  // Ejecutar el script de Python para procesar el archivo
  exec(`python3 removeWatermark.py ${filePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al ejecutar el script de Python: ${error}`);
      return res.status(500).send('Error al procesar el archivo');
    }

    // Enviar el archivo procesado al frontend
    res.download(processedFilePath, 'documento_sin_marca.pdf', (err) => {
      if (err) {
        console.error('Error al enviar el archivo procesado:', err);
      }
      // Limpiar archivos temporales
      fs.unlink(filePath, () => {});
      fs.unlink(processedFilePath, () => {});
    });
  });
});

// Endpoint para descargar el PDF procesado
app.get('/api/descargarPDF', (req, res) => {
  const { partida } = req.query;
  const pdfUrl = `http://srppn.chihuahua.gob.mx/rpp/WebAPI/Servicios/CopiasCertificadas/ObtenerAgregadoPorPartida?partida=${partida}`;

  fetch(pdfUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/pdf',
      'Cookie': cookie
    }
  })
    .then(response => {
      if (response.ok) {
        return response.buffer(); // Obtener el PDF como Buffer
      } else {
        throw new Error('Error al obtener el PDF');
      }
    })
    .then(buffer => {
      res.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');
      res.setHeader('Content-Type', 'application/pdf');
      res.send(buffer);
    })
    .catch(error => {
      console.error('Error al obtener el PDF:', error);
      res.status(500).json({ error: 'Error al obtener el PDF' });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor proxy corriendo en el puerto ${PORT}`);
});
