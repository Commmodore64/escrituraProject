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

  console.log('Solicitud al servidor externo:', url); // Imprime la URL de la solicitud

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': '.AspNet.ApplicationCookie=J2diw7kMpeoOvtN4j4Dibx9mjzXCiiGBjln7vHrOGl6p_HKO02ohm6rkjg_Rhc8BQokWxX99hjwU4TKRXssW6tg2jSnDjETKWnYcAblykvNxoTmYpCdHjJ-t7f2yAvVErtDEA_sHcEtiyLlXhMDwPMY8r1zIZWAoOAzYbMJFrM-rbrzeLDKe06M0eSE1uzhfPuXXE_H9V4alms23mpTVLzdwptdOhI_qXOaej8eazKGAg3djaSws1GzJw04OjNagGaiPO8R5HXJvTr5LBWrq_NJeB_ZMAQpujsCc0qgzAmM0RWol-tPFwUSp3S9GE_Roedg2eOeFiWSpf5D0pf6p4bdWoqwI6uu9By6zaR5WX4Pio-asZOV335xVpGJ_23uDzPSXVYxqlFoBc15Jy5IPJciMlcxBWlFcvHM1e6aUpAVnOGAheiYEkhFnwHKIRORTZpymgvBJDG1lSOHs6S3DLzyCTkG7OQUd8FeOuACGTceMCB1b7HLS1oOjHL799vf-BV-wnVY3QAsdbTNRRej6_gqsbm93LyOccFuBKpGF_2ihZvoQaea2OECKxZ1OChuQDVl4xL1VbegQ4xWOKBhQRQ'
    }
  })
    .then(response => {
      console.log('Respuesta del servidor externo:', response.status, response.statusText); // Imprime el estado de la respuesta
      return response.json();
    })
    .then(data => {
      console.log('Datos recibidos del servidor externo:', data); // Imprime los datos recibidos
      res.json(data);
    })
    .catch(error => {
      console.error('Error en la solicitud al servidor externo:', error);
      res.status(500).json({ error: 'Error al consultar el servidor externo' });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor proxy corriendo en el puerto ${PORT}`);
});
