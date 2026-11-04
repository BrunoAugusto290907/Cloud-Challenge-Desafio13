const STORAGE_KEY = 'desafio13_avaliacoes_dados';

const MAPA_SERVICOS = {
  1: 'Secretaria',
  2: 'Biblioteca',
  3: 'Cantina',
  4: 'Laboratórios'
};

const filtroServico = document.getElementById('filtro-servico');
const listaPublica = document.getElementById('lista-publica');

function obterDadosLocais() {
  try {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (!salvo) return [];
    return JSON.parse(salvo);
  } catch (e) {
    return [];
  }
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
    const nomeServico = a.servico_nome || MAPA_SERVICOS[a.servico_id] || `Serviço #${a.servico_id}`;
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

async function carregarMuralPublico() {
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
    } catch (e) {}
  }

  renderizarAvaliacoesPublicas(obterDadosLocais());
}

filtroServico.addEventListener('change', carregarMuralPublico);
carregarMuralPublico();