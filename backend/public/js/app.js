
const form = document.getElementById('form-avaliacao');
const servicoSelect = document.getElementById('servico');
const mensagem = document.getElementById('mensagem');

// Buscar serviços no PostgreSQL através da API
async function carregarServicos() {
  try {
    const resposta = await fetch('/api/servicos');
    if (!resposta.ok) throw new Error();

    const servicos = await resposta.json();

    servicos.forEach(servico => {
      const option = document.createElement('option');
      option.value = servico.id;
      option.textContent = servico.nome;
      servicoSelect.appendChild(option);
    });
  } catch {
    mensagem.textContent = 'Erro ao carregar serviços.';
  }
}

// Enviar avaliação para o backend
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const avaliacao = {
    servico_id: Number(servicoSelect.value),
    nota: Number(document.getElementById('nota').value),
    comentario: document.getElementById('comentario').value
  };

  try {
    const resposta = await fetch('/api/avaliacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(avaliacao)
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      throw new Error(erro.erro || 'Erro ao enviar.');
    }

    mensagem.textContent = 'Avaliação enviada com sucesso!';
    form.reset();
  } catch (erro) {
    mensagem.textContent = erro.message;
  }
});

carregarServicos();
