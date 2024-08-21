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
import { useState } from "react";

export default function Dashboard() {
  const [otp, setOtp] = useState<string>("");

  // Función para manejar el cambio en el OTP
  const handleOtpChange = (newValue: string) => {
    setOtp(newValue);
  };

  // Función para manejar la solicitud al presionar "Generar"
  const handleGenerateClick = () => {
    if (otp.length < 7) {
      console.error("El OTP debe tener 7 dígitos");
      return;
    }

    console.log("OTP enviado:", otp);

    const url = `http://localhost:3001/api/consultaInmuebles?FOLIOREAL=${otp}&BUSCAR=LL&TODOS=S&page=1&start=0&limit=5`;

    fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Datos recibidos:", data);

        const partida = data.Datos?.find((item: any) => item.PARTIDA)?.PARTIDA;

        if (partida) {
          console.log("Número de PARTIDA encontrado:", partida);

          // Solicitar el PDF desde el servidor
          const pdfUrl = `http://localhost:3001/api/descargarPDF?partida=${partida}`;

          fetch(pdfUrl, {
            method: "GET",
            credentials: "include",
          })
            .then((response) => {
              if (response.ok) {
                return response.blob(); // Obtener el PDF como Blob
              } else {
                throw new Error("Error al descargar el PDF");
              }
            })
            .then((blob) => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "documento.pdf"; // Nombre del archivo a descargar
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url); // Liberar el URL del Blob
            })
            .catch((error) => {
              console.error("Error al descargar el PDF:", error);
            });
        } else {
          console.error("No se encontró el número de PARTIDA en los datos");
        }
      })
      .catch((error) => {
        console.error("Error en la solicitud:", error);
      });
  };

  return (
    <>
      <PageHeader>
        <PageHeaderHeading className="text-4xl">Inicio</PageHeaderHeading>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Genera tu escritura en PDF</CardTitle>
          <CardDescription>Ingresa el numero de folio real</CardDescription>
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
    </>
  );
}
