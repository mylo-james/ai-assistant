const { callWeather } = require("../external-api");

const getWeather = async () => {
  const {
    daily: {
      weathercode,
      temperature_2m_max: max,
      temperature_2m_min: min,
      windspeed_10m_max: wind,
      precipitation_hours: precip,
    },
  } = await callWeather;
  return `The current WMO weathercode is ${weathercode}, temperatures will range from ${min} to ${max}. Winds could get up to ${wind} and it's going to precipitate for ${precip} hours today.`;
};

module.exports = { getWeather };
