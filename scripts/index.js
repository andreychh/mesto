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


class InputField {
  /**
   * @param {HTMLLabelElement} label
   */
  constructor(label) {
    this.field = label.querySelector(".popup__input");
    this.error = label.querySelector(".popup__input-error");

    this.field.addEventListener("input", () => this.updateState());
  }

  /**
   * @returns {string}
   */
  value() {
    return this.field.value;
  }

  /**
   * @param {string} value
   */
  setValue(value) {
    this.field.value = value;
    this.hideInputError();
  }

  /**
   * @returns {boolean}
   */
  valid() {
    return this.field.validity.valid;
  }

  /**
   * @returns {string}
   */
  name() {
    return this.field.name;
  }

  updateState() {
    if (!this.valid()) {
      this.showInputError();
    } else {
      this.hideInputError();
    }
  }

  showInputError() {
    this.field.classList.add("popup__input_type_error");
    this.error.textContent = this.field.validationMessage;
    this.error.classList.add("popup__input-error_active");
  }

  hideInputError() {
    this.field.classList.remove("popup__input_type_error");
    this.error.classList.remove("popup__input-error_active");
    this.error.textContent = "";
  }
}

class Form {
  /**
   * @param {HTMLFormElement} form
   */
  constructor(form) {
    this.form = form;
    this.submitButton = this.form.querySelector(".popup__button");
    this.inputFields = this.fetchInputFields();

    this.form.addEventListener("input", () => this.updateSubmitButtonState());
  }

  /**
   * @returns {InputField[]}
   */
  fetchInputFields() {
    return Array.from(this.form.querySelectorAll(".popup_label"))
      .map((label) => new InputField(label));
  }

  /**
   * @returns {Object}
   */
  fieldValues() {
    return this.inputFields.reduce(function (values, field) {
      values[field.name()] = field.value();
      return values;
    }, {});
  }

  /**
   * @param {Object} values
   */
  setFieldValues(values) {
    this.inputFields.forEach((field) => field.setValue(values[field.name()]));
    this.updateSubmitButtonState();
  }

  updateSubmitButtonState() {
    if (!this.validInputFields()) {
      this.submitButton.classList.add("popup__button_inactive");
    } else {
      this.submitButton.classList.remove("popup__button_inactive");
    }
  }

  /**
   * @returns {boolean}
   */
  validInputFields() {
    return this.inputFields.every((field) => field.valid());
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
   * @param {User} user
   */
  constructor(user) {
    super(document.querySelector(".popup_type_edit"));

    this.user = user;
    this.form = new Form(this.element.querySelector(".popup__form"));

    this.openButton = document.querySelector(".profile__edit-button");
    this.openButton.addEventListener("click", () => this.open());
    this.closeButton = this.element.querySelector(".popup__close");
    this.closeButton.addEventListener("click", () => this.close());

    this.element.addEventListener("submit", (event) => this.onFormSubmit(event));
  }

  open() {
    this.form.setFieldValues({name: this.user.name, job: this.user.job});
    super.open();
  }

  /**
   * @param {SubmitEvent} event
   */
  onFormSubmit(event) {
    event.preventDefault();
    const values = this.form.fieldValues();
    this.user.update(values.name, values.job);
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
    this.form = new Form(this.element.querySelector(".popup__form"));

    this.openButton = document.querySelector(".profile__add-button");
    this.openButton.addEventListener("click", () => this.open());
    this.closeButton = this.element.querySelector(".popup__close");
    this.closeButton.addEventListener("click", () => this.close());

    this.element.addEventListener("submit", (event) => this.onFormSubmit(event));
  }

  open() {
    this.form.setFieldValues({name: "", imageURL: ""});
    super.open();
  }

  /**
   * @param {SubmitEvent} event
   */
  onFormSubmit(event) {
    event.preventDefault();
    const values = this.form.fieldValues();
    this.gallery.add(values.name, values.imageURL);
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
