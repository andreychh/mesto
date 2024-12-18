import {Place} from "../domain";
import {Form} from "./form";


export class Popup {
  /**
   * @param {HTMLElement} element
   */
  constructor(element) {
    this.element = element;
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

export class ProfileInfoPopup extends Popup {
  /**
   * @param {User} user
   */
  constructor(user) {
    super(document.querySelector(".popup_type_edit-profile-info"));
    this.user = user;

    this.form = new Form(this.element.querySelector(".popup__form"));
    this.openButton = document.querySelector(".profile__edit-info-button");
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
    this.form.addLoadingState();
    const values = this.form.fieldValues();
    this.user.update(values.name, values.job)
      .then(() => this.close())
      .catch(console.log)
      .finally(() => this.form.removeLoadingState());
  }
}

export class ProfileAvatarPopup extends Popup {
  /**
   * @param {User} user
   */
  constructor(user) {
    super(document.querySelector(".popup_type_edit-profile-avatar"));
    this.user = user;

    this.form = new Form(this.element.querySelector(".popup__form"));
    this.openButton = document.querySelector(".profile__edit-avatar-button");
    this.openButton.addEventListener("click", () => this.open());
    this.closeButton = this.element.querySelector(".popup__close");
    this.closeButton.addEventListener("click", () => this.close());
    this.element.addEventListener("submit", (event) => this.onFormSubmit(event));
  }

  open() {
    this.form.setFieldValues({avatarURL: ""});
    super.open();
  }

  /**
   * @param {SubmitEvent} event
   */
  onFormSubmit(event) {
    event.preventDefault();
    this.form.addLoadingState();
    const values = this.form.fieldValues();
    this.user.setAvatarURL(values.avatarURL)
      .then(() => this.close())
      .catch(console.log)
      .finally(() => this.form.removeLoadingState());
  }
}

export class CardPopup extends Popup {
  /**
   * @param {Gallery} gallery
   */
  constructor(gallery) {
    super(document.querySelector(".popup_type_add-card"));
    this.gallery = gallery;

    this.form = new Form(this.element.querySelector(".popup__form"));
    this.openButton = document.querySelector(".profile__add-card-button");
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
    this.form.addLoadingState();
    const values = this.form.fieldValues();
    this.gallery.add(values.name, values.imageURL)
      .then(() => this.close())
      .catch(console.log)
      .finally(() => this.form.removeLoadingState());
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
    this.imageImg = this.element.querySelector(".popup__image"); // todo: rename
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
    const id = event.target.getAttribute("place-id");
    return this.gallery.find(id);
  }

  /**
   * @param {Place} place
   */
  update(place) {
    this.nameText.textContent = place.name;
    this.imageImg.src = place.imageURL;
  }
}
