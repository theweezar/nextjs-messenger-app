// filepath: d:/development/nextjs-messenger-app/server/lib/pool.js

const User = require("../models/user");

function Pool() {
  if (Pool.instance) {
    return Pool.instance;
  }

  this.pool = new Map();
  this.socketToUser = new Map();
  Pool.instance = this;
}

/**
 * Get a user by their userId.
 * @param {string} userId - The ID of the user.
 * @returns {User|undefined} The user object or undefined if not found.
 */
Pool.prototype.get = function (userId) {
  return this.pool.get(userId);
};

/**
 * Add a user to the pool.
 * @param {User} user - The user object to add.
 */
Pool.prototype.set = function (user) {
  this.pool.set(user.userId, user);
  this.socketToUser.set(user.socketId, user.userId);
};

/**
 * Delete a user from the pool by their userId.
 * @param {string} userId - The ID of the user to delete.
 * @returns {User|undefined} The deleted user object or undefined if not found.
 */
Pool.prototype.delete = function (userId) {
  const user = this.pool.get(userId);
  if (user) {
    this.pool.delete(userId);
    this.socketToUser.delete(user.socketId);
    user.detach();
  }
  return user;
};

/**
 * Get a user by their socketId.
 * @param {string} socketId - The socket ID of the user.
 * @returns {User|undefined} The user object or undefined if not found.
 */
Pool.prototype.getBySocketId = function (socketId) {
  const userId = this.socketToUser.get(socketId);
  return this.get(userId);
};

module.exports = new Pool();