-- Schema do banco de dados para persistir dados do ESP32
-- Execute este SQL no SQL Editor do Neon (ou qualquer cliente PostgreSQL)

-- Tabela para armazenar o estado atual do ESP32
CREATE TABLE IF NOT EXISTS esp32_status (
  id SERIAL PRIMARY KEY,
  estado TEXT NOT NULL DEFAULT 'desconhecido',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar scans de Wi-Fi para geolocalização
CREATE TABLE IF NOT EXISTS wifi_scans (
  id SERIAL PRIMARY KEY,
  scan_data JSONB NOT NULL,
  ultimo_scan_array JSONB,
  scan_para_enviar JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar emails cadastrados para receber alertas
CREATE TABLE IF NOT EXISTS emails_cadastrados (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir registro inicial para esp32_status (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM esp32_status LIMIT 1) THEN
    INSERT INTO esp32_status (estado) VALUES ('desconhecido');
  END IF;
END $$;

-- Inserir registro inicial para wifi_scans (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM wifi_scans LIMIT 1) THEN
    INSERT INTO wifi_scans (scan_data, ultimo_scan_array, scan_para_enviar) 
    VALUES ('{}'::jsonb, '[]'::jsonb, NULL);
  END IF;
END $$;

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_esp32_status_updated_at BEFORE UPDATE ON esp32_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wifi_scans_updated_at BEFORE UPDATE ON wifi_scans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_cadastrados_updated_at BEFORE UPDATE ON emails_cadastrados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

