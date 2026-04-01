import { escudosPorNome } from "./escudos";
import athleticMG from "./assets/athletic-brazil-footballlogos-org.png";
import atleticoMineiro from "./assets/atletico-mineiro-footballlogos-org.png";
import athleticoPR from "./assets/athletico-paranaense-footballlogos-org.png";
import atleticoGoianiense from "./assets/atletico-goianiense-footballlogos-org.png";
import chapecoense from "./assets/chapecoense-footballlogos-org.png";
import coritiba from "./assets/coritiba-footballlogos-org.png";
import bahia from "./assets/bahia-footballlogos-org.png";
import barraSC from "./assets/Barra_FC_2021_crest.png";
import botafogo from "./assets/botafogo-footballlogos-org.png";
import ceara from "./assets/ceara-fc-footballlogos-org.png";
import confiancaSE from "./assets/logo-confianca-se-512.png";
import corinthians from "./assets/corinthians-footballlogos-org.png";
import crb from "./assets/crb-footballlogos-org.png";
import cruzeiro from "./assets/cruzeiro-footballlogos-org.png";
import flamengo from "./assets/flamengo-crf-footballlogos-org.png";
import fluminense from "./assets/fluminense-footballlogos-org.png";
import fortaleza from "./assets/fortaleza-footballlogos-org.png";
import goias from "./assets/goias-footballlogos-org.png";
import gremio from "./assets/gremio-footballlogos-org.png";
import internacional from "./assets/sc-internacional-footballlogos-org.png";
import jacuipense from "./assets/ECJacuipense.png";
import juventude from "./assets/juventude-footballlogos-org.png";
import mirassol from "./assets/mirassol-fc-footballlogos-org.png";
import operarioPR from "./assets/operario-ferroviario-footballlogos-org.png";
import palmeiras from "./assets/palmeiras-footballlogos-org.png";
import paysandu from "./assets/paysandu-footballlogos-org.png";
import rbBragantino from "./assets/rb-bragantino-footballlogos-org.png";
import santos from "./assets/santos-fc-footballlogos-org.png";
import saoPaulo from "./assets/sao-paulo-spfc-footballlogos-org.png";
import remo from "./assets/clube-de-remo-footballlogos-org.png";
import vasco from "./assets/vasco-de-gama-footballlogos-org.png";
import vitoria from "./assets/vitoria-footballlogos-org.png";

/** Nome do arquivo (sem .png, minúsculo, hífen) → nome do time no simulador */
const SLUG_PARA_NOME = {
  "atletico-mg": "Atlético-MG",
  ceara: "Ceará",
  cruzeiro: "Cruzeiro",
  goias: "Goiás",
  "athletico-pr": "Athletico-PR",
  "atletico-go": "Atlético-GO",
  flamengo: "Flamengo",
  vitoria: "Vitória",
  gremio: "Grêmio",
  "confianca-se": "Confiança-SE",
  vasco: "Vasco",
  paysandu: "Paysandu",
  fortaleza: "Fortaleza",
  crb: "CRB",
  bahia: "Bahia",
  remo: "Remo",
  botafogo: "Botafogo",
  chapecoense: "Chapecoense",
  "red-bull-bragantino": "Red Bull Bragantino",
  mirassol: "Mirassol",
  corinthians: "Corinthians",
  "barra-sc": "Barra-SC",
  fluminense: "Fluminense",
  "operario-pr": "Operário-PR",
  palmeiras: "Palmeiras",
  "jacuipense-ba": "Jacuipense-BA",
  internacional: "Internacional",
  "athletic-mg": "Athletic-MG",
  santos: "Santos",
  coritiba: "Coritiba",
  "sao-paulo": "São Paulo",
  juventude: "Juventude",
};

const EMBUTIDOS = {
  "Atlético-MG": atleticoMineiro,
  "Athletico-PR": athleticoPR,
  "Atlético-GO": atleticoGoianiense,
  "Athletic-MG": athleticMG,
  Bahia: bahia,
  "Barra-SC": barraSC,
  Botafogo: botafogo,
  Ceará: ceara,
  Chapecoense: chapecoense,
  "Confiança-SE": confiancaSE,
  Corinthians: corinthians,
  Coritiba: coritiba,
  CRB: crb,
  Cruzeiro: cruzeiro,
  Flamengo: flamengo,
  Fluminense: fluminense,
  Fortaleza: fortaleza,
  Goiás: goias,
  "Grêmio": gremio,
  Internacional: internacional,
  "Jacuipense-BA": jacuipense,
  Juventude: juventude,
  Mirassol: mirassol,
  "Operário-PR": operarioPR,
  Palmeiras: palmeiras,
  Paysandu: paysandu,
  "Red Bull Bragantino": rbBragantino,
  Remo: remo,
  Santos: santos,
  "São Paulo": saoPaulo,
  Vasco: vasco,
  Vitória: vitoria,
};

function carregarEscudosDaPasta() {
  const map = {};
  try {
    const req = require.context("./assets/copa-brasil", false, /\.png$/i);
    req.keys().forEach((key) => {
      const slug = key
        .replace(/^\.\//, "")
        .replace(/\.png$/i, "")
        .toLowerCase();
      const nome = SLUG_PARA_NOME[slug];
      if (nome) map[nome] = req(key);
    });
  } catch {
    /* pasta vazia ou indisponível no bundle */
  }
  return map;
}

const ESCUDOS_PASTA_COPA = carregarEscudosDaPasta();

/**
 * Escudo para o simulador da Copa do Brasil.
 * 1) PNG em `src/assets/copa-brasil/<slug>.png` (veja SLUG_PARA_NOME em escudosCopaBrasil.js)
 * 2) Times com arte já no projeto (Flamengo, Palmeiras, etc.)
 * 3) Demais entradas de escudos.js (Libertadores), se existirem
 */
export function escudoCopaPorNome(nome) {
  if (!nome) return null;
  return (
    ESCUDOS_PASTA_COPA[nome] ||
    EMBUTIDOS[nome] ||
    escudosPorNome[nome] ||
    null
  );
}
