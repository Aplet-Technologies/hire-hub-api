// packages
import express from "express";
import "dotenv/config.js";

// db
import { mongo } from "./src/config/db.js";

const app = express();

const dbUrl =
  process.env.DB_URL || `mongodb://0.0.0.0:27017/${process.env.DB_URL}`;

mongo(dbUrl);

app.listen(process.env.PORT, () => {
  console.log(
    `Server started on port ${process.env.PORT},connected DB ${dbUrl}`
  );
});
