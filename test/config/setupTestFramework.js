jest.setTimeout(9 * 60 * 1000); // 10 min
global.cleanupFunctions = [];

afterAll(() => {
  while (global.cleanupFunctions.length > 0) {
    const fn = global.cleanupFunctions.pop();
    fn();
  }
});
