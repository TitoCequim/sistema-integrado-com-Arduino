-- Migração: Adiciona coluna scan_para_enviar_timestamp
-- Execute este SQL no SQL Editor do Neon se você já executou o schema.sql anteriormente

-- Adiciona a coluna scan_para_enviar_timestamp se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wifi_scans' 
    AND column_name = 'scan_para_enviar_timestamp'
  ) THEN
    ALTER TABLE wifi_scans 
    ADD COLUMN scan_para_enviar_timestamp TIMESTAMP WITH TIME ZONE;
    
    -- Limpa scans antigos que não têm timestamp (marca como NULL)
    UPDATE wifi_scans 
    SET scan_para_enviar_timestamp = NULL 
    WHERE scan_para_enviar_timestamp IS NULL;
  END IF;
END $$;

