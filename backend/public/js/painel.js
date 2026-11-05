
const painelContainer = document.getElementById('painel-container');
const alertPainel = document.getElementById('alert-painel');
const btnAtualizar = document.getElementById('btn-atualizar');

function criarElemento(tag, texto, classe = '') {
  const elemento = document.createElement(tag);
  elemento.textContent = String(texto);

  if (classe) {
    elemento.className = classe;
  }

  return elemento;
}

function mostrarAlerta(mensagem, tipo) {
  alertPainel.textContent = mensagem;
  alertPainel.className = `alert ${tipo}`;
}

function criarBarraDistribuicao(nota, quantidade, total) {
  const percentual = total > 0
    ? Math.round((quantidade / total) * 100)
    : 0;

  const linha = document.createElement('div');
  linha.className = 'dist-row';

  const label = criarElemento('span', `Nota ${nota}`);
  label.style.width = '48px';

  const fundo = document.createElement('div');
  fundo.className = 'dist-bar-bg';

  const barra = document.createElement('div');
  barra.className = 'dist-bar-fill';
  barra.style.width = `${percentual}%`;

  fundo.appendChild(barra);

  const valor = criarElemento('span', quantidade);
  valor.style.width = '28px';
  valor.style.textAlign = 'right';

  linha.append(label, fundo, valor);

  return linha;
}

function criarCartao(servico) {
  const total = Number(servico.quantidade) || 0;

  const cartao = document.createElement('div');
  cartao.className = 'card';
  cartao.style.marginBottom = '0';

  const titulo = criarElemento('h2', servico.nome);

  const metricas = document.createElement('div');
  metricas.className = 'metric-box';

  const mediaContainer = document.createElement('div');

  if (
    servico.amostra_insuficiente ||
    total < 3 ||
    servico.media === null
  ) {
    const aviso = criarElemento(
      'span',
      'Amostra insuficiente',
      'badge-insuficiente'
    );

    mediaContainer.appendChild(aviso);
  } else {
    const media = Number(servico.media)
      .toFixed(1)
      .replace('.', ',');

    const valorMedia = criarElemento(
      'span',
      `${media} ★`,
      'media-valor'
    );

    mediaContainer.appendChild(valorMedia);
  }

  const quantidade = criarElemento(
    'div',
    `${total} avaliações`,
  );

  quantidade.style.fontSize = '0.9rem';
  quantidade.style.color = 'var(--text-muted)';

  metricas.append(mediaContainer, quantidade);

  const distribuicaoContainer = document.createElement('div');

  const subtitulo = criarElemento(
    'strong',
    'Distribuição das notas (1 a 5)'
  );

  subtitulo.style.fontSize = '0.85rem';
  subtitulo.style.display = 'block';
  subtitulo.style.marginBottom = '0.5rem';

  distribuicaoContainer.appendChild(subtitulo);

  for (let nota = 5; nota >= 1; nota--) {
    const quantidadeNota = Number(
      servico.distribuicao?.[nota] || 0
    );

    distribuicaoContainer.appendChild(
      criarBarraDistribuicao(nota, quantidadeNota, total)
    );
  }

  cartao.append(
    titulo,
    metricas,
    distribuicaoContainer
  );

  return cartao;
}

function renderizarPainel(servicos) {
  painelContainer.replaceChildren();

  if (!Array.isArray(servicos) || servicos.length === 0) {
    painelContainer.textContent =
      'Nenhum serviço encontrado no banco de dados.';
    return;
  }

  for (const servico of servicos) {
    painelContainer.appendChild(
      criarCartao(servico)
    );
  }
}

async function carregarPainel(exibirAviso = false) {
  btnAtualizar.disabled = true;
  painelContainer.textContent = 'Carregando painel...';

  try {
    const resposta = await fetch('/api/painel');
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      throw new Error(
        dados?.erro || `Erro HTTP ${resposta.status}.`
      );
    }

    if (!Array.isArray(dados)) {
      throw new Error('Resposta inválida do servidor.');
    }

    renderizarPainel(dados);

    if (exibirAviso) {
      const horario = new Date().toLocaleTimeString('pt-BR');

      mostrarAlerta(
        `Painel atualizado às ${horario}.`,
        'success'
      );
    } else {
      alertPainel.textContent = '';
      alertPainel.className = 'alert';
    }
  } catch (erro) {
    painelContainer.textContent =
      'Não foi possível carregar os indicadores.';

    mostrarAlerta(
      `Erro ao consultar o painel: ${erro.message}`,
      'error'
    );
  } finally {
    btnAtualizar.disabled = false;
  }
}

btnAtualizar.addEventListener('click', () => {
  carregarPainel(true);
});

carregarPainel();
