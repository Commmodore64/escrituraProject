import { PageHeader, PageHeaderHeading } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import axios from "axios";
import { useState } from "react";
import { MdFileUpload } from "react-icons/md";

export default function Dashboard() {
  const [otp, setOtp] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  // Función para manejar el cambio en el OTP
  const handleOtpChange = (newValue: string) => {
    setOtp(newValue);
  };

  // Función para manejar la solicitud al presionar "Generar"
  const handleGenerateClick = async () => {
    if (otp.length < 7) {
      console.error("El OTP debe tener 7 dígitos");
      return;
    }

    console.log("OTP enviado:", otp);

    const url = `http://localhost:3001/api/consultaInmuebles?FOLIOREAL=${otp}&BUSCAR=LL&TODOS=S&page=1&start=0&limit=5`;

    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Datos recibidos:", data);

      const partida = data.Datos?.find((item: any) => item.PARTIDA)?.PARTIDA;

      if (partida) {
        console.log("Número de PARTIDA encontrado:", partida);

        // Solicitar el PDF procesado desde el servidor
        const pdfUrl = `http://localhost:3001/api/descargarPDF?partida=${partida}`;

        const pdfResponse = await fetch(pdfUrl, {
          method: "GET",
          credentials: "include",
        });

        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "documento.pdf"; // Nombre del archivo a descargar
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url); // Liberar el URL del Blob
        } else {
          throw new Error("Error al descargar el PDF procesado");
        }
      } else {
        console.error("No se encontró el número de PARTIDA en los datos");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      // Crear un enlace para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadLink(url);
    } catch (err) {
      setError("Error al subir el archivo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader>
        <PageHeaderHeading className="text-4xl">Inicio</PageHeaderHeading>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Genera tu escritura en PDF</CardTitle>
          <CardDescription>Ingresa el número de folio real</CardDescription>
          <div className="flex justify-center items-center p-10">
            <InputOTP maxLength={7} onChange={handleOtpChange} value={otp}>
              <InputOTPGroup>
                {[...Array(7)].map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-16 h-16 text-2xl text-center border border-gray-300"
                    // Aquí asumimos que InputOTPSlot maneja internamente el valor
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex justify-center mt-4">
            <Button className="text-sm px-4 py-2" onClick={handleGenerateClick}>
              Generar
            </Button>
          </div>
        </CardHeader>
      </Card>
      <div className="w-full max-w-md mx-auto space-y-4 mt-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Subir Archivo PDF</h2>
          <p className="text-muted-foreground">
            Arrastra y suelta archivos o haz clic para seleccionar desde tu
            dispositivo.
          </p>
        </div>
        <div>
          <div
            className="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-muted transition-colors duration-150 hover:border-primary hover:bg-muted"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <input
              id="fileInput"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="text-center space-y-2">
              <MdFileUpload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                Arrastra y suelta archivos aquí o haz clic para seleccionar
                desde tu dispositivo.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="text-sm px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Subir Archivo"}
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {downloadLink && (
          <a
            href={downloadLink}
            download="documento_sin_marca.pdf"
            className="text-blue-500 underline"
          >
            Descargar PDF procesado
          </a>
        )}
      </div>
    </>
  );
}
