const API_SERVICOS = '/api/servicos';
const API_AVALIACOES = '/api/avaliacoes';

const selectServico = document.getElementById('servico_id');
const filtroServico = document.getElementById('filtro-servico');
const formAvaliacao = document.getElementById('form-avaliacao');
const inputNota = document.getElementById('nota');
const inputComentario = document.getElementById('comentario');
const charCount = document.getElementById('char-count');
const alertBox = document.getElementById('alert-box');
const listaPublica = document.getElementById('lista-publica');

// Serviços padrão da ficha do Desafio 13
let mapaServicos = {
  1: 'Secretaria',
  2: 'Biblioteca',
  3: 'Cantina',
  4: 'Laboratórios'
};

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
    const res = await fetch(API_SERVICOS);
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
    // Mantém os 4 serviços padrão caso a API ainda não esteja em execução
  }
}

async function carregarAvaliacoesPublicas() {
  try {
    const servicoId = filtroServico.value;
    const url = servicoId ? `${API_AVALIACOES}?servico_id=${servicoId}` : API_AVALIACOES;
    const res = await fetch(url);
    const dados = await res.json();
    const avaliacoes = Array.isArray(dados) ? dados : (dados.avaliacoes || []);

    const visiveis = avaliacoes.filter((a) => !a.oculta);

    if (visiveis.length === 0) {
      listaPublica.innerHTML = '<p style="color: var(--text-muted);">Nenhuma avaliação pública para exibir.</p>';
      return;
    }

    listaPublica.innerHTML = visiveis.map((a) => {
      const nomeServico = a.servico_nome || mapaServicos[a.servico_id] || `Serviço #${a.servico_id}`;
      const comentarioTexto = a.comentario ? a.comentario : '<em>Sem comentário</em>';
      return `
        <div class="comment-item">
          <div>
            <div class="comment-meta">
              <strong>${nomeServico}</strong> • <span class="badge-nota">Nota ${a.nota}</span>
            </div>
            <div>${comentarioTexto}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    listaPublica.innerHTML = '<p style="color: var(--text-muted);">Conecte a API para listar as avaliações salvas no banco.</p>';
  }
}

formAvaliacao.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertBox.className = 'alert';

  const payload = {
    servico_id: Number(selectServico.value),
    nota: Number(inputNota.value),
    comentario: inputComentario.value
  };

  try {
    const res = await fetch(API_AVALIACOES, {
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

    mostrarAlerta('Avaliação registrada com sucesso!', 'success');
    inputNota.value = '';
    inputComentario.value = '';
    charCount.textContent = '0 / 280 caracteres';
    charCount.classList.remove('limit-exceeded');
    carregarAvaliacoesPublicas();
  } catch (err) {
    mostrarAlerta('Erro de conexão com o servidor.', 'error');
  }
});

filtroServico.addEventListener('change', carregarAvaliacoesPublicas);

carregarServicos().then(carregarAvaliacoesPublicas);