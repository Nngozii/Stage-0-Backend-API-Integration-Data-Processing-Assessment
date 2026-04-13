const express = require("express");
const port = 9000;

const app = express();

app.get(`/api/classify`, async (req, res) => {
  let {name} = req.query;

  if (name === undefined || name === ""){
    res.status(400).json({
        status: "error",
        message: "Missing or empty name parameter",
      });
  }

  if (typeof(name) !== "string"){
    res.status(422).json({
        status: "error",
        message: "Name is not a string",
      });
  }

  try {
    const response = await fetch(`https://api.genderize.io/?name=${name}`);
    const data = await response.json();

    if (data.gender === null || data.count === 0) {
      res.json({
        status: "error",
        message: "No prediction available for the provided name",
      });
    }

    let confidence =
      data.probability >= 0.7 && data.count >= 100 ? true : false;
    let processedDateTime = new Date().toISOString();

    res.status(200).json({
      status: "success",
      data: {
        name: data.name,
        gender: data.gender,
        probability: data.probability,
        sample_size: data.count,
        is_confident: confidence,
        processed_at: processedDateTime,
      },
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      return res.status(400).json({ status: "error", message: err.message });
    } else if (err instanceof TypeError) {
      return res.status(422).json({ status: "error", message: err.message });
    } else {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
});

app.listen(port, () => {
  console.log("Server listen on port", port);
});
