"use client";

function createDMKey(userId1, userId2) {
  return "ca_" + [userId1, userId2].sort().join('_');
}

function createPoolKey() {
  return "ca_pool";
}

/**
 * Pushes a message object to local storage between two users.
 * @param {Object} messageObj - The message object to be stored.
 * @param {string} messageObj.fromId - The ID of the user sending the message.
 * @param {string} messageObj.toId - The ID of the user receiving the message.
 * @param {string} messageObj.message - The content of the message.
 * @param {string} messageObj.timestamp - The timestamp of the message.
 */
export function pushMessageToLocalStorage(messageObj) {
  const fromId = messageObj.fromId;
  const toId = messageObj.toId;
  const key = createDMKey(fromId, toId);
  const data = localStorage.getItem(key);
  const item = data ? JSON.parse(data) : {
    messages: []
  };

  item.messages.push(messageObj);

  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Retrieves messages between two users from local storage.
 * @param {string} fromId - The ID of the user sending the messages.
 * @param {string} toId - The ID of the user receiving the messages.
 * @returns {Object} - An object containing the messages exchanged between the two users.
 */
export function getMessagesFromLocalStorage(fromId, toId) {
  const key = createDMKey(fromId, toId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : {
    messages: []
  };
}

/**
 * Adds or updates a message object in the local storage pool.
 *
 * This function retrieves the current pool from local storage, updates the
 * message object with the provided data, and increments the unread count
 * unless the `read` parameter is set to `true`. If the `read` parameter is
 * `true`, the unread count is reset to 0.
 *
 * @param {Object} messageObj - The message object to be added or updated in the pool.
 * @param {string} messageObj.id - The unique identifier for the message.
 * @param {string} messageObj.username - The username associated with the message.
 * @param {string} messageObj.message - The content of the message.
 * @param {number} messageObj.timestamp - The timestamp of the message.
 * @param {boolean} [read=false] - Whether the message has been read. If `true`, the unread count is reset to 0.
 */
export function pushLastToPoolInLocalStorage(messageObj, read = false) {
  const key = createPoolKey();
  const data = localStorage.getItem(key);
  const item = data ? JSON.parse(data) : {};
  item[messageObj.id] = {
    username: messageObj.username,
    lastMessage: messageObj.message,
    lastTimestamp: messageObj.timestamp,
    unreadCount: (item[messageObj.id] ? item[messageObj.id].unreadCount : 0) + 1
  };
  if (read) {
    item[messageObj.id].unreadCount = 0;
  }
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Retrieves the last message and unread count for a given user ID from local storage.
 * @param {string} fromId - The ID of the user whose last message and unread count are to be retrieved.
 * @returns {Object} - An object containing the last message and unread count for the user.
 */
export function getLastInPoolFromLocalStorage(fromId) {
  const key = createPoolKey();
  const data = localStorage.getItem(key);
  const item = data ? JSON.parse(data) : {};
  return item[fromId] ? item[fromId] : {};
}

/**
 * Retrieves all last messages and unread counts from the local storage pool.
 * @returns {Object} - An object containing all last messages and unread counts.
 */
export function getAllLastInPoolFromLocalStorage() {
  const key = createPoolKey();
  const data = localStorage.getItem(key);
  const item = data ? JSON.parse(data) : {};
  return item;
}

/**
 * Resets the unread count for a given user ID in local storage.
 * @param {string} fromId - The ID of the user whose unread count is to be reset.
 */
export function resetUnreadCountInLocalStorage(fromId) {
  const key = createPoolKey();
  const data = localStorage.getItem(key);
  const item = data ? JSON.parse(data) : {};

  if (item[fromId]) {
    item[fromId].unreadCount = 0;
    localStorage.setItem(key, JSON.stringify(item));
  }
}
