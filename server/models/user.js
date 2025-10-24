function User({ userId, username, socketId, online = false, message = null, timestamp = null, unreadCount = 0 }) {
  this.userId = userId;
  this.username = username;
  this.socketId = socketId;
  this.online = online;
  this.message = message;
  this.timestamp = timestamp;
  this.unreadCount = unreadCount;
}

User.prototype.attach = function (socketId) {
  this.online = true;
  this.socketId = socketId;
};

User.prototype.detach = function () {
  this.online = false;
  this.socketId = null;
};

User.prototype.toJSON = function () {
  return {
    userId: this.userId,
    username: this.username,
    socketId: this.socketId,
    online: this.online,
    message: this.message,
    timestamp: this.timestamp,
    unreadCount: this.unreadCount
  };
};

module.exports = User;