import {Event} from "./internal";


export class User {
  /**
   * @param {string} name
   * @param {string} job
   * @param {string} avatarURL
   */
  constructor(name, job, avatarURL) {
    this.events = {change: new Event()};

    this.name = name;
    this.job = job;
    this.avatarURL = avatarURL;
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

  /**
   * @param {string} avatarURL
   */
  setAvatarURL(avatarURL) {
    this.avatarURL = avatarURL;
    this.events.change.trigger();
  }
}

export class Place {
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

export class Gallery {
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
