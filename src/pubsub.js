/**
 * Simple publish-subscribe class used throughout module.
 */

/**
 * Simple publish-subscribe manager for executing events
 * on state changes.
 */
export class PubSub {
  /**
   * Create a new pubsub helper
   */
  constructor() {
    this.events = {};
  }

  get empty() {
    return Object.keys(this.events).length === 0;
  }

  /**
   * Subscribe to specific event.
   *
   * @param {string} event - Event name to subscribe to.
   * @param {function} callback - Function to call on event.
   */
  subscribe(event, callback) {
    const self = this;

    // sync callback list
    if (!(event in self.events)) {
      self.events[event] = [];
    }
    return self.events[event].push(callback);
  }

  /**
   * Subscribe to specific event.
   *
   * @param {string} event - Event name to broadcast.
   * @param {object} payload - Arguments to pass to event callbacks.
   */
  publish(event, ...payload) {
    const self = this;

    // complete event chain if it exists
    if (!(event in self.events)) {
      return [];
    }

    // TODO: EMBED CALLBACKS IN TRY BLOCK?
    return self.events[event].map(callback => callback(...payload));
  }
}

export default PubSub;
