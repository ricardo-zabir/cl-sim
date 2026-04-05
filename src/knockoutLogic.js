/** @typedef {{ nome: string, grupo: string, pos?: number, grpPts: number, grpSG: number, grpGP: number, grpGC: number }} TimeKO */

export function stripPos(t) {
  return {
    nome: t.nome,
    grupo: t.grupo,
    grpPts: t.grpPts,
    grpSG: t.grpSG,
    grpGP: t.grpGP,
    grpGC: t.grpGC,
  };
}

export function embaralhar(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Melhor campanha na fase de grupos (para mando na volta de QF/SF). */
export function melhorCampanhaGrupos(a, b) {
  if (a.grpPts !== b.grpPts) return a.grpPts > b.grpPts ? a : b;
  if (a.grpSG !== b.grpSG) return a.grpSG > b.grpSG ? a : b;
  if (a.grpGP !== b.grpGP) return a.grpGP > b.grpGP ? a : b;
  if (a.grpGC !== b.grpGC) return a.grpGC < b.grpGC ? a : b;
  return a.nome <= b.nome ? a : b;
}

export function definirMandoIdaVolta(wa, wb) {
  const m = melhorCampanhaGrupos(wa, wb);
  const p = m.nome === wa.nome && m.grupo === wa.grupo ? wb : wa;
  return {
    ida: { mandante: p, visitante: m },
    volta: { mandante: m, visitante: p },
  };
}

/**
 * Cada 2º colocado sorteado contra um 1º de outro grupo (backtracking).
 */
export function emparelharPrimeirosContraSegundos(primeiros, segundos) {
  const winners = [...primeiros];
  const runners = [...segundos];

  function backtrack(i, usados, pares) {
    if (i === runners.length) return pares;
    const r = runners[i];
    const candidatos = embaralhar(
      winners.filter((w) => w.grupo !== r.grupo && !usados.has(w.nome))
    );
    for (const w of candidatos) {
      const next = new Set(usados);
      next.add(w.nome);
      const res = backtrack(i + 1, next, [...pares, { primeiro: w, segundo: r }]);
      if (res) return res;
    }
    return null;
  }

  return backtrack(0, new Set(), []);
}

export function sortearOitavas(classificados) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const primeiros = embaralhar(classificados.filter((c) => c.pos === 1));
    const segundos = embaralhar(classificados.filter((c) => c.pos === 2));
    const pares = emparelharPrimeirosContraSegundos(primeiros, segundos);
    if (!pares) continue;

    const r16 = pares.map((p, i) => {
      const primeiro = p.primeiro;
      const segundo = p.segundo;
      return {
        id: `r16-${i}`,
        tipo: "duas",
        sideA: primeiro,
        sideB: segundo,
        ida: { mandante: segundo, visitante: primeiro },
        volta: { mandante: primeiro, visitante: segundo },
      };
    });
    return { r16 };
  }
  return null;
}

/** Sorteia pares ida/volta entre `times` (quantidade par). Mando da volta aleatório entre os dois. */
export function sortearConfrontosIdaVolta(times, idPrefix) {
  if (!times || times.length < 2 || times.length % 2 !== 0) return [];
  const s = embaralhar(times.map(stripPos));
  const ties = [];
  for (let i = 0; i < s.length / 2; i++) {
    const A = {
      ...s[i * 2],
      grpPts: 0,
      grpSG: 0,
      grpGP: 0,
      grpGC: 0,
    };
    const B = {
      ...s[i * 2 + 1],
      grpPts: 0,
      grpSG: 0,
      grpGP: 0,
      grpGC: 0,
    };
    const aHostsVolta = Math.random() < 0.5;
    ties.push({
      id: `${idPrefix}-${i}`,
      tipo: "duas",
      sideA: A,
      sideB: B,
      ida: aHostsVolta
        ? { mandante: B, visitante: A }
        : { mandante: A, visitante: B },
      volta: aHostsVolta
        ? { mandante: A, visitante: B }
        : { mandante: B, visitante: A },
    });
  }
  return ties;
}

/** Um confronto de ida e volta entre dois classificados (mando da volta aleatório). */
export function confrontoDuploEntre(wa, wb, id) {
  const A = { ...stripPos(wa), grpPts: 0, grpSG: 0, grpGP: 0, grpGC: 0 };
  const B = { ...stripPos(wb), grpPts: 0, grpSG: 0, grpGP: 0, grpGC: 0 };
  const aHostsVolta = Math.random() < 0.5;
  return {
    id,
    tipo: "duas",
    sideA: A,
    sideB: B,
    ida: aHostsVolta
      ? { mandante: B, visitante: A }
      : { mandante: A, visitante: B },
    volta: aHostsVolta
      ? { mandante: A, visitante: B }
      : { mandante: B, visitante: A },
  };
}

/** Ida na casa do time da esquerda (`sideA`); volta na casa do `sideB`. */
export function confrontoDuploMandoEsquerda(wa, wb, id) {
  const A = { ...stripPos(wa), grpPts: 0, grpSG: 0, grpGP: 0, grpGC: 0 };
  const B = { ...stripPos(wb), grpPts: 0, grpSG: 0, grpGP: 0, grpGC: 0 };
  return {
    id,
    tipo: "duas",
    sideA: A,
    sideB: B,
    ida: { mandante: A, visitante: B },
    volta: { mandante: B, visitante: A },
  };
}

export function placarKo(placares, id) {
  return placares[id] || {};
}

function golsEquipeNoJogo(placar, mandante, visitante, equipeNome) {
  if (!placar || placar.casa == null || placar.fora == null) return null;
  if (equipeNome === mandante.nome) return placar.casa;
  if (equipeNome === visitante.nome) return placar.fora;
  return null;
}

/**
 * @returns {null | TimeKO | 'tie'}
 */
export function vencedorConfrontoDuplo(tie, placares) {
  const idaP = placarKo(placares, `${tie.id}-ida`);
  const volP = placarKo(placares, `${tie.id}-volta`);
  const { mandante: idaM, visitante: idaV } = tie.ida;
  const { mandante: volM, visitante: volV } = tie.volta;

  const gIdaA = golsEquipeNoJogo(idaP, idaM, idaV, tie.sideA.nome);
  const gIdaB = golsEquipeNoJogo(idaP, idaM, idaV, tie.sideB.nome);
  const gVolA = golsEquipeNoJogo(volP, volM, volV, tie.sideA.nome);
  const gVolB = golsEquipeNoJogo(volP, volM, volV, tie.sideB.nome);

  if (gIdaA == null || gIdaB == null || gVolA == null || gVolB == null) {
    return null;
  }

  const agA = gIdaA + gVolA;
  const agB = gIdaB + gVolB;

  if (agA > agB) return tie.sideA;
  if (agB > agA) return tie.sideB;

  const pen = placarKo(placares, `${tie.id}-pen`);
  if (pen.a == null || pen.b == null) return null;
  if (pen.a === pen.b) return "tie";
  return pen.a > pen.b ? tie.sideA : tie.sideB;
}

export function agregadoConfronto(tie, placares) {
  const idaP = placarKo(placares, `${tie.id}-ida`);
  const volP = placarKo(placares, `${tie.id}-volta`);
  const { mandante: idaM, visitante: idaV } = tie.ida;
  const { mandante: volM, visitante: volV } = tie.volta;

  const gIdaA = golsEquipeNoJogo(idaP, idaM, idaV, tie.sideA.nome);
  const gIdaB = golsEquipeNoJogo(idaP, idaM, idaV, tie.sideB.nome);
  const gVolA = golsEquipeNoJogo(volP, volM, volV, tie.sideA.nome);
  const gVolB = golsEquipeNoJogo(volP, volM, volV, tie.sideB.nome);

  if (gIdaA == null || gIdaB == null || gVolA == null || gVolB == null) {
    return { completo: false, agA: null, agB: null, empatado: false };
  }

  const agA = gIdaA + gVolA;
  const agB = gIdaB + gVolB;
  return {
    completo: true,
    agA,
    agB,
    empatado: agA === agB,
  };
}

/** Final jogo único: placar { a: gols sideA, b: gols sideB } */
export function vencedorFinal(tie, placares) {
  const p = placarKo(placares, tie.id);
  if (p.a == null || p.b == null) return null;
  if (p.a !== p.b) return p.a > p.b ? tie.sideA : tie.sideB;

  // Se empatar no tempo normal, decide nos pênaltis.
  const pen = placarKo(placares, `${tie.id}-pen`);
  if (pen.a == null || pen.b == null) return null;
  if (pen.a === pen.b) return "tie";
  return pen.a > pen.b ? tie.sideA : tie.sideB;
}

export function montarChaveamento(sorteio, placares) {
  if (!sorteio) return { r16: [], qf: [], sf: [], f: [] };

  const { r16: r16Seed } = sorteio;
  const w16 = r16Seed.map((m) => vencedorConfrontoDuplo(m, placares));

  const qf = [];
  for (let i = 0; i < 4; i++) {
    const wa = w16[i * 2];
    const wb = w16[i * 2 + 1];
    const bad = wa === "tie" || wb === "tie";
    if (!wa || !wb || bad) {
      qf.push({
        id: `qf-${i}`,
        tipo: "duas",
        sideA: null,
        sideB: null,
        ida: null,
        volta: null,
        pendingTie: bad,
      });
      continue;
    }
    const a = stripPos(wa);
    const b = stripPos(wb);
    const { ida, volta } = definirMandoIdaVolta(a, b);
    qf.push({
      id: `qf-${i}`,
      tipo: "duas",
      sideA: a,
      sideB: b,
      ida,
      volta,
      pendingTie: false,
    });
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
        id: `sf-${i}`,
        tipo: "duas",
        sideA: null,
        sideB: null,
        ida: null,
        volta: null,
        pendingTie: bad,
      });
      continue;
    }
    const a = stripPos(wa);
    const b = stripPos(wb);
    const { ida, volta } = definirMandoIdaVolta(a, b);
    sf.push({
      id: `sf-${i}`,
      tipo: "duas",
      sideA: a,
      sideB: b,
      ida,
      volta,
      pendingTie: false,
    });
  }

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
