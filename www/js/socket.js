"use strict";
class SocketManager {
  constructor(port) {
    this.port = port;
    this.url = `ws://${document.location.hostname}:${port}/ws`;
    this.lastID = 0;
    this.streams = {}
  }
  makeStream(uri) {
    this.lastID++;
    this.streams[this.lastID] = new Socket(
        `${this.url}/${uri}`,
        this.lastID,
        this);
    return this.streams[this.lastID];
  }
}

class Socket {
  constructor(url, id, manager) {
    this.url = url;
    this.id = id;
    this.manager = manager;

    this.connected = false;
    this.callbacks = [];
    this._send_buffer = [];

    console.log(this.url);
    this.ws = new WebSocket(this.url);
    this.ws.sockObj = this;
    this.ws.onmessage = (this._onMessage).bind(this);

  }

 close() {
    this.ws.onclose = function() {};
    this.ws.close();
  }

  register(cb) {
    this.callbacks.push(cb)
  }

  /*
   * Unregister a given callback
   *
   * @param {function} cb - Callback to unregister
   */
  unregister(cb) {
    this.callbacks = _.reject(this.callbacks, function (v) {
      return v == cb;
    });
  }

  /*
   * Unregister all callbacks
   */
  unregisterAll() {
    this.callbacks = []
  }

  /*
   * Handle messages from the websocket.
   *
   * @param {event} event - message event to react to.
   */
  _onMessage(event) {
    var self = this;
    var msg = JSON.parse(event.data);
    var myID = this.id;
    console.assert(_.has(this.manager.streams, this.id),
                   "An orphan stream just got a message");
    this.lastMsg = msg;
    var self = this;
    _.each(this.callbacks, function (cb) {
      if (_.isUndefined(cb)) {
        console.log("undefined callback for: " + self.stream.url);
        return null;
      }
      else {
        try {
          cb(msg);
          return cb;
        }
        catch  (e){
          console.log(e);
          console.log(self);
          console.log(self.url);
          console.log(cb);
          return null;
        }
      }
    });
  }

  /*
   * Send a message on the websocket.
   *
   * @param {object} msg - Message to be converted to JSON and sent on the websocket.
   */
  send(msg) {
    var data = JSON.stringify(msg);
    if (this.ws.readyState != this.ws.OPEN) {
      this._send_buffer.push(data);
    }
    else {
      this.ws.send(data);
    }
  }

}
