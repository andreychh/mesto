export class Profile {
  /**
   * @param {User} user
   */
  constructor(user) {
    this.user = user;
    this.user.events.change.subscribe(() => this.update());

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
   * @param {Gallery} gallery
   */
  constructor(place, gallery) {
    this.place = place;
    this.gallery = gallery;

    this.place.events.change.subscribe(() => this.update());
    this.element = Card.template.cloneNode(true);

    this.setupElements();
    this.setData();

    this.update();
  }

  setupElements() {
    this.nameText = this.element.querySelector(".card__title");
    this.imageImg = this.element.querySelector(".card__image");
    this.likeSection = this.element.querySelector(".card__like-section");
    this.likeCount = this.likeSection.querySelector(".card__like-count");
    this.likeButton = this.likeSection.querySelector(".card__like-button");
    this.likeButton.addEventListener("click", () => this.place.toggleLike().catch(console.log));

    this.deleteButton = this.element.querySelector(".card__delete-button");
    if (this.place.ownedByUser) {
      this.deleteButton.classList.remove("card__delete-button_is-hidden");
      this.deleteButton.addEventListener("click", () => this.gallery.remove(this.place.id).catch(console.log));
    }
  }

  setData() {
    this.nameText.textContent = this.place.name;
    this.imageImg.src = this.place.imageURL;
    this.imageImg.alt = `Изображение "${this.place.name}"`;
    this.imageImg.setAttribute("place-id", this.place.id);
  }

  update() {
    this.likeCount.textContent = this.place.likes;
    this.likeSection.classList.toggle("card__like-section_has-likes", this.place.likes > 0);
    this.likeButton.classList.toggle("card__like-button_is-active", this.place.liked);
  }
}

export class Deck {
  /**
   * @param {Gallery} gallery
   */
  constructor(gallery) {
    this.gallery = gallery;
    this.gallery.events.change.subscribe(() => this.update());

    this.list = document.querySelector(".places__list");

    this.update();
  }

  update() {
    this.setCards(this.fetchCards());
  }

  /**
   * @returns {Card[]}
   */
  fetchCards() {
    return this.gallery.places.map((place) => new Card(place, this.gallery));
  }

  /**
   * @param {Card[]} cards
   */
  setCards(cards) {
    this.list.innerHTML = "";
    this.list.append(...cards.map(card => card.element));
  }
}
