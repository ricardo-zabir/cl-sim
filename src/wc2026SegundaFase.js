import { WC2026_TERCEIROS_POR_ELIM } from "./wc2026TerceirosPorElim";

/** Ordem FIFA (cabeçalho do terceiros.txt): 1A…1L com buracos → A,B,D,E,G,I,K,L; o 3º em cada coluna vem do array do cenário. */
export const WC2026_COLUNAS_1_VS_3 = ["A", "B", "D", "E", "G", "I", "K", "L"];

const GRUPOS_TODOS = "ABCDEFGHIJKL".split("");

/**
 * @param {Array<{ grupo: string }>} top8Terceiros
 * @returns {string} chave dos 4 grupos eliminados (letras ordenadas)
 */
export function chaveEliminadosTerceiros(top8Terceiros) {
  const qual = new Set(top8Terceiros.map((x) => x.grupo));
  return GRUPOS_TODOS.filter((g) => !qual.has(g))
    .sort()
    .join("");
}

/**
 * @param {Record<string, Array<{ time: string }>>} tabelaPorGrupoLetra — ex.: { A: [1º,2º,3º,4º], ... }
 * @param {ReturnType<import('./wc2026MelhoresTerceiros').calcularOitoMelhoresTerceiros>} melhoresTerceiros
 */
export function montarSegundaFase16(tabelaPorGrupoLetra, melhoresTerceiros) {
  const top8 = melhoresTerceiros.top8;
  const elimKey = chaveEliminadosTerceiros(top8);
  const terceirosCol = WC2026_TERCEIROS_POR_ELIM[elimKey];

  if (!terceirosCol) {
    return {
      ok: false,
      erro: "Combinação de terceiros não encontrada na tabela FIFA.",
      partidas: [],
      elimKey,
    };
  }

  /** @type {Record<string, string>} */
  const nomeTerceiro = {};
  for (const x of top8) {
    nomeTerceiro[x.grupo] = x.time;
  }

  const time = (letra, pos) =>
    tabelaPorGrupoLetra[letra]?.[pos - 1]?.time ?? null;

  const idxCol = (g) => WC2026_COLUNAS_1_VS_3.indexOf(g);

  /** 1º coluna X vs 3º do grupo indicado na tabela (mesma coluna). */
  const umVsTres = [
    { id: 1, g1: "E" },
    { id: 2, g1: "I" },
    { id: 7, g1: "D" },
    { id: 8, g1: "G" },
    { id: 11, g1: "A" },
    { id: 12, g1: "L" },
    { id: 15, g1: "B" },
    { id: 16, g1: "K" },
  ];

  /** Confrontos só entre 1º/2º colocados (sem terceiros). */
  const fixos = [
    { id: 3, rotA: "2º A", rotB: "2º B", gA: "A", pA: 2, gB: "B", pB: 2 },
    { id: 4, rotA: "1º F", rotB: "2º C", gA: "F", pA: 1, gB: "C", pB: 2 },
    { id: 5, rotA: "2º K", rotB: "2º L", gA: "K", pA: 2, gB: "L", pB: 2 },
    { id: 6, rotA: "1º H", rotB: "2º J", gA: "H", pA: 1, gB: "J", pB: 2 },
    { id: 9, rotA: "1º C", rotB: "2º F", gA: "C", pA: 1, gB: "F", pB: 2 },
    { id: 10, rotA: "2º E", rotB: "2º I", gA: "E", pA: 2, gB: "I", pB: 2 },
    { id: 13, rotA: "1º J", rotB: "2º H", gA: "J", pA: 1, gB: "H", pB: 2 },
    { id: 14, rotA: "2º D", rotB: "2º G", gA: "D", pA: 2, gB: "G", pB: 2 },
  ];

  const partidas = [];

  for (const j of umVsTres) {
    const col = idxCol(j.g1);
    const g3 = terceirosCol[col];
    partidas.push({
      id: j.id,
      tipo: "1x3",
      rotuloA: `1º ${j.g1}`,
      rotuloB: `3º ${g3}`,
      nomeA: time(j.g1, 1),
      nomeB: nomeTerceiro[g3] ?? null,
    });
  }

  for (const j of fixos) {
    partidas.push({
      id: j.id,
      tipo: "fixo",
      rotuloA: j.rotA,
      rotuloB: j.rotB,
      nomeA: time(j.gA, j.pA),
      nomeB: time(j.gB, j.pB),
    });
  }

  partidas.sort((a, b) => a.id - b.id);

  return {
    ok: true,
    partidas,
    elimKey,
    terceirosCol,
  };
}
