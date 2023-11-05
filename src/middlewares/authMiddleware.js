import Jwt from "jsonwebtoken";
import User from "../model/auth/user.model.js";

export const accessToken = async (req, res, next) => {
  // let myUser = await req.session.user;
  //   let device = await req.headers["device"];
  let authHeader = await req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1]; //Access token
  var filter;
  await Jwt.verify(token, "access-key-secrete", (err, access) => {
    filter = { _id: access?.user_data?.user_id };

    User.findOne(filter).then((result) => {
      const user = result;
      if (!user) {
        return res
          .status(403)
          .json({ status: "error", message: "Unauthenticated" });
      }
      //   if (user) {
      //     if (device !== user.device) {
      //       return res
      //         .status(403)
      //         .json({ status: "error", message: "session expired" });
      //     }
      //   }

      if (!err) {
        req.user = access;
        next();
      } else {
        return res
          .status(403)
          .json({ status: "error", message: "Unauthenticated" });
      }
    });
  });
};
