import User from "../model/auth/user.model.js";
import Resume from "../model/auth/resume.model.js";
import Jwt from "jsonwebtoken";
import { encryptPassword, checkPassword } from "../services/MiscServices.js";
import { error } from "react-native-builder-bob/lib/utils/logger.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: "fah@gmail.com",
    pass: "kfu",
  },
  secure: true,
});

export const signUp = async (req, res) => {
  const {
    phone,
    password,
    email,
    isEmployer,
    first_name,
    last_name,
    company_address,
  } = req.body;
  const encryptedPassword = await encryptPassword(password);
  try {
    const existingUser = await User.findOne({
      $or: [{ phone: phone }, { email: email }],
    });
    if (existingUser) {
      return res.status(404).json({
        success: false,
        message: `User with this ${
          (existingUser.email == email && "email") ||
          (existingUser.phone == phone && "phone")
        }  already registered`,
      });
    } else {
      const imagePath = req?.file?.path;
      const imageRelativePath = "/" + imagePath?.replace(/\\/g, "/");
      const imageUrl =
        req?.protocol + "://" + req?.get("host") + imageRelativePath;
      const image = imageUrl;
      let saveuser = new User({
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: encryptedPassword,
        isEmployer: isEmployer,
        phone: phone,
        image: imageRelativePath == "/" + undefined ? null : image,
        company_address: company_address,
      });

      const saveUser = await saveuser.save();
      await res.status(201).json({
        status: 201,
        success: true,
        message: "User registred successfully",
        data: saveUser,
      });
    }
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userData = await User.find({ email: email });
    if (userData.length > 0) {
      const user = userData[0];
      const user_data = {
        user_id: userData[0]._id,
      };
      let check = await checkPassword(password, user.password);
      if (check) {
        let accessToken = Jwt.sign({ user_data }, "access-key-secrete", {
          expiresIn: "1m",
        });
        let refreshToken = Jwt.sign({ user_data }, "access-key-secrete", {
          expiresIn: "2m",
        });
        const update = {
          access_token: accessToken,
          refresh_token: refreshToken,
        };
        await User.findOneAndUpdate({ email: email }, update, { new: true });
        const tokens = {
          accessToken,
          refreshToken,
        };
        return res.status(200).json({
          status: 200,
          success: true,
          message: "Logged in successfully",
          data: { tokens: tokens },
        });
      } else {
        return res
          .status(404)
          .json({ status: "error", message: "Invalid credentials" });
      }
    } else {
      return res
        .status(404)
        .json({ status: "error", message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    await res.status(400).json({ message: error?.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const projection = {
      _id: 0,
      first_name: 1,
      phone: 1,
      email: 1,
      isEmployer: 1,
      image: 1,
    };
    const userList = await User.find({}, projection);
    const mailData = {
      from: "fahee@gmail.com", // sender address
      to: "faheem@.com", // list of receivers
      subject: "Sending Email using Node.js",
      text: "That was easy!",
      html: "<b>Hey there! </b>  <br> This is our first message sent with Nodemailer<br/>",
    };
    transporter.sendMail(mailData, (error, info) => {
      console.log(info, "mail");
      console.log(error, "erro");
    });
    return res.status(200).json({
      status: 200,
      success: true,
      data: userList,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
};

export const getUserProfile = async (req, res) => {
  let user_id = req.user.user_data.user_id;
  try {
    const projection = {
      _id: 1,
      first_name: 1,
      phone: 1,
      email: 1,
      isEmployer: 1,
      image: 1,
    };
    const userData = await User.findById(user_id, projection);
    if (userData) {
      await res.status(200).json({
        status: 200,
        success: true,
        data: userData,
        id: req.user.user_data.user_id,
      });
    } else {
      await res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    await res.status(400).json({ message: error?.message || "User not found" });
  }
};

export async function refreshToken(req, res) {
  const refresh = req.body.refreshToken;
  try {
    const decoded = Jwt.verify(refresh, "access-key-secrete");
    const user = await User.findOne({
      _id: decoded.user_data?.user_id,
      refresh,
    });
    if (!user) {
      throw new Error();
    }

    const user_data = {
      user_id: user._id,
    };

    // Generate a new access token
    const accessToken = Jwt.sign({ user_data }, "access-key-secrete", {
      expiresIn: "1d",
    });
    const refreshToken = Jwt.sign({ user_data }, "access-key-secrete", {
      expiresIn: "7d",
    });
    const update = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
    const filter = { _id: user._id };
    await User.findOneAndUpdate(filter, update, { new: true });
    res.json({ data: update });
    // Return the new access token
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
}

export async function updatePassword(req, res) {
  try {
    const { email, password } = req.body;
    const encryptedPassword = await encryptPassword(password);
    // const updatedUser = await User.findByIdAndUpdate(
    //   user._id,
    //   { password: encryptedPassword },
    //   { new: true }
    // );

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { password: encryptedPassword },
      { new: true }
    );
    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: 404, success: false, message: "User not found" });
    }
    return res.status(200).json({
      status: 200,
      message: "Password updated successfully",
      data: { data: updatedUser },
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res
      .status(500)
      .json({ status: 404, success: false, message: "Internal server error" });
  }
}
