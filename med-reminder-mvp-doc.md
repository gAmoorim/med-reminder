# MedRemind — Documentação da v1 (MVP)

App/site de lembrete de medicamentos, focado em validar o fluxo mais arriscado do projeto primeiro: alarme via push funcionando de ponta a ponta.

## Escopo da v1

### 1. Cadastro de medicamento + esquema

**Medicamento**
- Nome
- Forma: comprimido / gota
- Quantidade por dose (ex: 1/2 comprimido, 10 gotas)

**Esquema (schedule)**
- Tipo de recorrência: `intervalo` (ex: 8/8h) ou `horarios_fixos` (ex: 08:00, 14:00, 20:00)
- Data de início (e opcionalmente data de término)
- Timezone do usuário (salvar explicitamente — evita bug com horário de verão)

Um medicamento tem 1 esquema ativo por vez, mas o histórico de esquemas antigos é preservado (não deletar ao editar, criar um novo e desativar o anterior).

### 2. Alarme

**Fluxo**
1. Job diário gera as `doses` esperadas do dia seguinte a partir do esquema ativo
2. No horário previsto, o backend dispara um Web Push
3. Notificação mostra 2 ações: **Confirmar** / **Adiar**
4. **Confirmar** → status da dose = `tomada`, salva horário real
5. **Adiar** → status = `adiada`, agenda novo push em 10/20/30 min (escolhido pelo usuário)
6. Se a dose ficar sem resposta após **N repetições** (definir N, ex: 3), status vira `nao_tomada` automaticamente

**Importante:** o reagendamento do alarme (adiar, repetição) precisa ser um job no servidor, não um `setTimeout` no client — senão para de funcionar assim que o app/aba é fechado.

### 3. Dashboard

Ao entrar no sistema, resumo do dia atual:
- Total de doses programadas / tomadas / pendentes
- Próximo medicamento + contagem regressiva até o horário

Dados vêm de uma query simples: `doses` do dia agrupadas por status.

### 4. Histórico

Lista cronológica (não calendário visual ainda) das doses passadas, agrupada por dia, mostrando status de cada uma (tomada / adiada / não tomada) e horário real de confirmação.

## Modelo de dados (resumo)

| Tabela | Campos principais |
|---|---|
| `usuarios` | id, nome, email, senha_hash |
| `medicamentos` | id, usuario_id, nome, forma, quantidade_por_dose |
| `esquemas` | id, medicamento_id, tipo_recorrencia, intervalo_horas ou horarios_fixos, timezone, ativo, data_inicio, data_fim |
| `doses` | id, esquema_id, horario_previsto, horario_confirmado, status (`pendente`/`tomada`/`adiada`/`nao_tomada`), qtd_adiamentos |

## Stack técnica

- **Backend:** Node.js (CommonJS) + Express + Knex.js + PostgreSQL
- **Scheduler:** `node-cron` ou `agenda` — gera doses do dia e dispara os pushes
- **Push:** lib `web-push` (VAPID keys) + Service Worker no frontend
- **Frontend:** React + Vite, com Workbox pra facilitar o Service Worker
- **Auth:** JWT + bcrypt

## PWA

- `manifest.json` (nome, ícones, `display: standalone`)
- Service Worker registrado (pré-requisito do push)
- HTTPS em produção (obrigatório pra push fora de `localhost`)

## Testando localmente

- Push funciona em `localhost` sem HTTPS (exceção da regra)
- Chrome DevTools → **Application → Service Workers** tem botão "Push" pra simular notificação sem esperar o horário real
- Testar primeiro em Chrome/Edge/Firefox desktop (suporte completo), depois Android, por último iOS (push só funciona em PWA instalada na tela de início, a partir do iOS 16.4)

---

## Futuras implementações (v2+)

- **Reposição de medicamentos** — quantidade inicial em estoque, decrementa a cada dose confirmada, alerta configurável quando estiver acabando (ex: "restam ~4 doses")
- **Calendário do tratamento** — visão mensal clicável, com resumo de doses tomadas/não tomadas por dia
- **Observação por dose** — campo de texto livre por dose confirmada (ex: "tomei após o almoço")
- **Compartilhamento com cuidador** — usuário adiciona um responsável que visualiza medicamentos, doses tomadas/esquecidas, próximas doses, e recebe alerta se uma dose não for confirmada ou o estoque estiver acabando
