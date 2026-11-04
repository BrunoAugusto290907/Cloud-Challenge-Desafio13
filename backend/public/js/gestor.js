const STORAGE_KEY = 'desafio13_avaliacoes_dados';
const PRIVADAS_KEY = 'desafio13_ids_privados';

const filtroGestor = document.getElementById('filtro-gestor');
const listaModeracao = document.getElementById('lista-moderacao');
const alertGestor = document.getElementById('alert-gestor');

let mapaServicos = {
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

function mostrarAlerta(msg, tipo) {
  const msgLimpa = String(msg).replace(/^HTTP\s*\d*\s*:\s*/i, '');
  alertGestor.textContent = msgLimpa;
  alertGestor.className = `alert ${tipo}`;
}

function obterIdsPrivados() {
  try {
    return JSON.parse(localStorage.getItem(PRIVADAS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

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

function renderizarListaGestor(avaliacoes) {
  const servicoFiltro = Number(filtroGestor.value);
  const idsPrivados = obterIdsPrivados();
  const filtradas = avaliacoes.filter((a) => !servicoFiltro || Number(a.servico_id) === servicoFiltro);

  if (filtradas.length === 0) {
    listaModeracao.innerHTML = '<p style="color: var(--text-muted);">Nenhuma avaliação encontrada.</p>';
    return;
  }

  listaModeracao.innerHTML = filtradas.map((a) => {
    const nomeServico = a.servico_nome || mapaServicos[a.servico_id] || `Serviço #${a.servico_id}`;
    const textoComentario = a.comentario || '<em>Sem comentário escrito</em>';
    const ehPrivadaDeOrigem = a.privada === true || idsPrivados.includes(Number(a.id));

    let statusHtml = '';
    let botaoVisibilidadeHtml = '';

    if (ehPrivadaDeOrigem) {
      statusHtml = '<span style="font-size: 0.75rem; color: #475569; background: #e2e8f0; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600;">Privada (Enviada pelo estudante)</span>';
      botaoVisibilidadeHtml = '';
    } else if (a.oculta) {
      statusHtml = '<span class="badge-oculto">Pública (Ocultada pelo Gestor)</span>';
      botaoVisibilidadeHtml = `<button style="background-color: #16a34a; padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="alterarVisibilidadePublica(${a.id}, false)">Deixar visível novamente</button>`;
    } else {
      statusHtml = '<span style="font-size: 0.75rem; color: var(--success-text); background: var(--success-bg); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600;">Pública (Visível no mural)</span>';
      botaoVisibilidadeHtml = `<button style="background-color: #d97706; padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="alterarVisibilidadePublica(${a.id}, true)">Ocultar comentário</button>`;
    }

    const botaoExcluirHtml = `<button class="btn-danger" onclick="excluirComentario(${a.id})">Excluir</button>`;

    return `
      <div class="comment-item">
        <div>
          <div class="comment-meta">
            <strong>#${a.id} - ${nomeServico}</strong> • <span class="badge-nota">Nota ${a.nota} ★</span> ${statusHtml}
          </div>
          <div>${textoComentario}</div>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          ${botaoVisibilidadeHtml}
          ${botaoExcluirHtml}
        </div>
      </div>
    `;
  }).join('');
}

async function carregarAvaliacoesGestor() {
  const locais = obterDadosLocais();

  for (const prefixo of ['/api', '']) {
    try {
      const servicoId = filtroGestor.value;
      const query = servicoId ? `?servico_id=${servicoId}&incluir_ocultas=true` : '?incluir_ocultas=true';
      const res = await fetch(`${prefixo}/avaliacoes${query}`);
      if (res.ok) {
        const dados = await res.json();
        const avaliacoes = Array.isArray(dados) ? dados : (dados.avaliacoes || []);
        renderizarListaGestor(avaliacoes);
        return;
      }
    } catch (e) {
      // Usa dados locais caso o backend esteja desligado
    }
  }

  renderizarListaGestor(locais);
}

async function alterarVisibilidadePublica(id, ocultar) {
  const idsPrivados = obterIdsPrivados();
  if (idsPrivados.includes(Number(id))) {
    mostrarAlerta('Avaliações privadas enviadas pelo estudante não podem ser tornadas públicas.', 'error');
    return;
  }

  for (const prefixo of ['/api', '']) {
    try {
      const rota = ocultar ? `${prefixo}/avaliacoes/${id}/ocultar` : `${prefixo}/avaliacoes/${id}/exibir`;
      const res = await fetch(rota, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oculta: ocultar })
      });

      if (res.ok) break;
    } catch (e) {
      // Continua para atualização local
    }
  }

  const locais = obterDadosLocais().map((item) => {
    if (Number(item.id) === Number(id) && !item.privada) {
      return { ...item, oculta: ocultar };
    }
    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(locais));

  if (ocultar) {
    mostrarAlerta(`Comentário público #${id} ocultado do mural!`, 'success');
  } else {
    mostrarAlerta(`Comentário público #${id} ficou visível novamente no mural da primeira tela!`, 'success');
  }
  renderizarListaGestor(locais);
}

async function excluirComentario(id) {
  for (const prefixo of ['/api', '']) {
    try {
      const res = await fetch(`${prefixo}/avaliacoes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) break;
    } catch (e) {
      // Continua para exclusão local
    }
  }

  const locais = obterDadosLocais().filter((item) => Number(item.id) !== Number(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(locais));

  const idsPrivados = obterIdsPrivados().filter((itemId) => Number(itemId) !== Number(id));
  localStorage.setItem(PRIVADAS_KEY, JSON.stringify(idsPrivados));

  mostrarAlerta(`Comentário #${id} excluído com sucesso!`, 'success');
  renderizarListaGestor(locais);
}

filtroGestor.addEventListener('change', carregarAvaliacoesGestor);
carregarAvaliacoesGestor();