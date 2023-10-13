const express = require("express");
const OpenAI = require("openai");
require("dotenv").config();
const fs = require("fs").promises;
const cron = require("node-cron");
const router = express.Router();
const { userData } = require("../userData");
const { getWeather } = require("../weather");
const { getQuote } = require("../quote");
const { debug } = require("../utils");
const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateResponse = async (morningBrief) => {
  console.log("Generating new response");
  const prompt = await fs.readFile("morningBrief/prompt.txt", "utf8");
  const eventsJSON = await fs.readFile("events/events.json", "utf8");
  const events = JSON.parse(eventsJSON);
  const forecast = await getWeather();
  const quote = await getQuote();

  const response = await openAI.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Here's some background on the user: ${userData}`,
      },
      {
        role: "system",
        content: `Today is: ${new Date()}`,
      },
      {
        role: "system",
        content: `The forecast is ${forecast}`,
      },
      {
        role: "system",
        content: `Today's quote is ${quote}`,
      },
      {
        role: "system",
        content: `Here are the events for the day: ${events.content}`,
      },
      {
        role: "user",
        content: prompt,
      },
      {
        role: "system",
        content: `Make it much different than this brief: ${morningBrief.content}.`,
      },
      {
        role: "system",
        content: "Keep responses to less that 125 words.",
      },
      {
        role: "assistant",
        content: "I will try and keep my responses to less that 125 words.",
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
  };
  await fs.writeFile("morningBrief/morningBrief.json", JSON.stringify(obj));
  return obj.content;
};

router.get("/", async (_req, res) => {
  const morningBriefJSON = await fs.readFile(
    "morningBrief/morningBrief.json",
    "utf8"
  );
  const morningBrief = JSON.parse(morningBriefJSON);
  if (
    new Date(morningBrief.created).getDay() === new Date().getDay() &&
    !debug
  ) {
    res.send(morningBrief.content);
  } else {
    res.send(await generateResponse(morningBrief.content));
  }
});

cron.schedule("5 0 * * *", generateResponse);

module.exports = router;
