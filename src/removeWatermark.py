import sys

from docx import Document
from docx2pdf import convert
from pdf2docx import Converter

# Obtener argumentos de la línea de comandos
input_pdf = sys.argv[1]
output_docx = sys.argv[2]
output_pdf = sys.argv[3]
watermark_text = "REPRODUCCIÓN PROHIBIDA SU SOLO CONSULTA,"

# Función para convertir PDF a Word
def pdf_to_word(input_pdf, output_docx):
    cv = Converter(input_pdf)
    cv.convert(output_docx, start=0, end=None)
    cv.close()

# Función para eliminar el texto de la marca de agua en el documento Word
def remove_watermark_text(docx_path, watermark_text):
    doc = Document(docx_path)
    for para in doc.paragraphs:
        if watermark_text in para.text:
            para.clear()
    doc.save(docx_path)

# Función para convertir Word a PDF
def word_to_pdf(input_docx, output_pdf):
    convert(input_docx, output_pdf)

# Ejecutar las funciones
pdf_to_word(input_pdf, output_docx)
remove_watermark_text(output_docx, watermark_text)
word_to_pdf(output_docx, output_pdf)

print("Proceso completado")
