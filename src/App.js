import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Analytics } from '@vercel/analytics/react';
import "./App.css";
import { escudosPorNome } from "./escudos";
import {
  sortearOitavas,
  montarChaveamento,
  vencedorFinal,
  agregadoConfronto,
  placarKo,
} from "./knockoutLogic";

function Escudo({ nome }) {
  const src = escudosPorNome[nome];
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className="team-escudo"
      loading="lazy"
      decoding="async"
    />
  );
}

const grupos = {
  A: ["Flamengo","Estudiantes","Cusco","Independiente Medellín"],
  B: ["Nacional","Universitario","Coquimbo Unido","Deportes Tolima"],
  C: ["Fluminense","Bolívar","Deportivo La Guaira","Independiente Rivadavia"],
  D: ["Boca Juniors","Cruzeiro","Universidad Católica","Barcelona"],
  E: ["Peñarol","Corinthians","Santa Fé","Platense"],
  F: ["Palmeiras","Cerro Porteño","Junior","Sporting Cristal"],
  G: ["LDU","Lanús","Always Ready","Mirassol"],
  H: ["Independiente del Valle","Libertad","Rosario Central","Universidad Central"]
};

const JOGOS_POR_RODADA_GRUPO = 2;
const TOTAL_RODADAS_GRUPO = 6;
const EMAIL_CONTATO = "ricardofonseca.zabir@hotmail.com";
const CHAVE_PIX_TEMPLATE = "ricardofonseca.zabir@hotmail.com";

const gerarJogos = (times) => {
  const [A1,A2,A3,A4] = times;
  return [
    {casa:A4, fora:A2},
    {casa:A3, fora:A1},
    {casa:A2, fora:A3},
    {casa:A1, fora:A4},
    {casa:A2, fora:A1},
    {casa:A4, fora:A3},
    {casa:A3, fora:A2},
    {casa:A4, fora:A1},
    {casa:A1, fora:A2},
    {casa:A3, fora:A4},
    {casa:A1, fora:A3},
    {casa:A2, fora:A4},
  ];
};

// Distribuição simples para simular um gol:
// 40% -> 0, 30% -> 1, 20% -> 2, 5% -> 3, 3% -> 4, 1% -> 5, 1% -> 6
function sortearGolsSimulacao() {
  const r = Math.random() * 100;
  if (r < 40) return 0;
  if (r < 70) return 1;
  if (r < 90) return 2;
  if (r < 95) return 3;
  if (r < 98) return 4;
  if (r < 99) return 5;
  return 6;
}

function calcularTabela(jogos, grupo, placares) {
  const tabela = {};

  jogos.forEach((j,i)=>{
    const {casa,fora} = j;
    const key = `${grupo}-${i}`;
    const placar = placares[key] || {};
    const gCasa = placar.casa ?? null;
    const gFora = placar.fora ?? null;

    if(!tabela[casa]) tabela[casa] = {P:0,J:0,V:0,E:0,D:0,GP:0,GC:0};
    if(!tabela[fora]) tabela[fora] = {P:0,J:0,V:0,E:0,D:0,GP:0,GC:0};

    if(gCasa===null || gFora===null) return;

    tabela[casa].J++;
    tabela[fora].J++;

    tabela[casa].GP += gCasa;
    tabela[casa].GC += gFora;

    tabela[fora].GP += gFora;
    tabela[fora].GC += gCasa;

    if(gCasa > gFora){
      tabela[casa].P+=3;
      tabela[casa].V++;
      tabela[fora].D++;
    } else if(gCasa < gFora){
      tabela[fora].P+=3;
      tabela[fora].V++;
      tabela[casa].D++;
    } else {
      tabela[casa].P+=1;
      tabela[fora].P+=1;
      tabela[casa].E++;
      tabela[fora].E++;
    }
  });

  return Object.entries(tabela).map(([time,dados])=>(
    {...dados, time, SG: dados.GP - dados.GC}
  )).sort((a,b)=> b.P - a.P || b.SG - a.SG || b.GP - a.GP);
}

function gruposEstaoCompletos(placares) {
  for (const [grupo, times] of Object.entries(grupos)) {
    const jogos = gerarJogos(times);
    for (let i = 0; i < jogos.length; i++) {
      const p = placares[`${grupo}-${i}`];
      if (p?.casa == null || p?.fora == null) return false;
      if (!Number.isFinite(p.casa) || !Number.isFinite(p.fora)) return false;
    }
  }
  return true;
}

function obterClassificados(placares) {
  const lista = [];
  for (const [grupo, times] of Object.entries(grupos)) {
    const jogos = gerarJogos(times);
    const tabela = calcularTabela(jogos, grupo, placares);
    const primeiro = tabela[0];
    const segundo = tabela[1];
    if (primeiro) {
      lista.push({
        nome: primeiro.time,
        grupo,
        pos: 1,
        grpPts: primeiro.P,
        grpSG: primeiro.SG,
        grpGP: primeiro.GP,
        grpGC: primeiro.GC,
      });
    }
    if (segundo) {
      lista.push({
        nome: segundo.time,
        grupo,
        pos: 2,
        grpPts: segundo.P,
        grpSG: segundo.SG,
        grpGP: segundo.GP,
        grpGC: segundo.GC,
      });
    }
  }
  return lista;
}

function rotuloTime(t) {
  if (!t) return "—";
  if (t.pos === 1) return `${t.nome} (1º grp. ${t.grupo})`;
  if (t.pos === 2) return `${t.nome} (2º grp. ${t.grupo})`;
  return `${t.nome} (grp. ${t.grupo})`;
}

export default function App(){
  const [placares,setPlacares] = useState({});
  const [rodadaPorGrupo, setRodadaPorGrupo] = useState({});
  const [fase, setFase] = useState("grupos");
  const [sorteio, setSorteio] = useState(null);
  const [koPlacares, setKoPlacares] = useState({});
  const [pixCopiado, setPixCopiado] = useState(false);

  const mudarRodadaGrupo = useCallback((grupo, delta) => {
    setRodadaPorGrupo((prev) => {
      const cur = prev[grupo] ?? 0;
      const next = Math.max(
        0,
        Math.min(TOTAL_RODADAS_GRUPO - 1, cur + delta)
      );
      return { ...prev, [grupo]: next };
    });
  }, []);

  const gruposCompletos = useMemo(() => gruposEstaoCompletos(placares), [placares]);
  const classificados = useMemo(() => obterClassificados(placares), [placares]);
  const chaveKey = useMemo(
    () => classificados.map((c) => `${c.grupo}-${c.pos}-${c.nome}`).join("|"),
    [classificados]
  );

  useEffect(() => {
    setSorteio(null);
    setKoPlacares({});
  }, [chaveKey]);

  const handleChange = (key, lado, valor) => {
    const n = valor === "" ? null : Number(valor);
    setPlacares(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lado]: Number.isFinite(n) ? n : null
      }
    }));
  };

  const handleKoChange = useCallback((id, lado, valor) => {
    const n = valor === "" ? null : Number(valor);
    setKoPlacares((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [lado]: Number.isFinite(n) ? n : null,
      },
    }));
  }, []);

  const simularGrupo = useCallback((grupo) => {
    const times = grupos[grupo];
    if (!times) return;

    const jogos = gerarJogos(times);
    setPlacares((prev) => {
      const next = { ...prev };
      let mudou = false;

      jogos.forEach((_, i) => {
        const key = `${grupo}-${i}`;
        const cur = next[key] || {};

        const casaVazia = cur.casa == null;
        const foraVazia = cur.fora == null;

        if (!casaVazia && !foraVazia) return;

        mudou = true;
        next[key] = {
          ...cur,
          casa: casaVazia ? sortearGolsSimulacao() : cur.casa,
          fora: foraVazia ? sortearGolsSimulacao() : cur.fora,
        };
      });

      return mudou ? next : prev;
    });
  }, []);

  const copiarChavePix = useCallback(async () => {
    console.log("[Simulador Libertadores] Clique: copiar chave Pix");
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(CHAVE_PIX_TEMPLATE);
      } else {
        const el = document.createElement("textarea");
        el.value = CHAVE_PIX_TEMPLATE;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setPixCopiado(true);
      window.setTimeout(() => setPixCopiado(false), 1800);
    } catch (_err) {
      window.alert("Não foi possível copiar a chave Pix.");
    }
  }, []);

  const realizarSorteio = () => {
    if (!gruposCompletos || classificados.length !== 16) return;
    setKoPlacares({});
    const s = sortearOitavas(classificados);
    if (!s) {
      window.alert("Não foi possível montar o sorteio. Tente «Novo sorteio».");
      return;
    }
    setSorteio(s);
  };

  const bracket = useMemo(
    () => montarChaveamento(sorteio, koPlacares),
    [sorteio, koPlacares]
  );

  const campeao = useMemo(() => {
    const final = bracket.f[0];
    if (!final?.sideA || !final?.sideB) return null;
    return vencedorFinal(final, koPlacares);
  }, [bracket.f, koPlacares]);

  const renderConfrontoDuplo = (tie, opts = {}) => {
    const { disabled } = opts;
    const idaId = `${tie.id}-ida`;
    const volId = `${tie.id}-volta`;
    const penId = `${tie.id}-pen`;

    if (!tie.sideA || !tie.sideB || !tie.ida || !tie.volta) {
      return (
        <div key={tie.id} className="ko-tie ko-tie--placeholder">
          <p className="ko-tie__wait">Aguardando fase anterior</p>
        </div>
      );
    }

    const ag = agregadoConfronto(tie, koPlacares);
    const pen = placarKo(koPlacares, penId);
    const mostrarPen = ag.completo && ag.empatado;
    const penTie =
      mostrarPen && pen.a != null && pen.b != null && pen.a === pen.b;

    const rowLeg = (label, subId, mandante, visitante) => {
      const p = placarKo(koPlacares, subId);
      return (
        <div className="ko-leg" key={subId}>
          <div className="ko-leg__label">{label}</div>
          <div className="ko-leg__row">
            <div className="ko-leg__team ko-leg__team--home">
              <span className="team-line team-line--home" title={rotuloTime(mandante)}>
                <span className="team-line__name">{mandante.nome}</span>
                <Escudo nome={mandante.nome} />
              </span>
            </div>
            <div className="ko-leg__score">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                disabled={disabled}
                className="score-input"
                placeholder="–"
                value={p.casa ?? ""}
                onChange={(e) => handleKoChange(subId, "casa", e.target.value)}
              />
              <span className="score-sep">×</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                disabled={disabled}
                className="score-input"
                placeholder="–"
                value={p.fora ?? ""}
                onChange={(e) => handleKoChange(subId, "fora", e.target.value)}
              />
            </div>
            <div className="ko-leg__team ko-leg__team--away">
              <span className="team-line team-line--away" title={rotuloTime(visitante)}>
                <Escudo nome={visitante.nome} />
                <span className="team-line__name">{visitante.nome}</span>
              </span>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div
        key={tie.id}
        className={`ko-tie ${disabled ? "ko-tie--disabled" : ""} ${penTie ? "ko-tie--tie" : ""}`}
      >
        {rowLeg("Ida", idaId, tie.ida.mandante, tie.ida.visitante)}
        {rowLeg("Volta", volId, tie.volta.mandante, tie.volta.visitante)}
        {ag.completo && (
          <div className="ko-tie__agg">
            Agregado: <strong>{tie.sideA.nome}</strong> {ag.agA} × {ag.agB}{" "}
            <strong>{tie.sideB.nome}</strong>
          </div>
        )}
        {mostrarPen && (
          <div className="ko-tie__pen">
            <span className="ko-tie__pen-label">Pênaltis</span>
            <div className="ko-tie__pen-row">
              <span className="ko-tie__pen-side" title={tie.sideA.nome}>
                {tie.sideA.nome}
              </span>
              <div className="ko-tie__pen-score">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={disabled}
                  className="score-input score-input--pen"
                  placeholder="–"
                  value={pen.a ?? ""}
                  onChange={(e) => handleKoChange(penId, "a", e.target.value)}
                />
                <span className="score-sep">×</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={disabled}
                  className="score-input score-input--pen"
                  placeholder="–"
                  value={pen.b ?? ""}
                  onChange={(e) => handleKoChange(penId, "b", e.target.value)}
                />
              </div>
              <span className="ko-tie__pen-side" title={tie.sideB.nome}>
                {tie.sideB.nome}
              </span>
            </div>
          </div>
        )}
        {penTie && (
          <p className="ko-match__warn">
            Empate — altere um dos valores (pênaltis empatados).
          </p>
        )}
      </div>
    );
  };

  const renderFinal = (match) => {
    const disabled = !match.sideA || !match.sideB || match.pendingTie;
    const p = placarKo(koPlacares, match.id);
    const regTie = p.a != null && p.b != null && p.a === p.b;
    const penId = `${match.id}-pen`;
    const pen = placarKo(koPlacares, penId);
    const penTie =
      regTie && pen.a != null && pen.b != null && pen.a === pen.b;

    return (
      <div
        key={match.id}
        className={`ko-match ${disabled ? "ko-match--disabled" : ""} ${penTie ? "ko-match--tie" : ""}`}
      >
        <div className="ko-match__teams">
          <span className="ko-match__team" title={match.sideA ? rotuloTime(match.sideA) : ""}>
            {match.sideA ? (
              <span className="team-line team-line--away">
                <Escudo nome={match.sideA.nome} />
                <span className="team-line__name">{match.sideA.nome}</span>
              </span>
            ) : (
              "Aguardando fase anterior"
            )}
          </span>
          <div className="ko-match__score">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              disabled={disabled || !match.sideA || !match.sideB}
              className="score-input"
              placeholder="–"
              value={p.a ?? ""}
              onChange={(e) => handleKoChange(match.id, "a", e.target.value)}
            />
            <span className="score-sep">×</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              disabled={disabled || !match.sideA || !match.sideB}
              className="score-input"
              placeholder="–"
              value={p.b ?? ""}
              onChange={(e) => handleKoChange(match.id, "b", e.target.value)}
            />
          </div>
          <span className="ko-match__team ko-match__team--away" title={match.sideB ? rotuloTime(match.sideB) : ""}>
            {match.sideB ? (
              <span className="team-line team-line--home">
                <span className="team-line__name">{match.sideB.nome}</span>
                <Escudo nome={match.sideB.nome} />
              </span>
            ) : (
              "Aguardando fase anterior"
            )}
          </span>
        </div>
        {regTie && (
          <div className="ko-tie__pen" role="group" aria-label="Pênaltis">
            <span className="ko-tie__pen-label">Pênaltis</span>
            <div className="ko-tie__pen-row">
              <span className="ko-tie__pen-side" title={match.sideA.nome}>
                {match.sideA.nome}
              </span>
              <div className="ko-tie__pen-score">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={disabled || !match.sideA || !match.sideB}
                  className="score-input score-input--pen"
                  placeholder="–"
                  value={pen.a ?? ""}
                  onChange={(e) => handleKoChange(penId, "a", e.target.value)}
                />
                <span className="score-sep">×</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={disabled || !match.sideA || !match.sideB}
                  className="score-input score-input--pen"
                  placeholder="–"
                  value={pen.b ?? ""}
                  onChange={(e) => handleKoChange(penId, "b", e.target.value)}
                />
              </div>
              <span className="ko-tie__pen-side" title={match.sideB.nome}>
                {match.sideB.nome}
              </span>
            </div>
          </div>
        )}

        {penTie && (
          <p className="ko-match__warn">Empate — altere um dos valores (pênaltis empatados).</p>
        )}
      </div>
    );
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="phase-tabs" role="tablist" aria-label="Fase da competição">
          <button
            type="button"
            role="tab"
            aria-selected={fase === "grupos"}
            className={`phase-tabs__btn ${fase === "grupos" ? "phase-tabs__btn--active" : ""}`}
            onClick={() => setFase("grupos")}
          >
            Fase de grupos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={fase === "mataMata"}
            className={`phase-tabs__btn ${fase === "mataMata" ? "phase-tabs__btn--active" : ""}`}
            disabled={!gruposCompletos}
            title={!gruposCompletos ? "Preencha todos os placares da fase de grupos" : undefined}
            onClick={() => gruposCompletos && setFase("mataMata")}
          >
            Mata-mata
          </button>
        </div>
        <h1 className="app-title">Simulador Copa Libertadores 2026</h1>
        <p className="app-subtitle">
          {fase === "grupos"
            ? "Preencha todos os resultados da fase de grupos para liberar a fase mata-mata. Os dois melhores de cada grupo avançam. O botão “Simular grupo” preenche automaticamente os resultados restantes."
            : "Clique em “Sortear” para gerar o chaveamento. Os primeiros colocados decidem em casa nas oitavas. A melhor campanha na fase de grupos decide em casa nas quartas e na semifinal. Empates no placar agregado ou na final são decididos nos pênaltis."}
        </p>
      </header>

      {fase === "grupos" && (
      <div className="groups-grid">
        {Object.entries(grupos).map(([grupo,times])=>{
          const jogos = gerarJogos(times);
          const tabela = calcularTabela(jogos, grupo, placares);
          const idxRodada = rodadaPorGrupo[grupo] ?? 0;
          const inicio = idxRodada * JOGOS_POR_RODADA_GRUPO;
          const jogosRodada = jogos.slice(inicio, inicio + JOGOS_POR_RODADA_GRUPO);
          const temPendencias = jogos.some((_, i) => {
            const p = placares[`${grupo}-${i}`];
            return p?.casa == null || p?.fora == null;
          });

          return (
            <article key={grupo} className="group-card">
              <div className="group-card__head">
                <div className="group-card__head-main">
                  <button
                    type="button"
                    className="group-card__arrow"
                    aria-label={`Grupo ${grupo}: rodada anterior`}
                    disabled={idxRodada <= 0}
                    onClick={() => mudarRodadaGrupo(grupo, -1)}
                  >
                    ‹
                  </button>
                  <div className="group-card__titles">
                    <span className="group-card__letter">Grupo {grupo}</span>
                    <span className="group-card__rodada">
                      Rodada {idxRodada + 1}/{TOTAL_RODADAS_GRUPO}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="group-card__arrow"
                    aria-label={`Grupo ${grupo}: próxima rodada`}
                    disabled={idxRodada >= TOTAL_RODADAS_GRUPO - 1}
                    onClick={() => mudarRodadaGrupo(grupo, 1)}
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="group-card__matches">
                {jogosRodada.map((j, offset)=>{
                  const i = inicio + offset;
                  const key = `${grupo}-${i}`;
                  const p = placares[key] || {};
                  return (
                    <div key={key} className="match-row">
                      <div className="match-row__team match-row__team--home" title={j.casa}>
                        <span className="team-line team-line--home">
                          <span className="team-line__name">{j.casa}</span>
                          <Escudo nome={j.casa} />
                        </span>
                      </div>
                      <div className="match-row__score">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          className="score-input"
                          placeholder="–"
                          value={p.casa ?? ""}
                          onChange={(e)=>handleChange(key,"casa",e.target.value)}
                        />
                        <span className="score-sep">×</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          className="score-input"
                          placeholder="–"
                          value={p.fora ?? ""}
                          onChange={(e)=>handleChange(key,"fora",e.target.value)}
                        />
                      </div>
                      <div className="match-row__team match-row__team--away" title={j.fora}>
                        <span className="team-line team-line--away">
                          <Escudo nome={j.fora} />
                          <span className="team-line__name">{j.fora}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="group-card__table-wrap">
                <div className="standings-legend">
                  <span className="standings-legend__dot" aria-hidden />
                  <span>Classificação às oitavas</span>
                </div>
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Pts</th>
                      <th>J</th>
                      <th>V</th>
                      <th>E</th>
                      <th>D</th>
                      <th>GP</th>
                      <th>GC</th>
                      <th>SG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tabela.map((t, idx)=>(
                      <tr key={t.time} className={idx < 2 ? "row-qualify" : ""}>
                        <td title={t.time}>
                          <span className="team-line team-line--table">
                            <Escudo nome={t.time} />
                            <span className="team-line__name">{t.time}</span>
                          </span>
                        </td>
                        <td className="col-pts">{t.P}</td>
                        <td>{t.J}</td>
                        <td>{t.V}</td>
                        <td>{t.E}</td>
                        <td>{t.D}</td>
                        <td>{t.GP}</td>
                        <td>{t.GC}</td>
                        <td>{t.SG}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="group-card__simbar">
                <button
                  type="button"
                  className="group-card__simulate"
                  disabled={!temPendencias}
                  title={!temPendencias ? "Nada para simular neste grupo" : "Preenche placares vazios aleatoriamente"}
                  onClick={() => simularGrupo(grupo)}
                >
                  Simular grupo
                </button>
              </div>
            </article>
          );
        })}
      </div>
      )}

      {fase === "mataMata" && (
        <div className="knockout">
          {!sorteio && (
            <div className="knockout__intro">
              <p className="knockout__intro-text">
                Sorteio dos 1ºs de grupo contra 2ºs de grupos (dois potes). Ida com mandante do 2º; volta com mandante do 1º. Empate no agregado decide nos pênaltis.
              </p>
              <button type="button" className="knockout__sortear" onClick={realizarSorteio}>
                Sortear oitavas de final
              </button>
            </div>
          )}

          {sorteio && (
            <>
              <div className="knockout__actions">
                <button type="button" className="knockout__resortear" onClick={realizarSorteio}>
                  Novo sorteio
                </button>
                <span className="knockout__hint">Isso zera os placares do mata-mata.</span>
              </div>

              <div className="bracket">
                <section className="bracket__round">
                  <h2 className="bracket__title">Oitavas de final</h2>
                  <div className="bracket__matches bracket__matches--ties">
                    {bracket.r16.map((m) => renderConfrontoDuplo(m, { disabled: false }))}
                  </div>
                </section>

                <section className="bracket__round">
                  <h2 className="bracket__title">Quartas de final</h2>
                  <div className="bracket__matches bracket__matches--ties">
                    {bracket.qf.map((m) =>
                      renderConfrontoDuplo(m, {
                        disabled: !m.sideA || !m.sideB || m.pendingTie,
                      })
                    )}
                  </div>
                </section>

                <section className="bracket__round">
                  <h2 className="bracket__title">Semifinais</h2>
                  <div className="bracket__matches bracket__matches--ties">
                    {bracket.sf.map((m) =>
                      renderConfrontoDuplo(m, {
                        disabled: !m.sideA || !m.sideB || m.pendingTie,
                      })
                    )}
                  </div>
                </section>

                <section className="bracket__round bracket__round--final">
                  <h2 className="bracket__title">Final</h2>
                  <div className="bracket__matches">
                    {bracket.f.map((m) => renderFinal(m))}
                  </div>
                </section>
              </div>

              {campeao && campeao !== "tie" && (
                <div className="knockout__champion">
                  <span className="knockout__champion-label">Campeão</span>
                  <span className="knockout__champion-name">
                    <Escudo nome={campeao.nome} />
                    {campeao.nome}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <footer className="support-footer">
        <section className="support-block support-block--feedback">
          <p className="support-footer__text">
            Qualquer sugestão, feedback ou ideia é muito bem-vinda — vou adorar ouvir você!
          </p>
          <div className="support-footer__actions">
            <a
              className="support-footer__btn support-footer__btn--email"
              href={`mailto:${EMAIL_CONTATO}`}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                console.log("[Simulador Libertadores] Clique: enviar feedback por e-mail")
              }
            >
              Enviar feedback por e-mail
            </a>
          </div>
        </section>

        <section className="support-block support-block--donation">
          <p className="support-footer__text">
            Esse é um projeto independente, feito com muita paixão por futebol.
            Se quiser apoiar com uma pequena contribuição para manter o projeto e ajudar a criar novas ideias, fique à vontade para usar PIX.
          </p>
          <div className="support-footer__actions">
          <button
            type="button"
            className={`support-footer__btn support-footer__btn--pix ${pixCopiado ? "is-copied" : ""}`}
            onClick={copiarChavePix}
          >
            {pixCopiado ? "Pix copiado!" : "Copiar chave Pix"}
          </button>
          </div>
        </section>
      </footer>
      <Analytics />
    </div>
  );
}
