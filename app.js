const express = require("express");
const app = express();
const port = 6135;
const { loadUserData } = require("./userData");

const morningBrief = require("./morningBrief");
const events = require("./events");

app.use(express.json());
app.use("/morningBrief", morningBrief);
app.use("/events", events);

app.listen(port, () => {
  loadUserData();
  console.log(`Listening on port ${port}`);
});
