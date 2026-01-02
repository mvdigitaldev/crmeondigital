-- Migration: Criar tabela pipeline_stages
-- Execute este script no SQL Editor do Supabase

-- Criar tabela pipeline_stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índice para ordenação
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order ON pipeline_stages("order");

-- Criar índice único no slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_pipeline_stages_slug ON pipeline_stages(slug);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_pipeline_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pipeline_stages_updated_at
  BEFORE UPDATE ON pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_pipeline_stages_updated_at();

-- Inserir etapas padrão (opcional - você pode comentar isso se não quiser etapas padrão)
-- Essas etapas correspondem às etapas hardcoded que existiam anteriormente
INSERT INTO pipeline_stages (name, slug, "order", color) VALUES
  ('Prospecção', 'prospecção', 0, NULL),
  ('Contato Realizado', 'contato_realizado', 1, NULL),
  ('Reunião Agendada', 'reuniao_agendada', 2, NULL),
  ('Negociação', 'negociacao', 3, NULL),
  ('Fechado', 'fechado', 4, NULL),
  ('Perdido', 'perdido', 5, NULL)
ON CONFLICT (slug) DO NOTHING;

-- Comentário: Se você já tem leads no banco com esses status, você pode precisar
-- migrar os dados existentes. O status no campo 'leads.status' deve corresponder
-- ao slug da etapa. Se você alterar o slug de uma etapa, os leads com aquele status
-- antigo não aparecerão mais naquela etapa até que sejam atualizados.

