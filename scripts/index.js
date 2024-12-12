class Place {
  /**
   * @param {number} id
   * @param {Gallery} source
   */
  constructor(id, source) {
    this.events = {change: new Event()};

    this.id = id;
    this.source = source;
  }

  /**
   * @returns {string}
   */
  name() {
    return this.source.places.get(this.id).name;
  }

  /**
   * @returns {string}
   */
  imageURL() {
    return this.source.places.get(this.id).imageURL;
  }

  /**
   * @returns {boolean}
   */
  liked() {
    return this.source.places.get(this.id).liked;
  }

  toggleLike() {
    const place = this.source.places.get(this.id);
    place.liked = !place.liked;
    this.events.change.trigger();
  }

  remove() {
    this.source.remove(this.id);
  }
}

class Gallery {
  constructor() {
    this.events = {change: new Event()};

    this.places = new Map();
    this.lastUsedID = 0;
  }

  /**
   * @param {string} name
   * @param {string} imageURL
   * @param {boolean} liked
   * @returns {Place}
   */
  add(name, imageURL, liked = false) {
    const id = ++this.lastUsedID;
    this.places.set(id, {id, name, imageURL, liked});
    this.events.change.trigger();
    return new Place(id, this);
  }

  /**
   * @param {number} id
   */
  remove(id) {
    this.places.delete(id);
    this.events.change.trigger();
  }

  /**
   * @returns {Place[]}
   */
  all() {
    return Array.from(this.places.values())
      .map((place) => new Place(place.id, this));
  }
}

class User {
  /**
   * @param {string} name
   * @param {string} job
   */
  constructor(name, job) {
    this.events = {change: new Event()};

    this.name = name;
    this.job = job;
  }

  /**
   * @param {string} name
   * @param {string} job
   */
  update(name, job) {
    this.name = name;
    this.job = job;
    this.events.change.trigger();
  }
}


class Card {
  static template = document.querySelector("#card-template").content;

  /**
   * @param {Place} place
   */
  constructor(place) {
    this.place = place;
    this.place.events.change.subscribe(() => this.update());

    this.element = Card.template.cloneNode(true);
    this.name = this.element.querySelector(".card__title");
    this.image = this.element.querySelector(".card__image");
    this.image.setAttribute("place-id", place.id.toString());
    this.deleteButton = this.element.querySelector(".card__delete-button");
    this.deleteButton.addEventListener("click", () => place.remove());
    this.likeButton = this.element.querySelector(".card__like-button");
    this.likeButton.addEventListener("click", () => place.toggleLike());

    this.update();
  }

  update() {
    this.name.textContent = this.place.name();
    this.image.src = this.place.imageURL();
    this.image.alt = `Изображение "${this.place.name()}"`;
    this.likeButton.classList.toggle("card__like-button_is-active", this.place.liked());
  }
}

class Deck {
  /**
   * @param {Gallery} gallery
   */
  constructor(gallery) {
    this.gallery = gallery;
    this.gallery.events.change.subscribe(() => this.reset());

    this.list = document.querySelector(".places__list");
  }

  reset() {
    this.setCards(this.fetchCards());
  }

  /**
   * @returns {Card[]}
   */
  fetchCards() {
    return this.gallery.all()
      .map((place) => new Card(place))
      .sort((a, b) => b.place.id - a.place.id);
  }

  /**
   * @param {Card[]} cards
   */
  setCards(cards) {
    this.list.innerHTML = "";
    this.list.append(...cards.map(card => card.element));
  }
}

class Profile {
  /**
   *
   * @param {User} user
   */
  constructor(user) {
    user.events.change.subscribe(() => this.update());

    this.user = user;
    this.element = document.querySelector(".profile");
    this.nameText = this.element.querySelector(".profile__title");
    this.jobText = this.element.querySelector(".profile__description");

    this.update();
  }

  update() {
    this.nameText.textContent = this.user.name;
    this.jobText.textContent = this.user.job;
  }
}


class Popup {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.element = element;
    this.element.classList.add("popup_is-animated");
  }

  open() {
    this.element.classList.add("popup_is-opened");
  }

  close() {
    this.element.classList.remove("popup_is-opened");
  }
}

class ProfilePopup extends Popup {
  /**
   *
   * @param {User} user
   */
  constructor(user) {
    super(document.querySelector(".popup_type_edit"));

    this.user = user;

    this.openButton = document.querySelector(".profile__edit-button");
    this.openButton.addEventListener("click", () => this.open());
    this.closeButton = this.element.querySelector(".popup__close");
    this.closeButton.addEventListener("click", () => this.close());

    this.form = document.querySelector("form[name=\"edit-profile\"]");
    this.form.addEventListener("submit", (event) => this.submit(event));
    this.nameInputField = this.form.querySelector(".popup__input_type_name");
    this.jobInputField = this.form.querySelector(".popup__input_type_description");
  }

  open() {
    this.update();
    super.open();
  }

  update() {
    this.nameInputField.value = this.user.name;
    this.jobInputField.value = this.user.job;
  }

  /**
   * @param {Event} event
   */
  submit(event) {
    event.preventDefault();
    this.user.update(this.nameInputField.value, this.jobInputField.value);
    this.close();
  }
}

class CardPopup extends Popup {
  /**
   * @param {Gallery} gallery
   */
  constructor(gallery) {
    super(document.querySelector(".popup_type_new-card"));

    this.gallery = gallery;

    this.openButton = document.querySelector(".profile__add-button");
    this.openButton.addEventListener("click", () => this.open());
    this.closeButton = this.element.querySelector(".popup__close");
    this.closeButton.addEventListener("click", () => this.close());

    this.form = document.querySelector("form[name=\"new-place\"]");
    this.form.addEventListener("submit", (event) => this.submit(event));
    this.nameInputField = this.form.querySelector(".popup__input_type_card-name");
    this.imageURLInputField = this.form.querySelector(".popup__input_type_url");
  }

  open() {
    this.clear();
    super.open();
  }

  clear() {
    this.nameInputField.value = "";
    this.imageURLInputField.value = "";
  }

  /**
   * @param {Event} event
   */
  submit(event) {
    event.preventDefault();
    this.gallery.add(this.nameInputField.value, this.imageURLInputField.value);
    this.close();
  }
}

class ImagePopup extends Popup {
  /**
   * @param {Gallery} gallery
   */
  constructor(gallery) {
    super(document.querySelector(".popup_type_image"));

    this.gallery = gallery;

    this.placesList = document.querySelector(".places__list");
    this.placesList.addEventListener("click", (event) => this.open(event));
    this.closeButton = this.element.querySelector(".popup__close");
    this.closeButton.addEventListener("click", () => this.close());

    this.nameText = this.element.querySelector(".popup__caption");
    this.imageImg = this.element.querySelector(".popup__image");
  }

  /**
   * @param {Event} event
   */
  open(event) {
    if (!event.target.classList.contains("card__image")) {
      return;
    }
    this.update(this.fetchPlace(event));
    super.open();
  }

  /**
   * @param {Event} event
   * @returns {Place}
   */
  fetchPlace(event) {
    const id = Number(event.target.getAttribute("place-id"));
    return new Place(id, this.gallery);
  }

  /**
   * @param {Place} place
   */
  update(place) {
    this.nameText.textContent = place.name();
    this.imageImg.src = place.imageURL();
  }
}


class Event {
  constructor() {
    this.listeners = [];
  }

  /**
   * @param {function} listener
   */
  subscribe(listener) {
    this.listeners.push(listener);
  }

  /**
   * @param {function} listener
   */
  unsubscribe(listener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  trigger(data) {
    this.listeners.forEach(listener => listener(data));
  }
}


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
