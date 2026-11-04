const STORAGE_KEY = 'desafio13_avaliacoes_dados';
const PRIVADAS_KEY = 'desafio13_ids_privados';

const SERVICOS_PADRAO = {
  1: 'Secretaria',
  2: 'Biblioteca',
  3: 'Cantina',
  4: 'Laboratórios'
};

const DADOS_INICIAIS = [
  { id: 1, servico_id: 1, servico_nome: 'Secretaria', nota: 5, comentario: 'Atendimento rápido na emissão do histórico escolar.', oculta: false, privada: false },
  { id: 2, servico_id: 1, servico_nome: 'Secretaria', nota: 4, comentario: 'Resolveram minha matrícula, apenas uma pequena fila.', oculta: false, privada: false },
  { id: 3, servico_id: 1, servico_nome: 'Secretaria', nota: 4, comentario: 'Bons esclarecimentos sobre os prazos acadêmicos.', oculta: false, privada: false },
  { id: 4, servico_id: 2, servico_nome: 'Biblioteca', nota: 5, comentario: 'Ambiente silencioso e acervo muito bem organizado.', oculta: false, privada: false },
  { id: 5, servico_id: 2, servico_nome: 'Biblioteca', nota: 5, comentario: 'Renovação de livros super prática no balcão.', oculta: false, privada: false },
  { id: 6, servico_id: 2, servico_nome: 'Biblioteca', nota: 4, comentario: 'Ótimo espaço de estudo em grupo.', oculta: false, privada: false },
  { id: 7, servico_id: 3, servico_nome: 'Cantina', nota: 4, comentario: 'Lanches bons e atendimento cordial.', oculta: false, privada: false },
  { id: 8, servico_id: 3, servico_nome: 'Cantina', nota: 3, comentario: 'Fila grande no horário do intervalo das 20h.', oculta: false, privada: false },
  { id: 9, servico_id: 3, servico_nome: 'Cantina', nota: 4, comentario: 'Boas opções de salgados e sucos.', oculta: false, privada: false },
  { id: 10, servico_id: 4, servico_nome: 'Laboratórios', nota: 5, comentario: 'Computadores rápidos e com VS Code configurado.', oculta: false, privada: false },
  { id: 11, servico_id: 4, servico_nome: 'Laboratórios', nota: 4, comentario: 'Rede estável durante toda a aula prática.', oculta: false, privada: false }
];

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

let mapaServicos = { ...SERVICOS_PADRAO };

selectVisibilidade.addEventListener('change', () => {
  if (selectVisibilidade.value === 'privada') {
    btnEnviar.textContent = 'Enviar Avaliação Privada (Apenas Gestor)';
    inputComentario.placeholder = 'Escreva seu comentário privado (visível somente na tela do Gestor)...';
  } else {
    btnEnviar.textContent = 'Enviar Avaliação Pública';
    inputComentario.placeholder = 'Escreva aqui seu elogio, crítica ou sugestão para aparecer no mural público...';
  }
});

function obterDadosLocais() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DADOS_INICIAIS));
      return [...DADOS_INICIAIS];
    }
    return JSON.parse(salvo);
  } catch (e) {
    return [...DADOS_INICIAIS];
  }
}

function salvarDadosLocais(lista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch (e) {
    // Ignora erro de storage
  }
}

function registrarIdPrivado(id) {
  try {
    const ids = JSON.parse(localStorage.getItem(PRIVADAS_KEY) || '[]');
    if (!ids.includes(Number(id))) {
      ids.push(Number(id));
      localStorage.setItem(PRIVADAS_KEY, JSON.stringify(ids));
    }
  } catch (e) {
    // Ignora erro de storage
  }
}

function mostrarAlerta(mensagem, tipo) {
  const mensagemLimpa = String(mensagem).replace(/^HTTP\s*\d*\s*:\s*/i, '');
  alertBox.textContent = mensagemLimpa;
  alertBox.className = `alert ${tipo}`;
}

inputComentario.addEventListener('input', () => {
  const len = inputComentario.value.length;
  charCount.textContent = `${len} / 280 caracteres`;
  charCount.classList.toggle('limit-exceeded', len > 280);
});

function validarFormulario(servicoId, notaTexto, comentario) {
  if (!servicoId || !mapaServicos[servicoId]) {
    return 'Selecione um serviço válido da unidade.';
  }

  const notaNormalizada = notaTexto.replace(',', '.');
  const notaNumero = Number(notaNormalizada);

  if (
    notaTexto === '' ||
    Number.isNaN(notaNumero) ||
    !Number.isInteger(notaNumero) ||
    notaNumero < 1 ||
    notaNumero > 5
  ) {
    return 'A nota deve ser um número inteiro de 1 a 5. Avaliação não gravada.';
  }

  if (comentario && comentario.length > 280) {
    return `O comentário possui ${comentario.length} caracteres (máximo permitido: 280). Avaliação não gravada.`;
  }

  return null;
}

function renderizarAvaliacoesPublicas(avaliacoes) {
  const servicoFiltro = Number(filtroServico.value);

  const visiveis = avaliacoes
    .filter((a) => !a.oculta && !a.privada)
    .filter((a) => !servicoFiltro || Number(a.servico_id) === servicoFiltro);

  if (visiveis.length === 0) {
    listaPublica.innerHTML = '<p style="color: var(--text-muted);">Nenhuma avaliação pública encontrada para este serviço.</p>';
    return;
  }

  listaPublica.innerHTML = visiveis.map((a) => {
    const nomeServico = a.servico_nome || mapaServicos[a.servico_id] || `Serviço #${a.servico_id}`;
    const comentarioHtml = a.comentario && a.comentario.trim() !== ''
      ? a.comentario
      : '<em style="color: var(--text-muted);">Avaliação enviada sem comentário escrito.</em>';

    return `
      <div class="comment-item">
        <div>
          <div class="comment-meta">
            <strong>${nomeServico}</strong> • <span class="badge-nota">Nota ${a.nota} ★</span>
          </div>
          <div>${comentarioHtml}</div>
        </div>
      </div>
    `;
  }).join('');
}

async function carregarAvaliacoesPublicas() {
  for (const prefixo of ['/api', '']) {
    try {
      const servicoId = filtroServico.value;
      const query = servicoId ? `?servico_id=${servicoId}` : '';
      const res = await fetch(`${prefixo}/avaliacoes${query}`);

      if (res.ok) {
        const dados = await res.json();
        const lista = Array.isArray(dados) ? dados : (dados.avaliacoes || []);
        renderizarAvaliacoesPublicas(lista);
        return;
      }
    } catch (e) {
      // Usa o armazenamento local caso o backend esteja desligado
    }
  }

  renderizarAvaliacoesPublicas(obterDadosLocais());
}

formAvaliacao.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertBox.className = 'alert';

  const servicoId = Number(selectServico.value);
  const notaTexto = inputNota.value.trim();
  const comentario = inputComentario.value;
  const ehPrivada = selectVisibilidade.value === 'privada';

  const erroValidacao = validarFormulario(servicoId, notaTexto, comentario);
  if (erroValidacao) {
    mostrarAlerta(erroValidacao, 'error');
    return;
  }

  const payload = {
    servico_id: servicoId,
    nota: Number(notaTexto),
    comentario,
    oculta: ehPrivada,
    privada: ehPrivada
  };

  let gravouNaApi = false;

  for (const prefixo of ['/api', '']) {
    try {
      const res = await fetch(`${prefixo}/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        gravouNaApi = true;
        const criada = await res.json().catch(() => ({}));
        const idCriado = criada.id || (criada.avaliacao && criada.avaliacao.id);

        if (ehPrivada && idCriado) {
          registrarIdPrivado(idCriado);
          await fetch(`${prefixo}/avaliacoes/${idCriado}/ocultar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oculta: true })
          }).catch(() => {});
        }
        break;
      }

      if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        const msg = data.erro || data.error || data.message || 'Dados inválidos.';
        mostrarAlerta(msg, 'error');
        return;
      }
    } catch (err) {
      // Segue para gravação local
    }
  }

  const locais = obterDadosLocais();
  const novoId = locais.length > 0 ? Math.max(...locais.map((i) => Number(i.id) || 0)) + 1 : 1;

  if (ehPrivada) {
    registrarIdPrivado(novoId);
  }

  locais.unshift({
    id: novoId,
    servico_id: servicoId,
    servico_nome: mapaServicos[servicoId],
    nota: Number(notaTexto),
    comentario,
    oculta: ehPrivada,
    privada: ehPrivada
  });
  salvarDadosLocais(locais);

  if (ehPrivada) {
    mostrarAlerta('Avaliação privada enviada com sucesso! Ela é restrita ao Gestor e sua nota conta na média.', 'success');
  } else {
    mostrarAlerta('Avaliação pública enviada com sucesso! Ela já está visível no mural abaixo.', 'success');
  }

  inputNota.value = '';
  inputComentario.value = '';
  charCount.textContent = '0 / 280 caracteres';
  charCount.classList.remove('limit-exceeded');

  if (gravouNaApi) {
    carregarAvaliacoesPublicas();
  } else {
    renderizarAvaliacoesPublicas(locais);
  }
});

filtroServico.addEventListener('change', carregarAvaliacoesPublicas);
carregarAvaliacoesPublicas();