
const tokenInput = document.getElementById('token');
const servicoSelect = document.getElementById('servico');
const buscarBtn = document.getElementById('buscar');
const mensagem = document.getElementById('mensagem');
const lista = document.getElementById('avaliacoes');

async function carregarServicos() {
  try {
    const resposta = await fetch('/api/servicos');
    if (!resposta.ok) throw new Error();

    const servicos = await resposta.json();

    for (const servico of servicos) {
      const opcao = document.createElement('option');
      opcao.value = servico.id;
      opcao.textContent = servico.nome;
      servicoSelect.appendChild(opcao);
    }
  } catch {
    mensagem.textContent = 'Erro ao carregar serviços.';
  }
}

async function buscarAvaliacoes() {
  const token = tokenInput.value;
  const servicoId = servicoSelect.value;

  lista.replaceChildren();

  if (!token || !servicoId) {
    mensagem.textContent = 'Informe o token e o serviço.';
    return;
  }

  try {
    const resposta = await fetch(
      `/api/avaliacoes?servico_id=${servicoId}`,
      { headers: { 'x-gestor-token': token } }
    );

    if (resposta.status === 401) {
      throw new Error('Token inválido.');
    }
    if (!resposta.ok) {
      throw new Error('Não foi possível buscar avaliações.');
    }

    const avaliacoes = await resposta.json();
    mensagem.textContent = `${avaliacoes.length} avaliações encontradas.`;

    for (const avaliacao of avaliacoes) {
      const card = document.createElement('div');
      card.className = 'comentario-card';

      const nota = document.createElement('strong');
      nota.textContent = `Nota: ${avaliacao.nota}/5`;

      const comentario = document.createElement('p');
      comentario.textContent =
        avaliacao.comentario || 'Sem comentário';

      const status = document.createElement('p');
      status.textContent = avaliacao.oculta
        ? 'Comentário oculto'
        : 'Comentário visível';

      card.append(nota, comentario, status);

      if (avaliacao.comentario && !avaliacao.oculta) {
        const botao = document.createElement('button');
        botao.textContent = 'Ocultar comentário';
        botao.type = 'button';

        botao.addEventListener('click', async () => {
          if (!confirm('Deseja ocultar este comentário?')) return;

          botao.disabled = true;

          try {
            const resposta = await fetch(
              `/api/avaliacoes/${avaliacao.id}/ocultar`,
              {
                method: 'PATCH',
                headers: { 'x-gestor-token': tokenInput.value }
              }
            );

            if (!resposta.ok) {
              throw new Error('Não foi possível ocultar.');
            }

            await buscarAvaliacoes();
          } catch (erro) {
            mensagem.textContent = erro.message;
            botao.disabled = false;
          }
        });

        card.appendChild(botao);
      }

      lista.appendChild(card);
    }
  } catch (erro) {
    mensagem.textContent = erro.message;
  }
}

buscarBtn.addEventListener('click', buscarAvaliacoes);
carregarServicos();
