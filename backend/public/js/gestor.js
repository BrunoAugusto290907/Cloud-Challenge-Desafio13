const STORAGE_KEY = 'desafio13_avaliacoes_dados';

const filtroGestor = document.getElementById('filtro-gestor');
const listaModeracao = document.getElementById('lista-moderacao');
const alertGestor = document.getElementById('alert-gestor');

let mapaServicos = {
  1: 'Secretaria',
  2: 'Biblioteca',
  3: 'Cantina',
  4: 'Laboratórios'
};

async function requisitarApi(caminho, opcoes = {}) {
  for (const prefixo of ['/api', '']) {
    try {
      const res = await fetch(`${prefixo}${caminho}`, opcoes);
      if (res.status !== 404) return res;
    } catch (e) {
      // Continua para o fallback
    }
  }
  throw new Error('API offline');
}

function mostrarAlerta(msg, tipo) {
  alertGestor.textContent = msg;
  alertGestor.className = `alert ${tipo}`;
}

function renderizarListaGestor(avaliacoes) {
  const servicoFiltro = Number(filtroGestor.value);
  const filtradas = avaliacoes.filter((a) => !servicoFiltro || Number(a.servico_id) === servicoFiltro);

  if (filtradas.length === 0) {
    listaModeracao.innerHTML = '<p style="color: var(--text-muted);">Nenhuma avaliação encontrada.</p>';
    return;
  }

  listaModeracao.innerHTML = filtradas.map((a) => {
    const nomeServico = a.servico_nome || mapaServicos[a.servico_id] || `Serviço #${a.servico_id}`;
    const textoComentario = a.comentario || '<em>Sem comentário escrito</em>';
    const statusHtml = a.oculta ? '<span class="badge-oculto">Comentário Oculto na Lista Pública</span>' : '';
    const botaoHtml = !a.oculta
      ? `<button class="btn-danger" onclick="ocultarComentario(${a.id})">Ocultar comentário</button>`
      : '';

    return `
      <div class="comment-item">
        <div>
          <div class="comment-meta">
            <strong>#${a.id} - ${nomeServico}</strong> • <span class="badge-nota">Nota ${a.nota} ★</span> ${statusHtml}
          </div>
          <div>${textoComentario}</div>
        </div>
        <div>${botaoHtml}</div>
      </div>
    `;
  }).join('');
}

async function carregarAvaliacoesGestor() {
  try {
    const servicoId = filtroGestor.value;
    const query = servicoId ? `?servico_id=${servicoId}&incluir_ocultas=true` : '?incluir_ocultas=true';
    const res = await requisitarApi(`/avaliacoes${query}`);
    if (!res.ok) throw new Error('Falha API');
    const dados = await res.json();
    const avaliacoes = Array.isArray(dados) ? dados : (dados.avaliacoes || []);
    renderizarListaGestor(avaliacoes);
  } catch (err) {
    const salvo = localStorage.getItem(STORAGE_KEY);
    const locais = salvo ? JSON.parse(salvo) : [];
    renderizarListaGestor(locais);
  }
}

async function ocultarComentario(id) {
  try {
    const res = await requisitarApi(`/avaliacoes/${id}/ocultar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oculta: true })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msgErro = data.erro || data.error || data.message || 'Não foi possível ocultar o comentário.';
      mostrarAlerta(`HTTP ${res.status}: ${msgErro}`, 'error');
      return;
    }

    mostrarAlerta(`Comentário #${id} ocultado com sucesso! A nota continua contando na média (CA5).`, 'success');
    carregarAvaliacoesGestor();
  } catch (err) {
    // Oculta localmente caso o backend esteja desligado
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      const locais = JSON.parse(salvo).map((item) => (
        Number(item.id) === Number(id) ? { ...item, oculta: true } : item
      ));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locais));
      mostrarAlerta(`Comentário #${id} ocultado da lista pública! A nota continua contando na média (CA5).`, 'success');
      renderizarListaGestor(locais);
    }
  }
}

filtroGestor.addEventListener('change', carregarAvaliacoesGestor);
carregarAvaliacoesGestor();