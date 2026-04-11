/** Chave estável para (grupo, seleção). */
export function chaveGrupoTime(grupo, time) {
  return `${grupo}::${time}`;
}

/**
 * Dos 12 terceiros colocados (um por grupo), classificam os 8 melhores.
 * Critérios FIFA (entre terceiros): pontos, saldo de gols, gols marcados;
 * empate: ordem alfabética do nome da seleção (em substituição a sorteio).
 *
 * @param {Record<string, string[]>} grupos
 * @param {Record<string, { casa?: number, fora?: number }>} placares
 * @param {(times: string[]) => { casa: string, fora: string }[]} gerarJogos
 * @param {(jogos: any[], grupo: string, placares: any) => Array<{ time: string, P: number, SG: number, GP: number, GC: number, J: number }>} calcularTabela
 */
export function calcularOitoMelhoresTerceiros(
  grupos,
  placares,
  gerarJogos,
  calcularTabela
) {
  const candidatos = [];
  for (const [grupo, times] of Object.entries(grupos)) {
    const jogos = gerarJogos(times);
    const tab = calcularTabela(jogos, grupo, placares);
    if (tab.length < 3) continue;
    const t = tab[2];
    candidatos.push({
      grupo,
      time: t.time,
      P: t.P,
      SG: t.SG,
      GP: t.GP,
      GC: t.GC,
      J: t.J,
    });
  }

  const ordenados = [...candidatos].sort(
    (a, b) =>
      b.P - a.P ||
      b.SG - a.SG ||
      b.GP - a.GP ||
      a.time.localeCompare(b.time, "pt")
  );

  const top8 = ordenados.slice(0, 8);
  const classificados = new Set(
    top8.map((x) => chaveGrupoTime(x.grupo, x.time))
  );

  return { candidatos, ordenados, top8, classificados };
}

export function terceiroNosOitoMelhores(grupo, nomeTime, classificados) {
  return classificados.has(chaveGrupoTime(grupo, nomeTime));
}
