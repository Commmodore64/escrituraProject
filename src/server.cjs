const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/process-pdf', (req, res) => {
  const { inputPdf } = req.files; // Cambiar a req.files si usas multer para el manejo de archivos

  const inputPdfPath = path.resolve('temp.pdf');
  const outputDocxPath = path.resolve('temp.docx');
  const outputPdfPath = path.resolve('output.pdf');
  const watermarkText = "REPRODUCCIÓN PROHIBIDA SU SOLO CONSULTA,";

  fs.writeFileSync(inputPdfPath, inputPdf.data); // Guardar el PDF temporalmente

  exec(`python removeWatermark.py "${inputPdfPath}" "${outputDocxPath}" "${outputPdfPath}" "${watermarkText}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error ejecutando el script Python: ${error}`);
      return res.status(500).send('Error procesando el PDF');
    }

    res.sendFile(outputPdfPath, () => {
      fs.unlinkSync(inputPdfPath);
      fs.unlinkSync(outputDocxPath);
      fs.unlinkSync(outputPdfPath);
    });
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
