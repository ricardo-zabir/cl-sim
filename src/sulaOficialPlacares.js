/**
 * Placares oficiais oitavas/quartas Sul-Americana 2026.
 * Chaves: `${tieId}-ida` / `-volta` (casa/fora = mandante/visitante) e `-pen` ({ a, b } = sideA/sideB).
 */
export const PLACARES_OFICIAIS_SULA = {
  // Oitavas
  "sula-r16-0-ida": { casa: 3, fora: 1 },
  "sula-r16-0-volta": { casa: 0, fora: 4 },
  "sula-r16-1-ida": { casa: 1, fora: 1 },
  "sula-r16-1-volta": { casa: 3, fora: 1 },
  "sula-r16-2-ida": { casa: 0, fora: 0 },
  "sula-r16-2-volta": { casa: 1, fora: 4 },
  "sula-r16-3-ida": { casa: 0, fora: 0 },
  "sula-r16-3-volta": { casa: 1, fora: 1 },
  "sula-r16-3-pen": { a: 8, b: 7 },
  "sula-r16-4-ida": { casa: 0, fora: 1 },
  "sula-r16-4-volta": { casa: 2, fora: 2 },
  "sula-r16-5-ida": { casa: 2, fora: 1 },
  "sula-r16-5-volta": { casa: 0, fora: 0 },
  "sula-r16-6-ida": { casa: 0, fora: 1 },
  "sula-r16-6-volta": { casa: 2, fora: 1 },
  "sula-r16-7-ida": { casa: 6, fora: 1 },
  "sula-r16-7-volta": { casa: 1, fora: 0 },

  // Quartas
  "sula-qf-0-ida": { casa: 1, fora: 0 },
  "sula-qf-0-volta": { casa: 1, fora: 1 },
  "sula-qf-1-ida": { casa: 0, fora: 0 },
  "sula-qf-1-volta": { casa: 2, fora: 0 },
  "sula-qf-2-ida": { casa: 2, fora: 0 },
  "sula-qf-2-volta": { casa: 4, fora: 2 },
  "sula-qf-2-pen": { a: 1, b: 3 },
  "sula-qf-3-ida": { casa: 2, fora: 0 },
  "sula-qf-3-volta": { casa: 3, fora: 0 },
};

export function placarSulaEhOficial(id) {
  return Object.prototype.hasOwnProperty.call(PLACARES_OFICIAIS_SULA, id);
}
