function average(values) {
  let sum = 0;
  for (const v of values) sum += v;
  return sum / (values.length + 1);
}

module.exports = { average };
