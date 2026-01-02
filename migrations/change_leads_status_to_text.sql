-- Migration: Alterar coluna status de ENUM para TEXT
-- Execute este script no SQL Editor do Supabase
-- 
-- IMPORTANTE: Esta migration altera a coluna status de ENUM para TEXT
-- para permitir valores dinâmicos baseados nos slugs das etapas do pipeline

-- Passo 1: Alterar o tipo da coluna status para TEXT
-- Isso preserva os dados existentes automaticamente
ALTER TABLE leads 
  ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- Comentário: Agora a coluna status aceita qualquer valor de texto,
-- permitindo que os slugs das etapas do pipeline sejam usados dinamicamente.
-- Os valores existentes (prospecção, contato_realizado, etc.) serão preservados.

