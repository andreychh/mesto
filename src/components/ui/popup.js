import {Place} from "../domain";
import {Form} from "./form";


export class Popup {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.element = element;
    this.element.classList.add("popup_is-animated");
    this.element.addEventListener("click", (event) => this.onOverlayClick(event));
    this.escapeKeydownListener = this.onEscapeKeydown.bind(this);
  }

  open() {
    this.element.classList.add("popup_is-opened");
    document.addEventListener("keydown", this.escapeKeydownListener);
  }

  close() {
    this.element.classList.remove("popup_is-opened");
    document.removeEventListener("keydown", this.escapeKeydownListener);
  }

  /**
   * @param {MouseEvent} event
   */
  onOverlayClick(event) {
    if (event.target === this.element) {
      this.close();
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  onEscapeKeydown(event) {
    if (event.key === "Escape") {
      this.close();
    }
  }
}

export class ProfilePopup extends Popup {
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

export class CardPopup extends Popup {
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

export class ImagePopup extends Popup {
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
   * @param {MouseEvent} event
   */
  open(event) {
    if (!event.target.classList.contains("card__image")) {
      return;
    }
    this.update(this.fetchPlace(event));
    super.open();
  }

  /**
   * @param {MouseEvent} event
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
