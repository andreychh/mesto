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
