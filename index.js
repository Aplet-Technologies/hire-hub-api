//PACKAGES
import express from "express";

const app = express();
const PORT = 8000;

//routes

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
