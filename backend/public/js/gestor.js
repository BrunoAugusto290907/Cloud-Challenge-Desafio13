
const filtroGestor = document.getElementById('filtro-gestor');
const listaModeracao = document.getElementById('lista-moderacao');
const alertGestor = document.getElementById('alert-gestor');

let tokenGestor = '';

function mostrarAlerta(mensagem, tipo) {
  alertGestor.textContent = mensagem;
  alertGestor.className = `alert ${tipo}`;
}

async function requisicaoGestor(url, opcoes = {}) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      ...opcoes.headers,
      'x-gestor-token': tokenGestor
    }
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || `Erro HTTP ${resposta.status}.`);
  }

  return dados;
}

function criarElemento(tag, texto, classe = '') {
  const elemento = document.createElement(tag);
  elemento.textContent = texto;

  if (classe) {
    elemento.className = classe;
  }

  return elemento;
}

function criarBotao(texto, cor, acao) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = texto;
  botao.style.backgroundColor = cor;
  botao.style.padding = '0.4rem 0.8rem';
  botao.style.fontSize = '0.85rem';
  botao.addEventListener('click', acao);
  return botao;
}

function renderizarAvaliacoes(avaliacoes) {
  listaModeracao.replaceChildren();

  if (avaliacoes.length === 0) {
    listaModeracao.textContent = 'Nenhuma avaliação encontrada.';
    return;
  }

  for (const avaliacao of avaliacoes) {
    const item = document.createElement('div');
    item.className = 'comment-item';

    const conteudo = document.createElement('div');

    const meta = document.createElement('div');
    meta.className = 'comment-meta';

    const titulo = criarElemento(
      'strong',
      `#${avaliacao.id} - ${avaliacao.servico_nome}`
    );

    const nota = criarElemento(
      'span',
      `Nota ${avaliacao.nota} ★`,
      'badge-nota'
    );

    let statusTexto;

    if (avaliacao.privada) {
      statusTexto = 'Privada (Somente gestor)';
    } else if (avaliacao.oculta) {
      statusTexto = 'Pública (Ocultada pelo gestor)';
    } else {
      statusTexto = 'Pública (Visível no mural)';
    }

    const status = criarElemento('span', statusTexto);
    status.style.marginLeft = '0.5rem';
    status.style.fontWeight = '600';

    meta.append(titulo, ' • ', nota, ' ', status);

    const comentario = criarElemento(
      'div',
      avaliacao.comentario || 'Sem comentário escrito'
    );

    conteudo.append(meta, comentario);
    item.appendChild(conteudo);

    if (!avaliacao.privada && !avaliacao.oculta && avaliacao.comentario) {
      const botaoOcultar = criarBotao(
        'Ocultar comentário',
        '#d97706',
        () => ocultarComentario(avaliacao.id)
      );

      item.appendChild(botaoOcultar);
    }

    listaModeracao.appendChild(item);
  }
}

async function carregarAvaliacoesGestor() {
  listaModeracao.textContent = 'Carregando avaliações...';

  try {
    const servicoId = filtroGestor.value;
    const query = servicoId
      ? `?servico_id=${encodeURIComponent(servicoId)}`
      : '';

    const avaliacoes = await requisicaoGestor(
      `/api/avaliacoes${query}`
    );

    renderizarAvaliacoes(avaliacoes);
  } catch (erro) {
    listaModeracao.textContent =
      'Não foi possível carregar as avaliações.';
    mostrarAlerta(erro.message, 'error');
  }
}

async function ocultarComentario(id) {
  try {
    await requisicaoGestor(`/api/avaliacoes/${id}/ocultar`, {
      method: 'PATCH'
    });

    mostrarAlerta(
      `Comentário #${id} ocultado com sucesso!`,
      'success'
    );

    await carregarAvaliacoesGestor();
  } catch (erro) {
    mostrarAlerta(erro.message, 'error');
  }
}

function criarAcessoGestor() {
  const formulario = document.createElement('form');
  formulario.className = 'form-group';

  const label = document.createElement('label');
  label.textContent = 'Token de acesso do gestor';
  label.htmlFor = 'token-gestor';

  const input = document.createElement('input');
  input.id = 'token-gestor';
  input.type = 'password';
  input.autocomplete = 'off';
  input.required = true;
  input.placeholder = 'Digite o token do gestor';

  const botao = document.createElement('button');
  botao.type = 'submit';
  botao.textContent = 'Acessar avaliações';

  formulario.append(label, input, botao);

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();

    tokenGestor = input.value;

    if (!tokenGestor.trim()) {
      mostrarAlerta('Informe o token do gestor.', 'error');
      return;
    }

    await carregarAvaliacoesGestor();
  });

  listaModeracao.replaceChildren(formulario);
}

filtroGestor.addEventListener('change', () => {
  if (tokenGestor) {
    carregarAvaliacoesGestor();
  }
});

criarAcessoGestor();
