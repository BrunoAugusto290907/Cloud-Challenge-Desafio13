
const painel = document.getElementById('painel');

async function carregarPainel() {
  try {
    const resposta = await fetch('/api/painel');

    if (!resposta.ok) {
      throw new Error('Não foi possível carregar o painel.');
    }

    const servicos = await resposta.json();
    painel.replaceChildren();

    for (const servico of servicos) {
      const card = document.createElement('section');
      card.className = 'servico-card';

      // Nome do serviço
      const titulo = document.createElement('h2');
      titulo.textContent = servico.nome;
      card.appendChild(titulo);

      // Quantidade de avaliações
      const quantidade = document.createElement('p');
      quantidade.textContent =
        `Total de avaliações: ${servico.quantidade}`;
      card.appendChild(quantidade);

      // Média ou amostra insuficiente
      const media = document.createElement('p');
      media.className = 'media';

      media.textContent = servico.amostra_insuficiente
        ? 'Amostra insuficiente'
        : `⭐ Média: ${Number(servico.media).toFixed(1)}`;

      card.appendChild(media);

      // Gráfico de distribuição das notas
      for (let nota = 5; nota >= 1; nota--) {
        const total = servico.distribuicao[nota] || 0;

        const percentual = servico.quantidade
          ? (total / servico.quantidade) * 100
          : 0;

        const linha = document.createElement('div');
        linha.className = 'linha-nota';

        const rotulo = document.createElement('span');
        rotulo.textContent = `${nota} ⭐`;

        const barra = document.createElement('div');
        barra.className = 'barra';

        const preenchimento = document.createElement('div');
        preenchimento.className = 'preenchimento';
        preenchimento.style.width = `${percentual}%`;

        barra.appendChild(preenchimento);

        const contagem = document.createElement('span');
        contagem.textContent = total;

        linha.append(rotulo, barra, contagem);
        card.appendChild(linha);
      }

      // Título dos comentários
      const tituloComentarios = document.createElement('h3');
      tituloComentarios.textContent = '💬 Comentários';
      tituloComentarios.style.marginTop = '24px';
      card.appendChild(tituloComentarios);

      // Buscar comentários públicos do serviço
      try {
        const respostaComentarios = await fetch(
          `/api/servicos/${servico.servico_id}/avaliacoes`
        );

        if (!respostaComentarios.ok) {
          throw new Error('Falha ao carregar comentários.');
        }

        const dados = await respostaComentarios.json();
        const comentarios = dados.avaliacoes;

        if (comentarios.length === 0) {
          const vazio = document.createElement('p');
          vazio.textContent = 'Nenhum comentário disponível.';
          card.appendChild(vazio);
        } else {
          comentarios.forEach(avaliacao => {
            const comentario = document.createElement('div');
            comentario.className = 'comentario-card';

            const estrelas = document.createElement('strong');
            estrelas.textContent =
              `${'⭐'.repeat(avaliacao.nota)} (${avaliacao.nota}/5)`;

            const texto = document.createElement('p');
            texto.textContent = avaliacao.comentario;

            comentario.append(estrelas, texto);
            card.appendChild(comentario);
          });
        }
      } catch {
        const erro = document.createElement('p');
        erro.textContent = 'Não foi possível carregar os comentários.';
        card.appendChild(erro);
      }

      painel.appendChild(card);
    }
  } catch (erro) {
    painel.textContent = erro.message;
  }
}

carregarPainel();
