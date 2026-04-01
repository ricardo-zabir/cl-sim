/**
 * Confrontos da quinta fase (ida e volta). O terceiro item é quem decide em casa na volta.
 * @type {readonly [string, string, string][]}
 */
export const CONFRONTOS_QUINTA_FASE = [
  ["Atlético-MG", "Ceará", "Ceará"],
  ["Cruzeiro", "Goiás", "Cruzeiro"],
  ["Athletico-PR", "Atlético-GO", "Atlético-GO"],
  ["Flamengo", "Vitória", "Vitória"],
  ["Grêmio", "Confiança-SE", "Confiança-SE"],
  ["Vasco", "Paysandu", "Vasco"],
  ["Fortaleza", "CRB", "CRB"],
  ["Bahia", "Remo", "Remo"],
  ["Botafogo", "Chapecoense", "Chapecoense"],
  ["Red Bull Bragantino", "Mirassol", "Mirassol"],
  ["Corinthians", "Barra-SC", "Corinthians"],
  ["Fluminense", "Operário-PR", "Fluminense"],
  ["Palmeiras", "Jacuipense-BA", "Jacuipense-BA"],
  ["Internacional", "Athletic-MG", "Internacional"],
  ["Santos", "Coritiba", "Coritiba"],
  ["São Paulo", "Juventude", "Juventude"],
];

function timeKO(nome, slot) {
  return {
    nome,
    grupo: `Q${slot}`,
    pos: 1,
    grpPts: 0,
    grpSG: 0,
    grpGP: 0,
    grpGC: 0,
  };
}

export function montarConfrontosQuintaFase() {
  return CONFRONTOS_QUINTA_FASE.map(([nomeA, nomeB, decideVolta], index) => {
    const tA = timeKO(nomeA, index * 2);
    const tB = timeKO(nomeB, index * 2 + 1);
    let decide = null;
    if (decideVolta === nomeA) decide = tA;
    else if (decideVolta === nomeB) decide = tB;
    if (!decide) {
      throw new Error(`Mando inválido na chave ${index}: ${decideVolta}`);
    }
    const outro = decide.nome === tA.nome ? tB : tA;
    return {
      id: `q5-${index}`,
      tipo: "duas",
      sideA: tA,
      sideB: tB,
      ida: { mandante: outro, visitante: decide },
      volta: { mandante: decide, visitante: outro },
    };
  });
}
