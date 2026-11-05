
const MAX_COMENTARIO = 280;

function validarAvaliacao(body) {
  const erros = [];

  const {
    servico_id,
    nota,
    comentario,
    privada = false
  } = body || {};

  // Validar serviço
  if (!Number.isInteger(servico_id) || servico_id < 1) {
    erros.push('servico_id deve ser um inteiro positivo.');
  }

  // Validar nota de 1 a 5
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    erros.push('nota deve ser um número inteiro de 1 a 5.');
  }

  // Validar se a avaliação é pública ou privada
  if (typeof privada !== 'boolean') {
    erros.push('privada deve ser true ou false.');
  }

  // Validar comentário opcional
  let comentarioFinal = null;

  if (comentario !== undefined && comentario !== null) {
    if (typeof comentario !== 'string') {
      erros.push('comentario deve ser um texto.');
    } else {
      const texto = comentario.trim();

      if ([...texto].length > MAX_COMENTARIO) {
        erros.push(
          `comentario deve ter no máximo ${MAX_COMENTARIO} caracteres.`
        );
      }

      comentarioFinal = texto === '' ? null : texto;
    }
  }

  return {
    erros,
    valores: {
      servico_id,
      nota,
      comentario: comentarioFinal,
      privada
    }
  };
}

// Validar IDs utilizados nas rotas
function idValido(valor) {
  return /^\d+$/.test(String(valor)) &&
    Number(valor) > 0 &&
    Number(valor) < 2147483647;
}

module.exports = {
  validarAvaliacao,
  idValido,
  MAX_COMENTARIO
};
