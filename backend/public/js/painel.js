const STORAGE_KEY = 'desafio13_avaliacoes_dados';
const PRIVADAS_KEY = 'desafio13_ids_privados';

const painelContainer = document.getElementById('painel-container');
const alertPainel = document.getElementById('alert-painel');
const btnAtualizar = document.getElementById('btn-atualizar');

const SERVICOS_FIXOS = [
  { id: 1, nome: 'Secretaria' },
  { id: 2, nome: 'Biblioteca' },
  { id: 3, nome: 'Cantina' },
  { id: 4, nome: 'Laboratórios' }
];

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

function obterIdsPrivados() {
  try {
    return JSON.parse(localStorage.getItem(PRIVADAS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function obterAvaliacoesLocais() {
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

async function buscarAvaliacoesAtuais() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  if (salvo) {
    return JSON.parse(salvo);
  }

  for (const prefixo of ['/api', '']) {
    try {
      const res = await fetch(`${prefixo}/avaliacoes`);
      if (res.ok) {
        const dados = await res.json();
        return Array.isArray(dados) ? dados : (dados.avaliacoes || []);
      }
    } catch (e) {
      // Continua para os dados locais
    }
  }

  return obterAvaliacoesLocais();
}

// Analisa SOMENTE as avaliações que aparecem na tela principal de Avaliação Pública
function calcularPainelApenasPublicas(todasAvaliacoes) {
  const idsPrivados = obterIdsPrivados();

  const avaliacoesPublicasVisiveis = todasAvaliacoes.filter(
    (a) => !a.oculta && !a.privada && !idsPrivados.includes(Number(a.id))
  );

  return SERVICOS_FIXOS.map((s) => {
    const doServico = avaliacoesPublicasVisiveis.filter((a) => Number(a.servico_id) === s.id);
    const quantidade = doServico.length;
    const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    let soma = 0;
    doServico.forEach((a) => {
      const n = Number(a.nota);
      soma += n;
      if (distribuicao[n] !== undefined) {
        distribuicao[n] += 1;
      }
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

function renderizarCartoes(lista) {
  painelContainer.innerHTML = lista.map((item) => {
    const nome = item.nome;
    const total = Number(item.quantidade || 0);
    const amostraInsuficiente = total < 3 || item.media === null;

    let exibicaoMedia = '';
    if (amostraInsuficiente) {
      exibicaoMedia = '<span class="badge-insuficiente">Amostra insuficiente</span>';
    } else {
      const valorMedia = Number(item.media).toFixed(1).replace('.', ',');
      exibicaoMedia = `<span class="media-valor">${valorMedia} ★</span>`;
    }

    let barrasHtml = '';
    for (let n = 5; n >= 1; n--) {
      const qtdNota = Number(item.distribuicao[n] || 0);
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
          <div style="font-size: 0.9rem; color: var(--text-muted);">${total} avaliações públicas</div>
        </div>
        <div>
          <strong style="font-size: 0.85rem; display: block; margin-bottom: 0.5rem;">Distribuição das notas públicas (1 a 5)</strong>
          ${barrasHtml}
        </div>
      </div>
    `;
  }).join('');
}

async function carregarPainel(exibirAviso = false) {
  const avaliacoes = await buscarAvaliacoesAtuais();
  const dadosPainel = calcularPainelApenasPublicas(avaliacoes);
  renderizarCartoes(dadosPainel);

  if (exibirAviso) {
    const horario = new Date().toLocaleTimeString('pt-BR');
    alertPainel.textContent = `Painel atualizado às ${horario} (analisando apenas as avaliações públicas da tela principal).`;
    alertPainel.className = 'alert success';
  }
}

btnAtualizar.addEventListener('click', () => carregarPainel(true));
carregarPainel(false);