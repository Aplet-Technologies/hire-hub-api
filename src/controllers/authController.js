import User from "../model/auth/user.model.js";
import Jwt from "jsonwebtoken";
import { encryptPassword, checkPassword } from "../services/MiscServices.js";

export const login = async (req, res) => {
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
