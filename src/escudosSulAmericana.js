import { escudoCopaPorNome } from "./escudosCopaBrasil";
import { escudosPorNome } from "./escudos";
import bocaJuniors from "./assets/boca-juniors-footballlogos-org.png";
import bolivar from "./assets/bolivar-footylogos.png";
import cienciano from "./assets/Escudo_Cienciano.png";
import independienteSantaFe from "./assets/independiente-santa-fe-footballlogos-org.png";
import macara from "./assets/Macara_6.png";
import montevideoCityTorque from "./assets/Montevideo_City_Torque.png";
import olimpia from "./assets/Logo_de_Olimpia_2022_PNG_HD.png";
import recoleta from "./assets/Recoleta_Football_Club_logo_Paraguay_official_crest.png";
import riverPlate from "./assets/River_Plate.png";
import tigre from "./assets/tigre-argentina.png";

/** Aliases / nomes usados na Sul-Americana → escudo disponível. */
const ALIASES = {
  "Vasco da Gama": "Vasco",
  Mineiro: "Atlético-MG",
  "Atlético Mineiro": "Atlético-MG",
  "RB Bragantino": "Red Bull Bragantino",
  "Santa Fe": "Santa Fé",
  "Independiente Santa Fe": "Santa Fé",
};

const EMBUTIDOS = {
  "Boca Juniors": bocaJuniors,
  Bolívar: bolivar,
  Cienciano: cienciano,
  Recoleta: recoleta,
  "Deportivo Recoleta": recoleta,
  "Santa Fe": independienteSantaFe,
  "Independiente Santa Fe": independienteSantaFe,
  Macará: macara,
  Torque: montevideoCityTorque,
  "Montevideo City Torque": montevideoCityTorque,
  Olimpia: olimpia,
  River: riverPlate,
  "River Plate": riverPlate,
  "Santa Fé": independienteSantaFe,
  Tigre: tigre,
};

export function escudoSulaPorNome(nome) {
  if (!nome) return null;
  const alias = ALIASES[nome] || nome;
  return (
    EMBUTIDOS[nome] ||
    EMBUTIDOS[alias] ||
    escudoCopaPorNome(alias) ||
    escudoCopaPorNome(nome) ||
    escudosPorNome[alias] ||
    escudosPorNome[nome] ||
    null
  );
}
