<div align="center">

# ⭐ Avalie o Atendimento

**Avaliações anônimas e painel de satisfação por serviço, com médias em que dá pra confiar.**

![Senac](https://img.shields.io/badge/Senac-Cloud%20Computing%202026.2-004A8F?style=for-the-badge)
![Grupo](https://img.shields.io/badge/Grupo-02-F7941D?style=for-the-badge)
![Desafio](https://img.shields.io/badge/Desafio-13-0078D4?style=for-the-badge)

![Azure](https://img.shields.io/badge/Azure-App%20Service-0078D4?logo=microsoftazure&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-banco%20relacional-4169E1?logo=postgresql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)

**Aplicação publicada:** aguardando URL · **Pitch:** pendente · **GitHub Projects:** adicionar link, se utilizado · **Evidências:** adicionar após os testes

</div>

---

## 📇 Ficha rápida

| Campo | Informação |
|---|---|
| Disciplina | Cloud Computing · Senac · 2026.2 |
| Professor | Roni Maciel |
| Atividade | Cloud Challenge — do problema ao produto na nuvem |
| Grupo / Desafio | Grupo 02 · Desafio 13 — Avalie o Atendimento |
| Complexidade | Intermediária |
| Nível de implantação | A definir após a publicação e validação |
| URL pública | Pendente — preencher após implantação |

## 📌 Sobre o projeto

A unidade deseja medir a satisfação com **secretaria, biblioteca, cantina e laboratórios**, substituindo a caixa de sugestões em papel por uma solução digital. O **Avalie o Atendimento** permite que estudantes enviem avaliações **anônimas** e que gestores consultem um **painel por serviço** com quantidade, média e distribuição das notas.

| Perfil | Funcionalidades |
|---|---|
| Estudante | Escolhe o serviço, atribui nota inteira de 1 a 5 e pode escrever comentário opcional de até 280 caracteres. |
| Gestor | Consulta avaliações públicas e privadas, acompanha indicadores e oculta comentários públicos impróprios. |

**Regra central:** serviços com **menos de 3 avaliações** exibem **“Amostra insuficiente”**, sem apresentar média. Ocultar um comentário **não exclui sua nota dos indicadores**.

### Funcionalidade adicional: avaliações públicas e privadas

- **Pública:** pode aparecer no mural público, desde que contenha comentário e não esteja oculta.
- **Privada:** é armazenada no PostgreSQL e pode ser consultada apenas pela rota protegida do gestor; não aparece no mural.
- **Ambas:** contam na quantidade, média e distribuição de notas.
- O sistema não solicita identificação do estudante. O acesso do gestor usa um token simples configurado no servidor; não é um sistema completo de contas e autenticação.

## ✅ Requisitos e situação

**Legenda:** Implementado = presente no código; Pendente de validação = ainda requer teste com PostgreSQL conectado e/ou Azure.

| Requisito | Situação |
|---|---|
| RF1 — Quatro serviços cadastrados por script inicial | Implementado; execução no banco a validar |
| RF2 — Avaliação anônima, nota 1–5 e comentário opcional até 280 caracteres | Implementado; teste integrado pendente |
| RF3 — Painel com quantidade, média com 1 casa decimal e distribuição 1–5 | Implementado; teste integrado pendente |
| RF4 — Menos de 3 avaliações: “Amostra insuficiente” | Implementado; teste integrado pendente |
| RF5 — Gestor oculta comentário sem excluir nota dos indicadores | Implementado; teste integrado pendente |
| Persistência em PostgreSQL | Implementada no código; conexão e reinício a validar |
| `GET /health` verifica conexão com banco | Implementado; validar em ambiente publicado |
| Validação no servidor e consultas SQL parametrizadas | Implementadas; testar casos negativos |
| Variáveis sensíveis fora do repositório | `.env.example` e `.gitignore` presentes; conferir configuração de produção |
| Implantação Azure App Service + PostgreSQL | Pendente de publicação e verificação |
| Evidências, pitch e URL pública | Pendentes |

## 🏗️ Arquitetura

```mermaid
flowchart LR
    U["Estudante / Gestor (navegador)"] -->|HTTPS| A["Azure App Service: Node.js + Express + HTML/CSS/JS"]
    A -->|"DATABASE_URL / TLS"| D[("Azure Database for PostgreSQL")]
    A -.->|"GET /health"| D
```

A interface e a API são servidas pela **mesma aplicação Express**. O navegador utiliza rotas relativas (`/api/...`), sem necessidade de configurar uma URL separada para o frontend.

### Tecnologias

- **Frontend:** HTML, CSS e JavaScript.
- **Backend:** Node.js 20 ou superior, Express 5.
- **Banco:** PostgreSQL com biblioteca `pg`.
- **Hospedagem prevista:** Azure App Service e Azure Database for PostgreSQL Flexible Server.

## 📁 Estrutura do repositório

```text
Cloud-Challenge-Desafio13/
├── README.md
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── requisicoes.http
│   ├── public/
│   │   ├── index.html
│   │   ├── painel.html
│   │   ├── gestor.html
│   │   ├── css/style.css
│   │   └── js/
│   │       ├── app.js
│   │       ├── painel.js
│   │       └── gestor.js
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── db.js
│       ├── validacao.js
│       └── routes/
│           ├── health.js
│           ├── servicos.js
│           ├── avaliacoes.js
│           └── painel.js
└── banco/
    ├── schema.sql
    ├── dados-iniciais.sql
    └── validacao.sql
```

A pasta `evidencias/` deve ser criada e preenchida quando os testes e a publicação forem realizados.

## 🚀 Execução local

### Pré-requisitos

- Node.js **20 ou superior** e npm.
- Um banco PostgreSQL acessível (local ou remoto).
- Permissão para criar tabelas e inserir os dados iniciais no banco.

### 1. Clonar e instalar

```bash
git clone https://github.com/BrunoAugusto290907/Cloud-Challenge-Desafio13.git
cd Cloud-Challenge-Desafio13/backend
npm ci
```

### 2. Configurar variáveis

Copie `backend/.env.example` para `backend/.env` e ajuste **somente no seu computador**:

```env
DATABASE_URL=postgres://usuario:senha@localhost:5432/avalie
DATABASE_SSL=false
GESTOR_TOKEN=substitua-por-um-token-longo-e-aleatorio
PORT=3000
```

`DATABASE_SSL=false` é apropriado apenas para um PostgreSQL local configurado sem TLS. Para PostgreSQL gerenciado na Azure, use `DATABASE_SSL=true` (ou omita a variável, pois o código ativa SSL por padrão).

**Nunca envie `.env`, senhas, tokens ou URLs contendo credenciais para o GitHub, prints ou evidências.**

### 3. Preparar o PostgreSQL

Crie previamente o banco indicado em `DATABASE_URL`. Na raiz do repositório, execute os scripts **nesta ordem** usando `psql` com conexão e credenciais apropriadas:

```bash
psql "SUA_STRING_DE_CONEXAO" -f banco/schema.sql
psql "SUA_STRING_DE_CONEXAO" -f banco/dados-iniciais.sql
```

Os comandos acima devem ser executados a partir da **raiz do repositório**. Se você estiver dentro de `backend/`, use `../banco/schema.sql` e `../banco/dados-iniciais.sql`.

Os scripts SQL não são executados automaticamente por `npm start`.

### 4. Iniciar

Dentro de `backend/`:

```bash
npm start
```

Acesse:

- Página de avaliações: `http://localhost:3000/`
- Painel: `http://localhost:3000/painel.html`
- Gestor: `http://localhost:3000/gestor.html`
- Saúde da aplicação: `http://localhost:3000/health`

Com banco conectado, `/health` deve responder aproximadamente:

```json
{
  "status": "ok",
  "banco": "conectado",
  "iniciado_em": "2026-11-05T19:00:00.000Z"
}
```

O horário acima é apenas ilustrativo. Se a conexão falhar, a rota responde HTTP **503** com `banco: "indisponivel"`.

## ☁️ Guia de implantação na Azure — para o responsável pelo deploy

> **Atenção:** a publicação ainda precisa ser executada e testada. Não considerar a aplicação pronta apenas porque o App Service inicia.

### 1. Criar/configurar PostgreSQL Flexible Server

1. No portal Azure, criar um **Azure Database for PostgreSQL Flexible Server** em região compatível com os recursos disponíveis.
2. Definir usuário administrador e senha forte; guardar as credenciais fora do GitHub.
3. Criar o banco de dados que será utilizado pela aplicação.
4. Configurar o acesso de rede para que o App Service consiga alcançar o PostgreSQL. A configuração depende da modalidade de rede escolhida (acesso público com regras de firewall apropriadas ou acesso privado com integração de rede).
5. Exigir conexão segura/TLS conforme a configuração do servidor.
6. Executar `banco/schema.sql` e depois `banco/dados-iniciais.sql` **nesse banco**.
7. Confirmar que as quatro opções de serviço foram inseridas.

**Importante:** liberar o IP do computador de quem executa `psql` não garante que o **App Service** terá acesso. Validar especificamente a conectividade da aplicação hospedada. Evitar liberar acesso irrestrito à Internet como solução permanente.

### 2. Criar/configurar Azure App Service

1. Criar um **Web App** com runtime **Node.js 20 ou superior** compatível com o projeto e um plano/região adequados.
2. Publicar o conteúdo do repositório usando **`backend/` como raiz da aplicação**. O `package.json` precisa ficar na raiz efetivamente implantada, não dentro de uma subpasta adicional.
3. Se usar integração com GitHub Actions ou outro pipeline, configurar o diretório de trabalho/artefato como `backend` e instalar dependências com `npm ci`.
4. Garantir que a instalação de dependências seja executada no build/deploy.
5. O comando de inicialização do projeto é **`npm start`**, que executa `node src/server.js`.
6. O servidor já lê `process.env.PORT`; não fixar a porta no código. Respeitar a porta fornecida pelo ambiente.

**Observação sobre ZIP:** um ZIP da raiz do repositório pode não funcionar diretamente se `package.json` ficar dentro de `backend/`. Para implantação por ZIP, empacotar **o conteúdo de `backend/`**, deixando `package.json` na raiz do ZIP, e configurar o processo de build conforme o método de publicação escolhido.

### 3. Variáveis de ambiente do App Service

No portal Azure, abrir as configurações de **variáveis de ambiente** do Web App e definir:

| Variável | Valor esperado |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL apontando para o servidor, banco e usuário corretos. |
| `DATABASE_SSL` | `true` (ou omitir, pois o código ativa SSL por padrão). |
| `GESTOR_TOKEN` | Token longo, aleatório e secreto, usado nas rotas de gestor. |
| `NODE_ENV` | `production` (recomendado). |
| `PORT` | Normalmente não é necessário definir manualmente; usar a porta do ambiente. |

Formato ilustrativo da conexão (substituir os valores e codificar caracteres especiais da senha na URL):

```text
postgres://USUARIO:SENHA@SERVIDOR.postgres.database.azure.com:5432/NOME_DO_BANCO?sslmode=require
```

**Não copiar credenciais reais para este README.** O aplicativo usa a configuração SSL do `pg` em `backend/src/db.js`. Testar a conexão TLS no ambiente final; não desativar validações de certificado como solução padrão.

Após alterar variáveis de ambiente, salvar as configurações e reiniciar o Web App, se necessário.

### 4. Verificar publicação

Substituir `SEU-APP` pelo nome real do Web App:

```text
https://SEU-APP.azurewebsites.net/health
https://SEU-APP.azurewebsites.net/
https://SEU-APP.azurewebsites.net/painel.html
https://SEU-APP.azurewebsites.net/gestor.html
```

Checklist do responsável pelo deploy:

- [ ] `/health` responde HTTP 200, `status: "ok"` e `banco: "conectado"`.
- [ ] Página principal carrega os quatro serviços a partir da API.
- [ ] Uma avaliação pública válida é salva e aparece no mural quando possui comentário.
- [ ] Uma avaliação privada é salva, não aparece no mural e fica acessível ao gestor.
- [ ] O painel mostra quantidade e distribuição corretas; só mostra média a partir de 3 avaliações.
- [ ] O gestor consegue ocultar comentário público com token válido.
- [ ] Um usuário sem token não consegue consultar avaliações privadas nem moderar.
- [ ] Reiniciar o App Service não remove avaliações salvas.
- [ ] Nenhuma senha ou token aparece no repositório ou nos registros públicos.
- [ ] URL pública final foi adicionada ao README e testada em navegador externo.

### 5. Se o banco não conectar

Verificar, nesta ordem:

1. `DATABASE_URL` está correta e contém banco, host e credenciais válidos?
2. O PostgreSQL está ativo e o banco foi criado?
3. As regras de rede/firewall permitem acesso **do App Service**?
4. SSL/TLS está habilitado e funcionando?
5. `schema.sql` e `dados-iniciais.sql` foram executados no banco correto?
6. Os logs do App Service mostram erro de conexão, timeout ou autenticação?

A rota `/health` é a primeira verificação. Uma página HTML carregar **não significa** que a conexão com o banco está funcionando.

## 🔌 API

| Método | Endpoint | Função | Acesso |
|---|---|---|---|
| `GET` | `/health` | Verifica conexão com PostgreSQL | Público |
| `GET` | `/api/servicos` | Lista serviços | Público |
| `GET` | `/api/servicos/:id/avaliacoes` | Lista avaliações com comentários públicos e não ocultos | Público |
| `POST` | `/api/avaliacoes` | Registra avaliação pública ou privada | Público |
| `GET` | `/api/painel` | Indicadores de todos os serviços | Público |
| `GET` | `/api/painel/:servicoId` | Indicadores de um serviço | Público |
| `GET` | `/api/avaliacoes` | Lista avaliações, inclusive privadas e ocultas | Gestor |
| `PATCH` | `/api/avaliacoes/:id/ocultar` | Oculta comentário público sem remover nota | Gestor |

Exemplo de avaliação pública:

```json
{
  "servico_id": 1,
  "nota": 5,
  "comentario": "Atendimento rápido e cordial.",
  "privada": false
}
```

Para avaliação privada, utilizar `"privada": true`. O campo `comentario` é opcional. As rotas protegidas exigem o cabeçalho HTTP `x-gestor-token` com o valor de `GESTOR_TOKEN` configurado no servidor. **Nunca incorporar esse token ao JavaScript público.**

Respostas de erro incluem, conforme o caso, HTTP `400` (entrada inválida), `401` (token ausente/incorreto), `404` (recurso inexistente), `409` (moderação incompatível) e `503` (`/health` quando o banco está indisponível). Falhas inesperadas nas demais rotas atualmente passam pelo tratamento geral HTTP `500`.

## 🧪 Plano de testes e evidências

Os testes abaixo **precisam ser executados e registrados** com PostgreSQL acessível. Não estão marcados como aprovados antecipadamente.

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| T01 | Criar avaliação pública válida com nota 5 | HTTP 201; avaliação persistida e comentário visível no mural | Pendente |
| T02 | Criar avaliação privada válida | HTTP 201; visível ao gestor, ausente do mural | Pendente |
| T03 | Enviar nota 6 ou 0 | HTTP 400; nada inserido | Pendente |
| T04 | Enviar comentário com mais de 280 caracteres | HTTP 400; nada inserido | Pendente |
| T05 | Consultar `/api/avaliacoes` sem token | HTTP 401 | Pendente |
| T06 | Serviço com apenas 2 avaliações | `amostra_insuficiente: true`, `media: null` | Pendente |
| T07 | Serviço com 3 ou mais avaliações | Média com 1 casa decimal e distribuição correta | Pendente |
| T08 | Ocultar comentário público com token válido | Comentário some do mural; nota permanece nos indicadores | Pendente |
| T09 | Reiniciar aplicação após criar avaliação | Registro continua no PostgreSQL | Pendente |
| T10 | Consultar `/health` com banco conectado | HTTP 200 e `banco: "conectado"` | Pendente |

Apoio para testes manuais: `backend/requisicoes.http` e `banco/validacao.sql`. Os dados usados devem ser fictícios.

Criar a pasta `evidencias/` na raiz do repositório e guardar capturas datadas, sem credenciais, mostrando:

- Requisições positivas e negativas com seus códigos HTTP.
- Painel antes/depois da terceira avaliação.
- Moderação de comentário e preservação da nota.
- Registro persistente após reinício.
- Aplicação e `/health` na URL pública da Azure.

## 🎬 Apresentação e entrega

**Pitch (aproximadamente 90 segundos):** apresentar o problema da caixa de sugestões, a solução digital, as quatro áreas avaliadas, o painel com regra de amostra mínima, a moderação, o armazenamento PostgreSQL e a demonstração da aplicação publicada.

Antes da entrega final:

- [ ] Atualizar a URL pública e o nível de implantação na ficha rápida.
- [ ] Adicionar link do vídeo do pitch.
- [ ] Adicionar link do GitHub Projects, caso utilizado pela equipe.
- [ ] Preencher a pasta `evidencias/` com testes datados.
- [ ] Atualizar os status dos testes com base nos resultados reais.
- [ ] Confirmar que `backend/.env` e quaisquer segredos não foram enviados ao Git.
- [ ] Conferir a persistência após reiniciar o App Service.

## 👥 Organização do trabalho

A integração frontend/backend e a preparação do código para publicação são separadas da execução do deploy na Azure. O responsável pelo deploy deverá configurar os recursos de nuvem, executar os scripts SQL, validar a URL pública e registrar evidências do ambiente publicado.

---

**Projeto acadêmico — Senac Cloud Computing 2026.2 · Grupo 02 · Desafio 13.**
