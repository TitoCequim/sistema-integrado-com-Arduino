-- Migração: Remove coluna scan_para_enviar_timestamp (simplificação)
-- Execute este SQL no SQL Editor do Neon se você já tinha a coluna timestamp

-- Remove a coluna scan_para_enviar_timestamp se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wifi_scans' 
    AND column_name = 'scan_para_enviar_timestamp'
  ) THEN
    ALTER TABLE wifi_scans 
    DROP COLUMN scan_para_enviar_timestamp;
  END IF;
END $$;

