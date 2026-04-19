/**
 * Placares oficiais da fase de grupos (chave: `${grupo}-${índice}` em gerarJogos).
 * Rodada do card = índices (rodada-1)*2 e (rodada-1)*2+1. Os índices seguem `gerarJogos`.
 */
export const PLACARES_OFICIAIS_GRUPOS = {
  "A-0": { casa: 1, fora: 1 },
  "A-1": { casa: 0, fora: 2 },
  "A-2": { casa: 2, fora: 1 },
  "A-3": { casa: 4, fora: 1 },
  "B-0": { casa: 0, fora: 0 },
  "B-1": { casa: 1, fora: 1 },
  "B-2": { casa: 0, fora: 2 },
  "B-3": { casa: 3, fora: 1 },
  "C-0": { casa: 1, fora: 0 },
  "C-1": { casa: 0, fora: 0 },
  "C-2": { casa: 1, fora: 1 },
  "C-3": { casa: 1, fora: 2 },
  "D-0": { casa: 0, fora: 1 },
  "D-1": { casa: 1, fora: 2 },
  "D-2": { casa: 1, fora: 2 },
  "D-3": { casa: 3, fora: 0 },
  "E-0": { casa: 0, fora: 2 },
  "E-1": { casa: 1, fora: 1 },
  "E-2": { casa: 2, fora: 0 },
  "E-3": { casa: 1, fora: 2 },
  "F-0": { casa: 1, fora: 0 },
  "F-1": { casa: 1, fora: 1 },
  "F-2": { casa: 1, fora: 0 },
  "F-3": { casa: 2, fora: 1 },
  "G-0": { casa: 1, fora: 0 },
  "G-1": { casa: 0, fora: 1 },
  "G-2": { casa: 1, fora: 0 },
  "G-3": { casa: 2, fora: 0 },
  "H-0": { casa: 3, fora: 1 },
  "H-1": { casa: 0, fora: 0 },
  "H-2": { casa: 0, fora: 1 },
  "H-3": { casa: 3, fora: 1 },
};

export function placarGrupoEhOficial(key) {
  return Object.prototype.hasOwnProperty.call(PLACARES_OFICIAIS_GRUPOS, key);
}
