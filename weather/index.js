const express = require("express");
const OpenAI = require("openai");
const cron = require("node-cron");
require("dotenv").config();
const fs = require("fs").promises;
const router = express.Router();
const { defaultMessages, debug } = require("../utils");
const { callWeather } = require("../external-api");

const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getWeather = async () => {
  const weather = await callWeather();
  return weather;
};

const generateWeatherResponse = async (weather) => {
  console.log("Generating new weather response");
  const prompt = await fs.readFile("weather/prompt.txt", "utf8");

  const response = await openAI.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      ...(await defaultMessages),
      {
        role: "system",
        content: `Here are the weather for the day: ${weather}`,
      },
      {
        role: "user",
        content: prompt,
      },
      {
        role: "user",
        content: `Today's Date is ${new Date().getDate()}`,
      },
      {
        role: "user",
        content: `Here's my updated journal, ${await fs.readFile(
          "userData/aboutMe.txt"
        )}`,
      },
    ],
    temperature: 1.3,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0.5,
  });
  const obj = {
    content: response.choices[0].message.content,
    created: new Date(),
    JSON: weather,
  };
  await fs.writeFile("weather/weather.json", JSON.stringify(obj));
  return obj.content;
};

const runWeather = async (_req, res) => {
  const weatherJSON = await fs.readFile("weather/weather.json", "utf8");
  const weather = JSON.parse(weatherJSON);
  const dataJSON = await getWeather();
  if (weather.JSON === dataJSON && !debug) {
    res.send(weather.content);
  } else {
    res.send(await generateWeatherResponse(dataJSON));
  }
};

router.get("/", runWeather);

cron.schedule("3 0 * * *", runWeather);

module.exports = { router, runWeather };
