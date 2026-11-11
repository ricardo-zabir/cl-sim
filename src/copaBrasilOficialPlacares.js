/**
 * Placares oficiais oitavas/quartas/semis Copa do Brasil 2026.
 * Chaves: `${tieId}-ida` / `-volta` (casa/fora = mandante/visitante) e `-pen` ({ a, b } = sideA/sideB).
 * Final (06/12, Mané Garrincha): Grêmio × Palmeiras — ainda não jogada.
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

  // Semis
  "cdb-sf-0-ida": { casa: 2, fora: 0 }, // Grêmio 2 x 0 Atlético-MG
  "cdb-sf-0-volta": { casa: 1, fora: 1 }, // Atlético-MG 1 x 1 Grêmio
  "cdb-sf-1-ida": { casa: 1, fora: 0 }, // Palmeiras 1 x 0 Vasco
  "cdb-sf-1-volta": { casa: 2, fora: 1 }, // Vasco 2 x 1 Palmeiras
  "cdb-sf-1-pen": { a: 5, b: 4 }, // Palmeiras 5 x 4 Vasco
};

export function placarCopaEhOficial(id) {
  return Object.prototype.hasOwnProperty.call(PLACARES_OFICIAIS_COPA, id);
}
