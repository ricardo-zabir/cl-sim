import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { escudoCopaPorNome } from "../escudosCopaBrasil";
import { montarConfrontosQuintaFase } from "../copaBrasilQuintaFase";
import {
  sortearConfrontosIdaVolta,
  confrontoDuploEntre,
  stripPos,
  vencedorFinal,
  vencedorConfrontoDuplo,
  agregadoConfronto,
  placarKo,
} from "../knockoutLogic";

function Escudo({ nome }) {
  const src = escudoCopaPorNome(nome);
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

const EMAIL_CONTATO = "ricardofonseca.zabir@hotmail.com";
const CHAVE_PIX_TEMPLATE = "75df5998-b352-4f8b-a0c1-38bedec43b2c";

const N_CONFRONTOS_OITAVAS = 8;
const N_CONFRONTOS_QUARTAS = 4;
const N_CONFRONTOS_SEMIS = 2;

function rotuloTime(t) {
  if (!t) return "—";
  return t.nome;
}

function faseDuplaConcluida(ties, placares) {
  if (!ties?.length) return false;
  return ties.every((t) => {
    const w = vencedorConfrontoDuplo(t, placares);
    return w != null && w !== "tie";
  });
}

function removerPlacaresPorPrefixo(placares, prefixos) {
  const next = { ...placares };
  let mudou = false;
  for (const k of Object.keys(next)) {
    if (prefixos.some((p) => k.startsWith(p))) {
      delete next[k];
      mudou = true;
    }
  }
  return mudou ? next : placares;
}

export default function CopaDoBrasilSimulator() {
  const quintaTies = useMemo(() => montarConfrontosQuintaFase(), []);

  const [etapa, setEtapa] = useState("quinta");
  const [tiesOitavas, setTiesOitavas] = useState(null);
  const [tiesQuartas, setTiesQuartas] = useState(null);
  const [tiesSemis, setTiesSemis] = useState(null);

  const [koPlacares, setKoPlacares] = useState({});
  const [pixCopiado, setPixCopiado] = useState(false);

  const semisFormadasPorVencedoresRef = useRef("");

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

  const quintaOk = faseDuplaConcluida(quintaTies, koPlacares);
  const oitavasOk = tiesOitavas && faseDuplaConcluida(tiesOitavas, koPlacares);

  const sortearOitavas = () => {
    if (!quintaOk) return;
    const vencedores = quintaTies.map((t) => vencedorConfrontoDuplo(t, koPlacares));
    const ties = sortearConfrontosIdaVolta(vencedores, "o8");
    setKoPlacares((p) => removerPlacaresPorPrefixo(p, ["o8-", "q4-", "s2-", "f-"]));
    setTiesOitavas(ties);
    setTiesQuartas(null);
    setTiesSemis(null);
    setEtapa("oitavas");
  };

  const sortearQuartas = () => {
    if (!oitavasOk || !tiesOitavas) return;
    const vencedores = tiesOitavas.map((t) => vencedorConfrontoDuplo(t, koPlacares));
    const ties = sortearConfrontosIdaVolta(vencedores, "q4");
    setKoPlacares((p) => removerPlacaresPorPrefixo(p, ["q4-", "s2-", "f-"]));
    setTiesQuartas(ties);
    setTiesSemis(null);
    semisFormadasPorVencedoresRef.current = "";
    setEtapa("quartas");
  };

  useEffect(() => {
    if (!tiesQuartas) {
      semisFormadasPorVencedoresRef.current = "";
      setTiesSemis(null);
      return;
    }

    if (!faseDuplaConcluida(tiesQuartas, koPlacares)) {
      semisFormadasPorVencedoresRef.current = "";
      setTiesSemis(null);
      setKoPlacares((p) => removerPlacaresPorPrefixo(p, ["s2-", "f-"]));
      setEtapa((e) => (e === "semis" ? "quartas" : e));
      return;
    }

    const w = tiesQuartas.map((t) => vencedorConfrontoDuplo(t, koPlacares));
    if (w.some((x) => !x || x === "tie")) {
      semisFormadasPorVencedoresRef.current = "";
      setTiesSemis(null);
      setKoPlacares((p) => removerPlacaresPorPrefixo(p, ["s2-", "f-"]));
      setEtapa((e) => (e === "semis" ? "quartas" : e));
      return;
    }

    const assinatura = w.map((x) => x.nome).join("|");
    if (assinatura === semisFormadasPorVencedoresRef.current) return;

    semisFormadasPorVencedoresRef.current = assinatura;
    setKoPlacares((p) => removerPlacaresPorPrefixo(p, ["s2-", "f-"]));
    setTiesSemis([
      confrontoDuploEntre(w[0], w[1], "s2-0"),
      confrontoDuploEntre(w[2], w[3], "s2-1"),
    ]);
    setEtapa("semis");
  }, [tiesQuartas, koPlacares]);

  const finalMatch = useMemo(() => {
    if (!tiesSemis || tiesSemis.length !== 2) return null;
    const wa = vencedorConfrontoDuplo(tiesSemis[0], koPlacares);
    const wb = vencedorConfrontoDuplo(tiesSemis[1], koPlacares);
    if (!wa || !wb || wa === "tie" || wb === "tie") return null;
    return {
      id: "f-0",
      tipo: "unica",
      sideA: stripPos(wa),
      sideB: stripPos(wb),
      pendingTie: false,
    };
  }, [tiesSemis, koPlacares]);

  const campeao = useMemo(() => {
    if (!finalMatch?.sideA || !finalMatch?.sideB) return null;
    return vencedorFinal(finalMatch, koPlacares);
  }, [finalMatch, koPlacares]);

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
    <div className="app-root theme-copa-brasil">
      <header className="app-header">
        <Link className="app-back-home" to="/">
          ← Competições
        </Link>
        <h1 className="app-title">Simulador Copa do Brasil</h1>
        <p className="app-subtitle">
          Começa na quinta fase com os 16 confrontos oficiais. Depois, sorteio livre nas oitavas e nas quartas; ao
          fechar as quartas, as semifinais montam sozinhas (1ª quarta × 2ª; 3ª × 4ª). Final em jogo único; empate no
          agregado ou na final vai para pênaltis.
        </p>
      </header>

      <div className="knockout">
        <div className="bracket">
          <section className="bracket__round">
            <h2 className="bracket__title">Quinta fase</h2>
            <div className="bracket__matches bracket__matches--ties">
              {quintaTies.map((m) =>
                renderConfrontoDuplo(m, { disabled: etapa !== "quinta" })
              )}
            </div>
            <div className="knockout__actions knockout__actions--after-round">
              <button
                type="button"
                className="knockout__sortear"
                disabled={!quintaOk}
                title={
                  !quintaOk
                    ? "Preencha todos os confrontos da quinta fase com placares válidos"
                    : undefined
                }
                onClick={sortearOitavas}
              >
                Sortear oitavas de final
              </button>
              {tiesOitavas && (
                <span className="knockout__hint">
                  Sortear de novo zera placares das oitavas e das fases seguintes.
                </span>
              )}
            </div>
          </section>

          <section className="bracket__round">
            <h2 className="bracket__title">Oitavas de final (sorteio)</h2>
            <div className="bracket__matches bracket__matches--ties">
              {tiesOitavas
                ? tiesOitavas.map((m) =>
                    renderConfrontoDuplo(m, {
                      disabled: etapa !== "oitavas",
                    })
                  )
                : Array.from({ length: N_CONFRONTOS_OITAVAS }, (_, i) => (
                    <div key={`o8-ph-${i}`} className="ko-tie ko-tie--placeholder">
                      <p className="ko-tie__wait">Aguardando sorteio</p>
                    </div>
                  ))}
            </div>
            <div className="knockout__actions knockout__actions--after-round">
              <button
                type="button"
                className="knockout__sortear"
                disabled={!oitavasOk || !tiesOitavas}
                title={
                  !tiesOitavas
                    ? "Sorteie primeiro as oitavas de final"
                    : !oitavasOk
                      ? "Preencha todos os confrontos das oitavas com placares válidos"
                      : undefined
                }
                onClick={sortearQuartas}
              >
                Sortear quartas de final
              </button>
              {tiesQuartas && (
                <span className="knockout__hint">
                  Sortear de novo zera placares das quartas e das fases seguintes; mantém oitavas.
                </span>
              )}
            </div>
          </section>

          <section className="bracket__round">
            <h2 className="bracket__title">Quartas de final (sorteio)</h2>
            <div className="bracket__matches bracket__matches--ties">
              {tiesQuartas
                ? tiesQuartas.map((m) =>
                    renderConfrontoDuplo(m, {
                      disabled: etapa !== "quartas",
                    })
                  )
                : Array.from({ length: N_CONFRONTOS_QUARTAS }, (_, i) => (
                    <div key={`q4-ph-${i}`} className="ko-tie ko-tie--placeholder">
                      <p className="ko-tie__wait">Aguardando sorteio</p>
                    </div>
                  ))}
            </div>
          </section>

          <section className="bracket__round">
            <h2 className="bracket__title">Semifinais</h2>
            <p className="knockout__intro-text" style={{ marginBottom: "1rem" }}>
              Vencedor da 1ª quarta contra o da 2ª; vencedor da 3ª contra o da 4ª. Mando da volta sorteado.
            </p>
            <div className="bracket__matches bracket__matches--ties">
              {tiesSemis
                ? tiesSemis.map((m) =>
                    renderConfrontoDuplo(m, {
                      disabled: etapa !== "semis",
                    })
                  )
                : Array.from({ length: N_CONFRONTOS_SEMIS }, (_, i) => (
                    <div key={`s2-ph-${i}`} className="ko-tie ko-tie--placeholder">
                      <p className="ko-tie__wait">Preencha as quartas para definir as semifinais</p>
                    </div>
                  ))}
            </div>
          </section>

          <section className="bracket__round bracket__round--final">
            <h2 className="bracket__title">Final</h2>
            <div className="bracket__matches">
              {finalMatch ? (
                renderFinal(finalMatch)
              ) : (
                <div className="ko-tie ko-tie--placeholder">
                  <p className="ko-tie__wait">Aguardando final</p>
                </div>
              )}
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
      </div>

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
