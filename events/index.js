const express = require("express");
const fs = require("fs").promises;
const router = express.Router();

router.post("/add", async ({ body: { data: dataJSON } }, res) => {
  console.log("uploading events");
  let content = "none";
  const created = new Date();
  if (dataJSON) {
    const data = JSON.parse(dataJSON);
    content = Object.keys(data).reduce(
      (accum, event) => (accum += `Event: ${event}, Time: ${data[event]}. `),
      ""
    );
  }
  await fs.writeFile(
    "events/events.json",
    JSON.stringify({ content, created })
  );
  res.send(content);
});

module.exports = router;
