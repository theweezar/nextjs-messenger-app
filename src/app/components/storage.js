"use client";

// Function to push a message object to local storage
export function pushMessageToLocalStorage(messageObj, unreadCount) {
  const fromId = messageObj.fromId;
  const toId = messageObj.toId;
  const key = [fromId, toId].sort().join('_');
  const data = localStorage.getItem(key);
  const item = data ? JSON.parse(data) : {
    messages: [],
    unreadCount: 0,
    lastMessage: ''
  };

  item.messages.push(messageObj);
  item.lastMessage = messageObj.message;

  if (unreadCount) {
    item.unreadCount = unreadCount;
  }

  localStorage.setItem(key, JSON.stringify(item));
}

// Function to get messages from local storage
export function getMessagesFromLocalStorage(fromId, toId) {
  const key = [fromId, toId].sort().join('_');
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : {
    messages: [],
    unreadCount: 0,
    lastMessage: ''
  };
}

export function updateUnreadCountInLocalStorage(fromId, toId, unreadCount) {
  const key = [fromId, toId].sort().join('_');
  const data = localStorage.getItem(key);
  if (data) {
    const item = JSON.parse(data);
    item.unreadCount = unreadCount;
    localStorage.setItem(key, JSON.stringify(item));
  }
}
