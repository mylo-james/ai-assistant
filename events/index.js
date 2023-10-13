const express = require("express");
const fs = require("fs").promises;
const router = express.Router();

router.post("/add", async ({ body: { data: dataJSON } }, res) => {
  console.log("uploading events");
  const data = JSON.parse(dataJSON);
  const content = Object.keys(data).reduce(
    (accum, event) => (accum += `Event: ${event}, Time: ${data[event]}. `),
    ""
  );
  await fs.writeFile(
    "events/events.json",
    `{"content": ${JSON.stringify(content)}, "created": "${new Date()}"}`
  );
  res.send(content);
});

module.exports = router;
