class Log {
  constructor(category) {
    this.category = category;
  }

  info(...args) {
    console.log(`%c[${this.category}]`, 'background: blue; color: white;', ...args);
  }

  warn(...args) {
    console.log(`%c[${this.category}] WARNING:`, 'background: orange; color: black;', ...args);
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

export { Log, Logger };
