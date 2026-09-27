import { stripPos, vencedorConfrontoDuplo } from "./knockoutLogic";

function timeCopa(nome, slot) {
  return {
    nome,
    grupo: `B${slot}`,
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

/** [sideA, sideB, idaMandanteEhSideA] — oitavas 2025. */
export const CONFRONTOS_OITAVAS_COPA = [
  ["Vasco", "Fluminense", true],
  ["Internacional", "Corinthians", true],
  ["Mirassol", "Grêmio", true],
  ["Athletico-PR", "Vitória", true],
  ["Atlético-MG", "Juventude", true],
  ["Santos", "Remo", true],
  ["Chapecoense", "Cruzeiro", true],
  ["Palmeiras", "Fortaleza", true],
];

/**
 * Emparelhamento das quartas: índices das oitavas + se o 1º manda na ida.
 * Ordem: Inter×Gre, Cru×CAM, Pal×San, Vas×Vit → semis Gre×CAM e Pal×Vas.
 */
const QUARTAS_PARES = [
  { i: 1, j: 2, idaPrimeiro: true },
  { i: 6, j: 4, idaPrimeiro: true },
  { i: 7, j: 5, idaPrimeiro: true },
  { i: 0, j: 3, idaPrimeiro: true },
];

export function montarOitavasCopaBrasil() {
  return CONFRONTOS_OITAVAS_COPA.map(([nomeA, nomeB, idaMandanteEhSideA], index) =>
    confrontoDuplo({
      sideA: timeCopa(nomeA, index * 2),
      sideB: timeCopa(nomeB, index * 2 + 1),
      id: `cdb-r16-${index}`,
      idaMandanteEhSideA,
    })
  );
}

/**
 * Oitavas fixas; quartas e semis derivadas dos placares.
 * Semis: vencedor qf0 × qf1; vencedor qf2 × qf3. Final em jogo único.
 */
export function montarChaveamentoCopaBrasil(oitavasTies, placares) {
  const w16 = oitavasTies.map((t) => vencedorConfrontoDuplo(t, placares));

  const qf = QUARTAS_PARES.map(({ i, j, idaPrimeiro }, index) => {
    const wa = w16[i];
    const wb = w16[j];
    const bad = wa === "tie" || wb === "tie";
    if (!wa || !wb || bad) {
      return {
        id: `cdb-qf-${index}`,
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
      id: `cdb-qf-${index}`,
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
        id: `cdb-sf-${i}`,
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
          id: `cdb-sf-${i}`,
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
      id: "cdb-f-0",
      tipo: "unica",
      sideA: wa && wa !== "tie" ? stripPos(wa) : null,
      sideB: wb && wb !== "tie" ? stripPos(wb) : null,
      pendingTie: badF,
    },
  ];

  return { r16: oitavasTies, qf, sf, f };
}
