import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import logoLibertadores from "../assets/copa-libertadores-logo.png";
import logoSulAmericana from "../assets/copa-sul-americana-logo.png";
import logoCopaBrasil from "../assets/CopaDoBrasil.png";
import logoChampionsLeague from "../assets/Logo_UEFA_Champions_League.png";
import "../App.css";

const EMAIL_CONTATO = "ricardofonseca.zabir@hotmail.com";
const CHAVE_PIX_TEMPLATE = "75df5998-b352-4f8b-a0c1-38bedec43b2c";

const COMPETICOES = [
  {
    id: "libertadores",
    to: "/copa-libertadores",
    logo: logoLibertadores,
    title: "Copa Libertadores",
    meta: "La Gloria Eterna",
  },
  {
    id: "sul-americana",
    to: "/copa-sul-americana",
    logo: logoSulAmericana,
    title: "Copa Sul-Americana",
    meta: "La Gran Conquista",
  },
  {
    id: "copa-do-brasil",
    to: "/copa-do-brasil",
    logo: logoCopaBrasil,
    title: "Copa do Brasil",
    meta: "A Taça do Povo",
  },
  {
    id: "champions-league",
    to: "/champions-league",
    logo: logoChampionsLeague,
    title: "Champions League 26/27",
    meta: "The Beautiful Game",
  },
];

export default function Home() {
  const [pixCopiado, setPixCopiado] = useState(false);

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

  return (
    <div className="app-root home-page">
      <header className="home-header">
        <h1 className="app-title">SimFut</h1>
        <p className="app-subtitle">
          Simule o futebol. Escreva a história.
        </p>
      </header>

      <ul className="home-competitions">
        {COMPETICOES.map((c) => {
          const content = (
            <>
              {c.logo ? (
                <img
                  src={c.logo}
                  alt=""
                  className="home-competition-card__logo"
                />
              ) : (
                <span className="home-competition-card__logo home-competition-card__logo--placeholder" aria-hidden />
              )}
              <div className="home-competition-card__body">
                <h2 className="home-competition-card__title">{c.title}</h2>
                <p className="home-competition-card__meta">{c.meta}</p>
              </div>
              {c.to ? (
                <span className="home-competition-card__chev" aria-hidden>
                  ›
                </span>
              ) : null}
            </>
          );

          return (
            <li key={c.id}>
              {c.to ? (
                <Link className="home-competition-card" to={c.to}>
                  {content}
                </Link>
              ) : (
                <div className="home-competition-card home-competition-card--soon">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>

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
