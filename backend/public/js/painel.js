const STORAGE_KEY = 'desafio13_avaliacoes_dados';
const painelContainer = document.getElementById('painel-container');
const alertPainel = document.getElementById('alert-painel');
const btnAtualizar = document.getElementById('btn-atualizar');

const SERVICOS_FIXOS = [
  { id: 1, nome: 'Secretaria' },
  { id: 2, nome: 'Biblioteca' },
  { id: 3, nome: 'Cantina' },
  { id: 4, nome: 'Laboratórios' }
];

async function requisitarApi(caminho) {
  for (const prefixo of ['/api', '']) {
    try {
      const res = await fetch(`${prefixo}${caminho}`);
      if (res.status !== 404) return res;
    } catch (e) {
      // Continua para o fallback
    }
  }
  throw new Error('API offline');
}

function calcularPainelLocal() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  const avaliacoes = salvo ? JSON.parse(salvo) : [
    { id: 1, servico_id: 1, nota: 5, oculta: false },
    { id: 2, servico_id: 1, nota: 4, oculta: false },
    { id: 3, servico_id: 1, nota: 4, oculta: false },
    { id: 4, servico_id: 2, nota: 5, oculta: false },
    { id: 5, servico_id: 2, nota: 5, oculta: false },
    { id: 6, servico_id: 2, nota: 4, oculta: false },
    { id: 7, servico_id: 3, nota: 4, oculta: false },
    { id: 8, servico_id: 3, nota: 3, oculta: false },
    { id: 9, servico_id: 3, nota: 4, oculta: false },
    { id: 10, servico_id: 4, nota: 5, oculta: false },
    { id: 11, servico_id: 4, nota: 4, oculta: false }
  ];

  // Regra RF5/CA5: comentários ocultos continuam contando normalmente na média!
  return SERVICOS_FIXOS.map((s) => {
    const doServico = avaliacoes.filter((a) => Number(a.servico_id) === s.id);
    const quantidade = doServico.length;
    const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    let soma = 0;
    doServico.forEach((a) => {
      const n = Number(a.nota);
      soma += n;
      if (distribuicao[n] !== undefined) distribuicao[n] += 1;
    });

    const media = quantidade >= 3 ? Number((soma / quantidade).toFixed(1)) : null;

    return {
      id: s.id,
      nome: s.nome,
      quantidade,
      media,
      distribuicao
    };
  });
}

function extrairDistribuicao(item, nota) {
  if (item.distribuicao && item.distribuicao[nota] !== undefined) {
    return Number(item.distribuicao[nota]);
  }
  if (item[`nota_${nota}`] !== undefined) {
    return Number(item[`nota_${nota}`]);
  }
  return 0;
}

function renderizarCartoes(lista) {
  painelContainer.innerHTML = lista.map((item) => {
    const nome = item.nome || item.servico_nome || item.servico;
    const total = Number(item.quantidade ?? item.total_avaliacoes ?? item.total ?? 0);
    const amostraInsuficiente = total < 3 || item.amostra_insuficiente === true || item.media === 'amostra insuficiente' || item.media === null;

    let exibicaoMedia = '';
    if (amostraInsuficiente) {
      exibicaoMedia = '<span class="badge-insuficiente">Amostra insuficiente</span>';
    } else {
      const valorMedia = Number(item.media).toFixed(1).replace('.', ',');
      exibicaoMedia = `<span class="media-valor">${valorMedia} ★</span>`;
    }

    let barrasHtml = '';
    for (let n = 5; n >= 1; n--) {
      const qtdNota = extrairDistribuicao(item, n);
      const percentual = total > 0 ? Math.round((qtdNota / total) * 100) : 0;
      barrasHtml += `
        <div class="dist-row">
          <span style="width: 48px;">Nota ${n}</span>
          <div class="dist-bar-bg">
            <div class="dist-bar-fill" style="width: ${percentual}%;"></div>
          </div>
          <span style="width: 28px; text-align: right;">${qtdNota}</span>
        </div>
      `;
    }

    return `
      <div class="card" style="margin-bottom: 0;">
        <h2>${nome}</h2>
        <div class="metric-box">
          <div>${exibicaoMedia}</div>
          <div style="font-size: 0.9rem; color: var(--text-muted);">${total} avaliações</div>
        </div>
        <div>
          <strong style="font-size: 0.85rem; display: block; margin-bottom: 0.5rem;">Distribuição das notas (1 a 5)</strong>
          ${barrasHtml}
        </div>
      </div>
    `;
  }).join('');
}

async function carregarPainel() {
  alertPainel.className = 'alert';

  try {
    const res = await requisitarApi('/painel');
    if (!res.ok) throw new Error('API indisponível');
    const dados = await res.json();
    const lista = Array.isArray(dados) ? dados : (dados.painel || dados.servicos || []);

    if (lista.length > 0) {
      renderizarCartoes(lista);
      return;
    }
  } catch (err) {
    // Calcula a partir das avaliações salvas se o backend estiver desligado
  }

  renderizarCartoes(calcularPainelLocal());
}

btnAtualizar.addEventListener('click', carregarPainel);
carregarPainel();