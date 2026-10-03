import { vencedorConfrontoDuplo } from "./knockoutLogic";
import { JOGOS_UCL_LIGA } from "./uclLiga2627";

function timeDe(row, pos) {
  if (!row) return null;
  return {
    nome: row.nome,
    grupo: "UCL",
    pos,
    grpPts: row.pts ?? 0,
    grpSG: row.sg ?? 0,
    grpGP: row.gp ?? 0,
    grpGC: row.gc ?? 0,
  };
}

/** Mantém a posição da fase de liga (manda na volta quem terminou à frente). */
function keepTeam(t) {
  if (!t) return null;
  return {
    nome: t.nome,
    grupo: t.grupo,
    pos: t.pos,
    grpPts: t.grpPts ?? 0,
    grpSG: t.grpSG ?? 0,
    grpGP: t.grpGP ?? 0,
    grpGC: t.grpGC ?? 0,
  };
}

/**
 * Ida/volta: pior classificado da liga manda na ida (linha de cima);
 * melhor (pos menor) manda na volta (linha de baixo). Final é jogo único.
 */
export function confrontoDuplo({ sideA, sideB, id }) {
  const A = keepTeam(sideA);
  const B = keepTeam(sideB);
  const posA = A.pos ?? Number.POSITIVE_INFINITY;
  const posB = B.pos ?? Number.POSITIVE_INFINITY;
  const aMelhor = posA <= posB;
  const melhor = aMelhor ? A : B;
  const pior = aMelhor ? B : A;
  return {
    id,
    tipo: "duas",
    sideA: pior,
    sideB: melhor,
    ida: { mandante: pior, visitante: melhor },
    volta: { mandante: melhor, visitante: pior },
  };
}

export function faseLigaCompleta(placares) {
  return JOGOS_UCL_LIGA.every((j) => {
    const p = placares[j.id];
    return p && p.casa != null && p.fora != null;
  });
}

/** Pares de posição (1-based) usados no sorteio do chaveamento. */
export const PARES_POSICAO_UCL = [
  [1, 2],
  [3, 4],
  [5, 6],
  [7, 8],
  [9, 10],
  [11, 12],
  [13, 14],
  [15, 16],
  [17, 18],
  [19, 20],
  [21, 22],
  [23, 24],
];

/**
 * Slots de playoff: uns (17–24) × seed (9–16).
 * Índices 0–3 = chave esquerda; 4–7 = chave direita (mesmo padrão).
 */
const PO_SLOTS = [
  { uns: [21, 22], seed: [11, 12] },
  { uns: [19, 20], seed: [13, 14] },
  { uns: [23, 24], seed: [9, 10] },
  { uns: [17, 18], seed: [15, 16] },
];

/** Seeds das oitavas vs vencedores dos playoffs (ordem dos PO). */
const R16_SEED_SLOTS = [
  [5, 6],
  [3, 4],
  [7, 8],
  [1, 2],
];

function shuffleDois(a, b) {
  return Math.random() < 0.5 ? [a, b] : [b, a];
}

function placeholderTie(id) {
  return {
    id,
    tipo: "duas",
    sideA: null,
    sideB: null,
    ida: null,
    volta: null,
    pendingTie: false,
    provisional: null,
  };
}

/**
 * Estado provisório (antes do sorteio): 4 blocos (não 8).
 * Cada bloco vira 2 confrontos no sorteio (chave esq/dir); os 2 vencedores
 * enfrentam o par das oitavas (faces).
 */
export function montarSlotsProvisoriosUcl(tabela) {
  const t = (pos) => timeDe(tabela[pos - 1], pos);

  const po = PO_SLOTS.map((slot, i) => {
    const [r16a, r16b] = R16_SEED_SLOTS[i];
    return {
      id: `ucl-po-pair-${i}`,
      provisional: {
        uns: [t(slot.uns[0]), t(slot.uns[1])],
        seed: [t(slot.seed[0]), t(slot.seed[1])],
        faces: [t(r16a), t(r16b)],
      },
    };
  });

  return { po };
}

/**
 * Sorteia qual time de cada par (1/2, 3/4, …) vai para a chave esquerda/direita.
 */
export function sortearChaveUcl(tabela) {
  const t = (pos) => timeDe(tabela[pos - 1], pos);
  const sides = {};
  for (const [a, b] of PARES_POSICAO_UCL) {
    const [left, right] = shuffleDois(t(a), t(b));
    sides[`${a}-${b}`] = { left, right };
  }

  const pick = (pair, half) => {
    const key = `${pair[0]}-${pair[1]}`;
    return half === 0 ? sides[key].left : sides[key].right;
  };

  const po = [];
  for (let half = 0; half < 2; half++) {
    for (let i = 0; i < PO_SLOTS.length; i++) {
      const slot = PO_SLOTS[i];
      const uns = pick(slot.uns, half);
      const seed = pick(slot.seed, half);
      po.push(
        confrontoDuplo({
          sideA: uns,
          sideB: seed,
          id: `ucl-po-${half * 4 + i}`,
        })
      );
    }
  }

  const r16Seeds = [];
  for (let half = 0; half < 2; half++) {
    for (let i = 0; i < R16_SEED_SLOTS.length; i++) {
      r16Seeds.push(pick(R16_SEED_SLOTS[i], half));
    }
  }

  return { po, r16Seeds, sides };
}

/**
 * Monta o chaveamento a partir do sorteio + placares KO.
 * Sem sorteio: playoffs provisórios; o resto aguarda.
 */
export function montarChaveamentoUcl(sorteio, placares) {
  if (!sorteio) {
    return {
      po: Array.from({ length: 8 }, (_, i) => placeholderTie(`ucl-po-${i}`)),
      r16: Array.from({ length: 8 }, (_, i) => placeholderTie(`ucl-r16-${i}`)),
      qf: Array.from({ length: 4 }, (_, i) => placeholderTie(`ucl-qf-${i}`)),
      sf: Array.from({ length: 2 }, (_, i) => placeholderTie(`ucl-sf-${i}`)),
      f: [
        {
          id: "ucl-f-0",
          tipo: "unica",
          sideA: null,
          sideB: null,
          pendingTie: false,
        },
      ],
      sorteado: false,
    };
  }

  const po = sorteio.po.map((tie) =>
    tie?.sideA && tie?.sideB
      ? confrontoDuplo({ sideA: tie.sideA, sideB: tie.sideB, id: tie.id })
      : { ...tie }
  );

  const wPo = po.map((m) =>
    m.sideA && m.sideB ? vencedorConfrontoDuplo(m, placares) : null
  );

  const r16 = sorteio.r16Seeds.map((seed, i) => {
    const wa = wPo[i];
    const bad = wa === "tie";
    if (!wa || bad) {
      return {
        id: `ucl-r16-${i}`,
        tipo: "duas",
        sideA: null,
        sideB: seed ? keepTeam(seed) : null,
        ida: null,
        volta: null,
        pendingTie: bad,
        waitingPo: true,
        seedSide: seed ? keepTeam(seed) : null,
      };
    }
    return confrontoDuplo({
      sideA: wa,
      sideB: seed,
      id: `ucl-r16-${i}`,
    });
  });

  const w16 = r16.map((m) =>
    m.sideA && m.sideB && m.ida ? vencedorConfrontoDuplo(m, placares) : null
  );

  const qf = [];
  for (let i = 0; i < 4; i++) {
    const wa = w16[i * 2];
    const wb = w16[i * 2 + 1];
    const bad = wa === "tie" || wb === "tie";
    if (!wa || !wb || bad) {
      qf.push({
        id: `ucl-qf-${i}`,
        tipo: "duas",
        sideA: null,
        sideB: null,
        ida: null,
        volta: null,
        pendingTie: bad,
      });
    } else {
      qf.push(
        confrontoDuplo({
          sideA: wa,
          sideB: wb,
          id: `ucl-qf-${i}`,
        })
      );
    }
  }

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
        id: `ucl-sf-${i}`,
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
          id: `ucl-sf-${i}`,
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

  return {
    po,
    r16,
    qf,
    sf,
    f: [
      {
        id: "ucl-f-0",
        tipo: "unica",
        sideA: wa && wa !== "tie" ? keepTeam(wa) : null,
        sideB: wb && wb !== "tie" ? keepTeam(wb) : null,
        pendingTie: badF,
      },
    ],
    sorteado: true,
  };
}

/** Play-offs concluídos (8 vencedores definidos). */
export function playoffsCompletos(sorteio, placares) {
  if (!sorteio?.po?.length) return false;
  return sorteio.po.every((tie) => {
    const w = vencedorConfrontoDuplo(tie, placares);
    return w != null && w !== "tie";
  });
}
