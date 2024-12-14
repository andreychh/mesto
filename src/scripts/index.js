import "../styles/index.css";
import {initialCards} from "../components/mock";
import initialAvatarURL from "../images/avatar.jpg";

import {Gallery, User} from "../components/domain";
import {Deck, Profile} from "../components/ui/view";
import {CardPopup, ImagePopup, ProfileAvatarPopup, ProfileInfoPopup} from "../components/ui/popup";

function init(cards) {
  const user = new User("Жак-Ив Кусто", "Исследователь океана", initialAvatarURL);
  const places = new Gallery();

  const profile = new Profile(user);
  cards.forEach((place) => places.add(place.name, place.link));
  const deck = new Deck(places);
  deck.reset();
  const profileInfoPopup = new ProfileInfoPopup(user);
  const profileAvatarPopup = new ProfileAvatarPopup(user);
  const cardPopup = new CardPopup(places);
  const imagePopup = new ImagePopup(places);
}

init(initialCards);
