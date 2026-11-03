<div align="center">

# ⭐ Avalie o Atendimento

**Avaliações anônimas e painel de satisfação por serviço, com médias em que dá pra confiar.**

![Senac](https://img.shields.io/badge/Senac-Cloud%20Computing%202026.2-004A8F?style=for-the-badge)
![Grupo](https://img.shields.io/badge/Grupo-02-F7941D?style=for-the-badge)
![Desafio](https://img.shields.io/badge/Desafio-13-0078D4?style=for-the-badge)

![Azure](https://img.shields.io/badge/Azure-App%20Service-0078D4?logo=microsoftazure&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-banco%20relacional-4169E1?logo=postgresql&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-339933?logo=nodedotjs&logoColor=white)

[🌐 Aplicação publicada 🚧](#) · [🎬 Vídeo do pitch 🚧](#) · [📋 GitHub Projects 🚧](#) · [📎 Evidências](./evidencias)

</div>

---

## 📇 Ficha rápida

| | |
|---|---|
| **Disciplina** | Cloud Computing · Senac · 2026.2 |
| **Professor** | Roni Maciel |
| **Atividade** | Atividade Avaliativa: Cloud Challenge — *do problema ao produto na nuvem* |
| **Grupo / Desafio** | Grupo 02 · Desafio 13 — Avalie o Atendimento |
| **Complexidade** | Intermediária |
| **Nível de implantação** | 🚧 (A. Nuvem completa · B. Implantação parcial · C. Local) |
| **URL pública (Nível A)** | 🚧 |

---

## 📌 Sobre o projeto

A unidade quer medir a satisfação com a **secretaria, a biblioteca, a cantina e os laboratórios**, mas hoje isso se resume a uma caixa de sugestões de papel que ninguém tabula. O **Avalie o Atendimento** permite que estudantes avaliem cada serviço de forma **anônima** e entrega aos gestores um **painel por serviço** com média, quantidade de avaliações e distribuição das notas.

| 👤 Usuário | O que faz |
|---|---|
| **Estudante** | Avalia um serviço com nota de 1 a 5 e, se quiser, deixa um comentário, sem se identificar. |
| **Gestor** | Consulta o painel por serviço e oculta comentários impróprios. |

> ⭐ **Regra central:** serviço com **menos de 3 avaliações** mostra *"amostra insuficiente"* em vez da média. Comentário oculto some da lista pública, **mas a nota continua contando na média**.

---

## ✅ Requisitos

Legenda: ⬜ pendente · 🔄 em andamento · ✅ concluído

### Requisitos da ficha

| # | Requisito | Status |
|---|---|:---:|
| RF1 | Serviços avaliados (secretaria, biblioteca, cantina e laboratórios) carregados por **script de dados iniciais** | ⬜ |
| RF2 | Registrar avaliação anônima: serviço, **nota inteira de 1 a 5** e comentário opcional (até **280** caracteres) | ⬜ |
| RF3 | Painel por serviço: **média (1 casa decimal)**, quantidade de avaliações e distribuição das notas de 1 a 5 ⭐ | ⬜ |
| RF4 | Serviços com **menos de 3 avaliações** mostram *"amostra insuficiente"* em vez da média ⭐ | ⬜ |
| RF5 | Moderação: o gestor **oculta** um comentário impróprio, e a nota continua contando na média | ⬜ |

### Requisitos gerais da atividade

| Requisito | Como atendemos | Status |
|---|---|:---:|
| Cadastro, consulta e mudança de estado | `POST` avaliação · painel/listagens · ocultar comentário | ⬜ |
| Dados persistidos em banco de dados | PostgreSQL (nada em memória ou em arquivo) | ⬜ |
| `GET /health` testando a conexão com o banco | Rota de saúde com `iniciado_em` | ⬜ |
| Validação no servidor + erros claros (`400`, `404`, `409`, `503`) | Sem expor detalhes internos | ⬜ |
| `DATABASE_URL` fora do código, `.env` fora do Git | Variável de ambiente + `.gitignore` | ⬜ |
| Consultas parametrizadas | Nenhuma concatenação de texto do usuário no SQL | ⬜ |
| Somente dados fictícios | Script de dados iniciais com dados inventados | ⬜ |

---

## 🏗️ Arquitetura

```mermaid
flowchart LR
    U["👤 Estudante / Gestor<br/>(navegador)"] -- "HTTPS" --> A["☁️ Azure App Service<br/>API + interface"]
    A -- "DATABASE_URL · TLS<br/>consultas parametrizadas" --> D[("🐘 PostgreSQL<br/>banco gerenciado")]
    A -. "GET /health" .-> D
