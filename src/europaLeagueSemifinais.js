import {
  confrontoDuploMandoEsquerda,
  stripPos,
  vencedorConfrontoDuplo,
} from "./knockoutLogic";

/** Par [mandante ida, visitante ida] — primeiro jogo na casa do primeiro. */
export const CONFRONTOS_SEMIFINAIS_UEL = [
  ["Braga", "Freiburg"],
  ["Forest", "Aston Villa"],
];

function timeUEL(nome, slot) {
  return {
    nome,
    grupo: `E${slot}`,
    pos: 1,
    grpPts: 0,
    grpSG: 0,
    grpGP: 0,
    grpGC: 0,
  };
}

export function montarSemifinaisEuropaLeague() {
  return CONFRONTOS_SEMIFINAIS_UEL.map(([nomeA, nomeB], index) => {
    const tA = timeUEL(nomeA, index * 2);
    const tB = timeUEL(nomeB, index * 2 + 1);
    return confrontoDuploMandoEsquerda(tA, tB, `uel-sf-${index}`);
  });
}

/** Chave com semis fixas e final derivada dos placares. */
export function montarChaveamentoEuropaLeague(semifinaisTies, placares) {
  const wSf = semifinaisTies.map((t) => vencedorConfrontoDuplo(t, placares));
  const wa = wSf[0];
  const wb = wSf[1];
  const badF = wa === "tie" || wb === "tie";

  const f = [
    {
      id: "uel-f-0",
      tipo: "unica",
      sideA: wa && wa !== "tie" ? stripPos(wa) : null,
      sideB: wb && wb !== "tie" ? stripPos(wb) : null,
      pendingTie: badF,
    },
  ];

  return { sf: semifinaisTies, f };
}
