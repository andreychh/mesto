/**
 * @param {string} name
 * @param {string} link
 * @returns {Node}
 */
function createCard({name, link}) {
  const template = document.querySelector("#card-template").content;
  const card = template.cloneNode(true);
  const image = card.querySelector(".card__image");
  const description = card.querySelector(".card__description");

  image.src = link;
  image.alt = `Изображение "${name}"`;
  description.textContent = name;

  return card;
}

/**
 * @param {Node} card
 */
function appendCard(card) {
  const places = document.querySelector(".places__list");

  places.append(card);
}

initialCards.map(createCard).forEach(appendCard);
