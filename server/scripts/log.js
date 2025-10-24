const chalk = require("chalk");

class Log {
  constructor(category) {
    this.category = category;
  }

  info(...args) {
    console.log(chalk.cyan(`[${this.category}]`, ...args));
  }

  warn(...args) {
    console.log(chalk.yellow(`[${this.category}] WARNING:`, ...args));
  }
}

class Logger extends Log {
  constructor() {
    super('');
  }

  static getLog(category) {
    return new Log(category);
  }
}

module.exports = { Log, Logger };