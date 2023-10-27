const express = require("express");
const OpenAI = require("openai");
const cron = require("node-cron");
require("dotenv").config();
const fs = require("fs").promises;
const router = express.Router();
const { defaultMessages, debug } = require("../utils");
const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateEventResponse = async (events) => {
  console.log("Generating new event response");
  const prompt = await fs.readFile("events/prompt.txt", "utf8");

  const response = await openAI.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      ...(await defaultMessages),
      {
        role: "system",
        content: `Here are the events for the day in JSON format: ${events}"`,
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
    JSON: events,
  };
  await fs.writeFile("events/events.json", JSON.stringify(obj));
  return obj.content;
};

const runEvents = async (_req, res) => {
  const eventsJSON = await fs.readFile("events/events.json", "utf8");
  const events = JSON.parse(eventsJSON);
  if (events.content && !debug) {
    res.send(events.content);
  } else {
    res.send(await generateEventResponse(events.JSON));
  }
};

router.post("/", async ({ body: { data } }, res) => {
  const obj = {
    content: "",
    created: new Date(),
    JSON: data || "No Events Today",
  };
  await fs.writeFile("events/events.json", JSON.stringify(obj));
  res.send(obj);
});
router.get("/", runEvents);

cron.schedule("2 0 * * *", runEvents);

module.exports = { router, runEvents };
