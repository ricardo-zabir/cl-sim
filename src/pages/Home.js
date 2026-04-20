import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import logoLibertadores from "../assets/copa-libertadores-logo.png";
import logoCopaBrasil from "../assets/CopaDoBrasil.png";
import logoChampionsLeague from "../assets/Logo_UEFA_Champions_League.png";
import logoEuropaLeague from "../assets/new-uefa-europa-league-logo-vector-11573941629yib9g5ics6.png";
import logoWorldCup2026 from "../assets/world-cup-2026-footballlogos-org.png";
import "../App.css";

const EMAIL_CONTATO = "ricardofonseca.zabir@hotmail.com";
const CHAVE_PIX_TEMPLATE = "75df5998-b352-4f8b-a0c1-38bedec43b2c";

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
        <h1 className="app-title">Simuladores</h1>
        <p className="app-subtitle">
          Escolha uma competição para abrir o simulador.
        </p>
        <span className="home-header__meta">5 competições disponíveis</span>
      </header>

      <ul className="home-competitions">
        <li>
          <Link className="home-competition-card" to="/copa-do-mundo-2026">
            <img
              src={logoWorldCup2026}
              alt=""
              className="home-competition-card__logo"
            />
            <div className="home-competition-card__body">
              <h2 className="home-competition-card__title">Copa do Mundo 2026</h2>
              <p className="home-competition-card__meta">
                12 grupos, turno único e tabela ao vivo
              </p>
            </div>
            <span className="home-competition-card__chev" aria-hidden>
              ›
            </span>
          </Link>
        </li>
        <li>
          <Link className="home-competition-card" to="/copa-libertadores">
            <img
              src={logoLibertadores}
              alt=""
              className="home-competition-card__logo"
            />
            <div className="home-competition-card__body">
              <h2 className="home-competition-card__title">Copa Libertadores</h2>
              <p className="home-competition-card__meta">
                Fase de grupos, mata-mata e regras 2026
              </p>
            </div>
            <span className="home-competition-card__chev" aria-hidden>
              ›
            </span>
          </Link>
        </li>
        <li>
          <Link className="home-competition-card" to="/champions-league">
            <img
              src={logoChampionsLeague}
              alt=""
              className="home-competition-card__logo"
            />
            <div className="home-competition-card__body">
              <h2 className="home-competition-card__title">Champions League</h2>
              <p className="home-competition-card__meta">
                Quartas fixas, semifinais em chave e final única
              </p>
            </div>
            <span className="home-competition-card__chev" aria-hidden>
              ›
            </span>
          </Link>
        </li>
        <li>
          <Link className="home-competition-card" to="/copa-do-brasil">
            <img
              src={logoCopaBrasil}
              alt=""
              className="home-competition-card__logo"
            />
            <div className="home-competition-card__body">
              <h2 className="home-competition-card__title">Copa do Brasil</h2>
              <p className="home-competition-card__meta">
                Quinta fase fixa, sorteio nas oitavas e quartas, final única
              </p>
            </div>
            <span className="home-competition-card__chev" aria-hidden>
              ›
            </span>
          </Link>
        </li>
        <li>
          <Link className="home-competition-card" to="/europa-league">
            <img
              src={logoEuropaLeague}
              alt=""
              className="home-competition-card__logo"
            />
            <div className="home-competition-card__body">
              <h2 className="home-competition-card__title">Europa League</h2>
              <p className="home-competition-card__meta">
                Semifinais fixas, ida e volta, final em jogo único
              </p>
            </div>
            <span className="home-competition-card__chev" aria-hidden>
              ›
            </span>
          </Link>
        </li>
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
