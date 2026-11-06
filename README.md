<div align="center">

# ⭐ Avalie+

### Sua opinião transforma o atendimento.

**Cloud Challenge 2026.2 · Senac · Grupo 02 · Desafio 13 — Avalie o Atendimento**

![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Azure-4169E1?logo=postgresql&logoColor=white)
![Microsoft Azure](https://img.shields.io/badge/Microsoft_Azure-App_Service-0078D4?logo=microsoftazure&logoColor=white)
![Status](https://img.shields.io/badge/Status-Publicado-16a34a)

### 🌐 [Acessar o Avalie+](https://bit.ly/avalie-mais)

[Site na Azure](https://avalie-atendimento-g02-awbecghng2fcgqgj.brazilsouth-01.azurewebsites.net/) · [Painel de satisfação](https://avalie-atendimento-g02-awbecghng2fcgqgj.brazilsouth-01.azurewebsites.net/painel.html) · [Repositório](https://github.com/BrunoAugusto290907/Cloud-Challenge-Desafio13)

</div>

---

## 📌 Sobre o projeto

O **Avalie+** é uma aplicação web desenvolvida para digitalizar a coleta de opiniões sobre os serviços de uma unidade de ensino. A proposta substitui a tradicional caixa de sugestões por um sistema acessível pela internet, no qual estudantes e demais usuários podem avaliar atendimentos **sem informar nome ou criar conta**.

O projeto contempla quatro serviços:

- **Secretaria**
- **Biblioteca**
- **Cantina**
- **Laboratórios**

As avaliações ajudam a identificar pontos positivos e oportunidades de melhoria, enquanto o painel apresenta indicadores de satisfação por serviço.

## ✨ Funcionalidades

### Para quem avalia

- Seleção de um dos serviços cadastrados.
- Avaliação de **1 a 5 estrelas**, com seleção visual interativa.
- Comentário opcional de até **280 caracteres**.
- Envio **anônimo**, sem cadastro.
- Escolha entre **avaliação pública** e **avaliação privada**.
- Mural com comentários públicos e filtro por serviço.
- Interface responsiva em português brasileiro, com identidade visual e favicon próprios.

### Para acompanhamento e gestão

- **Painel de satisfação** com quantidade de avaliações, média e distribuição das notas de 1 a 5.
- Exibição de **“Amostra insuficiente”** quando um serviço possui menos de três avaliações, sem apresentar média nesse caso.
- Área do gestor com acesso às avaliações públicas e privadas por meio de **token de autorização**.
- Moderação de comentários públicos inadequados, sem apagar a avaliação nem retirar sua nota dos indicadores.
- Armazenamento persistente no PostgreSQL.

> **Privacidade:** avaliações privadas não são exibidas no mural público. O sistema não solicita identificação do avaliador. A autenticação administrativa é baseada em token e não equivale a um sistema completo de contas de usuários.

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Interface | HTML5, CSS3 e JavaScript |
| Servidor | Node.js e Express 5 |
| Banco de dados | PostgreSQL e biblioteca `pg` |
| Configuração | `dotenv` e variáveis de ambiente |
| Hospedagem | Azure App Service (Linux, Node.js 22 LTS) |
| Banco na nuvem | Azure Database for PostgreSQL Flexible Server |
| Versionamento | Git e GitHub |

## ☁️ Arquitetura da solução

```mermaid
flowchart LR
    U[Usuário no navegador] -->|HTTPS| A[Azure App Service]
    A --> N[Node.js + Express]
    N --> F[Frontend HTML / CSS / JS]
    N -->|Conexão TLS| P[(Azure PostgreSQL)]
    G[Gestor autorizado] -->|Token nas rotas protegidas| N
```

O frontend e a API são disponibilizados pela mesma aplicação Express. O servidor recebe as avaliações, valida os dados e registra as informações no banco PostgreSQL hospedado na Azure.

## 📂 Estrutura do projeto

```text
Cloud-Challenge-Desafio13/
├── README.md
├── banco/
│   ├── schema.sql
│   ├── dados-iniciais.sql
│   └── validacao.sql
└── backend/
    ├── .env.example
    ├── package.json
    ├── package-lock.json
    ├── public/
    │   ├── index.html
    │   ├── painel.html
    │   ├── gestor.html
    │   ├── favicon.svg
    │   ├── css/
    │   │   └── style.css
    │   └── js/
    │       ├── app.js
    │       ├── painel.js
    │       └── gestor.js
    └── src/
        ├── server.js
        ├── app.js
        ├── db.js
        ├── validacao.js
        └── routes/
            ├── health.js
            ├── servicos.js
            ├── avaliacoes.js
            └── painel.js
```

## 💻 Como executar localmente

### Pré-requisitos

- Node.js **20 ou superior** e npm.
- Acesso a um servidor PostgreSQL.
- Um banco de dados criado e permissões para executar os scripts SQL.

### 1. Clonar o repositório

```bash
git clone https://github.com/BrunoAugusto290907/Cloud-Challenge-Desafio13.git
cd Cloud-Challenge-Desafio13/backend
npm ci
```

### 2. Configurar as variáveis de ambiente

Crie um arquivo `backend/.env` a partir de `backend/.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO
DATABASE_SSL=true
GESTOR_TOKEN=COLOQUE_AQUI_UM_TOKEN_FORTE_E_SECRETO
```

Para PostgreSQL local sem TLS, ajuste `DATABASE_SSL=false` conforme a configuração do banco. Para o PostgreSQL da Azure, mantenha a conexão segura habilitada. Senhas com caracteres especiais na URL de conexão devem ser codificadas corretamente.

**Nunca publique `.env`, senhas, tokens ou URLs de conexão com credenciais no GitHub.**

### 3. Preparar o banco

Crie o banco indicado em `DATABASE_URL` e execute os scripts SQL na seguinte ordem, a partir da raiz do repositório:

```bash
psql "SUA_STRING_DE_CONEXAO" -f banco/schema.sql
psql "SUA_STRING_DE_CONEXAO" -f banco/dados-iniciais.sql
```

Se estiver na pasta `backend`, use os caminhos `../banco/schema.sql` e `../banco/dados-iniciais.sql`.

Os scripts criam a estrutura necessária e cadastram os serviços e dados iniciais. Eles **não** são executados automaticamente pelo `npm start`.

### 4. Iniciar o servidor

Dentro da pasta `backend`:

```bash
npm start
```

Acesse:

| Página | Endereço local |
|---|---|
| Avaliação | http://localhost:3000/ |
| Painel | http://localhost:3000/painel.html |
| Gestor | http://localhost:3000/gestor.html |
| Saúde da API | http://localhost:3000/health |

Para desenvolvimento com reinicialização automática, utilize `npm run dev`.

## 🔌 API REST

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/health` | Verifica a aplicação e a conexão com o banco | Público |
| `GET` | `/api/servicos` | Lista os serviços cadastrados | Público |
| `GET` | `/api/servicos/:id/avaliacoes` | Lista comentários públicos visíveis de um serviço | Público |
| `POST` | `/api/avaliacoes` | Cadastra avaliação pública ou privada | Público |
| `GET` | `/api/painel` | Indicadores de todos os serviços | Público |
| `GET` | `/api/painel/:servicoId` | Indicadores de um serviço | Público |
| `GET` | `/api/avaliacoes` | Consulta avaliações para moderação | Gestor |
| `PATCH` | `/api/avaliacoes/:id/ocultar` | Oculta comentário público | Gestor |

As rotas restritas exigem o cabeçalho `x-gestor-token` com o token configurado no servidor. O token **não deve ser compartilhado publicamente**.

Exemplo de avaliação enviada à API:

```json
{
  "servico_id": 1,
  "nota": 5,
  "comentario": "Atendimento rápido e atencioso.",
  "privada": false
}
```

A rota `/health` retorna `status: "ok"` e `banco: "conectado"` quando a conexão está funcionando. Caso o banco esteja indisponível, informa o problema e retorna HTTP 503.

## 🚀 Publicação na Azure

A aplicação foi publicada usando **implantação manual por ZIP** no Azure App Service, com o banco de dados em **Azure Database for PostgreSQL Flexible Server**, na região **Brazil South**.

### Configuração utilizada

- **App Service:** `avalie-atendimento-g02`
- **Runtime:** Linux / Node.js 22 LTS
- **Banco:** PostgreSQL Flexible Server
- **Banco de dados:** `avalie_atendimento`
- **Variáveis de aplicação:** `DATABASE_URL`, `DATABASE_SSL`, `GESTOR_TOKEN` e `SCM_DO_BUILD_DURING_DEPLOYMENT=true`
- **Inicialização:** `npm start`

O arquivo ZIP é gerado a partir do conteúdo da pasta `backend`, mantendo `package.json` na raiz do pacote e **sem incluir `.env` ou `node_modules`**.

Exemplo de criação do ZIP no Windows, com terminal Git Bash aberto na pasta `backend`:

```bash
powershell.exe -NoProfile -Command "Compress-Archive -Path package.json,src,public -DestinationPath backend-deploy.zip -Force"
```

Após a criação, o arquivo é enviado em **Azure App Service → Deployment Center → Manual Deployment (Push)**.

> **Atenção:** a conexão entre o App Service e o PostgreSQL depende das regras de rede do servidor. Para produção, prefira permitir apenas os endereços de saída necessários do aplicativo ou utilizar conectividade privada. Evite manter uma liberação ampla de serviços Azure como configuração permanente.

### Endereços publicados

- **Link curto:** https://bit.ly/avalie-mais
- **Aplicação:** https://avalie-atendimento-g02-awbecghng2fcgqgj.brazilsouth-01.azurewebsites.net/
- **Painel:** https://avalie-atendimento-g02-awbecghng2fcgqgj.brazilsouth-01.azurewebsites.net/painel.html
- **Saúde:** https://avalie-atendimento-g02-awbecghng2fcgqgj.brazilsouth-01.azurewebsites.net/health

## 🧪 Validação

Durante a implantação, foram realizados testes manuais de acesso ao site, carregamento dos serviços e comentários, conexão com o PostgreSQL, seleção de estrelas, envio de avaliações públicas e privadas e utilização do painel do gestor.

O endpoint `/health` confirmou a conexão com o banco após o ajuste das regras de rede do PostgreSQL. O sistema permaneceu acessível pela URL pública após a atualização da interface.

**Antes da entrega final**, recomenda-se registrar evidências dos testes, verificar os casos de erro da API, confirmar o funcionamento em dispositivos móveis e revisar as permissões de rede e as credenciais.

## 🔐 Segurança e privacidade

- A aplicação não solicita nome ou cadastro do avaliador.
- Avaliações privadas não aparecem no mural público.
- O servidor valida notas, serviços e tamanho dos comentários.
- As consultas SQL utilizam parâmetros.
- Rotas administrativas exigem token de autorização.
- Credenciais devem permanecer em variáveis de ambiente, fora do repositório.
- Senhas e tokens eventualmente expostos durante o desenvolvimento devem ser substituídos antes da entrega definitiva.

## 🎓 Informações acadêmicas

| Item | Descrição |
|---|---|
| Instituição | Senac |
| Atividade | Cloud Challenge 2026.2 |
| Disciplina | Cloud Computing |
| Professor | Roni Maciel |
| Equipe | Grupo 02 |
| Desafio | 13 — Avalie o Atendimento |
| Produto | Avalie+ |
| Situação | Aplicação implantada e funcionalidades principais testadas |

---

<div align="center">

**⭐ Avalie+ — Sua opinião transforma o atendimento.**

Projeto acadêmico desenvolvido para o **Cloud Challenge 2026.2 — Senac**.

</div>
