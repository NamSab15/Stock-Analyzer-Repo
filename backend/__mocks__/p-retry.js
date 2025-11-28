module.exports = function pRetry(fn, opts) {
  // very simplified mock for tests - just execute and return
  return Promise.resolve(fn());
};
