export class Profile {
  /**
   * @param {User} user
   */
  constructor(user) {
    user.events.change.subscribe(() => this.update());

    this.user = user;
    this.element = document.querySelector(".profile");
    this.nameText = this.element.querySelector(".profile__title");
    this.jobText = this.element.querySelector(".profile__description");
    this.avatarImage = this.element.querySelector(".profile__image");

    this.update();
  }

  update() {
    this.nameText.textContent = this.user.name;
    this.jobText.textContent = this.user.job;
    this.avatarImage.src = this.user.avatarURL;
  }
}

export class Card {
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

export class Deck {
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
