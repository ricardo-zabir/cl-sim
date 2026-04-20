import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { escudoUELPorNome } from "../escudosEuropaLeague";
import {
  montarSemifinaisEuropaLeague,
  montarChaveamentoEuropaLeague,
} from "../europaLeagueSemifinais";
import { vencedorFinal, agregadoConfronto, placarKo } from "../knockoutLogic";

const EMAIL_CONTATO = "ricardofonseca.zabir@hotmail.com";
const CHAVE_PIX_TEMPLATE = "75df5998-b352-4f8b-a0c1-38bedec43b2c";

function Escudo({ nome }) {
  const src = escudoUELPorNome(nome);
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

function rotuloTime(t) {
  if (!t) return "—";
  return t.nome;
}

export default function EuropaLeagueSimulator() {
  const semifinaisTies = useMemo(() => montarSemifinaisEuropaLeague(), []);
  const [koPlacares, setKoPlacares] = useState({});
  const [pixCopiado, setPixCopiado] = useState(false);

  const bracket = useMemo(
    () => montarChaveamentoEuropaLeague(semifinaisTies, koPlacares),
    [semifinaisTies, koPlacares]
  );

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
    const primeiroPenEhSideA = tie.volta.mandante.nome === tie.sideA.nome;
    const timePenPrimeiro = primeiroPenEhSideA ? tie.sideA : tie.sideB;
    const timePenSegundo = primeiroPenEhSideA ? tie.sideB : tie.sideA;
    const valorAgPrimeiro = primeiroPenEhSideA ? ag.agA : ag.agB;
    const valorAgSegundo = primeiroPenEhSideA ? ag.agB : ag.agA;
    const valorPenPrimeiro = primeiroPenEhSideA ? pen.a : pen.b;
    const valorPenSegundo = primeiroPenEhSideA ? pen.b : pen.a;
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
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={disabled}
                  className="score-input score-input--pen"
                  placeholder="–"
                  value={valorPenPrimeiro ?? ""}
                  onChange={(e) =>
                    handleKoChange(
                      penId,
                      primeiroPenEhSideA ? "a" : "b",
                      e.target.value
                    )
                  }
                />
                <span className="score-sep">×</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  disabled={disabled}
                  className="score-input score-input--pen"
                  placeholder="–"
                  value={valorPenSegundo ?? ""}
                  onChange={(e) =>
                    handleKoChange(
                      penId,
                      primeiroPenEhSideA ? "b" : "a",
                      e.target.value
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
        {regTie && match.sideA && match.sideB && (
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
    <div className="app-root theme-europa-league">
      <header className="app-header">
        <Link className="app-back-home" to="/">
          ← Competições
        </Link>
        <h1 className="app-title">Simulador Europa League</h1>
        <p className="app-subtitle">
          Semifinais com ida e volta e final em jogo único.
        </p>
      </header>

      <div className="knockout">
        <div className="bracket">
          <section className="bracket__round">
            <h2 className="bracket__title">Semifinais</h2>
            <div className="bracket__matches bracket__matches--ties">
              {bracket.sf.map((m) => renderConfrontoDuplo(m, { disabled: false }))}
            </div>
          </section>

          <section className="bracket__round bracket__round--final">
            <h2 className="bracket__title">Final</h2>
            <div className="bracket__matches">
              {bracket.f.map((m) => renderFinal(m))}
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
