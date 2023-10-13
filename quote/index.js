const { callQuote } = require("../external-api");

const getQuote = async () => {
  const [{ q, a }] = await callQuote;
  return `${q} by ${a}`;
};

module.exports = { getQuote };
