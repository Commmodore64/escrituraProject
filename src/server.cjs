const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const inputPdf = path.join(__dirname, 'uploads', '4e99f9b009faff68a252bcc363af090c');
const outputDocx = path.join(__dirname, 'uploads', 'processed_file.docx');
const outputPdf = path.join(__dirname, 'uploads', 'processed_file.pdf');

// Asegúrate de que las rutas están correctamente formateadas
const command = `python3 removeWatermark.py "${inputPdf}" "${outputDocx}" "${outputPdf}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al ejecutar el script de Python: ${error}`);
    return res.status(500).send('Error al procesar el archivo');
  }
  if (stderr) {
    console.error(`Error en el script de Python: ${stderr}`);
  }

  // Enviar el archivo procesado al frontend
  res.download(outputPdf, 'documento_sin_marca.pdf', (err) => {
    if (err) {
      console.error('Error al enviar el archivo procesado:', err);
    }
    // Limpiar archivos temporales
    fs.unlink(inputPdf, () => {});
    fs.unlink(outputDocx, () => {});
    fs.unlink(outputPdf, () => {});
  });
});
