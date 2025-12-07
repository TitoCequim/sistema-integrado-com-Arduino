'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { createComment } from './actions/createComment';

export default function Home() {
  const [estado, setEstado] = useState('desconhecido');
  const alertaEnviadoRef = useRef(false);
  const [comment, setComment] = useState('');

  // Função para enviar alerta ao servidor
  async function enviarAlerta(currentEstado: string) {
    try {
      await fetch('/api/alerta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: currentEstado }),
      });
    } catch (error) {
      console.error('Erro ao enviar alerta:', error);
    }
  }

  // Função para chamar o Google via API
  async function chamarGoogle() {
    try {
      const resposta = await fetch('/api/status2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'chamar_google' }),
      });

      const json = await resposta.json();
      console.log(json);
    } catch (error) {
      console.error('Erro ao chamar Google:', error);
    }
  }

  // Atualiza o estado do ESP32
  async function atualizar() {
    try {
      const r = await fetch('/api/status');
      const data = await r.json();
      setEstado(data.estado);
    } catch (err) {
      console.error('Erro ao atualizar estado:', err);
    }
  }

  // Efeito para atualizar estado periodicamente
  useEffect(() => {
    (async () => {
      await atualizar();
    })();

    const interval = setInterval(() => {
      atualizar();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Efeito para enviar alerta quando o ESP32 sair do perímetro
  useEffect(() => {
    if (estado === 'fora' && !alertaEnviadoRef.current) {
      enviarAlerta(estado);
      alertaEnviadoRef.current = true;
    } else if (estado === 'dentro') {
      alertaEnviadoRef.current = false;
    }
  }, [estado]);

  // Enviar comentário
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.set('comment', comment);

    try {
      await createComment(formData);
      setComment(''); // limpa input
      alert('Comentário enviado!');
    } catch (err) {
      console.error('Erro ao criar comentário:', err);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Bem vindo!</h1>

      <h2>Status do ESP32:</h2>
      <p>
        {estado === 'dentro' && 'Dentro do Perímetro'}
        {estado === 'fora' && 'Fora do Perímetro'}
        {estado === 'desconhecido' && 'Aguardando...'}
      </p>

      <div>
        <button onClick={chamarGoogle}>Chamar Google</button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="write a comment"
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
