"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface EmailCadastrado {
  id: number;
  email: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

interface GoogleLocation {
  lat: number;
  lng: number;
}

interface GoogleResultado {
  location?: GoogleLocation;
  accuracy?: number;
  error?: string;
}

export default function Home() {
  const [estado, setEstado] = useState("desconhecido");
  const alertaEnviadoRef = useRef(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailsCadastrados, setEmailsCadastrados] = useState<EmailCadastrado[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleResultado, setGoogleResultado] = useState<GoogleResultado | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
//teste
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

  async function chamarGoogle() {
    setLoadingGoogle(true);
    setGoogleResultado(null);
    
    try {
      const resposta = await fetch("/api/status2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "chamar_google" })
      });

      const json = await resposta.json();
      
      if (json.ok) {
        setGoogleResultado(json.resultado);
        // Os dados já foram apagados automaticamente pela API após o envio
      } else {
        setGoogleResultado({ error: json.error || "Erro ao chamar API do Google" });
      }
    } catch (error) {
      console.error("Erro ao chamar Google:", error);
      setGoogleResultado({ error: "Erro ao conectar com a API" });
    } finally {
      setLoadingGoogle(false);
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

  const carregarEmails = useCallback(async () => {
    try {
      const r = await fetch("/api/emails");
      const data = await r.json();
      if (data.ok) {
        setEmailsCadastrados(data.emails || []);
      }
    } catch (err) {
      console.error("Erro ao carregar emails:", err);
    }
  }, []);

  async function cadastrarEmail() {
    if (!emailInput.trim() || !emailInput.includes("@")) {
      setMensagem("Por favor, insira um email válido.");
      return;
    }

    setLoading(true);
    setMensagem("");

    try {
      const r = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });

      const data = await r.json();

      if (data.ok) {
        setMensagem("✅ " + data.message);
        setEmailInput("");
        await carregarEmails();
      } else {
        setMensagem("❌ " + (data.error || "Erro ao cadastrar email"));
      }
    } catch (error) {
      setMensagem("❌ Erro ao cadastrar email. Tente novamente.");
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  }

  async function removerEmail(email: string) {
    if (!confirm(`Deseja remover o email ${email}?`)) {
      return;
    }

    try {
      const r = await fetch("/api/emails", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await r.json();

      if (data.ok) {
        setMensagem("✅ " + data.message);
        await carregarEmails();
      } else {
        setMensagem("❌ " + (data.error || "Erro ao remover email"));
      }
    } catch (error) {
      setMensagem("❌ Erro ao remover email. Tente novamente.");
      console.error("Erro:", error);
    }
  }

  // ✅ Correção do useEffect
  useEffect(() => {
    const atualizarAsync = async () => {
      await atualizar();
    };

    atualizarAsync();
    const i = setInterval(atualizarAsync, 1500);
    return () => clearInterval(i);
  }, []);

  // Carrega emails ao montar o componente
  useEffect(() => {
    carregarEmails();
  }, [carregarEmails]);

  useEffect(() => {
    if (estado === "fora" && !alertaEnviadoRef.current) {
      enviarAlerta(estado);
      alertaEnviadoRef.current = true;
    } else if (estado === "dentro") {
      alertaEnviadoRef.current = false;
    }
  }, [estado]);

  return (
    <div className="container">
      <h1 className="title-main">Bem vindo!</h1>

      <div className="card">
        <h2 className="title-section">Status do ESP32:</h2>
        <p className="status-text">
          {estado === "dentro" && "🟢 Dentro do Perímetro"}
          {estado === "fora" && "🔴 Fora do Perímetro"}
          {estado === "desconhecido" && "⏳ Aguardando..."}
        </p>

        <div className="mt-15">
          <button 
            onClick={chamarGoogle} 
            disabled={loadingGoogle}
            className="btn btn-google"
          >
            {loadingGoogle ? "Enviando..." : "📍 Chamar API do Google"}
          </button>
        </div>

        {googleResultado && (
          <div className="google-result">
            <h3 className="google-result-title">📍 Resultado da Geolocalização:</h3>
            
            {googleResultado.error ? (
              <div className="google-error">
                <strong>Erro:</strong> {googleResultado.error}
              </div>
            ) : (
              <div>
                {googleResultado.location && (
                  <div style={{ marginBottom: 15 }}>
                    <h4 className="title-subsection-small">📍 Localização:</h4>
                    <div className="google-location-box">
                      <div className="google-location-item"><strong>Latitude:</strong> {googleResultado.location.lat}</div>
                      <div className="google-location-item"><strong>Longitude:</strong> {googleResultado.location.lng}</div>
                      {googleResultado.accuracy && (
                        <div className="google-location-item"><strong>Precisão:</strong> {googleResultado.accuracy} metros</div>
                      )}
                    </div>
                    
                    {googleResultado.location.lat && googleResultado.location.lng && (
                      <div className="mt-10">
                        <a
                          href={`https://www.google.com/maps?q=${googleResultado.location.lat},${googleResultado.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link"
                        >
                          🗺️ Abrir no Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-15">
                  <h4 className="title-subsection-small">📋 Dados Completos (JSON):</h4>
                  <pre className="google-json">
                    {JSON.stringify(googleResultado, null, 2)}
                  </pre>
                </div>
                
                <div className="google-success">
                  ✅ Dados enviados e apagados do banco de dados automaticamente
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="title-section">📧 Cadastro de Emails para Alertas</h2>
        <p className="text-description">
          Cadastre seu email para receber alertas quando o ESP32 sair do perímetro.
        </p>

        <div className="form-group">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="seu@email.com"
            className="input-email"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                cadastrarEmail();
              }
            }}
          />
          <button
            onClick={cadastrarEmail}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>

        {mensagem && (
          <div className={`message ${mensagem.includes("✅") ? "message-success" : "message-error"}`}>
            {mensagem}
          </div>
        )}

        <div className="mt-20">
          <h3 className="title-subsection">Emails Cadastrados ({emailsCadastrados.length}):</h3>
          {emailsCadastrados.length === 0 ? (
            <p className="text-empty">
              Nenhum email cadastrado ainda.
            </p>
          ) : (
            <ul className="email-list">
              {emailsCadastrados.map((item) => (
                <li key={item.id} className="email-item">
                  <span className="email-text">{item.email}</span>
                  <button
                    onClick={() => removerEmail(item.email)}
                    className="btn btn-danger"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
