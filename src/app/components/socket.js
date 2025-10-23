import { io } from "socket.io-client";

if (!globalThis.socket) {
  globalThis.socket = io();
  console.log("Socket initialized");
}

export const socket = globalThis.socket;

/**
 * Check connection and emit socket event
 * @param {string} event - Socket event
 * @param {Object} params - Event parameters
 */
export const emit = (event, params) => {
  if (socket.connected) {
    socket.emit(event, params);
  }
};

/**
 * Initialize socket events
 * @param {Object} config - Socket event handlers
 */
export const on = (config) => {
  for (const [event, callback] of Object.entries(config)) {
    socket.on(event, callback);
  }
}

/**
 * Remove socket event listeners
 * @param {Object} config - Socket event handlers
 */
export const off = (config) => {
  for (const event in config) {
    socket.off(event);
  }
}
