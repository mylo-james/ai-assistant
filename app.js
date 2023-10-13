const express = require("express");
const OpenAI = require("openai");
const axios = require("axios");
const dotenv = require("dotenv").config();
const fs = require("fs").promises;
const app = express();
const port = 6135;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", async ({ query: { events = {} } }, res) => {
  const prompt = await fs.readFile("systemText.txt", "utf8");
  const userData = await fs.readFile("aboutMe.txt", "utf8");
  const yesterday = await fs.readFile("yesterday.txt", "utf8");

  const {
    data: { daily: weather },
  } = await axios({
    method: "GET",
    url: "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_hours,windspeed_10m_max&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=America%2FChicago&forecast_days=1",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const forecast = `Today the WMO weather code is ${weather.weathercode}. It is going to have a high of ${weather.temperature_2m_max}, a low of ${weather.temperature_2m_min}, a max windspeed of ${weather.windspeed_10m_max} and it's going to precipitate for ${weather.precipitation_hours} hours today.`;
  console.log(forecast);
  const { data } = await axios({
    method: "GET",
    url: "https://zenquotes.io/api/today",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const quote = data[0].q;
  const author = data[0].a;

  console.log(weather);

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Today is: ${new Date()}`,
      },
      {
        role: "system",
        content: `Here's some background on the user: ${userData}`,
      },
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: `Here are my events, a quote, and who the quote is by. ${JSON.stringify(
          { events, quote, author, forecast }
        )}`,
      },
      {
        role: "system",
        content: `Make it much different than this brief: ${yesterday}.`,
      },
      {
        role: "system",
        content: "Keep responses to less that 100 words.",
      },
      {
        role: "assistant",
        content: "I will try and keep my responses to less that 100 words.",
      },
    ],
    temperature: 1.3,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0.5,
  });
  const { content } = response.choices[0].message;
  await fs.writeFile("./yesterday.txt", content);
  res.send(content);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
