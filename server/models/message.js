function Message({ fromId, toId, message, timestamp = Date.now() }) {
  this.fromId = fromId;
  this.toId = toId;
  this.message = message;
  this.timestamp = timestamp;
}

Message.prototype.toJSON = function () {
  return {
    fromId: this.fromId,
    toId: this.toId,
    message: this.message,
    timestamp: this.timestamp,
  };
};

module.exports = Message;