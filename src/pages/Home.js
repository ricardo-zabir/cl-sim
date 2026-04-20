import React from "react";
import { Link } from "react-router-dom";
import logoLibertadores from "../assets/copa-libertadores-logo.png";
import logoCopaBrasil from "../assets/CopaDoBrasil.png";
import logoChampionsLeague from "../assets/Logo_UEFA_Champions_League.png";
import logoEuropaLeague from "../assets/new-uefa-europa-league-logo-vector-11573941629yib9g5ics6.png";
import logoWorldCup2026 from "../assets/world-cup-2026-footballlogos-org.png";
import "../App.css";

export default function Home() {
  return (
    <div className="app-root home-page">
      <header className="home-header">
        <h1 className="app-title">Simuladores</h1>
        <p className="app-subtitle">
          Escolha uma competição para abrir o simulador.
        </p>
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
    </div>
  );
}
