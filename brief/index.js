const express = require("express");
const OpenAI = require("openai");
require("dotenv").config();
const fs = require("fs").promises;
const cron = require("node-cron");
const router = express.Router();
const { getQuote } = require("../quote");
const { debug, defaultMessages } = require("../utils");
const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateResponse = async (brief) => {
  console.log("Generating new response");
  const prompt = await fs.readFile("brief/prompt.txt", "utf8");
  const eventsJSON = await fs.readFile("events/events.json", "utf8");
  const weatherJSON = await fs.readFile("weather/weather.json", "utf8");
  const pastBriefs = await fs.readFile("brief/brief-history.txt", "utf8");
  const events = JSON.parse(eventsJSON).content;
  const weather = JSON.parse(weatherJSON).content;
  const quote = await getQuote();
  const response = await openAI.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      ...(await defaultMessages),
      {
        role: "system",
        content: `The forecast is ${weather}`,
      },
      {
        role: "system",
        content: `Here are events planned for today: ${events}`,
      },
      {
        role: "system",
        content: `Here is the quote for the day: ${quote}, apply it to what's happening lately`,
      },
      {
        role: "system",
        content: `Here's what you've said before. Try to vary your jokes and the brief structure: ${pastBriefs}`,
      },
      {
        role: "user",
        content: prompt,
      },
      {
        role: "user",
        content: `Today's Date is ${new Date()}`,
      },
      {
        role: "user",
        content: `Here's my updated journal, ${await fs.readFile(
          "userData/aboutMe.txt"
        )}`,
      },
      {
        role: "user",
        content: "Max of 125 words",
      },
    ],
    temperature: 1.45,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0.5,
  });
  const obj = {
    content: response.choices[0].message.content,
    created: new Date(),
  };
  await fs.writeFile("brief/brief.json", JSON.stringify(obj));
  await fs.appendFile(
    "brief/brief-history.txt",
    response.choices[0].message.content.trim()
  );
  await fs.appendFile("brief/brief-history.txt", "- - -");
  return obj.content;
};

router.get("/", async (_req, res) => {
  const briefJSON = await fs.readFile("brief/brief.json", "utf8");
  const brief = JSON.parse(briefJSON);
  if (new Date(brief.created).getDay() === new Date().getDay() && !debug) {
    res.send(brief.content);
  } else {
    res.send(await generateResponse(brief.content));
  }
});

cron.schedule("10 0 * * *", generateResponse);

module.exports = router;
