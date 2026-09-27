/**
 * Placares oficiais oitavas/quartas Copa do Brasil 2025.
 * Chaves: `${tieId}-ida` / `-volta` (casa/fora = mandante/visitante) e `-pen` ({ a, b } = sideA/sideB).
 */
export const PLACARES_OFICIAIS_COPA = {
  // Oitavas
  "cdb-r16-0-ida": { casa: 0, fora: 0 },
  "cdb-r16-0-volta": { casa: 1, fora: 3 },
  "cdb-r16-1-ida": { casa: 2, fora: 0 },
  "cdb-r16-1-volta": { casa: 2, fora: 1 },
  "cdb-r16-2-ida": { casa: 1, fora: 1 },
  "cdb-r16-2-volta": { casa: 1, fora: 0 },
  "cdb-r16-3-ida": { casa: 2, fora: 0 },
  "cdb-r16-3-volta": { casa: 4, fora: 0 },
  "cdb-r16-4-ida": { casa: 0, fora: 0 },
  "cdb-r16-4-volta": { casa: 0, fora: 1 },
  "cdb-r16-5-ida": { casa: 0, fora: 0 },
  "cdb-r16-5-volta": { casa: 0, fora: 1 },
  "cdb-r16-6-ida": { casa: 0, fora: 0 },
  "cdb-r16-6-volta": { casa: 2, fora: 0 },
  "cdb-r16-7-ida": { casa: 3, fora: 0 },
  "cdb-r16-7-volta": { casa: 3, fora: 2 },

  // Quartas
  "cdb-qf-0-ida": { casa: 0, fora: 0 },
  "cdb-qf-0-volta": { casa: 3, fora: 1 },
  "cdb-qf-1-ida": { casa: 1, fora: 1 },
  "cdb-qf-1-volta": { casa: 2, fora: 1 },
  "cdb-qf-2-ida": { casa: 3, fora: 0 },
  "cdb-qf-2-volta": { casa: 0, fora: 0 },
  "cdb-qf-3-ida": { casa: 1, fora: 0 },
  "cdb-qf-3-volta": { casa: 0, fora: 2 },
};

export function placarCopaEhOficial(id) {
  return Object.prototype.hasOwnProperty.call(PLACARES_OFICIAIS_COPA, id);
}
