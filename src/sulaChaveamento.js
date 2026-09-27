import { stripPos, vencedorConfrontoDuplo } from "./knockoutLogic";

function timeSula(nome, slot) {
  return {
    nome,
    grupo: `S${slot}`,
    pos: 1,
    grpPts: 0,
    grpSG: 0,
    grpGP: 0,
    grpGC: 0,
  };
}

/**
 * Confronto ida/volta. `idaMandanteEhSideA`: true = sideA manda na ida.
 */
export function confrontoDuplo({ sideA, sideB, id, idaMandanteEhSideA = true }) {
  const A = stripPos(sideA);
  const B = stripPos(sideB);
  return {
    id,
    tipo: "duas",
    sideA: A,
    sideB: B,
    ida: idaMandanteEhSideA
      ? { mandante: A, visitante: B }
      : { mandante: B, visitante: A },
    volta: idaMandanteEhSideA
      ? { mandante: B, visitante: A }
      : { mandante: A, visitante: B },
  };
}

/** [sideA, sideB, idaMandanteEhSideA] — ordem das oitavas 2026. */
export const CONFRONTOS_OITAVAS_SULA = [
  ["Boca Juniors", "Recoleta", true],
  ["São Paulo", "Bolívar", false],
  ["Vasco", "Olimpia", true],
  ["Santa Fe", "River", true],
  ["Mineiro", "RB Bragantino", false],
  ["Santos", "Macará", true],
  ["Torque", "Tigre", false],
  ["Cienciano", "Botafogo", true],
];

/** Emparelhamento das quartas: índices das oitavas + se o 1º manda na ida. */
const QUARTAS_PARES = [
  { i: 0, j: 1, idaPrimeiro: true },
  { i: 2, j: 3, idaPrimeiro: false },
  { i: 5, j: 4, idaPrimeiro: true },
  { i: 7, j: 6, idaPrimeiro: true },
];

export function montarOitavasSulAmericana() {
  return CONFRONTOS_OITAVAS_SULA.map(([nomeA, nomeB, idaMandanteEhSideA], index) =>
    confrontoDuplo({
      sideA: timeSula(nomeA, index * 2),
      sideB: timeSula(nomeB, index * 2 + 1),
      id: `sula-r16-${index}`,
      idaMandanteEhSideA,
    })
  );
}

/**
 * Oitavas fixas; quartas e semis derivadas dos placares.
 * Semis: vencedor qf0 × qf1 (ida casa do 1º); vencedor qf2 × qf3 (ida casa do 1º).
 */
export function montarChaveamentoSulAmericana(oitavasTies, placares) {
  const w16 = oitavasTies.map((t) => vencedorConfrontoDuplo(t, placares));

  const qf = QUARTAS_PARES.map(({ i, j, idaPrimeiro }, index) => {
    const wa = w16[i];
    const wb = w16[j];
    const bad = wa === "tie" || wb === "tie";
    if (!wa || !wb || bad) {
      return {
        id: `sula-qf-${index}`,
        tipo: "duas",
        sideA: null,
        sideB: null,
        ida: null,
        volta: null,
        pendingTie: bad,
      };
    }
    return confrontoDuplo({
      sideA: wa,
      sideB: wb,
      id: `sula-qf-${index}`,
      idaMandanteEhSideA: idaPrimeiro,
    });
  });

  const wQf = qf.map((m) =>
    m.sideA && m.sideB ? vencedorConfrontoDuplo(m, placares) : null
  );

  const sf = [];
  for (let i = 0; i < 2; i++) {
    const wa = wQf[i * 2];
    const wb = wQf[i * 2 + 1];
    const bad = wa === "tie" || wb === "tie";
    if (!wa || !wb || bad) {
      sf.push({
        id: `sula-sf-${i}`,
        tipo: "duas",
        sideA: null,
        sideB: null,
        ida: null,
        volta: null,
        pendingTie: bad,
      });
    } else {
      sf.push(
        confrontoDuplo({
          sideA: wa,
          sideB: wb,
          id: `sula-sf-${i}`,
          idaMandanteEhSideA: true,
        })
      );
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
      id: "sula-f-0",
      tipo: "unica",
      sideA: wa && wa !== "tie" ? stripPos(wa) : null,
      sideB: wb && wb !== "tie" ? stripPos(wb) : null,
      pendingTie: badF,
    },
  ];

  return { r16: oitavasTies, qf, sf, f };
}
