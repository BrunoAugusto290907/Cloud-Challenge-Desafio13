
const selectVisibilidade = document.getElementById('visibilidade');
const selectServico = document.getElementById('servico_id');
const filtroServico = document.getElementById('filtro-servico');
const formAvaliacao = document.getElementById('form-avaliacao');
const inputNota = document.getElementById('nota');
const inputComentario = document.getElementById('comentario');
const charCount = document.getElementById('char-count');
const alertBox = document.getElementById('alert-box');
const listaPublica = document.getElementById('lista-publica');
const btnEnviar = document.getElementById('btn-enviar');

let servicos = [];

function mostrarAlerta(mensagem, tipo) {
  alertBox.textContent = mensagem;
  alertBox.className = `alert ${tipo}`;
}

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      dados.erro || `Erro HTTP ${resposta.status}.`
    );
  }

  return dados;
}

function criarElemento(tag, texto, classe = '') {
  const elemento = document.createElement(tag);
  elemento.textContent = String(texto);

  if (classe) {
    elemento.className = classe;
  }

  return elemento;
}

function atualizarVisibilidade() {
  const privada = selectVisibilidade.value === 'privada';

  btnEnviar.textContent = privada
    ? 'Enviar Avaliação Privada (Apenas Gestor)'
    : 'Enviar Avaliação Pública';

  inputComentario.placeholder = privada
    ? 'Escreva seu comentário privado (visível somente para o gestor)...'
    : 'Escreva seu elogio, crítica ou sugestão para o mural público...';
}

function atualizarContador() {
  const quantidade = [...inputComentario.value].length;

  charCount.textContent = `${quantidade} / 280 caracteres`;

  charCount.classList.toggle(
    'limit-exceeded',
    quantidade > 280
  );
}

function preencherSelect(select, incluirTodos = false) {
  select.replaceChildren();

  const primeiraOpcao = document.createElement('option');
  primeiraOpcao.value = '';
  primeiraOpcao.textContent = incluirTodos
    ? 'Todos os serviços'
    : 'Selecione um serviço...';

  select.appendChild(primeiraOpcao);

  for (const servico of servicos) {
    const opcao = document.createElement('option');
    opcao.value = String(servico.id);
    opcao.textContent = servico.nome;
    select.appendChild(opcao);
  }
}

async function carregarServicos() {
  try {
    servicos = await requisicao('/api/servicos');

    preencherSelect(selectServico);
    preencherSelect(filtroServico, true);

    await carregarAvaliacoesPublicas();
  } catch (erro) {
    listaPublica.textContent =
      'Não foi possível carregar os serviços e as avaliações.';

    mostrarAlerta(
      `Não foi possível conectar ao servidor: ${erro.message}`,
      'error'
    );
  }
}

function renderizarAvaliacoesPublicas(avaliacoes) {
  listaPublica.replaceChildren();

  if (avaliacoes.length === 0) {
    listaPublica.textContent =
      'Nenhuma avaliação pública encontrada para este serviço.';
    return;
  }

  for (const avaliacao of avaliacoes) {
    const servico = servicos.find(
      s => Number(s.id) === Number(avaliacao.servico_id)
    );

    const item = document.createElement('div');
    item.className = 'comment-item';

    const conteudo = document.createElement('div');

    const meta = document.createElement('div');
    meta.className = 'comment-meta';

    const nome = criarElemento(
      'strong',
      servico ? servico.nome : 'Serviço'
    );

    const nota = criarElemento(
      'span',
      `Nota ${avaliacao.nota} ★`,
      'badge-nota'
    );

    meta.append(nome, ' • ', nota);

    const comentario = criarElemento(
      'div',
      avaliacao.comentario || 'Sem comentário escrito'
    );

    conteudo.append(meta, comentario);
    item.appendChild(conteudo);

    listaPublica.appendChild(item);
  }
}

async function carregarAvaliacoesPublicas() {
  listaPublica.textContent = 'Carregando avaliações públicas...';

  try {
    const servicosSelecionados = filtroServico.value
      ? servicos.filter(
          s => String(s.id) === filtroServico.value
        )
      : servicos;

    const resultados = await Promise.all(
      servicosSelecionados.map(async servico => {
        const dados = await requisicao(
          `/api/servicos/${servico.id}/avaliacoes`
        );

        return dados.avaliacoes || [];
      })
    );

    const avaliacoes = resultados
      .flat()
      .sort((a, b) => {
        const dataA = new Date(a.criada_em).getTime();
        const dataB = new Date(b.criada_em).getTime();

        return dataB - dataA || Number(b.id) - Number(a.id);
      });

    renderizarAvaliacoesPublicas(avaliacoes);
  } catch (erro) {
    listaPublica.textContent =
      'Não foi possível carregar as avaliações públicas.';

    mostrarAlerta(
      `Erro ao carregar avaliações: ${erro.message}`,
      'error'
    );
  }
}

function validarFormulario(servicoId, nota, comentario) {
  const servicoExiste = servicos.some(
    servico => Number(servico.id) === servicoId
  );

  if (!servicoExiste) {
    return 'Selecione um serviço válido.';
  }

  if (
    !Number.isInteger(nota) ||
    nota < 1 ||
    nota > 5
  ) {
    return 'A nota deve ser um número inteiro de 1 a 5.';
  }

  if ([...comentario].length > 280) {
    return 'O comentário deve ter no máximo 280 caracteres.';
  }

  return null;
}

async function enviarAvaliacao(evento) {
  evento.preventDefault();

  const servicoId = Number(selectServico.value);
  const notaTexto = inputNota.value.trim();
  const nota = notaTexto === '' ? NaN : Number(notaTexto);
  const comentario = inputComentario.value;
  const privada = selectVisibilidade.value === 'privada';

  const erroValidacao = validarFormulario(
    servicoId,
    nota,
    comentario
  );

  if (erroValidacao) {
    mostrarAlerta(erroValidacao, 'error');
    return;
  }

  const payload = {
    servico_id: servicoId,
    nota,
    comentario,
    privada
  };

  btnEnviar.disabled = true;

  try {
    await requisicao('/api/avaliacoes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    inputNota.value = '';
    inputComentario.value = '';
    atualizarContador();

    mostrarAlerta(
      privada
        ? 'Avaliação privada salva com sucesso! Apenas o gestor poderá visualizar seu comentário.'
        : 'Avaliação pública salva com sucesso!',
      'success'
    );

    // Atualiza o mural sem alterar a mensagem de sucesso.
    if (!privada) {
      await carregarAvaliacoesPublicas();
    }
  } catch (erro) {
    mostrarAlerta(
      `Não foi possível concluir a operação: ${erro.message}`,
      'error'
    );
  } finally {
    btnEnviar.disabled = false;
  }
}

selectVisibilidade.addEventListener(
  'change',
  atualizarVisibilidade
);

inputComentario.addEventListener(
  'input',
  atualizarContador
);

filtroServico.addEventListener(
  'change',
  carregarAvaliacoesPublicas
);

formAvaliacao.addEventListener(
  'submit',
  enviarAvaliacao
);

atualizarVisibilidade();
atualizarContador();
carregarServicos();
