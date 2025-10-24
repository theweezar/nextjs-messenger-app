const chalk = require("chalk");

const PoolLog = {
  info: (message) => {
    console.log(chalk.cyan(`[POOL] ${message}`));
  }
}

const ClientLog = {
  info: (message) => {
    console.log(chalk.cyan(`[USER] ${message}`));
  },
  warn: (message) => {
    console.log(chalk.yellow(`[USER] ${message}`));
  }
}