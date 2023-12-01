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
  sendRequest,
  getFriendRequest,
  acceptRequest,
  getMutualFriends,
} from "../controllers/authController.js";
import { accessToken } from "../middlewares/authMiddleware.js";
import {
  assign,
  create,
  get,
  getById,
  remove,
  table,
  update,
} from "../controllers/orderController.js";

var authRouter = express();
authRouter.use(bodyParser.json());
authRouter.use(express.static("/uploads"));

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
authRouter.get("/all-users", accessToken, getAllUsers);
authRouter.get("/profile", accessToken, getUserProfile);
authRouter.post("/refresh", refreshToken);
authRouter.patch("/update", updatePassword);
authRouter.post("/create", create);
authRouter.get("/get", get);
authRouter.patch("/update/:id", update);
authRouter.patch("/remo/:id", remove);
authRouter.delete("/table/:id", table);
authRouter.get("/get/:id", getById);
authRouter.patch("/assign/:id", assign);

authRouter.post("/send-request/", accessToken, sendRequest);
authRouter.get("/get-request/", accessToken, getFriendRequest);
authRouter.patch("/accept/", accessToken, acceptRequest);
authRouter.get("/mutual/", accessToken, getMutualFriends);

export default authRouter;
