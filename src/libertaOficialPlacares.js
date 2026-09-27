import {
  confrontoDuploMandoEsquerda,
  stripPos,
  vencedorConfrontoDuplo,
} from "./knockoutLogic";

/**
 * Placares oficiais oitavas/quartas Libertadores 2026.
 * Chaves: `${tieId}-ida` / `-volta` / `-pen` ({ a, b } = sideA / sideB).
 */
export const PLACARES_OFICIAIS_LIBERTA_KO = {
  // Oitavas
  "r16-0-ida": { casa: 1, fora: 1 },
  "r16-0-volta": { casa: 0, fora: 3 },
  "r16-1-ida": { casa: 0, fora: 0 },
  "r16-1-volta": { casa: 1, fora: 0 },
  "r16-2-ida": { casa: 1, fora: 1 },
  "r16-2-volta": { casa: 2, fora: 1 },
  "r16-3-ida": { casa: 0, fora: 1 },
  "r16-3-volta": { casa: 3, fora: 1 },
  "r16-4-ida": { casa: 1, fora: 1 },
  "r16-4-volta": { casa: 0, fora: 0 },
  "r16-4-pen": { a: 4, b: 5 },
  "r16-5-ida": { casa: 1, fora: 1 },
  "r16-5-volta": { casa: 0, fora: 1 },
  "r16-6-ida": { casa: 0, fora: 0 },
  "r16-6-volta": { casa: 1, fora: 1 },
  "r16-6-pen": { a: 5, b: 4 },
  "r16-7-ida": { casa: 1, fora: 1 },
  "r16-7-volta": { casa: 1, fora: 1 },
  "r16-7-pen": { a: 7, b: 6 },

  // Quartas (mando conforme jogos oficiais)
  "qf-0-ida": { casa: 1, fora: 1 },
  "qf-0-volta": { casa: 0, fora: 1 },
  "qf-1-ida": { casa: 0, fora: 2 },
  "qf-1-volta": { casa: 1, fora: 1 },
  "qf-2-ida": { casa: 1, fora: 0 },
  "qf-2-volta": { casa: 3, fora: 2 },
  "qf-2-pen": { a: 4, b: 3 },
  "qf-3-ida": { casa: 2, fora: 0 },
  "qf-3-volta": { casa: 2, fora: 1 },
};

export function placarLibertaKoEhOficial(id) {
  return Object.prototype.hasOwnProperty.call(PLACARES_OFICIAIS_LIBERTA_KO, id);
}

function placeholderDuplo(id, pendingTie = false) {
  return {
    id,
    tipo: "duas",
    sideA: null,
    sideB: null,
    ida: null,
    volta: null,
    pendingTie,
  };
}

/**
 * Chaveamento oficial: oitavas do sorteio; quartas/semis com mando da ida fixo
 * conforme os jogos disputados (não pela campanha nos grupos).
 */
export function montarChaveamentoLibertadores(sorteio, placares) {
  if (!sorteio) return { r16: [], qf: [], sf: [], f: [] };

  const { r16: r16Seed } = sorteio;
  const w16 = r16Seed.map((m) => vencedorConfrontoDuplo(m, placares));

  // Emparelhamento + mandante da ida (nome) conforme chave oficial 2026
  const qfSpecs = [
    { id: "qf-0", i: 0, j: 1, idaNome: "Estudiantes" },
    { id: "qf-1", i: 2, j: 3, idaNome: "Independiente del Valle" },
    { id: "qf-2", i: 4, j: 5, idaNome: "Palmeiras" },
    { id: "qf-3", i: 6, j: 7, idaNome: "Fluminense" },
  ];

  const qf = qfSpecs.map(({ id, i, j, idaNome }) => {
    const wa = w16[i];
    const wb = w16[j];
    const bad = wa === "tie" || wb === "tie";
    if (!wa || !wb || bad) return placeholderDuplo(id, bad);

    const a = stripPos(wa);
    const b = stripPos(wb);
    if (a.nome === idaNome) return confrontoDuploMandoEsquerda(a, b, id);
    if (b.nome === idaNome) return confrontoDuploMandoEsquerda(b, a, id);
    return confrontoDuploMandoEsquerda(a, b, id);
  });

  const wQf = qf.map((m) =>
    m.sideA && m.sideB ? vencedorConfrontoDuplo(m, placares) : null
  );

  // Semis: Estudiantes × Flamengo (ida Estudiantes); Fluminense × Palmeiras (ida Flu)
  // Ordem visual: sf-0 = vencedores qf0×qf1; sf-1 = vencedores qf3×qf2 (Flu × Palm)
  const sfSpecs = [
    { id: "sf-0", ia: 0, ib: 1, idaNome: "Estudiantes" },
    { id: "sf-1", ia: 3, ib: 2, idaNome: "Fluminense" },
  ];

  const sf = sfSpecs.map(({ id, ia, ib, idaNome }) => {
    const wa = wQf[ia];
    const wb = wQf[ib];
    const bad = wa === "tie" || wb === "tie";
    if (!wa || !wb || bad) return placeholderDuplo(id, bad);

    const a = stripPos(wa);
    const b = stripPos(wb);
    if (a.nome === idaNome) return confrontoDuploMandoEsquerda(a, b, id);
    if (b.nome === idaNome) return confrontoDuploMandoEsquerda(b, a, id);
    return confrontoDuploMandoEsquerda(a, b, id);
  });

  const wSf = sf.map((m) =>
    m.sideA && m.sideB ? vencedorConfrontoDuplo(m, placares) : null
  );

  const wa = wSf[0];
  const wb = wSf[1];
  const badF = wa === "tie" || wb === "tie";
  const f = [
    {
      id: "f-0",
      tipo: "unica",
      sideA: wa && wa !== "tie" ? stripPos(wa) : null,
      sideB: wb && wb !== "tie" ? stripPos(wb) : null,
      pendingTie: badF,
    },
  ];

  return { r16: r16Seed, qf, sf, f };
}
