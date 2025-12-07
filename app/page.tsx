"use client";

import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [estado, setEstado] = useState("desconhecido");
  const alertaEnviadoRef = useRef(false);
 async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const comment = formData.get('comment');
    // Insert the comment from the form into the Postgres database
    await sql('INSERT INTO comments (comment) VALUES ($1)', [comment]);
  }
  // Função para enviar alerta ao servidor
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

  // Função para chamar o Google via API
  async function chamarGoogle() {
    try {
      const resposta = await fetch("/api/status2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "chamar_google" }),
      });

      const json = await resposta.json();
      console.log(json);
    } catch (error) {
      console.error("Erro ao chamar Google:", error);
    }
  }

  // Atualiza o estado do ESP32
  async function atualizar() {
    try {
      const r = await fetch("/api/status");
      const data = await r.json();
      setEstado(data.estado);
    } catch (err) {
      console.error("Erro ao atualizar estado:", err);
    }
  }

  // Efeito para atualizar estado periodicamente
  useEffect(() => {
    // IIFE async evita warning de setState dentro do efeito
    (async () => {
      await atualizar(); // atualiza imediatamente ao montar
    })();

    const interval = setInterval(() => {
      atualizar(); // atualiza a cada 1,5s
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Efeito para enviar alerta quando o ESP32 sair do perímetro
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

      <div>
        <button onClick={chamarGoogle}>Chamar Google</button>
      </div>
      <form action={create}>
      <input type="text" placeholder="write a comment" name="comment" />
      <button type="submit">Submit</button>
    </form>
    </div>

    
  );
}
