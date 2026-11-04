const STORAGE_KEY = 'desafio13_avaliacoes_dados';

const SERVICOS_PADRAO = {
  1: 'Secretaria',
  2: 'Biblioteca',
  3: 'Cantina',
  4: 'Laboratórios'
};

const DADOS_INICIAIS = [
  { id: 1, servico_id: 1, servico_nome: 'Secretaria', nota: 5, comentario: 'Atendimento rápido na emissão do histórico escolar.', oculta: false },
  { id: 2, servico_id: 1, servico_nome: 'Secretaria', nota: 4, comentario: 'Resolveram minha matrícula, apenas uma pequena fila.', oculta: false },
  { id: 3, servico_id: 1, servico_nome: 'Secretaria', nota: 4, comentario: 'Bons esclarecimentos sobre os prazos acadêmicos.', oculta: false },
  { id: 4, servico_id: 2, servico_nome: 'Biblioteca', nota: 5, comentario: 'Ambiente silencioso e acervo muito bem organizado.', oculta: false },
  { id: 5, servico_id: 2, servico_nome: 'Biblioteca', nota: 5, comentario: 'Renovação de livros super prática no balcão.', oculta: false },
  { id: 6, servico_id: 2, servico_nome: 'Biblioteca', nota: 4, comentario: 'Ótimo espaço de estudo em grupo.', oculta: false },
  { id: 7, servico_id: 3, servico_nome: 'Cantina', nota: 4, comentario: 'Lanches bons e atendimento cordial.', oculta: false },
  { id: 8, servico_id: 3, servico_nome: 'Cantina', nota: 3, comentario: 'Fila grande no horário do intervalo das 20h.', oculta: false },
  { id: 9, servico_id: 3, servico_nome: 'Cantina', nota: 4, comentario: 'Boas opções de salgados e sucos.', oculta: false },
  { id: 10, servico_id: 4, servico_nome: 'Laboratórios', nota: 5, comentario: 'Computadores rápidos e com VS Code configurado.', oculta: false },
  { id: 11, servico_id: 4, servico_nome: 'Laboratórios', nota: 4, comentario: 'Rede estável durante toda a aula prática.', oculta: false }
];

const selectServico = document.getElementById('servico_id');
const filtroServico = document.getElementById('filtro-servico');
const formAvaliacao = document.getElementById('form-avaliacao');
const inputNota = document.getElementById('nota');
const inputComentario = document.getElementById('comentario');
const charCount = document.getElementById('char-count');
const alertBox = document.getElementById('alert-box');
const listaPublica = document.getElementById('lista-publica');

let mapaServicos = { ...SERVICOS_PADRAO };

function obterDadosLocais() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (!salvo) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DADOS_INICIAIS));
    return [...DADOS_INICIAIS];
  }
  return JSON.parse(salvo);
}

function salvarDadosLocais(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

async function requisitarApi(caminho, opcoes = {}) {
  for (const prefixo of ['/api', '']) {
    try {
      const res = await fetch(`${prefixo}${caminho}`, opcoes);
      if (res.status !== 404) return res;
    } catch (e) {
      // Tenta o próximo ou cai no modo local
    }
  }
  throw new Error('API offline');
}

function mostrarAlerta(mensagem, tipo) {
  alertBox.textContent = mensagem;
  alertBox.className = `alert ${tipo}`;
}

inputComentario.addEventListener('input', () => {
  const len = inputComentario.value.length;
  charCount.textContent = `${len} / 280 caracteres`;
  charCount.classList.toggle('limit-exceeded', len > 280);
});

async function carregarServicos() {
  try {
    const res = await requisitarApi('/servicos');
    if (!res.ok) return;
    const dados = await res.json();
    const servicos = Array.isArray(dados) ? dados : (dados.servicos || []);

    if (servicos.length > 0) {
      selectServico.innerHTML = '<option value="">Selecione um serviço...</option>';
      filtroServico.innerHTML = '<option value="">Todos os serviços</option>';
      servicos.forEach((s) => {
        mapaServicos[s.id] = s.nome;
        selectServico.innerHTML += `<option value="${s.id}">${s.nome}</option>`;
        filtroServico.innerHTML += `<option value="${s.id}">${s.nome}</option>`;
      });
    }
  } catch (err) {
    // Mantém os 4 serviços padrão já presentes no HTML
  }
}

function renderizarAvaliacoesPublicas(avaliacoes) {
  const servicoFiltro = Number(filtroServico.value);
  const visiveis = avaliacoes
    .filter((a) => !a.oculta)
    .filter((a) => !servicoFiltro || Number(a.servico_id) === servicoFiltro);

  if (visiveis.length === 0) {
    listaPublica.innerHTML = '<p style="color: var(--text-muted);">Nenhuma avaliação pública para exibir neste filtro.</p>';
    return;
  }

  listaPublica.innerHTML = visiveis.map((a) => {
    const nomeServico = a.servico_nome || mapaServicos[a.servico_id] || `Serviço #${a.servico_id}`;
    const comentarioTexto = a.comentario && a.comentario.trim() !== ''
      ? a.comentario
      : '<em>Avaliação registrada sem comentário escrito.</em>';

    return `
      <div class="comment-item">
        <div>
          <div class="comment-meta">
            <strong>${nomeServico}</strong> • <span class="badge-nota">Nota ${a.nota} ★</span>
          </div>
          <div>${comentarioTexto}</div>
        </div>
      </div>
    `;
  }).join('');
}

async function carregarAvaliacoesPublicas() {
  try {
    const servicoId = filtroServico.value;
    const query = servicoId ? `?servico_id=${servicoId}` : '';
    const res = await requisitarApi(`/avaliacoes${query}`);
    if (!res.ok) throw new Error('Falha ao buscar');
    const dados = await res.json();
    const avaliacoes = Array.isArray(dados) ? dados : (dados.avaliacoes || []);
    renderizarAvaliacoesPublicas(avaliacoes);
  } catch (err) {
    const locais = obterDadosLocais();
    renderizarAvaliacoesPublicas(locais);
  }
}

function validarEntrada(servicoId, notaRaw, comentario) {
  if (!servicoId || !mapaServicos[servicoId]) {
    return 'Selecione um serviço existente da unidade.';
  }
  const nota = Number(notaRaw);
  if (notaRaw === '' || Number.isNaN(nota) || !Number.isInteger(nota) || nota < 1 || nota > 5) {
    return 'A nota deve ser um número inteiro entre 1 e 5 (CA1).';
  }
  if (comentario && comentario.length > 280) {
    return `O comentário possui ${comentario.length} caracteres. O limite máximo é de 280 caracteres (CA2).`;
  }
  return null;
}

formAvaliacao.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertBox.className = 'alert';

  const servicoId = Number(selectServico.value);
  const notaRaw = inputNota.value.trim();
  const comentario = inputComentario.value;

  const payload = {
    servico_id: servicoId,
    nota: Number(notaRaw),
    comentario
  };

  try {
    const res = await requisitarApi('/avaliacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msgErro = data.erro || data.error || data.message || 'Dados inválidos.';
      mostrarAlerta(`HTTP ${res.status}: ${msgErro}`, 'error');
      return;
    }

    mostrarAlerta('Avaliação anônima registrada com sucesso!', 'success');
    inputNota.value = '';
    inputComentario.value = '';
    charCount.textContent = '0 / 280 caracteres';
    charCount.classList.remove('limit-exceeded');
    carregarAvaliacoesPublicas();
  } catch (err) {
    // Validação e persistência local caso o backend esteja desligado
    const erroValidacao = validarEntrada(servicoId, notaRaw, comentario);
    if (erroValidacao) {
      mostrarAlerta(`HTTP 400: ${erroValidacao}`, 'error');
      return;
    }

    const locais = obterDadosLocais();
    const novoId = locais.length > 0 ? Math.max(...locais.map((i) => i.id)) + 1 : 1;
    locais.unshift({
      id: novoId,
      servico_id: servicoId,
      servico_nome: mapaServicos[servicoId],
      nota: Number(notaRaw),
      comentario,
      oculta: false
    });
    salvarDadosLocais(locais);

    mostrarAlerta('Avaliação anônima registrada com sucesso!', 'success');
    inputNota.value = '';
    inputComentario.value = '';
    charCount.textContent = '0 / 280 caracteres';
    charCount.classList.remove('limit-exceeded');
    renderizarAvaliacoesPublicas(locais);
  }
});

filtroServico.addEventListener('change', carregarAvaliacoesPublicas);
carregarServicos().then(carregarAvaliacoesPublicas);