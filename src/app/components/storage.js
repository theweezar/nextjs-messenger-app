"use client";

function createDMKey(userId1, userId2) {
  return "ca_" + [userId1, userId2].sort().join('_');
}

function createPoolKey() {
  return "ca_pool";
}

// Function to push a message object to local storage
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

// Function to get messages from local storage
export function getMessagesFromLocalStorage(fromId, toId) {
  const key = createDMKey(fromId, toId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : {
    messages: []
  };
}

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

export function getLastInPoolFromLocalStorage(fromId) {
  const key = createPoolKey();
  const data = localStorage.getItem(key);
  const item = data ? JSON.parse(data) : {};
  return item[fromId] ? item[fromId] : {};
}

export function resetUnreadCountInLocalStorage(fromId) {
  const key = createPoolKey();
  const data = localStorage.getItem(key);
  const item = data ? JSON.parse(data) : {};

  if (item[fromId]) {
    item[fromId].unreadCount = 0;
    localStorage.setItem(key, JSON.stringify(item));
  }
}
