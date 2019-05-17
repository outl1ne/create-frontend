jest.setTimeout(10 * 60 * 1000); // 10 min
global.cleanupFunctions = [];

console.log('Setup test framework');

afterAll(() => {
  while (global.cleanupFunctions.length > 0) {
    const fn = global.cleanupFunctions.pop();
    fn();
  }
});
