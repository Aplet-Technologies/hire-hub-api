import express from "express";
import path from "path";

const app = express();
const PORT = 8000 || 5000;

//routes

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
