import express from "express";
import "dotenv/config.js";

const app = express();

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
