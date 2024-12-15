export class InputField {
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

export class Form {
  /**
   * @param {HTMLFormElement} form
   */
  constructor(form) {
    this.form = form;
    this.submitButton = this.form.querySelector(".popup__button");
    this.inputFields = this.fetchInputFields();

    this.form.addEventListener("input", () => this.updateValidationState());
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
    this.updateValidationState();
  }

  addLoadingState() {
    this.submitButton.textContent = "Сохранение...";
  }

  removeLoadingState() {
    this.submitButton.textContent = "Сохранить";
  }

  updateValidationState() {
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
