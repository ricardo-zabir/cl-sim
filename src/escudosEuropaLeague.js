import astonVilla from "./assets/aston-villa-footballlogos-org.png";
import nottinghamForest from "./assets/nottingham-forest-footballlogos-org.png";
import braga from "./assets/sc-braga-footballlogos-org.png";
import freiburg from "./assets/sc-freiburg-footballlogos-org.png";

const POR_NOME = {
  "Aston Villa": astonVilla,
  Forest: nottinghamForest,
  Braga: braga,
  Freiburg: freiburg,
};

export function escudoUELPorNome(nome) {
  if (!nome) return null;
  return POR_NOME[nome] ?? null;
}
