/**
 * Copa do Mundo 2026 — fase de grupos. Cada time enfrenta os outros uma vez (6 jogos por grupo).
 */
export const gruposWC2026 = {
  A: ["México", "África do Sul", "Coreia do Sul", "República Tcheca"],
  B: ["Canadá", "Bósnia", "Catar", "Suíça"],
  C: ["Brasil", "Marrocos", "Haiti", "Escócia"],
  D: ["Estados Unidos", "Paraguai", "Austrália", "Turquia"],
  E: ["Alemanha", "Curaçao", "Costa do Marfim", "Equador"],
  F: ["Holanda", "Japão", "Suécia", "Tunísia"],
  G: ["Bélgica", "Egito", "Irã", "Nova Zelândia"],
  H: ["Espanha", "Cabo Verde", "Arábia Saudita", "Uruguai"],
  I: ["França", "Senegal", "Iraque", "Noruega"],
  J: ["Argentina", "Argélia", "Áustria", "Jordânia"],
  K: ["Portugal", "RD Congo", "Uzbequistão", "Colômbia"],
  L: ["Inglaterra", "Croácia", "Gana", "Panamá"],
};

/**
 * Rodadas de 2 jogos (ordem 1–4 = posição na lista do grupo).
 * R1: 1×2 | 3×4 — R2: 1×3 | 4×2 — R3: 4×1 | 2×3 (primeiro = mandante).
 */
export function gerarJogosRoundRobin4(times) {
  const [a, b, c, d] = times;
  return [
    { casa: a, fora: b },
    { casa: c, fora: d },
    { casa: a, fora: c },
    { casa: d, fora: b },
    { casa: d, fora: a },
    { casa: b, fora: c },
  ];
}

export const JOGOS_POR_RODADA_GRUPO_WC = 2;
export const TOTAL_RODADAS_GRUPO_WC = 3;
