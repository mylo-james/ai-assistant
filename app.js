const express = require("express");
const app = express();
const port = 6135;

const brief = require("./brief");
const { router: events } = require("./events");
const { router: weather } = require("./weather");

app.use(express.json());
app.use("/brief", brief);
app.use("/events", events);
app.use("/weather", weather);

app.listen(port, async () => {
  console.log(`Listening on port ${port}`);
});
