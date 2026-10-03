import arsenal from "./assets/arsenal-footballlogos-org.png";
import atleticoMadrid from "./assets/atletico-madrid-footballlogos-org.png";
import astonVilla from "./assets/aston-villa-footballlogos-org.png";
import barcelona from "./assets/fc-barcelona-footballlogos-org.png";
import bayern from "./assets/bayern-munich-footballlogos-org.png";
import liverpool from "./assets/liverpool-fc-footballlogos-org.png";
import psg from "./assets/paris-saint-germain-footballlogos-org.png";
import realMadrid from "./assets/real-madrid-footballlogos-org.png";
import sportingCP from "./assets/sporting-cp-portugal-footballlogos-org.png";

import manchesterUnited from "./assets/Manchester_United_FC_logo.png";
import como from "./assets/Calcio_Como_-_logo_(Italy,_2019-).svg.webp";
import stuttgart from "./assets/VfB_Stuttgart_1893_Logo.svg.webp";
import manchesterCity from "./assets/Manchester_City_Football_Club.png";
import lens from "./assets/RC_Lens.png";
import realBetis from "./assets/Real_Betis_Balompie.png";
import borussiaDortmund from "./assets/Borussia_Dortmund_logo.svg.webp";
import aekAthens from "./assets/aek-athens-logo-footylogos-1200.webp";
import roma from "./assets/AS_Roma_logo.png";
import shakhtar from "./assets/FC_Shakhtar_Donetsk.png";
import fenerbahce from "./assets/Fenerbahce_SK_logo.png";
import psv from "./assets/PSV_Eindhoven_escudo.png";
import villarreal from "./assets/Villarreal_CF_logo.svg.webp";
import clubBrugge from "./assets/Club_Brugge_KV_Logo.png";
import lille from "./assets/Lille_osc.png";
import slaviaPraha from "./assets/Slavia-symbol-nowordmark-RGB.png";
import inter from "./assets/FC_Internazionale_Milano_2021.svg.webp";
import lask from "./assets/LASK-Logo_2023.svg.webp";
import napoli from "./assets/SSC_Napoli.svg.webp";
import galatasaray from "./assets/Galatasaray_SK_football_logo.png";
import viking from "./assets/Viking_FK_Logo.png";
import porto from "./assets/F.C._Porto_logo.png";
import rbLeipzig from "./assets/RB_Leipzig_2020_Logo.png";
import feyenoord from "./assets/Feyenoord.png";
import sabah from "./assets/sabah.36c08f74.png";
import slovanBratislava from "./assets/SK_Slovan_Bratislava_logo.svg.webp";
import bodoGlimt from "./assets/FK_Bodo_Glimt_logo.svg.webp";

const POR_NOME = {
  Arsenal: arsenal,
  "Atl. Madrid": atleticoMadrid,
  "Atlético Madrid": atleticoMadrid,
  "Atlético de Madrid": atleticoMadrid,
  "Aston Villa": astonVilla,
  Barcelona: barcelona,
  Bayern: bayern,
  "Bayern München": bayern,
  Liverpool: liverpool,
  PSG: psg,
  "Paris Saint-Germain": psg,
  "Real Madrid": realMadrid,
  Sporting: sportingCP,
  "Sporting CP": sportingCP,

  "Man United": manchesterUnited,
  "Manchester United": manchesterUnited,
  Como: como,
  Stuttgart: stuttgart,
  "Man City": manchesterCity,
  "Manchester City": manchesterCity,
  Lens: lens,
  Betis: realBetis,
  "Real Betis": realBetis,
  Dortmund: borussiaDortmund,
  "Borussia Dortmund": borussiaDortmund,
  "AEK Athens": aekAthens,
  Roma: roma,
  "Shakhtar Donetsk": shakhtar,
  "Fenerbahçe": fenerbahce,
  PSV: psv,
  "PSV Eindhoven": psv,
  Villarreal: villarreal,
  "Club Brugge": clubBrugge,
  Lille: lille,
  "Slavia Praha": slaviaPraha,
  Inter: inter,
  LASK: lask,
  Napoli: napoli,
  Galatasaray: galatasaray,
  Viking: viking,
  Porto: porto,
  "RB Leipzig": rbLeipzig,
  Feyenoord: feyenoord,
  Sabah: sabah,
  "Slovan Bratislava": slovanBratislava,
  "Bodø/Glimt": bodoGlimt,
};

export function escudoUCLPorNome(nome) {
  if (!nome) return null;
  return POR_NOME[nome] ?? null;
}
