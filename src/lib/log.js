export const PoolLog = {
  info: function () {
    console.log(`[POOL]`, ...arguments);
  }
}

export const ClientLog = {
  info: function () {
    console.log(`[USER]`, ...arguments);
  },
  warn: function () {
    console.log(`[USER] WARNING:`, ...arguments);
  }
}
