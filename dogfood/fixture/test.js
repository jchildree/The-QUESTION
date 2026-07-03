const assert = require("assert");
const { average } = require("./stats");

assert.strictEqual(
  average([2, 4, 6]),
  4,
  "average([2,4,6]) should be 4, got " + average([2, 4, 6])
);
console.log("OK");
