"use client";

import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [estado, setEstado] = useState("desconhecido");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  
  const alertaEnviadoRef = useRef(false); 

  async function enviarAlerta(currentEstado: string) {
    console.log("Disparando alerta para /api/alerta...");
    try {
      const res = await fetch("/api/alerta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: currentEstado }),
      });

      const result = await res.json();
      console.log("Resposta do Alerta:", result.msg);
    } catch (error) {
      console.error("Erro ao chamar a rota de alerta:", error);
    }
  }

  async function atualizar() {
    const r = await fetch("/api/status");
    const data = await r.json();
    setEstado(data.estado);
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

  async function cadastrarEmail() {
    if (!email) {
      setMsg("Digite um email válido");
      return;
    }

    const res = await fetch("/api/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const result = await res.json();
    setMsg(result.msg);
    setEmail("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Bem vindo!</h1>

      <h1>Status do ESP32:</h1>
      <p>
        {estado === "dentro" && "Dentro do Perímetro"}
        {estado === "fora" && "Fora do Perímetro"}
        {estado === "desconhecido" && "Aguardando..."}
      </p>

      <h2>Cadastrar email para alertas:</h2>
      <input
        type="email"
        placeholder="Digite seu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10, width: 250 }}
      />
      <button
        onClick={cadastrarEmail}
        style={{ marginLeft: 10, padding: 10 }}
      >
        Cadastrar
      </button>
      <p>{msg}</p>
    </div>
  );
}
