import "../styles/index.css";

import {APIClient} from "../components/internal";
import {Gallery, User} from "../components/domain";
import {Deck, Profile} from "../components/ui/view";
import {CardPopup, ImagePopup, ProfileAvatarPopup, ProfileInfoPopup} from "../components/ui/popup";


async function init() {
  const client = new APIClient(process.env.API_TOKEN, process.env.API_GROUP);
  const apiUser = await client.getUser();
  const apiPlaces = await client.getPlaces();

  const user = new User(client, apiUser);
  const profile = new Profile(user);

  const gallery = new Gallery(client, apiPlaces, apiUser);
  const deck = new Deck(gallery);

  const profileInfoPopup = new ProfileInfoPopup(user);
  const profileAvatarPopup = new ProfileAvatarPopup(user);
  const cardPopup = new CardPopup(gallery);
  const imagePopup = new ImagePopup(gallery);
}

await init();
