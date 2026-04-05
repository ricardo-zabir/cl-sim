import arsenal from "./assets/arsenal-footballlogos-org.png";
import atleticoMadrid from "./assets/atletico-madrid-footballlogos-org.png";
import barcelona from "./assets/fc-barcelona-footballlogos-org.png";
import bayern from "./assets/bayern-munich-footballlogos-org.png";
import liverpool from "./assets/liverpool-fc-footballlogos-org.png";
import psg from "./assets/paris-saint-germain-footballlogos-org.png";
import realMadrid from "./assets/real-madrid-footballlogos-org.png";
import sportingCP from "./assets/sporting-cp-portugal-footballlogos-org.png";

const POR_NOME = {
  PSG: psg,
  Liverpool: liverpool,
  "Real Madrid": realMadrid,
  Bayern: bayern,
  Barcelona: barcelona,
  "Atlético de Madrid": atleticoMadrid,
  "Sporting CP": sportingCP,
  Arsenal: arsenal,
};

export function escudoUCLPorNome(nome) {
  if (!nome) return null;
  return POR_NOME[nome] ?? null;
}
