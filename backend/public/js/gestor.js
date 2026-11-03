const API_SERVICOS = '/api/servicos';
const API_AVALIACOES = '/api/avaliacoes';

const filtroGestor = document.getElementById('filtro-gestor');
const listaModeracao = document.getElementById('lista-moderacao');
const alertGestor = document.getElementById('alert-gestor');

let mapaServicos = {
  1: 'Secretaria',
  2: 'Biblioteca',
  3: 'Cantina',
  4: 'Laboratórios'
};

function mostrarAlerta(msg, tipo) {
  alertGestor.textContent = msg;
  alertGestor.className = `alert ${tipo}`;
}

async function carregarServicos() {
  try {
    const res = await fetch(API_SERVICOS);
    if (!res.ok) return;
    const dados = await res.json();
    const servicos = Array.isArray(dados) ? dados : (dados.servicos || []);

    if (servicos.length > 0) {
      filtroGestor.innerHTML = '<option value="">Todos os serviços</option>';
      servicos.forEach((s) => {
        mapaServicos[s.id] = s.nome;
        filtroGestor.innerHTML += `<option value="${s.id}">${s.nome}</option>`;
      });
    }
  } catch (err) {
    // Mantém os 4 serviços padrão caso a API não responda
  }
}

async function carregarAvaliacoesGestor() {
  try {
    const servicoId = filtroGestor.value;
    const url = servicoId ? `${API_AVALIACOES}?servico_id=${servicoId}&incluir_ocultas=true` : `${API_AVALIACOES}?incluir_ocultas=true`;
    const res = await fetch(url);
    const dados = await res.json();
    const avaliacoes = Array.isArray(dados) ? dados : (dados.avaliacoes || []);

    if (avaliacoes.length === 0) {
      listaModeracao.innerHTML = '<p style="color: var(--text-muted);">Nenhuma avaliação encontrada.</p>';
      return;
    }

    listaModeracao.innerHTML = avaliacoes.map((a) => {
      const nomeServico = a.servico_nome || mapaServicos[a.servico_id] || `Serviço #${a.servico_id}`;
      const textoComentario = a.comentario || '<em>Sem comentário escrito</em>';
      const statusHtml = a.oculta ? '<span class="badge-oculto">Comentário Oculto</span>' : '';
      const botaoHtml = !a.oculta
        ? `<button class="btn-danger" onclick="ocultarComentario(${a.id})">Ocultar comentário</button>`
        : '';

      return `
        <div class="comment-item">
          <div>
            <div class="comment-meta">
              <strong>#${a.id} - ${nomeServico}</strong> • <span class="badge-nota">Nota ${a.nota}</span> ${statusHtml}
            </div>
            <div>${textoComentario}</div>
          </div>
          <div>${botaoHtml}</div>
        </div>
      `;
    }).join('');
  } catch (err) {
    listaModeracao.innerHTML = '<p style="color: var(--text-muted);">Conecte a API para carregar as avaliações para moderação.</p>';
  }
}

async function ocultarComentario(id) {
  try {
    const res = await fetch(`${API_AVALIACOES}/${id}/ocultar`, {
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

    mostrarAlerta(`Comentário #${id} ocultado com sucesso (a nota permanece na média).`, 'success');
    carregarAvaliacoesGestor();
  } catch (err) {
    mostrarAlerta('Erro de comunicação com a API.', 'error');
  }
}

filtroGestor.addEventListener('change', carregarAvaliacoesGestor);
carregarServicos().then(carregarAvaliacoesGestor);