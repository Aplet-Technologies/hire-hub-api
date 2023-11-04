import express from "express";
import multer from "multer";
import path from "path";
import session from "express-session";
import bodyParser from "body-parser";

import {
  signUp,
  login,
  getAllUsers,
  getUserProfile,
  refreshToken,
  updatePassword,
} from "../controllers/authController.js";
import { accessToken } from "../middlewares/authMiddleware.js";

var authRouter = express();
authRouter.use(bodyParser.json());
authRouter.use(express.static("./uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

authRouter.use(
  session({
    secret: "access-key-secrete",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if using HTTPS
  })
);

const upload = multer({ storage: storage });

authRouter.post("/signUp", upload.single("image"), signUp);
authRouter.post("/login", login);
authRouter.get("/all-users", getAllUsers);
authRouter.get("/profile", accessToken, getUserProfile);
authRouter.post("/refresh", accessToken, refreshToken);
authRouter.patch("/update", updatePassword);

export default authRouter;
