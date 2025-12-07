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
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>Bem vindo!</h1>

      <div style={{ marginBottom: 30, padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
        <h2>Status do ESP32:</h2>
        <p style={{ fontSize: 18, fontWeight: "bold" }}>
          {estado === "dentro" && "🟢 Dentro do Perímetro"}
          {estado === "fora" && "🔴 Fora do Perímetro"}
          {estado === "desconhecido" && "⏳ Aguardando..."}
        </p>

        <div style={{ marginTop: 15 }}>
          <button 
            onClick={chamarGoogle} 
            disabled={loadingGoogle}
            style={{ 
              padding: "8px 16px", 
              cursor: loadingGoogle ? "not-allowed" : "pointer",
              opacity: loadingGoogle ? 0.6 : 1,
              backgroundColor: "#4285f4",
              color: "white",
              border: "none",
              borderRadius: 4,
              fontSize: 14,
              fontWeight: "bold"
            }}
          >
            {loadingGoogle ? "Enviando..." : "📍 Chamar API do Google"}
          </button>
        </div>

        {googleResultado && (
          <div style={{ 
            marginTop: 20, 
            padding: 15, 
            backgroundColor: "#f8f9fa", 
            borderRadius: 8,
            border: "1px solid #dee2e6"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>📍 Resultado da Geolocalização:</h3>
            
            {googleResultado.error ? (
              <div style={{ 
                padding: 10, 
                backgroundColor: "#f8d7da", 
                color: "#721c24", 
                borderRadius: 4 
              }}>
                <strong>Erro:</strong> {googleResultado.error}
              </div>
            ) : (
              <div>
                {googleResultado.location && (
                  <div style={{ marginBottom: 15 }}>
                    <h4 style={{ marginBottom: 8, color: "#333" }}>📍 Localização:</h4>
                    <div style={{ 
                      padding: 10, 
                      backgroundColor: "white", 
                      borderRadius: 4,
                      fontFamily: "monospace",
                      fontSize: 13
                    }}>
                      <div><strong>Latitude:</strong> {googleResultado.location.lat}</div>
                      <div><strong>Longitude:</strong> {googleResultado.location.lng}</div>
                      {googleResultado.accuracy && (
                        <div><strong>Precisão:</strong> {googleResultado.accuracy} metros</div>
                      )}
                    </div>
                    
                    {googleResultado.location.lat && googleResultado.location.lng && (
                      <div style={{ marginTop: 10 }}>
                        <a
                          href={`https://www.google.com/maps?q=${googleResultado.location.lat},${googleResultado.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            padding: "8px 16px",
                            backgroundColor: "#4285f4",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: 4,
                            fontSize: 14,
                            fontWeight: "bold"
                          }}
                        >
                          🗺️ Abrir no Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                )}
                
                <div style={{ marginTop: 15 }}>
                  <h4 style={{ marginBottom: 8, color: "#333" }}>📋 Dados Completos (JSON):</h4>
                  <pre style={{ 
                    padding: 10, 
                    backgroundColor: "#2d2d2d", 
                    color: "#f8f8f2",
                    borderRadius: 4,
                    overflow: "auto",
                    fontSize: 12,
                    maxHeight: 300
                  }}>
                    {JSON.stringify(googleResultado, null, 2)}
                  </pre>
                </div>
                
                <div style={{ 
                  marginTop: 10, 
                  padding: 8, 
                  backgroundColor: "#d4edda", 
                  color: "#155724", 
                  borderRadius: 4,
                  fontSize: 12
                }}>
                  ✅ Dados enviados e apagados do banco de dados automaticamente
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 30, padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
        <h2>📧 Cadastro de Emails para Alertas</h2>
        <p style={{ color: "#666", marginBottom: 15 }}>
          Cadastre seu email para receber alertas quando o ESP32 sair do perímetro.
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="seu@email.com"
            style={{
              flex: 1,
              padding: "10px",
              fontSize: 16,
              border: "1px solid #ddd",
              borderRadius: 4,
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                cadastrarEmail();
              }
            }}
          />
          <button
            onClick={cadastrarEmail}
            disabled={loading}
            style={{
              padding: "10px 20px",
              fontSize: 16,
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>

        {mensagem && (
          <div
            style={{
              padding: 10,
              marginBottom: 15,
              borderRadius: 4,
              backgroundColor: mensagem.includes("✅") ? "#d4edda" : "#f8d7da",
              color: mensagem.includes("✅") ? "#155724" : "#721c24",
            }}
          >
            {mensagem}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 10 }}>Emails Cadastrados ({emailsCadastrados.length}):</h3>
          {emailsCadastrados.length === 0 ? (
            <p style={{ color: "#999", fontStyle: "italic" }}>
              Nenhum email cadastrado ainda.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {emailsCadastrados.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    marginBottom: 8,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 4,
                  }}
                >
                  <span>{item.email}</span>
                  <button
                    onClick={() => removerEmail(item.email)}
                    style={{
                      padding: "5px 10px",
                      fontSize: 12,
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
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
