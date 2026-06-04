import { confrontoDuploMandoEsquerda } from "./knockoutLogic";

/** Confrontos oficiais das oitavas 2026 (time à esquerda manda na ida). */
export const OITAVAS_OFICIAIS_2026 = [
  ["Estudiantes", "Universidad Católica"],
  ["Rosario Central", "Corinthians"],
  ["Cruzeiro", "Flamengo"],
  ["Deportes Tolima", "Independiente del Valle"],
  ["Mirassol", "LDU"],
  ["Palmeiras", "Cerro Porteño"],
  ["Fluminense", "Independiente Rivadavia"],
  ["Platense", "Coquimbo Unido"],
];

export function montarSorteioOficialOitavas(classificados) {
  if (!classificados || classificados.length !== 16) return null;

  const porNome = new Map(classificados.map((c) => [c.nome, c]));
  const r16 = [];

  for (let i = 0; i < OITAVAS_OFICIAIS_2026.length; i++) {
    const [nomeA, nomeB] = OITAVAS_OFICIAIS_2026[i];
    const wa = porNome.get(nomeA);
    const wb = porNome.get(nomeB);
    if (!wa || !wb) return null;
    r16.push(confrontoDuploMandoEsquerda(wa, wb, `r16-${i}`));
  }

  return { r16 };
}
