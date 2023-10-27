const axios = require("axios");

const get = async (url) => {
  const { data } = await axios({
    method: "GET",
    url,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data;
};

const callWeather = async () => {
  const {
    daily: {
      time,
      weathercode,
      temperature_2m_max: max,
      temperature_2m_min: min,
      precipitation_hours: precip,
      windspeed_10m_max: wind,
    },
  } = await get(
    "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_hours,windspeed_10m_max&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FChicago&forecast_days=1"
  );
  return `Min temp of ${min}, max temp of ${max}, it may precipitate for ${precip} hours, and max wind speed of ${wind}`;
};
const callQuote = () => get("https://zenquotes.io/api/today");

module.exports = { callQuote, callWeather };
