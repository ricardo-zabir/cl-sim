import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { escudoWC2026PorNome } from "../escudosWorldCup2026";
import {
  gruposWC2026,
  gerarJogosRoundRobin4,
  JOGOS_POR_RODADA_GRUPO_WC,
  TOTAL_RODADAS_GRUPO_WC,
} from "../wc2026Grupos";
import {
  calcularOitoMelhoresTerceiros,
  terceiroNosOitoMelhores,
} from "../wc2026MelhoresTerceiros";
import { montarSegundaFase16 } from "../wc2026SegundaFase";
import {
  montarChaveamentoWc,
  vencedorJogoUnico,
} from "../wc2026KnockoutLogic";
import { placarKo } from "../knockoutLogic";

function Escudo({ nome }) {
  const src = escudoWC2026PorNome(nome);
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

const grupos = gruposWC2026;

const JOGOS_POR_RODADA_GRUPO = JOGOS_POR_RODADA_GRUPO_WC;
const TOTAL_RODADAS_GRUPO = TOTAL_RODADAS_GRUPO_WC;

const gerarJogos = gerarJogosRoundRobin4;

const EMAIL_CONTATO = "ricardofonseca.zabir@hotmail.com";
const CHAVE_PIX_TEMPLATE = "75df5998-b352-4f8b-a0c1-38bedec43b2c";

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

  jogos.forEach((j, i) => {
    const { casa, fora } = j;
    const key = `${grupo}-${i}`;
    const placar = placares[key] || {};
    const gCasa = placar.casa ?? null;
    const gFora = placar.fora ?? null;

    if (!tabela[casa]) tabela[casa] = { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0 };
    if (!tabela[fora]) tabela[fora] = { P: 0, J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0 };

    if (gCasa === null || gFora === null) return;

    tabela[casa].J++;
    tabela[fora].J++;

    tabela[casa].GP += gCasa;
    tabela[casa].GC += gFora;

    tabela[fora].GP += gFora;
    tabela[fora].GC += gCasa;

    if (gCasa > gFora) {
      tabela[casa].P += 3;
      tabela[casa].V++;
      tabela[fora].D++;
    } else if (gCasa < gFora) {
      tabela[fora].P += 3;
      tabela[fora].V++;
      tabela[casa].D++;
    } else {
      tabela[casa].P += 1;
      tabela[fora].P += 1;
      tabela[casa].E++;
      tabela[fora].E++;
    }
  });

  return Object.entries(tabela)
    .map(([time, dados]) => ({ ...dados, time, SG: dados.GP - dados.GC }))
    .sort((a, b) => b.P - a.P || b.SG - a.SG || b.GP - a.GP);
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

export default function WorldCup2026Simulator() {
  const [placares, setPlacares] = useState({});
  const [rodadaPorGrupo, setRodadaPorGrupo] = useState({});
  const [fase, setFase] = useState("grupos");
  const [koPlacares, setKoPlacares] = useState({});
  const [pixCopiado, setPixCopiado] = useState(false);

  const melhoresTerceiros = useMemo(
    () =>
      calcularOitoMelhoresTerceiros(
        grupos,
        placares,
        gerarJogos,
        calcularTabela
      ),
    [placares]
  );

  const tabelaPorGrupoLetra = useMemo(() => {
    const o = {};
    for (const [letra, times] of Object.entries(grupos)) {
      const jogos = gerarJogos(times);
      o[letra] = calcularTabela(jogos, letra, placares);
    }
    return o;
  }, [placares]);

  const segundaFase = useMemo(
    () => montarSegundaFase16(tabelaPorGrupoLetra, melhoresTerceiros),
    [tabelaPorGrupoLetra, melhoresTerceiros]
  );

  const r32Matches = useMemo(() => {
    if (!segundaFase.ok) return [];
    return segundaFase.partidas.map((p) => ({
      id: `wc-r32-${p.id}`,
      sideA: p.nomeA ? { nome: p.nomeA } : null,
      sideB: p.nomeB ? { nome: p.nomeB } : null,
    }));
  }, [segundaFase]);

  const koChave = useMemo(
    () =>
      segundaFase.ok
        ? segundaFase.partidas.map((p) => `${p.nomeA}|${p.nomeB}`).join(";")
        : "",
    [segundaFase]
  );

  useEffect(() => {
    setKoPlacares({});
  }, [koChave]);

  const bracket = useMemo(
    () => montarChaveamentoWc(r32Matches, koPlacares),
    [r32Matches, koPlacares]
  );

  const campeao = useMemo(() => {
    const f = bracket.final;
    if (!f?.sideA || !f?.sideB) return null;
    return vencedorJogoUnico(f, koPlacares);
  }, [bracket, koPlacares]);

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

  const handleChange = (key, lado, valor) => {
    const n = valor === "" ? null : Number(valor);
    setPlacares((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lado]: Number.isFinite(n) ? n : null,
      },
    }));
  };

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

  const todosGruposCompletos = gruposEstaoCompletos(placares);

  const renderJogoUnico = (match, opts = {}) => {
    const { disabled: disabledOpt } = opts;
    const disabled =
      disabledOpt ||
      !match.sideA ||
      !match.sideB ||
      match.pendingTie;
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
          <span className="ko-match__team" title={match.sideA?.nome ?? ""}>
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
          <span className="ko-match__team ko-match__team--away" title={match.sideB?.nome ?? ""}>
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
              <span className="ko-tie__pen-side" title={match.sideA?.nome}>
                {match.sideA?.nome}
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
              <span className="ko-tie__pen-side" title={match.sideB?.nome}>
                {match.sideB?.nome}
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
    <div className="app-root theme-world-cup-2026">
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
            disabled={!todosGruposCompletos}
            title={
              !todosGruposCompletos
                ? "Preencha todos os placares da fase de grupos"
                : undefined
            }
            onClick={() => todosGruposCompletos && setFase("mataMata")}
          >
            Mata-mata
          </button>
        </div>
        <h1 className="app-title">Simulador Copa do Mundo 2026</h1>
        <p className="app-subtitle">
          {fase === "grupos" ? (
            <>
              12 grupos com quatro seleções cada. Turno único: cada seleção joga três partidas. Entre os 12 terceiros
              lugares, classificam os <strong>8 melhores</strong> (desempate: pontos, saldo, gols marcados; depois ordem
              alfabética em empate). Os dois primeiros de cada grupo e esses oito terceiros seguem para o mata-mata (32
              vagas).
            </>
          ) : null}
          {todosGruposCompletos && fase === "grupos" && (
            <span className="app-subtitle__badge"> Todos os grupos completos.</span>
          )}
        </p>
      </header>

      {fase === "grupos" && (
      <div className="groups-grid">
        {Object.entries(grupos).map(([grupo, times]) => {
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
                {jogosRodada.map((j, offset) => {
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
                          onChange={(e) => handleChange(key, "casa", e.target.value)}
                        />
                        <span className="score-sep">×</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          className="score-input"
                          placeholder="–"
                          value={p.fora ?? ""}
                          onChange={(e) => handleChange(key, "fora", e.target.value)}
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
                <div className="standings-legend standings-legend--wc">
                  <span className="standings-legend__row">
                    <span className="standings-legend__dot" aria-hidden />
                    <span>1º e 2º do grupo</span>
                  </span>
                  <span className="standings-legend__row">
                    <span
                      className="standings-legend__dot standings-legend__dot--third-slot"
                      aria-hidden
                    />
                    <span>3º se estiver entre os 8 melhores</span>
                  </span>
                </div>
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>Seleção</th>
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
                    {tabela.map((t, idx) => {
                      let rowClass = "";
                      if (idx < 2) rowClass = "row-qualify";
                      else if (
                        idx === 2 &&
                        terceiroNosOitoMelhores(
                          grupo,
                          t.time,
                          melhoresTerceiros.classificados
                        )
                      ) {
                        rowClass = "row-qualify-third";
                      }
                      return (
                      <tr key={t.time} className={rowClass}>
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
                    );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="group-card__simbar">
                <button
                  type="button"
                  className="group-card__simulate"
                  disabled={!temPendencias}
                  title={
                    !temPendencias
                      ? "Nada para simular neste grupo"
                      : "Preenche placares vazios aleatoriamente"
                  }
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
          {!segundaFase.ok && (
            <p className="wc-knockout__err" role="alert">
              {segundaFase.erro}
            </p>
          )}
          {segundaFase.ok && (
            <div className="bracket">
              <section className="bracket__round">
                <h2 className="bracket__title">Dezesseis avos de final</h2>
                <div className="bracket__matches">
                  {bracket.r32.map((m) =>
                    renderJogoUnico(m, { disabled: false })
                  )}
                </div>
              </section>

              <section className="bracket__round">
                <h2 className="bracket__title">Oitavas de final</h2>
                <div className="bracket__matches">
                  {bracket.r16.map((m) =>
                    renderJogoUnico(m, {
                      disabled: !m.sideA || !m.sideB || m.pendingTie,
                    })
                  )}
                </div>
              </section>

              <section className="bracket__round">
                <h2 className="bracket__title">Quartas de final</h2>
                <div className="bracket__matches">
                  {bracket.qf.map((m) =>
                    renderJogoUnico(m, {
                      disabled: !m.sideA || !m.sideB || m.pendingTie,
                    })
                  )}
                </div>
              </section>

              <section className="bracket__round">
                <h2 className="bracket__title">Semifinais</h2>
                <div className="bracket__matches">
                  {bracket.sf.map((m) =>
                    renderJogoUnico(m, {
                      disabled: !m.sideA || !m.sideB || m.pendingTie,
                    })
                  )}
                </div>
              </section>

              <section className="bracket__round bracket__round--third">
                <h2 className="bracket__title">Decisão de 3º lugar</h2>
                <div className="bracket__matches">
                  {renderJogoUnico(bracket.thirdPlace, {
                    disabled:
                      !bracket.thirdPlace.sideA ||
                      !bracket.thirdPlace.sideB,
                  })}
                </div>
              </section>

              <section className="bracket__round bracket__round--final">
                <h2 className="bracket__title">Final</h2>
                <div className="bracket__matches">
                  {renderJogoUnico(bracket.final, {
                    disabled:
                      !bracket.final.sideA ||
                      !bracket.final.sideB ||
                      bracket.final.pendingTie,
                  })}
                </div>
              </section>

              {campeao && campeao !== "tie" && (
                <div className="knockout__champion">
                  <span className="knockout__champion-label">Campeão</span>
                  <span className="knockout__champion-name">
                    <Escudo nome={campeao.nome} />
                    {campeao.nome}
                  </span>
                </div>
              )}
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
