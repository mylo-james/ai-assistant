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
    data: { hourly: weather },
  } = await axios({
    method: "GET",
    url: "https://api.open-meteo.com/v1/forecast?latitude=41.85&longitude=-87.65&hourly=temperature_2m,precipitation_probability,windspeed_10m&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=America%2FChicago&forecast_days=1",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const { data } = await axios({
    method: "GET",
    url: "https://zenquotes.io/api/today",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const quote = data[0].q;
  const author = data[0].a;

  const weatherObj = JSON.stringify(
    weather.time.reduce((accum, time, i) => {
      const hour = new Date(time * 1000).toString().slice(16, 21);
      const temp = `${weather.temperature_2m[i]}F`;
      const precipitation = `${weather.precipitation_probability[i]}%`;
      const windspeed = `${weather.windspeed_10m[i]}mph`;
      accum[hour] = { temp, precipitation, windspeed };
      return accum;
    }, {})
  );

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Today is: ${new Date()}`,
      },
      {
        role: "system",
        content: `Yesterday you said: ${yesterday}`,
      },
      {
        role: "system",
        content: prompt,
      },
      {
        role: "system",
        content: `Here's the some JSON report of the forecast today: ${weatherObj}`,
      },
      {
        role: "system",
        content: `Here's some background on the user: ${userData}`,
      },
      {
        role: "user",
        content: JSON.stringify({ events, quote, author }),
      },
    ],
    temperature: 1.1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const { content } = response.choices[0].message;
  await fs.writeFile("./yesterday.txt", content);
  res.send(content);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
