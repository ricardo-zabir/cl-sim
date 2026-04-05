import {
  confrontoDuploMandoEsquerda,
  stripPos,
  vencedorConfrontoDuplo,
} from "./knockoutLogic";

/** Par [mandante ida, visitante ida] — primeiro jogo na casa do primeiro. */
export const CONFRONTOS_QUARTAS_UCL = [
  ["PSG", "Liverpool"],
  ["Real Madrid", "Bayern"],
  ["Barcelona", "Atlético de Madrid"],
  ["Sporting CP", "Arsenal"],
];

function timeUCL(nome, slot) {
  return {
    nome,
    grupo: `U${slot}`,
    pos: 1,
    grpPts: 0,
    grpSG: 0,
    grpGP: 0,
    grpGC: 0,
  };
}

export function montarQuartasChampionsLeague() {
  return CONFRONTOS_QUARTAS_UCL.map(([nomeA, nomeB], index) => {
    const tA = timeUCL(nomeA, index * 2);
    const tB = timeUCL(nomeB, index * 2 + 1);
    return confrontoDuploMandoEsquerda(tA, tB, `ucl-qf-${index}`);
  });
}

/**
 * Chave completo: quartas fixas; semis e final derivados dos placares (como o mata-mata da Libertadores).
 */
export function montarChaveamentoChampionsLeague(quartasTies, placares) {
  const wQf = quartasTies.map((t) => vencedorConfrontoDuplo(t, placares));

  const sf = [];
  for (let i = 0; i < 2; i++) {
    const wa = wQf[i * 2];
    const wb = wQf[i * 2 + 1];
    const bad = wa === "tie" || wb === "tie";
    if (!wa || !wb || bad) {
      sf.push({
        id: `ucl-sf-${i}`,
        tipo: "duas",
        sideA: null,
        sideB: null,
        ida: null,
        volta: null,
        pendingTie: bad,
      });
    } else {
      sf.push(confrontoDuploMandoEsquerda(wa, wb, `ucl-sf-${i}`));
    }
  }

  const wSf = sf.map((m) =>
    m.sideA && m.sideB ? vencedorConfrontoDuplo(m, placares) : null
  );
  const wa = wSf[0];
  const wb = wSf[1];
  const badF = wa === "tie" || wb === "tie";
  const f = [
    {
      id: "ucl-f-0",
      tipo: "unica",
      sideA: wa && wa !== "tie" ? stripPos(wa) : null,
      sideB: wb && wb !== "tie" ? stripPos(wb) : null,
      pendingTie: badF,
    },
  ];

  return { qf: quartasTies, sf, f };
}
