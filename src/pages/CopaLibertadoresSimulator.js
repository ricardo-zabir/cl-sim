import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { escudosPorNome } from "../escudos";
import {
  vencedorFinal,
  agregadoConfronto,
  placarKo,
  vencedorConfrontoDuplo,
} from "../knockoutLogic";
import {
  PLACARES_OFICIAIS_GRUPOS,
  placarGrupoEhOficial,
} from "../libertaOficialGrupos";
import { montarSorteioOficialOitavas } from "../libertaOficialOitavas";
import {
  PLACARES_OFICIAIS_LIBERTA_KO,
  placarLibertaKoEhOficial,
  montarChaveamentoLibertadores,
} from "../libertaOficialPlacares";

function Escudo({ nome, className = "team-escudo" }) {
  const src = escudosPorNome[nome];
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

const grupos = {
  A: ["Flamengo","Estudiantes","Cusco","Independiente Medellín"],
  B: ["Nacional","Universitario","Coquimbo Unido","Deportes Tolima"],
  C: ["Fluminense","Bolívar","Deportivo La Guaira","Rivadavia"],
  D: ["Boca Juniors","Cruzeiro","Universidad Católica","Barcelona"],
  E: ["Peñarol","Corinthians","Santa Fé","Platense"],
  F: ["Palmeiras","Cerro Porteño","Junior","Sporting Cristal"],
  G: ["LDU","Lanús","Always Ready","Mirassol"],
  H: ["Independiente del Valle","Libertad","Rosario Central","Universidad Central"]
};

const JOGOS_POR_RODADA_GRUPO = 2;
const TOTAL_RODADAS_GRUPO = 6;
const EMAIL_CONTATO = "ricardofonseca.zabir@hotmail.com";
const CHAVE_PIX_TEMPLATE = "75df5998-b352-4f8b-a0c1-38bedec43b2c";

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

  const linhas = Object.entries(tabela).map(([time, dados]) => ({
    ...dados,
    time,
    SG: dados.GP - dados.GC,
  }));

  return linhas.sort((a, b) =>
    compararPosicaoGrupo(a, b, jogos, grupo, placares)
  );
}

/** Pontos e desempates no confronto direto entre dois times (regra CONMEBOL). */
function confrontoDireto(timeA, timeB, jogos, grupo, placares) {
  let pA = 0;
  let pB = 0;
  let gpA = 0;
  let gcA = 0;
  let gpB = 0;
  let gcB = 0;

  jogos.forEach((j, i) => {
    const envolveA = j.casa === timeA || j.fora === timeA;
    const envolveB = j.casa === timeB || j.fora === timeB;
    if (!envolveA || !envolveB) return;

    const placar = placares[`${grupo}-${i}`] || {};
    const gCasa = placar.casa ?? null;
    const gFora = placar.fora ?? null;
    if (gCasa === null || gFora === null) return;

    const golsA = j.casa === timeA ? gCasa : gFora;
    const golsB = j.casa === timeB ? gCasa : gFora;
    gpA += golsA;
    gcA += golsB;
    gpB += golsB;
    gcB += golsA;

    if (golsA > golsB) pA += 3;
    else if (golsA < golsB) pB += 3;
    else {
      pA += 1;
      pB += 1;
    }
  });

  return { pA, pB, sgA: gpA - gcA, sgB: gpB - gcB, gpA, gpB };
}

function compararPosicaoGrupo(a, b, jogos, grupo, placares) {
  if (b.P !== a.P) return b.P - a.P;

  const h2h = confrontoDireto(a.time, b.time, jogos, grupo, placares);
  if (h2h.pB !== h2h.pA) return h2h.pB - h2h.pA;
  if (h2h.sgB !== h2h.sgA) return h2h.sgB - h2h.sgA;
  if (h2h.gpB !== h2h.gpA) return h2h.gpB - h2h.gpA;

  return b.SG - a.SG || b.GP - a.GP;
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

function golsEquipe(placar, mandante, visitante, equipeNome) {
  if (!placar) return null;
  if (equipeNome === mandante?.nome) {
    return placar.casa == null ? null : placar.casa;
  }
  if (equipeNome === visitante?.nome) {
    return placar.fora == null ? null : placar.fora;
  }
  return null;
}

function ladoDoPlacar(mandante, visitante, equipeNome) {
  if (equipeNome === mandante?.nome) return "casa";
  if (equipeNome === visitante?.nome) return "fora";
  return null;
}

function chunkPares(lista) {
  const pares = [];
  for (let i = 0; i < lista.length; i += 2) {
    pares.push([lista[i], lista[i + 1]]);
  }
  return pares;
}

export default function CopaLibertadoresSimulator(){
  const [placares, setPlacares] = useState(() => ({
    ...PLACARES_OFICIAIS_GRUPOS,
  }));
  const [rodadaPorGrupo, setRodadaPorGrupo] = useState(() => {
    const inicial = {};
    for (const g of Object.keys(grupos)) {
      inicial[g] = 5;
    }
    return inicial;
  });
  const [fase, setFase] = useState("mataMata");
  const [koPlacares, setKoPlacares] = useState(() => ({
    ...PLACARES_OFICIAIS_LIBERTA_KO,
  }));
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
    setKoPlacares({ ...PLACARES_OFICIAIS_LIBERTA_KO });
  }, [chaveKey]);

  const sorteio = useMemo(
    () => montarSorteioOficialOitavas(classificados),
    [classificados]
  );

  const handleChange = (key, lado, valor) => {
    if (placarGrupoEhOficial(key)) return;
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
    if (placarLibertaKoEhOficial(id)) return;
    const n = valor === "" ? null : Number(valor);
    setKoPlacares((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [lado]: Number.isFinite(n) ? n : null,
      },
    }));
  }, []);

  const setGolsTime = useCallback(
    (tie, legKey, equipeNome, valor) => {
      if (!tie?.ida || !tie?.volta) return;
      const leg = legKey === "ida" ? tie.ida : tie.volta;
      const subId = `${tie.id}-${legKey}`;
      if (placarLibertaKoEhOficial(subId)) return;
      const lado = ladoDoPlacar(leg.mandante, leg.visitante, equipeNome);
      if (!lado) return;
      handleKoChange(subId, lado, valor);
    },
    [handleKoChange]
  );

  const simularGrupo = useCallback((grupo) => {
    const times = grupos[grupo];
    if (!times) return;

    const jogos = gerarJogos(times);
    setPlacares((prev) => {
      const next = { ...prev };
      let mudou = false;

      jogos.forEach((_, i) => {
        const key = `${grupo}-${i}`;
        if (placarGrupoEhOficial(key)) return;
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

  const bracket = useMemo(
    () => montarChaveamentoLibertadores(sorteio, koPlacares),
    [sorteio, koPlacares]
  );

  const campeao = useMemo(() => {
    const final = bracket.f[0];
    if (!final?.sideA || !final?.sideB) return null;
    return vencedorFinal(final, koPlacares);
  }, [bracket.f, koPlacares]);

  const renderSlotDuplo = (tie, opts = {}) => {
    const { disabled = false } = opts;
    if (!tie?.sideA || !tie?.sideB || !tie?.ida || !tie?.volta) {
      return (
        <article key={tie?.id || "empty"} className="chave-slot chave-slot--empty">
          <p className="chave-slot__wait">Aguardando</p>
        </article>
      );
    }

    const idaId = `${tie.id}-ida`;
    const volId = `${tie.id}-volta`;
    const idaP = placarKo(koPlacares, idaId);
    const volP = placarKo(koPlacares, volId);
    const penId = `${tie.id}-pen`;
    const pen = placarKo(koPlacares, penId);
    const ag = agregadoConfronto(tie, koPlacares);
    const mostrarPen = ag.completo && ag.empatado;
    const vencedor = vencedorConfrontoDuplo(tie, koPlacares);
    const bloqueado = disabled || !tie.sideA || !tie.sideB;
    const idaTravado = placarLibertaKoEhOficial(idaId);
    const volTravado = placarLibertaKoEhOficial(volId);
    const penTravado = placarLibertaKoEhOficial(penId);

    const rowTime = (time, penLado) => {
      const gIda = golsEquipe(idaP, tie.ida.mandante, tie.ida.visitante, time.nome);
      const gVol = golsEquipe(volP, tie.volta.mandante, tie.volta.visitante, time.nome);
      const avancou = vencedor && vencedor !== "tie" && vencedor.nome === time.nome;
      return (
        <div
          key={time.nome}
          className={`chave-row${avancou ? " chave-row--winner" : ""}`}
        >
          <Escudo nome={time.nome} className="chave-escudo" />
          <span className="chave-row__name" title={rotuloTime(time)}>
            {time.nome}
          </span>
          <div className={`chave-row__scores${mostrarPen ? " chave-row__scores--pen" : ""}`}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              readOnly={bloqueado || idaTravado}
              className="chave-score"
              placeholder="–"
              title={idaTravado ? "Ida (oficial)" : "Ida"}
              value={gIda ?? ""}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setGolsTime(tie, "ida", time.nome, v);
              }}
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              readOnly={bloqueado || volTravado}
              className="chave-score"
              placeholder="–"
              title={volTravado ? "Volta (oficial)" : "Volta"}
              value={gVol ?? ""}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setGolsTime(tie, "volta", time.nome, v);
              }}
            />
            {mostrarPen && (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                readOnly={bloqueado || penTravado}
                className="chave-score chave-score--pen"
                placeholder="–"
                title={`Pênaltis — ${time.nome}`}
                value={pen[penLado] ?? ""}
                onChange={(e) =>
                  handleKoChange(penId, penLado, e.target.value.replace(/\D/g, ""))
                }
              />
            )}
          </div>
        </div>
      );
    };

    return (
      <article
        key={tie.id}
        className={`chave-slot${disabled ? " chave-slot--disabled" : ""}${mostrarPen ? " chave-slot--com-pen" : ""}`}
      >
        {rowTime(tie.sideA, "a")}
        {rowTime(tie.sideB, "b")}
      </article>
    );
  };

  const renderFinalChave = (match) => {
    const disabled = !match.sideA || !match.sideB || match.pendingTie;
    const p = placarKo(koPlacares, match.id);
    const penId = `${match.id}-pen`;
    const pen = placarKo(koPlacares, penId);
    const regTie = p.a != null && p.b != null && p.a === p.b;

    if (!match.sideA || !match.sideB) {
      return (
        <article className="chave-slot chave-slot--final chave-slot--empty">
          <p className="chave-slot__wait">Aguardando semis</p>
        </article>
      );
    }

    const row = (time, lado) => (
      <div key={time.nome} className="chave-row">
        <Escudo nome={time.nome} className="chave-escudo" />
        <span className="chave-row__name" title={rotuloTime(time)}>
          {time.nome}
        </span>
        <div className={`chave-row__scores${regTie ? " chave-row__scores--pen" : ""}`}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            readOnly={disabled}
            className="chave-score"
            placeholder="–"
            value={p[lado] ?? ""}
            onChange={(e) =>
              handleKoChange(match.id, lado, e.target.value.replace(/\D/g, ""))
            }
          />
          {regTie && (
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              readOnly={disabled}
              className="chave-score chave-score--pen"
              placeholder="–"
              title={`Pênaltis — ${time.nome}`}
              value={pen[lado] ?? ""}
              onChange={(e) =>
                handleKoChange(penId, lado, e.target.value.replace(/\D/g, ""))
              }
            />
          )}
        </div>
      </div>
    );

    return (
      <article
        className={`chave-slot chave-slot--final${disabled ? " chave-slot--disabled" : ""}${regTie ? " chave-slot--com-pen" : ""}`}
      >
        {row(match.sideA, "a")}
        {row(match.sideB, "b")}
      </article>
    );
  };

  const paresOitavas = chunkPares(bracket.r16 || []);
  const paresQuartas = chunkPares(bracket.qf || []);
  const paresSemis = chunkPares(bracket.sf || []);

  return (
    <div className="app-root theme-libertadores">
      <header className="app-header">
        <Link className="app-back-home" to="/">
          ← Competições
        </Link>
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
        {fase === "grupos" && (
          <p className="app-subtitle">
            Preencha todos os resultados da fase de grupos para liberar a fase mata-mata. Os dois melhores de cada grupo avançam. O botão “Simular grupo” preenche automaticamente os resultados restantes.
          </p>
        )}
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
                  const travado = placarGrupoEhOficial(key);
                  return (
                    <div
                      key={key}
                      className={`match-row${travado ? " match-row--oficial" : ""}`}
                    >
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
                          disabled={travado}
                          className={`score-input${travado ? " score-input--oficial" : ""}`}
                          placeholder="–"
                          title={travado ? "Resultado oficial — não editável" : undefined}
                          value={p.casa ?? ""}
                          onChange={(e)=>handleChange(key,"casa",e.target.value)}
                        />
                        <span className="score-sep">×</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          disabled={travado}
                          className={`score-input${travado ? " score-input--oficial" : ""}`}
                          placeholder="–"
                          title={travado ? "Resultado oficial — não editável" : undefined}
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
                Não foi possível montar o chaveamento oficial das oitavas com a classificação atual.
              </p>
            </div>
          )}

          {sorteio && (
            <div className="chave-wrap">
              <div className="chave" role="region" aria-label="Chaveamento Libertadores">
                <div className="chave__col">
                  <h2 className="chave__title">Oitavas</h2>
                  <div className="chave__col-body">
                    {paresOitavas.map((par, i) => (
                      <div key={`r16-pair-${i}`} className="chave__pair">
                        {renderSlotDuplo(par[0])}
                        {renderSlotDuplo(par[1])}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chave__col chave__col--qf">
                  <h2 className="chave__title">Quartas</h2>
                  <div className="chave__col-body">
                    {paresQuartas.map((par, i) => (
                      <div key={`qf-pair-${i}`} className="chave__pair chave__pair--qf">
                        {renderSlotDuplo(par[0], {
                          disabled: !par[0]?.sideA || !par[0]?.sideB || par[0]?.pendingTie,
                        })}
                        {renderSlotDuplo(par[1], {
                          disabled: !par[1]?.sideA || !par[1]?.sideB || par[1]?.pendingTie,
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chave__col chave__col--sf">
                  <h2 className="chave__title">Semis</h2>
                  <div className="chave__col-body">
                    {paresSemis.map((par, i) => (
                      <div key={`sf-pair-${i}`} className="chave__pair chave__pair--sf">
                        {renderSlotDuplo(par[0], {
                          disabled: !par[0]?.sideA || !par[0]?.sideB || par[0]?.pendingTie,
                        })}
                        {renderSlotDuplo(par[1], {
                          disabled: !par[1]?.sideA || !par[1]?.sideB || par[1]?.pendingTie,
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chave__col chave__col--final">
                  <h2 className="chave__title">Final</h2>
                  <div className="chave__col-body chave__col-body--final">
                    {bracket.f.map((m) => (
                      <div key={m.id} className="chave__pair chave__pair--final">
                        {renderFinalChave(m)}
                      </div>
                    ))}
                    {campeao && campeao !== "tie" && (
                      <div className="chave-campeao">
                        <span className="chave-campeao__label">Campeão</span>
                        <span className="chave-campeao__name">
                          <Escudo nome={campeao.nome} className="chave-escudo" />
                          {campeao.nome}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
    </div>
  );
}
