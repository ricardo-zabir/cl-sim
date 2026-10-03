import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { escudoUCLPorNome } from "../escudosChampionsLeague";
import {
  TOTAL_RODADAS_UCL,
  PLACARES_OFICIAIS_UCL_LIGA,
  placarUclLigaEhOficial,
  jogosDaRodada,
  calcularTabelaUclLiga,
  zonaClassificacaoUcl,
} from "../uclLiga2627";
import {
  faseLigaCompleta,
  sortearChaveUcl,
  montarSlotsProvisoriosUcl,
  montarChaveamentoUcl,
  playoffsCompletos,
} from "../uclChaveamento";
import {
  vencedorFinal,
  agregadoConfronto,
  placarKo,
  vencedorConfrontoDuplo,
} from "../knockoutLogic";

const EMAIL_CONTATO = "ricardofonseca.zabir@hotmail.com";
const CHAVE_PIX_TEMPLATE = "75df5998-b352-4f8b-a0c1-38bedec43b2c";

function Escudo({ nome, className = "team-escudo", style }) {
  const src = escudoUCLPorNome(nome);
  if (!src) {
    return (
      <span
        className={`${className} team-escudo--placeholder`}
        style={style}
        aria-hidden
      />
    );
  }
  return (
    <img
      src={src}
      alt=""
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
    />
  );
}

function fmtSg(sg) {
  if (sg > 0) return `+${sg}`;
  return String(sg);
}

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

export default function ChampionsLeagueSimulator() {
  const [fase, setFase] = useState("liga");
  const [placares, setPlacares] = useState(() => ({
    ...PLACARES_OFICIAIS_UCL_LIGA,
  }));
  const [rodada, setRodada] = useState(1);
  const [koPlacares, setKoPlacares] = useState({});
  const [sorteio, setSorteio] = useState(null);
  const [pixCopiado, setPixCopiado] = useState(false);
  const scrollYAoEditarRef = useRef(null);

  // Classificação pode atualizar um frame depois — evita o scroll “pular”
  // quando a tabela acima dos jogos remonta no mobile.
  const placaresTabela = useDeferredValue(placares);
  const tabela = useMemo(
    () => calcularTabelaUclLiga(placaresTabela),
    [placaresTabela]
  );
  const tabelaEsq = useMemo(() => tabela.slice(0, 18), [tabela]);
  const tabelaDir = useMemo(() => tabela.slice(18, 36), [tabela]);
  const jogos = useMemo(() => jogosDaRodada(rodada), [rodada]);
  const ligaOk = useMemo(() => faseLigaCompleta(placares), [placares]);
  const playoffsOk = useMemo(
    () => playoffsCompletos(sorteio, koPlacares),
    [sorteio, koPlacares]
  );

  const provisorio = useMemo(
    () => (ligaOk ? montarSlotsProvisoriosUcl(tabela) : null),
    [ligaOk, tabela]
  );

  const bracket = useMemo(
    () => montarChaveamentoUcl(sorteio, koPlacares),
    [sorteio, koPlacares]
  );

  useLayoutEffect(() => {
    if (scrollYAoEditarRef.current == null) return;
    window.scrollTo(0, scrollYAoEditarRef.current);
    scrollYAoEditarRef.current = null;
  });

  const handlePlacar = useCallback((id, lado, valor) => {
    if (placarUclLigaEhOficial(id)) return;
    const n = valor === "" ? null : Number(valor);
    scrollYAoEditarRef.current = window.scrollY;
    setPlacares((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [lado]: Number.isFinite(n) ? n : null,
      },
    }));
    setSorteio((s) => (s == null ? s : null));
    setKoPlacares((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, []);

  const handleKoChange = useCallback((id, lado, valor) => {
    if (!sorteio) return;
    const n = valor === "" ? null : Number(valor);
    setKoPlacares((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [lado]: Number.isFinite(n) ? n : null,
      },
    }));
  }, [sorteio]);

  const setGolsTime = useCallback(
    (tie, legKey, equipeNome, valor) => {
      if (!tie?.ida || !tie?.volta || !sorteio) return;
      const leg = legKey === "ida" ? tie.ida : tie.volta;
      const subId = `${tie.id}-${legKey}`;
      const lado = ladoDoPlacar(leg.mandante, leg.visitante, equipeNome);
      if (!lado) return;
      handleKoChange(subId, lado, valor);
    },
    [handleKoChange, sorteio]
  );

  const simularRodada = useCallback(() => {
    const daRodada = jogosDaRodada(rodada);
    setPlacares((prev) => {
      const next = { ...prev };
      let mudou = false;
      for (const jogo of daRodada) {
        if (placarUclLigaEhOficial(jogo.id)) continue;
        const cur = next[jogo.id] || {};
        const casaVazia = cur.casa == null;
        const foraVazia = cur.fora == null;
        if (!casaVazia && !foraVazia) continue;
        mudou = true;
        next[jogo.id] = {
          ...cur,
          casa: casaVazia ? sortearGolsSimulacao() : cur.casa,
          fora: foraVazia ? sortearGolsSimulacao() : cur.fora,
        };
      }
      return mudou ? next : prev;
    });
    setSorteio(null);
    setKoPlacares({});
  }, [rodada]);

  const rodadaTemPendencia = useMemo(
    () =>
      jogos.some((j) => {
        if (placarUclLigaEhOficial(j.id)) return false;
        const p = placares[j.id];
        return !p || p.casa == null || p.fora == null;
      }),
    [jogos, placares]
  );

  const fazerSorteio = useCallback(() => {
    if (!ligaOk) return;
    setKoPlacares({});
    setSorteio(sortearChaveUcl(tabela));
  }, [ligaOk, tabela]);

  // Se os play-offs deixarem de estar completos, volta da aba mata-mata
  useEffect(() => {
    if (fase === "mataMata" && !playoffsOk) setFase("playoffs");
  }, [fase, playoffsOk]);

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

  const campeao = useMemo(() => {
    const final = bracket.f[0];
    if (!final?.sideA || !final?.sideB) return null;
    return vencedorFinal(final, koPlacares);
  }, [bracket.f, koPlacares]);

  const renderTabela = (linhas, offset) => (
    <table className="ucl-liga-table">
      <thead>
        <tr>
          <th className="ucl-liga-table__pos">#</th>
          <th className="ucl-liga-table__time">Time</th>
          <th className="ucl-liga-table__pts-h">Pts</th>
          <th>J</th>
          <th>V</th>
          <th>SG</th>
          <th>GP</th>
        </tr>
      </thead>
      <tbody>
        {linhas.map((row, i) => {
          const pos = offset + i + 1;
          const zona = zonaClassificacaoUcl(pos);
          return (
            <tr key={row.nome} className={`ucl-liga-table__row ucl-liga-table__row--${zona}`}>
              <td className="ucl-liga-table__pos">{pos}</td>
              <td className="ucl-liga-table__time">
                <span className="ucl-liga-table__team">
                  <Escudo nome={row.nome} className="ucl-liga-table__escudo" />
                  <span className="ucl-liga-table__name" title={row.nome}>
                    {row.nome}
                  </span>
                </span>
              </td>
              <td className="ucl-liga-table__pts">{row.pts}</td>
              <td>{row.j}</td>
              <td>{row.v}</td>
              <td>{fmtSg(row.sg)}</td>
              <td>{row.gp}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const renderSlotProvisorio = (slot) => {
    if (!slot?.provisional) {
      return (
        <article key={slot?.id || "empty"} className="chave-slot chave-slot--empty">
          <p className="chave-slot__wait">Aguardando</p>
        </article>
      );
    }
    const { uns, seed } = slot.provisional;
    const rowPar = (a, b) => (
      <div className="chave-row chave-row--provisional">
        <Escudo nome={a.nome} className="chave-escudo" />
        <span className="chave-row__name" title={`${a.nome} / ${b.nome}`}>
          {a.nome} / {b.nome}
        </span>
        <Escudo nome={b.nome} className="chave-escudo" />
      </div>
    );
    return (
      <article key={slot.id} className="chave-slot chave-slot--disabled chave-slot--provisional">
        {rowPar(uns[0], uns[1])}
        {rowPar(seed[0], seed[1])}
      </article>
    );
  };

  const renderSlotDuplo = (tie, opts = {}) => {
    const { disabled = false } = opts;
    if (tie?.provisional) return renderSlotProvisorio(tie);

    if (!tie?.sideA || !tie?.sideB || !tie?.ida || !tie?.volta) {
      if (tie?.seedSide && tie?.waitingPo) {
        return (
          <article key={tie.id} className="chave-slot chave-slot--empty">
            <div className="chave-row">
              <span className="chave-row__name">Vencedor playoff</span>
            </div>
            <div className="chave-row">
              <Escudo nome={tie.seedSide.nome} className="chave-escudo" />
              <span className="chave-row__name">{tie.seedSide.nome}</span>
            </div>
          </article>
        );
      }
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
    const bloqueado = disabled || !sorteio;
    const rowOf = (time) => (time.nome === tie.sideA.nome ? 1 : 2);
    const winA =
      vencedor && vencedor !== "tie" && vencedor.nome === tie.sideA.nome;
    const winB =
      vencedor && vencedor !== "tie" && vencedor.nome === tie.sideB.nome;

    const inputGols = (leg, time, col) => {
      const placar = leg === "ida" ? idaP : volP;
      const jogo = leg === "ida" ? tie.ida : tie.volta;
      const gols = golsEquipe(placar, jogo.mandante, jogo.visitante, time.nome);
      const row = rowOf(time);
      return (
        <input
          key={`${leg}-${time.nome}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          readOnly={bloqueado}
          className={`chave-score chave-tabjogo__${leg}`}
          style={{ gridColumn: col, gridRow: row }}
          placeholder="–"
          title={leg === "ida" ? "Ida" : "Volta"}
          value={gols ?? ""}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            setGolsTime(tie, leg, time.nome, v);
          }}
        />
      );
    };

    return (
      <article
        key={tie.id}
        className={`chave-slot chave-slot--tabjogo${bloqueado ? " chave-slot--disabled" : ""}${mostrarPen ? " chave-slot--com-pen" : ""}`}
      >
        <div
          className={`chave-tabjogo__bg chave-tabjogo__bg--a${winA ? " chave-tabjogo__bg--winner" : ""}`}
          aria-hidden
        />
        <div
          className={`chave-tabjogo__bg chave-tabjogo__bg--b${winB ? " chave-tabjogo__bg--winner" : ""}`}
          aria-hidden
        />

        <Escudo
          nome={tie.sideA.nome}
          className="chave-escudo"
          style={{ gridColumn: 1, gridRow: 1 }}
        />
        <span
          className={`chave-row__name${winA ? " chave-row--winner-name" : ""}`}
          style={{ gridColumn: 2, gridRow: 1 }}
          title={tie.sideA.nome}
        >
          {tie.sideA.nome}
        </span>
        <Escudo
          nome={tie.sideB.nome}
          className="chave-escudo"
          style={{ gridColumn: 1, gridRow: 2 }}
        />
        <span
          className={`chave-row__name${winB ? " chave-row--winner-name" : ""}`}
          style={{ gridColumn: 2, gridRow: 2 }}
          title={tie.sideB.nome}
        >
          {tie.sideB.nome}
        </span>

        {inputGols("ida", tie.ida.mandante, 3)}
        {inputGols("ida", tie.ida.visitante, 3)}
        {inputGols("volta", tie.volta.mandante, 4)}
        {inputGols("volta", tie.volta.visitante, 4)}

        {mostrarPen && (
          <>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              readOnly={bloqueado}
              className="chave-score chave-score--pen"
              style={{ gridColumn: 5, gridRow: 1 }}
              placeholder="–"
              title={`Pênaltis — ${tie.sideA.nome}`}
              value={pen.a ?? ""}
              onChange={(e) =>
                handleKoChange(penId, "a", e.target.value.replace(/\D/g, ""))
              }
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              readOnly={bloqueado}
              className="chave-score chave-score--pen"
              style={{ gridColumn: 5, gridRow: 2 }}
              placeholder="–"
              title={`Pênaltis — ${tie.sideB.nome}`}
              value={pen.b ?? ""}
              onChange={(e) =>
                handleKoChange(penId, "b", e.target.value.replace(/\D/g, ""))
              }
            />
          </>
        )}
      </article>
    );
  };

  const renderFinal = (match) => {
    const disabled = !match.sideA || !match.sideB || match.pendingTie || !sorteio;
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
        <span className="chave-row__name" title={time.nome}>
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

  const renderConfrontoLinear = (tie, opts = {}) => {
    const { disabled = false, faces = null } = opts;

    if (tie?.provisional) {
      const { uns, seed, faces: facesPar } = tie.provisional;
      const pote = (a, b) => (
        <div className="ucl-po-pote">
          <span className="team-line" title={a.nome}>
            <Escudo nome={a.nome} />
            <span className="team-line__name">{a.nome}</span>
          </span>
          <span className="ucl-po-pote__sep">/</span>
          <span className="team-line" title={b.nome}>
            <Escudo nome={b.nome} />
            <span className="team-line__name">{b.nome}</span>
          </span>
        </div>
      );
      return (
        <div key={tie.id} className="ko-tie ko-tie--disabled ucl-po-card">
          <div className="ucl-po-matchup">
            {pote(uns[0], uns[1])}
            <span className="ucl-po-matchup__x" aria-hidden>
              ×
            </span>
            {pote(seed[0], seed[1])}
          </div>
          {facesPar?.[0] && facesPar?.[1] && (
            <div className="ucl-po-faces">
              <span className="ucl-po-faces__label">Vencedores enfrentam</span>
              <div className="ucl-po-faces__teams">
                <span className="team-line" title={facesPar[0].nome}>
                  <Escudo nome={facesPar[0].nome} />
                  <span className="team-line__name">{facesPar[0].nome}</span>
                </span>
                <span className="ucl-po-faces__dot" aria-hidden />
                <span className="team-line" title={facesPar[1].nome}>
                  <Escudo nome={facesPar[1].nome} />
                  <span className="team-line__name">{facesPar[1].nome}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (!tie?.sideA || !tie?.sideB || !tie?.ida || !tie?.volta) {
      return (
        <div key={tie?.id || "empty"} className="ko-tie ko-tie--placeholder">
          <p className="ko-tie__wait">Aguardando</p>
        </div>
      );
    }

    const idaId = `${tie.id}-ida`;
    const volId = `${tie.id}-volta`;
    const penId = `${tie.id}-pen`;
    const ag = agregadoConfronto(tie, koPlacares);
    const pen = placarKo(koPlacares, penId);
    const mostrarPen = ag.completo && ag.empatado;
    const primeiroPenEhSideA = tie.volta.mandante.nome === tie.sideA.nome;
    const timePenPrimeiro = primeiroPenEhSideA ? tie.sideA : tie.sideB;
    const timePenSegundo = primeiroPenEhSideA ? tie.sideB : tie.sideA;
    const valorAgPrimeiro = primeiroPenEhSideA ? ag.agA : ag.agB;
    const valorAgSegundo = primeiroPenEhSideA ? ag.agB : ag.agA;
    const valorPenPrimeiro = primeiroPenEhSideA ? pen.a : pen.b;
    const valorPenSegundo = primeiroPenEhSideA ? pen.b : pen.a;
    const penTie =
      mostrarPen && pen.a != null && pen.b != null && pen.a === pen.b;
    const bloqueado = disabled || !sorteio;
    const facesTime = faces || tie.faces || null;

    const rowLeg = (label, subId, mandante, visitante) => {
      const p = placarKo(koPlacares, subId);
      return (
        <div className="ko-leg" key={subId}>
          <div className="ko-leg__label">{label}</div>
          <div className="ko-leg__row">
            <div className="ko-leg__team ko-leg__team--home">
              <span className="team-line team-line--home" title={mandante.nome}>
                <span className="team-line__name">{mandante.nome}</span>
                <Escudo nome={mandante.nome} />
              </span>
            </div>
            <div className="ko-leg__score">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                readOnly={bloqueado}
                className="score-input"
                placeholder="–"
                value={p.casa ?? ""}
                onChange={(e) =>
                  handleKoChange(subId, "casa", e.target.value.replace(/\D/g, ""))
                }
              />
              <span className="score-sep">×</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                readOnly={bloqueado}
                className="score-input"
                placeholder="–"
                value={p.fora ?? ""}
                onChange={(e) =>
                  handleKoChange(subId, "fora", e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
            <div className="ko-leg__team ko-leg__team--away">
              <span className="team-line team-line--away" title={visitante.nome}>
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
        className={`ko-tie${bloqueado ? " ko-tie--disabled" : ""}${penTie ? " ko-tie--tie" : ""}`}
      >
        {rowLeg("Ida", idaId, tie.ida.mandante, tie.ida.visitante)}
        {rowLeg("Volta", volId, tie.volta.mandante, tie.volta.visitante)}
        {ag.completo && (
          <div className="ko-tie__agg">
            Agregado: <strong>{timePenPrimeiro.nome}</strong> {valorAgPrimeiro} ×{" "}
            {valorAgSegundo} <strong>{timePenSegundo.nome}</strong>
          </div>
        )}
        {mostrarPen && (
          <div className="ko-tie__pen">
            <span className="ko-tie__pen-label">Pênaltis</span>
            <div className="ko-tie__pen-row">
              <span className="ko-tie__pen-side" title={timePenPrimeiro.nome}>
                {timePenPrimeiro.nome}
              </span>
              <div className="ko-tie__pen-score">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  readOnly={bloqueado}
                  className="score-input score-input--pen"
                  placeholder="–"
                  value={valorPenPrimeiro ?? ""}
                  onChange={(e) =>
                    handleKoChange(
                      penId,
                      primeiroPenEhSideA ? "a" : "b",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                />
                <span className="score-sep">×</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  readOnly={bloqueado}
                  className="score-input score-input--pen"
                  placeholder="–"
                  value={valorPenSegundo ?? ""}
                  onChange={(e) =>
                    handleKoChange(
                      penId,
                      primeiroPenEhSideA ? "b" : "a",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                />
              </div>
              <span className="ko-tie__pen-side" title={timePenSegundo.nome}>
                {timePenSegundo.nome}
              </span>
            </div>
          </div>
        )}
        {facesTime?.nome && (
          <p className="ucl-po-faces">
            Vencedor enfrenta{" "}
            <span className="team-line" title={facesTime.nome}>
              <Escudo nome={facesTime.nome} />
              <span className="team-line__name">{facesTime.nome}</span>
            </span>
          </p>
        )}
      </div>
    );
  };

  const poSlots = sorteio
    ? bracket.po.map((tie, i) => ({
        ...tie,
        faces: sorteio.r16Seeds?.[i] || null,
      }))
    : (provisorio?.po || []).map((s) => ({
        id: s.id,
        provisional: s.provisional,
      }));

  const paresOitavas = chunkPares(bracket.r16);
  const paresQuartas = chunkPares(bracket.qf);
  const paresSemis = chunkPares(bracket.sf);

  return (
    <div className="app-root theme-champions-league">
      <header className="app-header">
        <Link className="app-back-home" to="/">
          ← Competições
        </Link>
        <div className="phase-tabs" role="tablist" aria-label="Fase da competição">
          <button
            type="button"
            role="tab"
            aria-selected={fase === "liga"}
            className={`phase-tabs__btn ${fase === "liga" ? "phase-tabs__btn--active" : ""}`}
            onClick={() => setFase("liga")}
          >
            Fase de liga
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={fase === "playoffs"}
            className={`phase-tabs__btn ${fase === "playoffs" ? "phase-tabs__btn--active" : ""}`}
            disabled={!ligaOk}
            title={!ligaOk ? "Preencha todos os placares da fase de liga" : undefined}
            onClick={() => ligaOk && setFase("playoffs")}
          >
            Play-offs
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={fase === "mataMata"}
            className={`phase-tabs__btn ${fase === "mataMata" ? "phase-tabs__btn--active" : ""}`}
            disabled={!playoffsOk}
            title={!playoffsOk ? "Conclua os play-offs para liberar o mata-mata" : undefined}
            onClick={() => playoffsOk && setFase("mataMata")}
          >
            Mata-mata
          </button>
        </div>
        <h1 className="app-title">Champions League 26/27</h1>
      </header>

      {fase === "liga" && (
        <div className="ucl-liga">
          <section className="ucl-liga__standings" aria-label="Classificação">
            <div className="ucl-liga__standings-head">
              <h2 className="ucl-liga__panel-title">Classificação</h2>
            </div>
            <div className="ucl-liga__tables">
              <div className="ucl-liga__table-col">{renderTabela(tabelaEsq, 0)}</div>
              <div className="ucl-liga__table-col">{renderTabela(tabelaDir, 18)}</div>
            </div>
            <div className="ucl-liga__legend" aria-label="Legenda">
              <span className="ucl-liga__legend-item ucl-liga__legend-item--r16">
                1º–8º Oitavas
              </span>
              <span className="ucl-liga__legend-item ucl-liga__legend-item--playoff">
                9º–24º Playoff
              </span>
              <span className="ucl-liga__legend-item ucl-liga__legend-item--out">
                25º–36º Eliminado
              </span>
            </div>
          </section>

          <section className="ucl-liga__fixtures" aria-label="Jogos da rodada">
            <div className="ucl-liga__fixtures-head">
              <button
                type="button"
                className="ucl-liga__rodada-btn"
                disabled={rodada <= 1}
                onClick={() => setRodada((r) => Math.max(1, r - 1))}
                aria-label="Rodada anterior"
              >
                ‹
              </button>
              <h2 className="ucl-liga__panel-title">{rodada}ª Rodada</h2>
              <button
                type="button"
                className="ucl-liga__rodada-btn"
                disabled={rodada >= TOTAL_RODADAS_UCL}
                onClick={() => setRodada((r) => Math.min(TOTAL_RODADAS_UCL, r + 1))}
                aria-label="Próxima rodada"
              >
                ›
              </button>
            </div>

            <div className="ucl-liga__simbar">
              <button
                type="button"
                className="ucl-liga__simular"
                disabled={!rodadaTemPendencia}
                title={
                  !rodadaTemPendencia
                    ? "Nada para simular nesta rodada"
                    : "Preenche placares vazios aleatoriamente"
                }
                onClick={simularRodada}
              >
                Simular rodada
              </button>
            </div>

            <ul className="ucl-liga__match-list">
              {jogos.map((jogo) => {
                const oficial = placarUclLigaEhOficial(jogo.id);
                const p = placares[jogo.id] || {};
                return (
                  <li
                    key={jogo.id}
                    className={`ucl-liga-match${oficial ? " ucl-liga-match--oficial" : ""}`}
                  >
                    <div className="ucl-liga-match__side ucl-liga-match__side--home">
                      <span className="ucl-liga-match__name" title={jogo.casa}>
                        {jogo.casa}
                      </span>
                      <Escudo nome={jogo.casa} className="ucl-liga-match__escudo" />
                    </div>
                    <div className="ucl-liga-match__score">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="ucl-liga-match__input"
                        placeholder="–"
                        readOnly={oficial}
                        title={oficial ? "Placar oficial" : `${jogo.casa} (casa)`}
                        value={p.casa ?? ""}
                        onChange={(e) =>
                          handlePlacar(jogo.id, "casa", e.target.value.replace(/\D/g, ""))
                        }
                      />
                      <span className="ucl-liga-match__sep">×</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="ucl-liga-match__input"
                        placeholder="–"
                        readOnly={oficial}
                        title={oficial ? "Placar oficial" : `${jogo.fora} (fora)`}
                        value={p.fora ?? ""}
                        onChange={(e) =>
                          handlePlacar(jogo.id, "fora", e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                    <div className="ucl-liga-match__side ucl-liga-match__side--away">
                      <Escudo nome={jogo.fora} className="ucl-liga-match__escudo" />
                      <span className="ucl-liga-match__name" title={jogo.fora}>
                        {jogo.fora}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}

      {fase === "playoffs" && ligaOk && (
        <div className="knockout">
          <div className="ucl-chave__toolbar">
            <button type="button" className="knockout__sortear" onClick={fazerSorteio}>
              {sorteio ? "Resortear play-offs" : "Sortear play-offs"}
            </button>
          </div>

          <div className="bracket">
            <section className="bracket__round">
              <h2 className="bracket__title">Play-offs</h2>
              <div className="bracket__matches bracket__matches--ties">
                {poSlots.map((tie) =>
                  renderConfrontoLinear(tie, { disabled: !sorteio })
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {fase === "mataMata" && playoffsOk && (
        <div className="knockout knockout--ucl">
          <div className="chave-wrap">
            <div className="chave" role="region" aria-label="Chaveamento Champions League">
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
                      {renderFinal(m)}
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
