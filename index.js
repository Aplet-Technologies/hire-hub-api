// packages
import express from "express";
import "dotenv/config.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import router from "./src/routes/index.js";
// db
import { mongo } from "./src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use("/api", router);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const dbUrl = `mongodb+srv://faheemtfora:sydesNQFyzlnOIOK@cluster0.vlmalrp.mongodb.net/?retryWrites=true&w=majority`;
// const dbUrl = `mongodb://0.0.0.0:27017/hirehubdb`;

mongo(dbUrl);

app.listen(8000, () => {
  console.log(`Server started on port 8000,connected DB ${dbUrl}`);
});

// app.listen(process.env.PORT, () => {
//   console.log(
//     `Server started on port ${process.env.PORT},connected DB ${dbUrl}`
//   );
// });
