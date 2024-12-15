export class Event {
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

export class APIClient {
  /**
   * @typedef {Object} APIUser
   * @prop {string} name
   * @prop {string} about
   * @prop {string} avatar
   * @prop {string} _id
   * @prop {string} cohort
   */

  /**
   * @typedef {Object} APIPlace
   * @prop {APIUser[]} likes
   * @prop {string} _id
   * @prop {string} name
   * @prop {string} link
   * @prop {APIUser} owner
   * @prop {string} createdAt
   */

  /**
   * @param {string} token
   * @param {string} group
   */
  constructor(token, group) {
    this.token = token;
    this.group = group;
    this.baseUrl = `https://nomoreparties.co/v1/${this.group}/`;
  }

  /**
   * @param {string} endpoint
   * @param {string} method
   * @param {Object} body
   * @returns {Promise<APIUser|APIPlace|APIPlace[]>}
   */
  sendRequest(endpoint, method, body = null) {
    const headers = {
      "authorization": this.token,
      "content-type": "application/json",
    };

    const options = {method, headers};

    if (body) {
      options.body = JSON.stringify(body);
    }

    return fetch(`${this.baseUrl}${endpoint}`, options)
      .then(function (response) {
        if (!response.ok) {
          return Promise.reject("Network response was not ok");
        }
        return response.json();
      });
  }

  /**
   * @returns {Promise<APIUser>}
   */
  getUser() {
    return this.sendRequest("users/me", "GET");
  }

  /**
   * @param {{name:string, about:string}} user
   * @returns {Promise<APIUser>}
   */
  updateUser(user) {
    return this.sendRequest("users/me", "PATCH", user);
  }

  /**
   * @param {{avatar:string}} user
   * @returns {Promise<APIUser>}
   */
  updateUserAvatar(user) {
    return this.sendRequest("users/me/avatar", "PATCH", user);
  }

  /**
   * @returns {Promise<APIPlace[]>}
   */
  getPlaces() {
    return this.sendRequest("cards", "GET");
  }

  /**
   * @param {{name:string, link:string}} place
   * @returns {Promise<APIPlace>}
   */
  createPlace(place) {
    return this.sendRequest("cards", "POST", place);
  }

  /**
   * @param {string} id
   * @returns {Promise<Object>}
   */
  deletePlace(id) {
    return this.sendRequest(`cards/${id}`, "DELETE");
  }

  /**
   * @param {string} id
   * @returns {Promise<APIPlace>}
   */
  likePlace(id) {
    return this.sendRequest(`cards/likes/${id}`, "PUT");
  }

  /**
   * @param {string} id
   * @returns {Promise<APIPlace>}
   */
  dislikePlace(id) {
    return this.sendRequest(`cards/likes/${id}`, "DELETE");
  }
}
