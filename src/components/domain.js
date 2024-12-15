import {Event} from "./internal";


export class User {
  /**
   * @param {APIClient} client
   * @param {APIUser} apiUser
   */
  constructor(client, apiUser) {
    this.events = {change: new Event()};
    this.client = client;
    this.id = apiUser._id;
    this.name = apiUser.name;
    this.job = apiUser.about;
    this.avatarURL = apiUser.avatar;
  }

  /**
   * @param {string} name
   * @param {string} job
   * @returns {Promise<void>}
   */
  async update(name, job) {
    const apiUser = await this.client.updateUser({name, about: job});
    this.name = apiUser.name;
    this.job = apiUser.about;
    this.events.change.trigger();
  }

  /**
   * @param {string} avatarURL
   * @returns {Promise<void>}
   */
  async setAvatarURL(avatarURL) {
    const apiUser = await this.client.updateUserAvatar({avatar: avatarURL});
    this.avatarURL = apiUser.avatar;
    this.events.change.trigger();
  }
}

export class Place {
  /**
   * @param {APIClient} client
   * @param {APIPlace} apiPlace
   * @param {boolean} liked
   * @param {number} likes
   */
  constructor(client, apiPlace, liked, likes) {
    this.events = {change: new Event()};
    this.client = client;
    this.id = apiPlace._id;
    this.name = apiPlace.name;
    this.imageURL = apiPlace.link;
    this.liked = liked;
    this.likes = likes;
  }

  async toggleLike() {
    const apiPlace = (this.liked)
      ? await this.client.dislikePlace(this.id)
      : await this.client.likePlace(this.id);

    const userID = await this.client.getUser().then((user) => user._id);
    const likerIDs = apiPlace.likes.map((user) => user._id);

    this.liked = likerIDs.includes(userID);
    this.likes = likerIDs.length;
    this.events.change.trigger();
  }
}

export class Gallery {
  /**
   * @param {APIClient} client
   * @param {APIPlace[]} apiPlaces
   * @param apiUser
   */
  constructor(client, apiPlaces, apiUser) {
    this.events = {change: new Event()};
    this.client = client;
    this.user = new User(client, apiUser);
    this.places = apiPlaces.map((apiPlace) => this.apiPlaceToPlace(apiPlace));
  }

  /**
   * @param {string} name
   * @param {string} imageURL
   * @returns {Promise<void>}
   */
  async add(name, imageURL) {
    const apiPlace = await this.client.createPlace({name, link: imageURL});
    this.places.unshift(this.apiPlaceToPlace(apiPlace));
    this.events.change.trigger();
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async remove(id) {
    await this.client.deletePlace(id);
    this.places = this.places.filter((place) => place.id !== id);
    this.events.change.trigger();
  }

  /**
   * @param {string} id
   * @returns {Place}
   */
  find(id) {
    return this.places.find((place) => place.id === id);
  }

  /**
   * @param {APIPlace} apiPlace
   * @returns {Place}
   */
  apiPlaceToPlace(apiPlace) {
    const likerIDs = apiPlace.likes.map((apiUser) => apiUser._id);
    return new Place(this.client, apiPlace, likerIDs.includes(this.user.id), likerIDs.length);
  }
}
