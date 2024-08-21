import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch'; // Asegúrate de tener `node-fetch` instalado

const app = express();

// Configuración de CORS para permitir credenciales y especificar origen
app.use(cors({
  origin: 'http://localhost:5173', // Origen del frontend
  credentials: true, // Permitir el envío de credenciales
}));

app.use(express.json());
const PORT = 3001;

app.get('/api/consultaInmuebles', (req, res) => {
  const { FOLIOREAL } = req.query;
  const url = `http://srppn.chihuahua.gob.mx/rpp/WebAPI/Servicios/ConsultaAvanzada/consultaInmuebles?FOLIOREAL=${FOLIOREAL}&BUSCAR=LL&TODOS=S&page=1&start=0&limit=5`;

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': '.AspNet.ApplicationCookie=R8wBdMIBPD1tWxmZLVsmY2R9kTorrpvuqHgtkNY76xMj6Cn7etRXRvyo4gRaD_nAQXwVNYGb4nXjE5d6tgvkutaGqADTRY09bpZ46aNve1QH7Rr6KFYPtQbeLYjwanhs3vDjTPYwGSMHbU3yko-X9CkjfnjVxjv_v3lwTY6vc7-KLA9w4p6a8hPb6BFqi3sYcszXd7n0xsH3huV-CZle5TKRpzkpOST2R2IlyquORRNqZZFY9NcLpDvBMvctwsvjps0dKRtnZcksKwzo3--uGIohMvP5Vs0YyiCRkVoenpdnFXrzVOjZoIlE_rtxy1Fd3Qiv6XRqdMe9RSBZlU8IZJeTm8NLHz8lGlt3tCBOfUBs7lBvKtAQHvvTO89jNfrY0mV8MXQxRyFDmb95RmmcBuAt73nWx8INaiyxViMQehGnMP2kVOl6P706Xki3eRFbh8FO-_YufYVgOsX8dowIrxpxJ1hjl3ZeNxBOEoqbghkz19i-NLE-qbSCQ_Er5b1mk1G6NzFzmfYh3ifIXZor0cFEXz8GpAp8brvQ-Lww6_d3SWRaC8vllvjmEKGD5HaYenQ-c5FXR8txyxd8lrvZXg'
    }
  })
    .then(response => response.json())
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      console.error('Error en la solicitud al servidor externo:', error);
      res.status(500).json({ error: 'Error al consultar el servidor externo' });
    });
});

app.get('/api/descargarPDF', (req, res) => {
  const { partida } = req.query;
  const pdfUrl = `http://srppn.chihuahua.gob.mx/rpp/WebAPI/Servicios/CopiasCertificadas/ObtenerAgregadoPorPartida?partida=${partida}`;

  fetch(pdfUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/pdf',
      'Cookie': '.AspNet.ApplicationCookie=R8wBdMIBPD1tWxmZLVsmY2R9kTorrpvuqHgtkNY76xMj6Cn7etRXRvyo4gRaD_nAQXwVNYGb4nXjE5d6tgvkutaGqADTRY09bpZ46aNve1QH7Rr6KFYPtQbeLYjwanhs3vDjTPYwGSMHbU3yko-X9CkjfnjVxjv_v3lwTY6vc7-KLA9w4p6a8hPb6BFqi3sYcszXd7n0xsH3huV-CZle5TKRpzkpOST2R2IlyquORRNqZZFY9NcLpDvBMvctwsvjps0dKRtnZcksKwzo3--uGIohMvP5Vs0YyiCRkVoenpdnFXrzVOjZoIlE_rtxy1Fd3Qiv6XRqdMe9RSBZlU8IZJeTm8NLHz8lGlt3tCBOfUBs7lBvKtAQHvvTO89jNfrY0mV8MXQxRyFDmb95RmmcBuAt73nWx8INaiyxViMQehGnMP2kVOl6P706Xki3eRFbh8FO-_YufYVgOsX8dowIrxpxJ1hjl3ZeNxBOEoqbghkz19i-NLE-qbSCQ_Er5b1mk1G6NzFzmfYh3ifIXZor0cFEXz8GpAp8brvQ-Lww6_d3SWRaC8vllvjmEKGD5HaYenQ-c5FXR8txyxd8lrvZXg'
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
