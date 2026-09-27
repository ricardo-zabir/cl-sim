import React, { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { escudoSulaPorNome } from "../escudosSulAmericana";
import {
  montarOitavasSulAmericana,
  montarChaveamentoSulAmericana,
} from "../sulaChaveamento";
import {
  PLACARES_OFICIAIS_SULA,
  placarSulaEhOficial,
} from "../sulaOficialPlacares";
import {
  vencedorFinal,
  agregadoConfronto,
  placarKo,
  vencedorConfrontoDuplo,
} from "../knockoutLogic";

const EMAIL_CONTATO = "ricardofonseca.zabir@hotmail.com";
const CHAVE_PIX_TEMPLATE = "75df5998-b352-4f8b-a0c1-38bedec43b2c";

function Escudo({ nome }) {
  const src = escudoSulaPorNome(nome);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      className="chave-escudo"
      loading="lazy"
      decoding="async"
    />
  );
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

export default function CopaSulAmericanaSimulator() {
  const oitavasTies = useMemo(() => montarOitavasSulAmericana(), []);
  const [koPlacares, setKoPlacares] = useState(() => ({
    ...PLACARES_OFICIAIS_SULA,
  }));
  const [pixCopiado, setPixCopiado] = useState(false);

  const bracket = useMemo(
    () => montarChaveamentoSulAmericana(oitavasTies, koPlacares),
    [oitavasTies, koPlacares]
  );

  const handleKoChange = useCallback((id, lado, valor) => {
    if (placarSulaEhOficial(id)) return;
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
      const lado = ladoDoPlacar(leg.mandante, leg.visitante, equipeNome);
      if (!lado) return;
      handleKoChange(subId, lado, valor);
    },
    [handleKoChange]
  );

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
    const penTravado = placarSulaEhOficial(penId);
    const idaTravado = placarSulaEhOficial(idaId);
    const volTravado = placarSulaEhOficial(volId);
    const vencedor = vencedorConfrontoDuplo(tie, koPlacares);
    const bloqueado = disabled || !tie.sideA || !tie.sideB;

    const rowTime = (time, penLado) => {
      const gIda = golsEquipe(idaP, tie.ida.mandante, tie.ida.visitante, time.nome);
      const gVol = golsEquipe(volP, tie.volta.mandante, tie.volta.visitante, time.nome);
      const avancou = vencedor && vencedor !== "tie" && vencedor.nome === time.nome;
      return (
        <div
          key={time.nome}
          className={`chave-row${avancou ? " chave-row--winner" : ""}`}
        >
          <Escudo nome={time.nome} />
          <span className="chave-row__name" title={time.nome}>
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

  const renderFinal = (match) => {
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
        <Escudo nome={time.nome} />
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

  const paresOitavas = chunkPares(bracket.r16);
  const paresQuartas = chunkPares(bracket.qf);
  const paresSemis = chunkPares(bracket.sf);

  return (
    <div className="app-root theme-sul-americana">
      <header className="app-header">
        <Link className="app-back-home" to="/">
          ← Competições
        </Link>
        <h1 className="app-title">Simulador Copa Sul-Americana 2026</h1>
      </header>

      <div className="chave-wrap">
        <div className="chave" role="region" aria-label="Chaveamento Sul-Americana">
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
                    <Escudo nome={campeao.nome} />
                    {campeao.nome}
                  </span>
                </div>
              )}
            </div>
          </div>
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
