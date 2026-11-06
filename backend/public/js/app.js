
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
const estrelas = [...document.querySelectorAll('.estrela')];
const textoNota = document.getElementById('texto-nota');

let servicos = [];

const descricoesNota = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente!'
};

function mostrarAlerta(mensagem, tipo) {
  alertBox.textContent = mensagem;
  alertBox.className = `alert ${tipo}`;
}

async function requisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(dados.erro || `Erro HTTP ${resposta.status}.`);
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

function atualizarEstrelas(previsualizacao = null) {
  const notaSelecionada = Number(inputNota.value) || 0;
  const notaExibida = previsualizacao ?? notaSelecionada;

  estrelas.forEach(estrela => {
    const valor = Number(estrela.dataset.nota);

    estrela.classList.toggle(
      'ativa',
      valor <= notaSelecionada && previsualizacao === null
    );

    estrela.classList.toggle(
      'preview',
      previsualizacao !== null && valor <= previsualizacao
    );

    estrela.setAttribute(
      'aria-pressed',
      String(valor === notaSelecionada)
    );
  });

  if (notaExibida > 0) {
    textoNota.textContent =
      `${notaExibida} de 5 estrelas — ${descricoesNota[notaExibida]}`;
  } else {
    textoNota.textContent = 'Toque nas estrelas para escolher sua nota';
  }
}

estrelas.forEach(estrela => {
  estrela.addEventListener('click', () => {
    inputNota.value = estrela.dataset.nota;
    atualizarEstrelas();
  });

  estrela.addEventListener('mouseenter', () => {
    atualizarEstrelas(Number(estrela.dataset.nota));
  });

  estrela.addEventListener('focus', () => {
    atualizarEstrelas(Number(estrela.dataset.nota));
  });

  estrela.addEventListener('blur', () => {
    atualizarEstrelas();
  });
});

const seletorEstrelas = document.querySelector('.rating-selector');

if (seletorEstrelas) {
  seletorEstrelas.addEventListener('mouseleave', () => {
    atualizarEstrelas();
  });
}

function atualizarVisibilidade() {
  const privada = selectVisibilidade.value === 'privada';

  btnEnviar.textContent = privada
    ? 'Enviar avaliação privada →'
    : 'Enviar avaliação pública →';

  inputComentario.placeholder = privada
    ? 'Escreva seu comentário privado, visível somente para o gestor...'
    : 'O que você gostou? O que poderia melhorar?';
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
    listaPublica.appendChild(
      criarElemento(
        'p',
        'Ainda não há avaliações públicas para este serviço.',
        'empty-state'
      )
    );
    return;
  }

  for (const avaliacao of avaliacoes) {
    const servico = servicos.find(
      s => Number(s.id) === Number(avaliacao.servico_id)
    );

    const item = document.createElement('article');
    item.className = 'comment-item';

    const conteudo = document.createElement('div');

    const meta = document.createElement('div');
    meta.className = 'comment-meta';

    const nome = criarElemento(
      'strong',
      servico ? servico.nome : 'Serviço'
    );

    const notaNumerica = Number(avaliacao.nota);
    const notaValida = Number.isInteger(notaNumerica)
      && notaNumerica >= 1
      && notaNumerica <= 5;

    const estrelasNota = notaValida
      ? '★'.repeat(notaNumerica) + '☆'.repeat(5 - notaNumerica)
      : '★';

    const nota = criarElemento(
      'span',
      `${estrelasNota} ${avaliacao.nota}/5`,
      'badge-nota'
    );

    meta.append(nome, nota);

    const comentario = criarElemento(
      'p',
      avaliacao.comentario || 'Avaliação enviada sem comentário.',
      'comment-text'
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

  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    return 'Selecione uma nota de 1 a 5 estrelas.';
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
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const payload = {
    servico_id: servicoId,
    nota,
    comentario,
    privada
  };

  btnEnviar.disabled = true;
  btnEnviar.textContent = 'Enviando avaliação...';

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

    atualizarEstrelas();
    atualizarContador();

    if (!privada) {
      try {
        await carregarAvaliacoesPublicas();
      } catch (erroAtualizacao) {
        console.warn('Erro ao atualizar mural:', erroAtualizacao);
      }
    }

    mostrarAlerta(
      privada
        ? 'Avaliação privada enviada com sucesso! Apenas o gestor poderá visualizar seu comentário.'
        : 'Avaliação pública enviada com sucesso! Obrigado por compartilhar sua experiência.',
      'success'
    );

    alertBox.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  } catch (erro) {
    mostrarAlerta(
      `Não foi possível enviar a avaliação: ${erro.message}`,
      'error'
    );
  } finally {
    btnEnviar.disabled = false;
    atualizarVisibilidade();
  }
}

selectVisibilidade.addEventListener('change', atualizarVisibilidade);
inputComentario.addEventListener('input', atualizarContador);
filtroServico.addEventListener('change', carregarAvaliacoesPublicas);
formAvaliacao.addEventListener('submit', enviarAvaliacao);

atualizarVisibilidade();
atualizarContador();
atualizarEstrelas();
carregarServicos();
