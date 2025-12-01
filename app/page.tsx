"use client";

import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [estado, setEstado] = useState("desconhecido");
  const alertaEnviadoRef = useRef(false);

  async function enviarAlerta(currentEstado: string) {
    try {
      await fetch("/api/alerta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: currentEstado }),
      });
    } catch (error) {
      console.error("Erro ao enviar alerta:", error);
    }
  }

  async function atualizar() {
    try {
      const r = await fetch("/api/status");
      const data = await r.json();
      setEstado(data.estado);
    } catch (err) {
      console.error("Erro ao atualizar estado:", err);
    }
  }

  useEffect(() => {
    atualizar();
    const i = setInterval(atualizar, 1500);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (estado === "fora" && !alertaEnviadoRef.current) {
      enviarAlerta(estado);
      alertaEnviadoRef.current = true;
    } else if (estado === "dentro") {
      alertaEnviadoRef.current = false;
    }
  }, [estado]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Bem vindo!</h1>

      <h1>Status do ESP32:</h1>
      <p>
        {estado === "dentro" && "Dentro do Perímetro"}
        {estado === "fora" && "Fora do Perímetro"}
        {estado === "desconhecido" && "Aguardando..."}
      </p>
    </div>
  );
}
