/**
 * Placares oficiais das quartas (chaves `${tieId}-ida` / `${tieId}-volta`, casa/fora = mandante/visitante).
 * Ordem dos confrontos: championsLeagueQuartas.js → CONFRONTOS_QUARTAS_UCL.
 */
export const PLACARES_QUARTAS_UCL_INICIAL = {
  "ucl-qf-0-ida": { casa: 2, fora: 0 },
  "ucl-qf-0-volta": { casa: 0, fora: 2 },
  "ucl-qf-1-ida": { casa: 1, fora: 2 },
  "ucl-qf-1-volta": { casa: 4, fora: 3 },
  "ucl-qf-2-ida": { casa: 0, fora: 2 },
  "ucl-qf-2-volta": { casa: 1, fora: 2 },
  "ucl-qf-3-ida": { casa: 0, fora: 1 },
  "ucl-qf-3-volta": { casa: 0, fora: 0 },
};

export function placarQuartasUclEhOficial(id) {
  return Object.prototype.hasOwnProperty.call(PLACARES_QUARTAS_UCL_INICIAL, id);
}
