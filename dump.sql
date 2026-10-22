-- MedRemind — Schema v1 (PostgreSQL)

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE medicamentos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  forma VARCHAR(20) NOT NULL CHECK (forma IN ('comprimido', 'gota')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE esquemas (
  id SERIAL PRIMARY KEY,
  medicamento_id INTEGER NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
  quantidade_por_dose NUMERIC(5,2) NOT NULL,
  tipo_recorrencia VARCHAR(20) NOT NULL CHECK (tipo_recorrencia IN ('intervalo', 'horarios_fixos')),
  intervalo_horas INTEGER,          -- obrigatório se tipo_recorrencia = 'intervalo'
  horarios_fixos JSONB,             -- ex: ["08:00", "14:00", "20:00"]
  timezone VARCHAR(50) NOT NULL,    -- ex: "America/Fortaleza"
  data_inicio DATE NOT NULL,
  data_fim DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_esquemas_medicamento_ativo ON esquemas (medicamento_id, ativo);

CREATE TABLE doses (
  id SERIAL PRIMARY KEY,
  esquema_id INTEGER NOT NULL REFERENCES esquemas(id) ON DELETE CASCADE,
  horario_previsto TIMESTAMPTZ NOT NULL,   -- horário original, imutável (histórico)
  proximo_alarme TIMESTAMPTZ,              -- próximo disparo do job; null quando tomada/nao_tomada
  horario_confirmado TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'tomada', 'adiada', 'nao_tomada')),
  qtd_repeticoes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_doses_status_alarme ON doses (status, proximo_alarme);
CREATE INDEX idx_doses_esquema_horario ON doses (esquema_id, horario_previsto);

CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, endpoint)
);