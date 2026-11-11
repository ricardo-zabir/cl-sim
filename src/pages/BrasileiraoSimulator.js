import React, {
  useCallback,
  useDeferredValue,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { escudoCopaPorNome } from "../escudosCopaBrasil";
import {
  TOTAL_RODADAS_BRA,
  PLACARES_OFICIAIS_BRA,
  placarBraEhOficial,
  jogosDaRodadaBra,
  calcularTabelaBra,
  zonaClassificacaoBra,
} from "../brasileiraoSerieA2026";

const EMAIL_CONTATO = "ricardofonseca.zabir@hotmail.com";
const CHAVE_PIX_TEMPLATE = "75df5998-b352-4f8b-a0c1-38bedec43b2c";

function Escudo({ nome, className = "team-escudo", style }) {
  const src = escudoCopaPorNome(nome);
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

export default function BrasileiraoSimulator() {
  const [placares, setPlacares] = useState(() => ({
    ...PLACARES_OFICIAIS_BRA,
  }));
  const [rodada, setRodada] = useState(21);
  const [pixCopiado, setPixCopiado] = useState(false);
  const scrollYAoEditarRef = useRef(null);

  const placaresTabela = useDeferredValue(placares);
  const tabela = useMemo(
    () => calcularTabelaBra(placaresTabela),
    [placaresTabela]
  );
  const tabelaEsq = useMemo(() => tabela.slice(0, 10), [tabela]);
  const tabelaDir = useMemo(() => tabela.slice(10, 20), [tabela]);
  const jogos = useMemo(() => jogosDaRodadaBra(rodada), [rodada]);

  useLayoutEffect(() => {
    if (scrollYAoEditarRef.current == null) return;
    window.scrollTo(0, scrollYAoEditarRef.current);
    scrollYAoEditarRef.current = null;
  });

  const handlePlacar = useCallback((id, lado, valor) => {
    if (placarBraEhOficial(id)) return;
    const n = valor === "" ? null : Number(valor);
    scrollYAoEditarRef.current = window.scrollY;
    setPlacares((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [lado]: Number.isFinite(n) ? n : null,
      },
    }));
  }, []);

  const simularRodada = useCallback(() => {
    const daRodada = jogosDaRodadaBra(rodada);
    setPlacares((prev) => {
      const next = { ...prev };
      let mudou = false;
      for (const jogo of daRodada) {
        if (placarBraEhOficial(jogo.id)) continue;
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
  }, [rodada]);

  const rodadaTemPendencia = useMemo(
    () =>
      jogos.some((j) => {
        if (placarBraEhOficial(j.id)) return false;
        const p = placares[j.id];
        return !p || p.casa == null || p.fora == null;
      }),
    [jogos, placares]
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
          const zona = zonaClassificacaoBra(pos);
          return (
            <tr
              key={row.nome}
              className={`ucl-liga-table__row ucl-liga-table__row--${zona}`}
            >
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

  return (
    <div className="app-root theme-brasileirao">
      <header className="app-header">
        <Link className="app-back-home" to="/">
          ← Competições
        </Link>
        <h1 className="app-title">Brasileirão Série A 2026</h1>
      </header>

      <div className="ucl-liga bra-liga">
        <section className="ucl-liga__standings" aria-label="Classificação">
          <div className="ucl-liga__standings-head">
            <h2 className="ucl-liga__panel-title">Classificação</h2>
          </div>
          <div className="ucl-liga__tables">
            <div className="ucl-liga__table-col">{renderTabela(tabelaEsq, 0)}</div>
            <div className="ucl-liga__table-col">{renderTabela(tabelaDir, 10)}</div>
          </div>
          <div className="ucl-liga__legend" aria-label="Legenda">
            <span className="ucl-liga__legend-item ucl-liga__legend-item--libertadores">
              1º–4º Libertadores
            </span>
            <span className="ucl-liga__legend-item ucl-liga__legend-item--preLibertadores">
              5º–6º Pré-Libertadores
            </span>
            <span className="ucl-liga__legend-item ucl-liga__legend-item--sulamericana">
              7º–12º Sul-Americana
            </span>
            <span className="ucl-liga__legend-item ucl-liga__legend-item--rebaixamento">
              17º–20º Rebaixamento
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
              disabled={rodada >= TOTAL_RODADAS_BRA}
              onClick={() => setRodada((r) => Math.min(TOTAL_RODADAS_BRA, r + 1))}
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
              const oficial = placarBraEhOficial(jogo.id);
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
                        handlePlacar(
                          jogo.id,
                          "casa",
                          e.target.value.replace(/\D/g, "")
                        )
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
                        handlePlacar(
                          jogo.id,
                          "fora",
                          e.target.value.replace(/\D/g, "")
                        )
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

      <footer className="support-footer">
        <section className="support-block support-block--feedback">
          <p className="support-footer__text">
            Qualquer sugestão, feedback ou ideia é muito bem-vinda — vou adorar
            ouvir você!
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
            Se quiser apoiar com uma pequena contribuição para manter o projeto e
            ajudar a criar novas ideias, fique à vontade para usar PIX.
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
