class User {
  constructor(name, job, eventBroker) {
    this.name = name;
    this.job = job;
    this.eventBroker = eventBroker;
    this.triggerChange();
  }

  setName(name) {
    this.name = name;
    this.triggerChange();
  }

  setJob(job) {
    this.job = job;
    this.triggerChange();
  }

  triggerChange() {
    this.eventBroker.send("user.changed", this);
  }
}

class Profile {
  constructor(eventBroker, profilePopup, cardPopup) {
    eventBroker.listen("user.changed", (user) => this.update(user));

    const element = document.querySelector(".profile");
    this.name = element.querySelector(".profile__title");
    this.job = element.querySelector(".profile__description");
    this.editButton = element.querySelector(".profile__edit-button");
    this.editButton.addEventListener("click", () => profilePopup.open());

    this.addCardButton = element.querySelector(".profile__add-button");
    this.addCardButton.addEventListener("click", () => cardPopup.open());
  }

  update(user) {
    this.name.textContent = user.name;
    this.job.textContent = user.job;
  }
}

class ProfilePopup {
  constructor(user) {
    this.user = user;

    this.element = document.querySelector(".popup_type_edit");
    this.element.classList.add("popup_is-animated");
    this.closeButton = this.element.querySelector(".popup__close");
    this.closeButton.addEventListener("click", () => this.close());

    this.form = document.querySelector("form[name=\"edit-profile\"]");
    this.form.addEventListener("submit", (event) => this.submit(event));
    this.nameInputField = this.form.querySelector(".popup__input_type_name");
    this.jobInputField = this.form.querySelector(".popup__input_type_description");
  }

  open() {
    this.nameInputField.value = this.user.name;
    this.jobInputField.value = this.user.job;
    this.element.classList.add("popup_is-opened");
  }

  close() {
    this.element.classList.remove("popup_is-opened");
  }

  submit(event) {
    event.preventDefault();
    this.user.setName(this.nameInputField.value);
    this.user.setJob(this.jobInputField.value);
    this.close();
  }
}

class CardPopup {
  constructor(places) {
    this.places = places;
    this.element = document.querySelector(".popup_type_new-card");
    this.element.classList.add("popup_is-animated");
    this.closeButton = this.element.querySelector(".popup__close");
    this.closeButton.addEventListener("click", () => this.close());

    this.form = document.querySelector("form[name=\"new-place\"]");
    this.form.addEventListener("submit", (event) => this.submit(event));
    this.titleInputField = this.form.querySelector(".popup__input_type_card-name");
    this.imageURLInputField = this.form.querySelector(".popup__input_type_url");
  }

  open() {
    this.titleInputField.value = "";
    this.imageURLInputField.value = "";
    this.element.classList.add("popup_is-opened");
  }

  close() {
    this.element.classList.remove("popup_is-opened");
  }

  submit(event) {
    event.preventDefault();
    this.places.prepend(new Place(this.titleInputField.value, this.imageURLInputField.value));
    this.close();
  }
}

class ImagePopup {
  constructor() {
    this.element = document.querySelector(".popup_type_image");
    this.element.classList.add("popup_is-animated");
    this.image = this.element.querySelector(".popup__image");
    this.title = this.element.querySelector(".popup__caption");
    this.closeButton = this.element.querySelector(".popup__close");
    this.closeButton.addEventListener("click", () => this.close());
  }

  open(place) {
    this.title.textContent = place.name;
    this.image.src = place.imageURL;
    this.element.classList.add("popup_is-opened");
  }

  close() {
    this.element.classList.remove("popup_is-opened");
  }
}

class Place {
  constructor(name, imageURL) {
    this.name = name;
    this.imageURL = imageURL;
  }
}

class Card {
  static template = document.querySelector("#card-template").content;

  constructor(place, places, imagePopup) {
    this.element = Card.template.cloneNode(true);
    this.image = this.element.querySelector(".card__image");
    this.image.addEventListener("click", () => imagePopup.open(place));
    this.title = this.element.querySelector(".card__title");
    this.likeButton = this.element.querySelector(".card__like-button");
    this.likeButton.addEventListener("click", () => this.like());
    this.deleteButton = this.element.querySelector(".card__delete-button");
    this.deleteButton.addEventListener("click", () => places.remove(place));

    this.title.textContent = place.name;
    this.image.src = place.imageURL;
    this.image.alt = `Изображение "${place.name}"`;
  }

  like() {
    this.likeButton.classList.toggle("card__like-button_is-active");
  }
}

class Places {
  constructor(eventBroker) {
    this.eventBroker = eventBroker;
    this.list = [];
  }

  append(...places) {
    this.list.push(...places);
    this.triggerChange();
  }

  prepend(...places) {
    this.list.unshift(...places);
    this.triggerChange();
  }

  remove(...places) {
    this.list = this.list.filter((place) => !places.includes(place));
    this.triggerChange();
  }

  clear() {
    this.list = [];
    this.triggerChange();
  }

  triggerChange() {
    this.eventBroker.send("places.changed", this);
  }
}

class Cards {
  constructor(eventBroker, imagePopup) {
    eventBroker.listen("places.changed", (place) => this.update(place));

    this.list = document.querySelector(".places__list");
    this.imagePopup = imagePopup;
  }

  update(places) {
    this.list.innerHTML = "";
    this.list.append(...places.list.map((place) => new Card(place, places, this.imagePopup).element));
  }
}

class EventBroker {
  constructor() {
    this.listeners = {};
  }

  listen(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  send(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  }
}


function init(initialCards) {
  const eventBroker = new EventBroker();
  const imagePopup = new ImagePopup();
  const places = new Places(eventBroker);
  const cards = new Cards(eventBroker, imagePopup);

  const user = new User("Жак-Ив Кусто", "Исследователь океана", eventBroker);
  const profilePopup = new ProfilePopup(user);
  const cardPopup = new CardPopup(places);
  const profile = new Profile(eventBroker, profilePopup, cardPopup);

  places.append(...initialCards.map(({name, link}) => new Place(name, link)));
}

init(initialCards);
