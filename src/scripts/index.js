import "../styles/index.css";
import {initialCards} from "../components/mock";

import {Gallery, User} from "../components/domain";
import {Deck, Profile} from "../components/ui/view";
import {CardPopup, ImagePopup, ProfilePopup} from "../components/ui/popup";


function init(cards) {
  const user = new User("Жак-Ив Кусто", "Исследователь океана");
  const places = new Gallery();

  const profile = new Profile(user);
  cards.forEach((place) => places.add(place.name, place.link));
  const deck = new Deck(places);
  deck.reset();

  const profilePopup = new ProfilePopup(user);
  const cardPopup = new CardPopup(places);
  const imagePopup = new ImagePopup(places);
}

init(initialCards);
