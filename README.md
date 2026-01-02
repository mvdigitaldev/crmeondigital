# CRM EON Digital

CRM completo para o time de SDR da EON Digital, desenvolvido com Next.js, Supabase, TailwindCSS e shadcn/ui.

## 🚀 Tecnologias

- **Next.js** 16+ (App Router)
- **Supabase** (banco de dados + autenticação)
- **TailwindCSS** (estilização)
- **shadcn/ui** (componentes)
- **React Query** (gerenciamento de estado)
- **TypeScript** (tipagem)
- **Zod** (validação)
- **Lucide-react** (ícones)
- **Recharts** (gráficos)
- **Framer Motion** (animações)
- **@dnd-kit** (drag & drop)

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Projeto Supabase criado

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd crmeondigital
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

**Como obter as credenciais do Supabase:**

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Copie a **URL** e a **anon/public key**
5. Para a Service Role Key, vá em **Settings** > **API** > **service_role key** (mantenha esta chave segura!)

### 4. Configure o banco de dados

O schema do banco de dados já foi criado via migrations. As tabelas incluem:

- `leads` - Leads do CRM
- `activities` - Atividades dos leads
- `lead_history` - Histórico de mudanças
- `user_profiles` - Perfis de usuários
- `pipeline_stages` - Etapas do pipeline (novo)

**Importante:** Execute o script SQL em `migrations/create_pipeline_stages.sql` no SQL Editor do Supabase para criar a tabela de etapas do pipeline.

### 5. Execute o projeto

```bash
npm run dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000)

## 📚 Estrutura do Projeto

```
crmeondigital/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas de autenticação
│   │   ├── (dashboard)/       # Rotas protegidas
│   │   │   ├── dashboard/     # Dashboard principal
│   │   │   ├── leads/         # Gestão de leads
│   │   │   ├── pipeline/      # Pipeline Kanban
│   │   │   └── usuarios/      # Gestão de usuários (Admin)
│   │   └── layout.tsx         # Layout raiz
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   ├── layout/            # Sidebar, Header
│   │   ├── leads/             # Componentes de leads
│   │   ├── pipeline/          # Componentes do pipeline
│   │   ├── activities/        # Componentes de atividades
│   │   └── dashboard/         # Componentes do dashboard
│   ├── lib/
│   │   ├── supabase/          # Clientes Supabase
│   │   ├── utils.ts           # Utilitários
│   │   ├── validations.ts     # Schemas Zod
│   │   └── providers.tsx      # Providers (React Query)
│   ├── hooks/                 # Custom hooks
│   ├── services/              # Serviços de API
│   └── types/                 # Tipos TypeScript
├── public/                    # Arquivos estáticos
└── middleware.ts              # Middleware de autenticação
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `leads`

Campos:
- `id` (UUID, Primary Key)
- `nome_produtor` (TEXT, obrigatório)
- `nome_contato` (TEXT, obrigatório)
- `telefone` (TEXT)
- `email` (TEXT)
- `produto` (TEXT)
- `site_link` (TEXT)
- `uf` (TEXT, max 2 caracteres)
- `status` (ENUM: prospecção, contato_realizado, reuniao_agendada, negociacao, fechado, perdido)
- `valor_estimado` (NUMERIC)
- `origem` (ENUM: Inbound, Outbound)
- `observacoes` (TEXT)
- `sdr_id` (UUID, Foreign Key para auth.users)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Tabela `activities`

Campos:
- `id` (UUID, Primary Key)
- `lead_id` (UUID, Foreign Key para leads)
- `tipo` (ENUM: ligacao, whatsapp, email, reuniao)
- `descricao` (TEXT)
- `data_agendada` (TIMESTAMPTZ, nullable)
- `realizada` (BOOLEAN)
- `created_by` (UUID, Foreign Key para auth.users)
- `created_at` (TIMESTAMPTZ)

### Tabela `lead_history`

Campos:
- `id` (UUID, Primary Key)
- `lead_id` (UUID, Foreign Key para leads)
- `campo_alterado` (TEXT)
- `valor_anterior` (TEXT)
- `valor_novo` (TEXT)
- `changed_by` (UUID, Foreign Key para auth.users)
- `created_at` (TIMESTAMPTZ)

### Tabela `user_profiles`

Campos:
- `id` (UUID, Primary Key, Foreign Key para auth.users)
- `role` (ENUM: SDR, Admin)
- `nome_completo` (TEXT)
- `created_at` (TIMESTAMPTZ)

### Tabela `pipeline_stages`

Campos:
- `id` (UUID, Primary Key)
- `name` (TEXT, obrigatório) - Nome da etapa
- `slug` (TEXT, obrigatório, único) - Identificador único da etapa (usado no campo status dos leads)
- `order` (INTEGER, obrigatório) - Ordem de exibição
- `color` (TEXT, opcional) - Cor da etapa
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## 🔐 Autenticação e Autorização

O sistema usa Supabase Auth para autenticação. Existem dois perfis:

- **SDR**: Acesso ao CRM, vê apenas seus próprios leads
- **Admin**: Acesso total, incluindo gestão de usuários e visualização de todos os leads

### Como criar o primeiro usuário Admin

1. Crie um usuário através do Supabase Auth (via Dashboard ou API)
2. No banco de dados, atualize a tabela `user_profiles`:
   ```sql
   UPDATE user_profiles SET role = 'Admin' WHERE id = '<user_id>';
   ```

## 🎨 Tema

- **Modo**: Dark (padrão)
- **Cor Primária**: #ff4c00
- **Fonte**: Sora (Google Fonts)

## 📝 Funcionalidades

### Leads
- ✅ CRUD completo de leads
- ✅ Filtros (status, UF, origem)
- ✅ Busca por texto
- ✅ Histórico de mudanças

### Pipeline
- ✅ Visualização Kanban
- ✅ Drag & drop entre etapas
- ✅ Atualização em tempo real
- ✅ Criar, editar e excluir etapas do funil
- ✅ Transferência automática de leads ao excluir etapa

### Atividades
- ✅ Registro de atividades
- ✅ Timeline por lead
- ✅ Follow-ups com alertas
- ✅ Marcação como realizada

### Dashboard
- ✅ Métricas principais
- ✅ Gráficos (Recharts)
- ✅ Valor potencial

### Usuários (Admin)
- ✅ Listagem de usuários
- ✅ Edição de perfis
- ✅ Alteração de roles

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para um repositório Git
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente
4. Deploy automático a cada push

### Outras plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 📄 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa ESLint
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário da EON Digital.

## 🆘 Suporte

Para suporte, entre em contato com a equipe de desenvolvimento da EON Digital.
