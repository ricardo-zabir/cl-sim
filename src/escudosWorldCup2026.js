import africaDoSul from "./assets/africa-do-sul.png";
import alemanha from "./assets/alemanha.png";
import arabiaSaudita from "./assets/arabia-saudita.png";
import argelia from "./assets/argelia.png";
import argentina from "./assets/argentina.png";
import australia from "./assets/australia.png";
import austria from "./assets/austria.png";
import belgica from "./assets/belgica.png";
import bosnia from "./assets/bosnia-e-herzegovina.png";
import brasil from "./assets/brasil.png";
import caboVerde from "./assets/cabo-verde.png";
import canada from "./assets/canada.png";
import catar from "./assets/catar.png";
import colombia from "./assets/colombia.png";
import coreiaDoSul from "./assets/coreia-do-sul.png";
import costaDoMarfim from "./assets/costa-do-marfim.png";
import croacia from "./assets/croacia.png";
import curacao from "./assets/curacao.png";
import egito from "./assets/egito.png";
import equador from "./assets/equador.png";
import escocia from "./assets/escocia.png";
import espanha from "./assets/espanha.png";
import estadosUnidos from "./assets/estados-unidos.png";
import franca from "./assets/franca.png";
import gana from "./assets/gana.png";
import haiti from "./assets/haiti.png";
import holanda from "./assets/paises-baixos.png";
import inglaterra from "./assets/inglaterra.png";
import ira from "./assets/ira.png";
import iraque from "./assets/iraque.png";
import japao from "./assets/japao.png";
import jordania from "./assets/jordania.png";
import marrocos from "./assets/marrocos.png";
import mexico from "./assets/mexico.png";
import noruega from "./assets/noruega.png";
import novaZelandia from "./assets/nova-zelandia.png";
import panama from "./assets/panama.png";
import paraguai from "./assets/paraguai.png";
import portugal from "./assets/portugal.png";
import rdCongo from "./assets/republica-democratica-do-congo.png";
import republicaCheca from "./assets/republica-checa.png";
import senegal from "./assets/senegal.png";
import suecia from "./assets/suecia.png";
import suica from "./assets/suica.png";
import tunisia from "./assets/tunisia.png";
import turquia from "./assets/turquia.png";
import uruguai from "./assets/uruguai.png";
import uzbequistao from "./assets/uzbequistao.png";

/** Nome da seleção no simulador → arte em `src/assets/` */
const POR_NOME = {
  Alemanha: alemanha,
  Argentina: argentina,
  Argélia: argelia,
  "Arábia Saudita": arabiaSaudita,
  Austrália: australia,
  Áustria: austria,
  "África do Sul": africaDoSul,
  Bélgica: belgica,
  Bósnia: bosnia,
  Brasil: brasil,
  "Cabo Verde": caboVerde,
  Canadá: canada,
  Catar: catar,
  Colômbia: colombia,
  "Coreia do Sul": coreiaDoSul,
  "Costa do Marfim": costaDoMarfim,
  Croácia: croacia,
  Curaçao: curacao,
  Egito: egito,
  Equador: equador,
  Escócia: escocia,
  Espanha: espanha,
  "Estados Unidos": estadosUnidos,
  França: franca,
  Gana: gana,
  Haiti: haiti,
  Holanda: holanda,
  Inglaterra: inglaterra,
  Irã: ira,
  Iraque: iraque,
  Japão: japao,
  Jordânia: jordania,
  Marrocos: marrocos,
  México: mexico,
  Noruega: noruega,
  "Nova Zelândia": novaZelandia,
  Panamá: panama,
  Paraguai: paraguai,
  Portugal: portugal,
  "RD Congo": rdCongo,
  "República Tcheca": republicaCheca,
  Senegal: senegal,
  Suécia: suecia,
  Suíça: suica,
  Tunísia: tunisia,
  Turquia: turquia,
  Uruguai: uruguai,
  Uzbequistão: uzbequistao,
};

export function escudoWC2026PorNome(nome) {
  if (!nome) return null;
  return POR_NOME[nome] ?? null;
}
