import { placarKo } from "./knockoutLogic";

/** @typedef {{ nome: string }} LadoKO */

/**
 * Jogo único: placares[id] = { a: gols time esquerdo (sideA), b: gols time direito }.
 * Empate no tempo: `${id}-pen` com { a, b } nos pênaltis.
 */
export function vencedorJogoUnico(match, placares) {
  if (!match?.sideA || !match?.sideB) return null;
  const p = placarKo(placares, match.id);
  if (p.a == null || p.b == null) return null;
  if (p.a !== p.b) return p.a > p.b ? match.sideA : match.sideB;

  const pen = placarKo(placares, `${match.id}-pen`);
  if (pen.a == null || pen.b == null) return null;
  if (pen.a === pen.b) return "tie";
  return pen.a > pen.b ? match.sideA : match.sideB;
}

export function perdedorJogoUnico(match, placares) {
  const w = vencedorJogoUnico(match, placares);
  if (!w || w === "tie") return null;
  return w.nome === match.sideA.nome ? match.sideB : match.sideA;
}

/**
 * @param {Array<{ id: string, sideA: LadoKO, sideB: LadoKO }>} r32 — 16 jogos, ordem 1–16 (índices 0+1, 2+3, …).
 */
export function montarChaveamentoWc(r32, placares) {
  const w32 = r32.map((m) => vencedorJogoUnico(m, placares));

  const r16 = [];
  for (let i = 0; i < 8; i++) {
    const wa = w32[i * 2];
    const wb = w32[i * 2 + 1];
    const badTie = wa === "tie" || wb === "tie";
    const missing = !wa || !wb || badTie;
    r16.push({
      id: `wc-r16-${i}`,
      sideA: missing ? null : wa,
      sideB: missing ? null : wb,
      pendingTie: badTie,
    });
  }

  const w16 = r16.map((m) =>
    m.sideA && m.sideB && !m.pendingTie
      ? vencedorJogoUnico(
          { id: m.id, sideA: m.sideA, sideB: m.sideB },
          placares
        )
      : null
  );

  const qf = [];
  for (let i = 0; i < 4; i++) {
    const wa = w16[i * 2];
    const wb = w16[i * 2 + 1];
    const badTie = wa === "tie" || wb === "tie";
    const missing = !wa || !wb || badTie;
    qf.push({
      id: `wc-qf-${i}`,
      sideA: missing ? null : wa,
      sideB: missing ? null : wb,
      pendingTie: badTie,
    });
  }

  const wQf = qf.map((m) =>
    m.sideA && m.sideB && !m.pendingTie
      ? vencedorJogoUnico(
          { id: m.id, sideA: m.sideA, sideB: m.sideB },
          placares
        )
      : null
  );

  const sf = [];
  for (let i = 0; i < 2; i++) {
    const wa = wQf[i * 2];
    const wb = wQf[i * 2 + 1];
    const badTie = wa === "tie" || wb === "tie";
    const missing = !wa || !wb || badTie;
    sf.push({
      id: `wc-sf-${i}`,
      sideA: missing ? null : wa,
      sideB: missing ? null : wb,
      pendingTie: badTie,
    });
  }

  const wSf = sf.map((m) =>
    m.sideA && m.sideB && !m.pendingTie
      ? vencedorJogoUnico(
          { id: m.id, sideA: m.sideA, sideB: m.sideB },
          placares
        )
      : null
  );

  const l0 = sf[0]?.sideA && sf[0]?.sideB && !sf[0].pendingTie
    ? perdedorJogoUnico(
        { id: sf[0].id, sideA: sf[0].sideA, sideB: sf[0].sideB },
        placares
      )
    : null;
  const l1 = sf[1]?.sideA && sf[1]?.sideB && !sf[1].pendingTie
    ? perdedorJogoUnico(
        { id: sf[1].id, sideA: sf[1].sideA, sideB: sf[1].sideB },
        placares
      )
    : null;

  const thirdReady = l0 && l1;
  const thirdPlace = {
    id: "wc-tp-0",
    sideA: thirdReady ? l0 : null,
    sideB: thirdReady ? l1 : null,
    pendingTie: false,
  };

  const badF = wSf[0] === "tie" || wSf[1] === "tie";
  const finalMatch = {
    id: "wc-f-0",
    sideA: wSf[0] && wSf[0] !== "tie" ? wSf[0] : null,
    sideB: wSf[1] && wSf[1] !== "tie" ? wSf[1] : null,
    pendingTie: badF,
  };

  return {
    r32,
    r16,
    qf,
    sf,
    thirdPlace,
    final: finalMatch,
  };
}
