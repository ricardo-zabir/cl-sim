/**
 * Champions League 2026/27 — fase de liga (36 times, 8 rodadas).
 */

export const TIMES_UCL_LIGA = [
  "PSG",
  "Bayern",
  "Barcelona",
  "Man United",
  "Como",
  "Sporting",
  "Stuttgart",
  "Man City",
  "Aston Villa",
  "Lens",
  "Betis",
  "Dortmund",
  "Liverpool",
  "Real Madrid",
  "Arsenal",
  "AEK Athens",
  "Roma",
  "Shakhtar Donetsk",
  "Fenerbahçe",
  "PSV",
  "Villarreal",
  "Club Brugge",
  "Lille",
  "Slavia Praha",
  "Atl. Madrid",
  "Inter",
  "LASK",
  "Napoli",
  "Galatasaray",
  "Viking",
  "Porto",
  "RB Leipzig",
  "Feyenoord",
  "Sabah",
  "Slovan Bratislava",
  "Bodø/Glimt",
];

/** Abreviações curtas para os cards de jogo. */
export const ABREV_UCL = {
  "PSG": "PSG",
  "Bayern": "BAY",
  Barcelona: "BAR",
  "Man United": "MUN",
  Como: "COM",
  "Sporting": "SPO",
  Stuttgart: "STU",
  "Man City": "MCI",
  "Aston Villa": "AVL",
  Lens: "LEN",
  "Betis": "BET",
  "Dortmund": "BVB",
  Liverpool: "LIV",
  "Real Madrid": "RMA",
  Arsenal: "ARS",
  "AEK Athens": "AEK",
  Roma: "ROM",
  "Shakhtar Donetsk": "SHK",
  "Fenerbahçe": "FEN",
  "PSV": "PSV",
  Villarreal: "VIL",
  "Club Brugge": "BRU",
  Lille: "LIL",
  "Slavia Praha": "SLA",
  "Atl. Madrid": "ATM",
  Inter: "INT",
  LASK: "LAS",
  Napoli: "NAP",
  Galatasaray: "GAL",
  Viking: "VIK",
  Porto: "POR",
  "RB Leipzig": "RBL",
  Feyenoord: "FEY",
  Sabah: "SAB",
  "Slovan Bratislava": "SLO",
  "Bodø/Glimt": "BOD",
};

export const TOTAL_RODADAS_UCL = 8;

/**
 * Confrontos: id estável `ucl-md{rodada}-{i}`.
 * MD1 com placares oficiais; demais rodadas editáveis.
 */
export const JOGOS_UCL_LIGA = [
  // ——— Rodada 1 ———
  { id: "ucl-md1-0", rodada: 1, casa: "AEK Athens", fora: "LASK" },
  { id: "ucl-md1-1", rodada: 1, casa: "Club Brugge", fora: "Aston Villa" },
  { id: "ucl-md1-2", rodada: 1, casa: "Dortmund", fora: "Villarreal" },
  { id: "ucl-md1-3", rodada: 1, casa: "Porto", fora: "Man City" },
  { id: "ucl-md1-4", rodada: 1, casa: "Lille", fora: "Betis" },
  { id: "ucl-md1-5", rodada: 1, casa: "Real Madrid", fora: "Inter" },
  { id: "ucl-md1-6", rodada: 1, casa: "Barcelona", fora: "Feyenoord" },
  { id: "ucl-md1-7", rodada: 1, casa: "Stuttgart", fora: "Viking" },
  { id: "ucl-md1-8", rodada: 1, casa: "Liverpool", fora: "Atl. Madrid" },
  { id: "ucl-md1-9", rodada: 1, casa: "PSG", fora: "Slovan Bratislava" },
  { id: "ucl-md1-10", rodada: 1, casa: "Sporting", fora: "Galatasaray" },
  { id: "ucl-md1-11", rodada: 1, casa: "Napoli", fora: "Arsenal" },
  { id: "ucl-md1-12", rodada: 1, casa: "Fenerbahçe", fora: "Roma" },
  { id: "ucl-md1-13", rodada: 1, casa: "PSV", fora: "Shakhtar Donetsk" },
  { id: "ucl-md1-14", rodada: 1, casa: "Como", fora: "RB Leipzig" },
  { id: "ucl-md1-15", rodada: 1, casa: "Bayern", fora: "Bodø/Glimt" },
  { id: "ucl-md1-16", rodada: 1, casa: "Man United", fora: "Sabah" },
  { id: "ucl-md1-17", rodada: 1, casa: "Slavia Praha", fora: "Lens" },

  // ——— Rodada 2 ———
  { id: "ucl-md2-0", rodada: 2, casa: "Lens", fora: "Sporting" },
  { id: "ucl-md2-1", rodada: 2, casa: "Sabah", fora: "Slavia Praha" },
  { id: "ucl-md2-2", rodada: 2, casa: "Arsenal", fora: "Lille" },
  { id: "ucl-md2-3", rodada: 2, casa: "Atl. Madrid", fora: "Man United" },
  { id: "ucl-md2-4", rodada: 2, casa: "Inter", fora: "Club Brugge" },
  { id: "ucl-md2-5", rodada: 2, casa: "Galatasaray", fora: "Barcelona" },
  { id: "ucl-md2-6", rodada: 2, casa: "RB Leipzig", fora: "PSV" },
  { id: "ucl-md2-7", rodada: 2, casa: "Viking", fora: "Bayern" },
  { id: "ucl-md2-8", rodada: 2, casa: "Villarreal", fora: "Napoli" },
  { id: "ucl-md2-9", rodada: 2, casa: "Feyenoord", fora: "Como" },
  { id: "ucl-md2-10", rodada: 2, casa: "LASK", fora: "Liverpool" },
  { id: "ucl-md2-11", rodada: 2, casa: "Roma", fora: "Real Madrid" },
  { id: "ucl-md2-12", rodada: 2, casa: "Aston Villa", fora: "Fenerbahçe" },
  { id: "ucl-md2-13", rodada: 2, casa: "Shakhtar Donetsk", fora: "AEK Athens" },
  { id: "ucl-md2-14", rodada: 2, casa: "Bodø/Glimt", fora: "Dortmund" },
  { id: "ucl-md2-15", rodada: 2, casa: "Man City", fora: "PSG" },
  { id: "ucl-md2-16", rodada: 2, casa: "Betis", fora: "Porto" },
  { id: "ucl-md2-17", rodada: 2, casa: "Slovan Bratislava", fora: "Stuttgart" },

  // ——— Rodada 3 ———
  { id: "ucl-md3-0", rodada: 3, casa: "Fenerbahçe", fora: "Slavia Praha" },
  { id: "ucl-md3-1", rodada: 3, casa: "Sabah", fora: "Dortmund" },
  { id: "ucl-md3-2", rodada: 3, casa: "Roma", fora: "Slovan Bratislava" },
  { id: "ucl-md3-3", rodada: 3, casa: "Porto", fora: "PSV" },
  { id: "ucl-md3-4", rodada: 3, casa: "Liverpool", fora: "Villarreal" },
  { id: "ucl-md3-5", rodada: 3, casa: "Man City", fora: "AEK Athens" },
  { id: "ucl-md3-6", rodada: 3, casa: "PSG", fora: "Barcelona" },
  { id: "ucl-md3-7", rodada: 3, casa: "Napoli", fora: "Bodø/Glimt" },
  { id: "ucl-md3-8", rodada: 3, casa: "Stuttgart", fora: "Atl. Madrid" },
  { id: "ucl-md3-9", rodada: 3, casa: "Como", fora: "Man United" },
  { id: "ucl-md3-10", rodada: 3, casa: "Lille", fora: "Galatasaray" },
  { id: "ucl-md3-11", rodada: 3, casa: "Aston Villa", fora: "Viking" },
  { id: "ucl-md3-12", rodada: 3, casa: "Club Brugge", fora: "Lens" },
  { id: "ucl-md3-13", rodada: 3, casa: "Bayern", fora: "Arsenal" },
  { id: "ucl-md3-14", rodada: 3, casa: "Inter", fora: "Shakhtar Donetsk" },
  { id: "ucl-md3-15", rodada: 3, casa: "Real Madrid", fora: "RB Leipzig" },
  { id: "ucl-md3-16", rodada: 3, casa: "Betis", fora: "Feyenoord" },
  { id: "ucl-md3-17", rodada: 3, casa: "Sporting", fora: "LASK" },

  // ——— Rodada 4 ———
  { id: "ucl-md4-0", rodada: 4, casa: "Shakhtar Donetsk", fora: "Sporting" },
  { id: "ucl-md4-1", rodada: 4, casa: "Galatasaray", fora: "Stuttgart" },
  { id: "ucl-md4-2", rodada: 4, casa: "Atl. Madrid", fora: "Bayern" },
  { id: "ucl-md4-3", rodada: 4, casa: "Barcelona", fora: "Aston Villa" },
  { id: "ucl-md4-4", rodada: 4, casa: "Feyenoord", fora: "Inter" },
  { id: "ucl-md4-5", rodada: 4, casa: "Bodø/Glimt", fora: "Lille" },
  { id: "ucl-md4-6", rodada: 4, casa: "LASK", fora: "Slovan Bratislava" },
  { id: "ucl-md4-7", rodada: 4, casa: "Man United", fora: "Roma" },
  { id: "ucl-md4-8", rodada: 4, casa: "Villarreal", fora: "PSG" },
  { id: "ucl-md4-9", rodada: 4, casa: "AEK Athens", fora: "Real Madrid" },
  { id: "ucl-md4-10", rodada: 4, casa: "Fenerbahçe", fora: "Liverpool" },
  { id: "ucl-md4-11", rodada: 4, casa: "Dortmund", fora: "Betis" },
  { id: "ucl-md4-12", rodada: 4, casa: "Porto", fora: "Napoli" },
  { id: "ucl-md4-13", rodada: 4, casa: "PSV", fora: "Club Brugge" },
  { id: "ucl-md4-14", rodada: 4, casa: "RB Leipzig", fora: "Man City" },
  { id: "ucl-md4-15", rodada: 4, casa: "Lens", fora: "Como" },
  { id: "ucl-md4-16", rodada: 4, casa: "Slavia Praha", fora: "Arsenal" },
  { id: "ucl-md4-17", rodada: 4, casa: "Viking", fora: "Sabah" },

  // ——— Rodada 5 ———
  { id: "ucl-md5-0", rodada: 5, casa: "Bodø/Glimt", fora: "LASK" },
  { id: "ucl-md5-1", rodada: 5, casa: "Galatasaray", fora: "Aston Villa" },
  { id: "ucl-md5-2", rodada: 5, casa: "Arsenal", fora: "Dortmund" },
  { id: "ucl-md5-3", rodada: 5, casa: "Como", fora: "AEK Athens" },
  { id: "ucl-md5-4", rodada: 5, casa: "Feyenoord", fora: "Porto" },
  { id: "ucl-md5-5", rodada: 5, casa: "Man City", fora: "Napoli" },
  { id: "ucl-md5-6", rodada: 5, casa: "RB Leipzig", fora: "Lens" },
  { id: "ucl-md5-7", rodada: 5, casa: "Real Madrid", fora: "PSV" },
  { id: "ucl-md5-8", rodada: 5, casa: "Slovan Bratislava", fora: "Betis" },
  { id: "ucl-md5-9", rodada: 5, casa: "Sabah", fora: "Barcelona" },
  { id: "ucl-md5-10", rodada: 5, casa: "Slavia Praha", fora: "Villarreal" },
  { id: "ucl-md5-11", rodada: 5, casa: "Atl. Madrid", fora: "Viking" },
  { id: "ucl-md5-12", rodada: 5, casa: "Club Brugge", fora: "Liverpool" },
  { id: "ucl-md5-13", rodada: 5, casa: "Inter", fora: "Stuttgart" },
  { id: "ucl-md5-14", rodada: 5, casa: "Shakhtar Donetsk", fora: "Fenerbahçe" },
  { id: "ucl-md5-15", rodada: 5, casa: "Lille", fora: "Bayern" },
  { id: "ucl-md5-16", rodada: 5, casa: "PSG", fora: "Roma" },
  { id: "ucl-md5-17", rodada: 5, casa: "Sporting", fora: "Man United" },

  // ——— Rodada 6 ———
  { id: "ucl-md6-0", rodada: 6, casa: "Viking", fora: "Feyenoord" },
  { id: "ucl-md6-1", rodada: 6, casa: "Villarreal", fora: "Sabah" },
  { id: "ucl-md6-2", rodada: 6, casa: "AEK Athens", fora: "Galatasaray" },
  { id: "ucl-md6-3", rodada: 6, casa: "Roma", fora: "Sporting" },
  { id: "ucl-md6-4", rodada: 6, casa: "Aston Villa", fora: "PSG" },
  { id: "ucl-md6-5", rodada: 6, casa: "Barcelona", fora: "Man City" },
  { id: "ucl-md6-6", rodada: 6, casa: "Bayern", fora: "Slavia Praha" },
  { id: "ucl-md6-7", rodada: 6, casa: "Man United", fora: "RB Leipzig" },
  { id: "ucl-md6-8", rodada: 6, casa: "Napoli", fora: "Club Brugge" },
  { id: "ucl-md6-9", rodada: 6, casa: "Betis", fora: "Como" },
  { id: "ucl-md6-10", rodada: 6, casa: "Slovan Bratislava", fora: "Shakhtar Donetsk" },
  { id: "ucl-md6-11", rodada: 6, casa: "Arsenal", fora: "Real Madrid" },
  { id: "ucl-md6-12", rodada: 6, casa: "Dortmund", fora: "Inter" },
  { id: "ucl-md6-13", rodada: 6, casa: "LASK", fora: "Fenerbahçe" },
  { id: "ucl-md6-14", rodada: 6, casa: "Liverpool", fora: "Porto" },
  { id: "ucl-md6-15", rodada: 6, casa: "PSV", fora: "Atl. Madrid" },
  { id: "ucl-md6-16", rodada: 6, casa: "Lens", fora: "Bodø/Glimt" },
  { id: "ucl-md6-17", rodada: 6, casa: "Stuttgart", fora: "Lille" },

  // ——— Rodada 7 ———
  { id: "ucl-md7-0", rodada: 7, casa: "Bodø/Glimt", fora: "Atl. Madrid" },
  { id: "ucl-md7-1", rodada: 7, casa: "Galatasaray", fora: "Feyenoord" },
  { id: "ucl-md7-2", rodada: 7, casa: "AEK Athens", fora: "Roma" },
  { id: "ucl-md7-3", rodada: 7, casa: "Aston Villa", fora: "Dortmund" },
  { id: "ucl-md7-4", rodada: 7, casa: "Inter", fora: "Liverpool" },
  { id: "ucl-md7-5", rodada: 7, casa: "Porto", fora: "Slavia Praha" },
  { id: "ucl-md7-6", rodada: 7, casa: "Lille", fora: "Slovan Bratislava" },
  { id: "ucl-md7-7", rodada: 7, casa: "Real Madrid", fora: "LASK" },
  { id: "ucl-md7-8", rodada: 7, casa: "Stuttgart", fora: "Club Brugge" },
  { id: "ucl-md7-9", rodada: 7, casa: "Fenerbahçe", fora: "Villarreal" },
  { id: "ucl-md7-10", rodada: 7, casa: "Sabah", fora: "Napoli" },
  { id: "ucl-md7-11", rodada: 7, casa: "Como", fora: "PSG" },
  { id: "ucl-md7-12", rodada: 7, casa: "Man United", fora: "Bayern" },
  { id: "ucl-md7-13", rodada: 7, casa: "RB Leipzig", fora: "Shakhtar Donetsk" },
  { id: "ucl-md7-14", rodada: 7, casa: "Lens", fora: "Man City" },
  { id: "ucl-md7-15", rodada: 7, casa: "Betis", fora: "Arsenal" },
  { id: "ucl-md7-16", rodada: 7, casa: "Sporting", fora: "Barcelona" },
  { id: "ucl-md7-17", rodada: 7, casa: "Viking", fora: "PSV" },

  // ——— Rodada 8 ———
  { id: "ucl-md8-0", rodada: 8, casa: "Arsenal", fora: "Sabah" },
  { id: "ucl-md8-1", rodada: 8, casa: "Roma", fora: "Lille" },
  { id: "ucl-md8-2", rodada: 8, casa: "Atl. Madrid", fora: "Fenerbahçe" },
  { id: "ucl-md8-3", rodada: 8, casa: "Dortmund", fora: "AEK Athens" },
  { id: "ucl-md8-4", rodada: 8, casa: "Club Brugge", fora: "Bodø/Glimt" },
  { id: "ucl-md8-5", rodada: 8, casa: "Bayern", fora: "Betis" },
  { id: "ucl-md8-6", rodada: 8, casa: "Barcelona", fora: "Como" },
  { id: "ucl-md8-7", rodada: 8, casa: "Shakhtar Donetsk", fora: "Real Madrid" },
  { id: "ucl-md8-8", rodada: 8, casa: "Feyenoord", fora: "RB Leipzig" },
  { id: "ucl-md8-9", rodada: 8, casa: "LASK", fora: "Porto" },
  { id: "ucl-md8-10", rodada: 8, casa: "Liverpool", fora: "Lens" },
  { id: "ucl-md8-11", rodada: 8, casa: "Man City", fora: "Sporting" },
  { id: "ucl-md8-12", rodada: 8, casa: "PSG", fora: "Galatasaray" },
  { id: "ucl-md8-13", rodada: 8, casa: "PSV", fora: "Stuttgart" },
  { id: "ucl-md8-14", rodada: 8, casa: "Slavia Praha", fora: "Aston Villa" },
  { id: "ucl-md8-15", rodada: 8, casa: "Napoli", fora: "Viking" },
  { id: "ucl-md8-16", rodada: 8, casa: "Villarreal", fora: "Man United" },
  { id: "ucl-md8-17", rodada: 8, casa: "Slovan Bratislava", fora: "Inter" },
];

/** Placares oficiais da rodada 1. */
export const PLACARES_OFICIAIS_UCL_LIGA = {
  "ucl-md1-0": { casa: 1, fora: 0 },
  "ucl-md1-1": { casa: 2, fora: 3 },
  "ucl-md1-2": { casa: 3, fora: 2 },
  "ucl-md1-3": { casa: 0, fora: 2 },
  "ucl-md1-4": { casa: 2, fora: 3 },
  "ucl-md1-5": { casa: 2, fora: 1 },
  "ucl-md1-6": { casa: 5, fora: 1 },
  "ucl-md1-7": { casa: 3, fora: 1 },
  "ucl-md1-8": { casa: 2, fora: 1 },
  "ucl-md1-9": { casa: 6, fora: 1 },
  "ucl-md1-10": { casa: 3, fora: 1 },
  "ucl-md1-11": { casa: 0, fora: 1 },
  "ucl-md1-12": { casa: 1, fora: 1 },
  "ucl-md1-13": { casa: 1, fora: 1 },
  "ucl-md1-14": { casa: 4, fora: 1 },
  "ucl-md1-15": { casa: 5, fora: 0 },
  "ucl-md1-16": { casa: 4, fora: 0 },
  "ucl-md1-17": { casa: 2, fora: 3 },
};

export function placarUclLigaEhOficial(id) {
  return Object.prototype.hasOwnProperty.call(PLACARES_OFICIAIS_UCL_LIGA, id);
}

export function jogosDaRodada(rodada) {
  return JOGOS_UCL_LIGA.filter((j) => j.rodada === rodada);
}

function linhaVazia(nome) {
  return {
    nome,
    pts: 0,
    j: 0,
    v: 0,
    e: 0,
    d: 0,
    gp: 0,
    gc: 0,
    sg: 0,
  };
}

/**
 * Classificação única a partir dos placares preenchidos.
 * Critérios ao vivo: pts → SG → GP → nome.
 */
export function calcularTabelaUclLiga(placares) {
  const mapa = Object.fromEntries(TIMES_UCL_LIGA.map((n) => [n, linhaVazia(n)]));

  for (const jogo of JOGOS_UCL_LIGA) {
    const p = placares[jogo.id];
    if (!p || p.casa == null || p.fora == null) continue;
    const casa = mapa[jogo.casa];
    const fora = mapa[jogo.fora];
    if (!casa || !fora) continue;

    casa.j += 1;
    fora.j += 1;
    casa.gp += p.casa;
    casa.gc += p.fora;
    fora.gp += p.fora;
    fora.gc += p.casa;
    casa.sg = casa.gp - casa.gc;
    fora.sg = fora.gp - fora.gc;

    if (p.casa > p.fora) {
      casa.v += 1;
      casa.pts += 3;
      fora.d += 1;
    } else if (p.casa < p.fora) {
      fora.v += 1;
      fora.pts += 3;
      casa.d += 1;
    } else {
      casa.e += 1;
      fora.e += 1;
      casa.pts += 1;
      fora.pts += 1;
    }
  }

  return Object.values(mapa).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.sg !== a.sg) return b.sg - a.sg;
    if (b.gp !== a.gp) return b.gp - a.gp;
    return a.nome.localeCompare(b.nome, "pt");
  });
}

/** Zona na classificação: 1–8 oitavas, 9–24 playoff, 25–36 fora. */
export function zonaClassificacaoUcl(pos) {
  if (pos <= 8) return "r16";
  if (pos <= 24) return "playoff";
  return "out";
}
