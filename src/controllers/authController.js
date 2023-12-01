import User from "../model/auth/user.model.js";
import Friends from "../model/auth/friends.model.js";
import Resume from "../model/auth/resume.model.js";
import Jwt from "jsonwebtoken";
import { encryptPassword, checkPassword } from "../services/MiscServices.js";

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
        // company_address: company_address,
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
          expiresIn: "1d",
        });
        let refreshToken = Jwt.sign({ user_data }, "access-key-secrete", {
          expiresIn: "10d",
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
    const userId = req.user.user_data.user_id;
    const projection = {
      _id: 1,
      first_name: 1,
      phone: 1,
      email: 1,
      isEmployer: 1,
      image: 1,
    };

    const users = await User.find({}, projection);
    const friends = await Friends.find({
      isFriend: true,
      $or: [{ sender: userId }, { reciever: userId }],
    });
    const requested = await Friends.find({
      isFriend: false,
      sender: userId,
      isRequested: true,
    });

    const result = users?.map((user) => {
      const isMyFriend = friends.find(
        (friend) => user?._id == friend?.reciever || user?._id == friend?.sender
      );
      const isRequested = requested.find(
        (request) => user?._id == request?.reciever
      );

      return {
        ...user.toObject(),
        myFriend: isMyFriend ? true : false,
        isRequested: isRequested ? true : false,
        requestId: isRequested ? isRequested?._id : null,
      };
    });

    return res.status(200).json({
      status: 200,
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ message: error?.message });
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

export async function sendRequest(req, res) {
  let user_id = req.user.user_data.user_id;
  const { reciever } = req.body;
  try {
    let saveFriends = new Friends({
      sender: user_id,
      reciever: reciever,
      isFriend: false,
      isRequested: true,
    });

    const data = await saveFriends.save();
    await res.status(201).json({
      status: 201,
      success: true,
      message: "Request sented successfully",
      data: data,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
}

export async function cancelRequest(req, res) {
  let user_id = req.user.user_data.user_id;
  const { request_id, accept } = req.body;

  // Create a filter for the update
  const filter = {
    $and: [{ _id: request_id }, { sender: user_id }],
  };

  try {
    const updatedRequest = await Friends.findOneAndUpdate(
      filter,
      { $set: { isFriend: false, isRequested: false } },
      { new: true }
    );

    await res.status(201).json({
      status: 200,
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
}

export async function getFriendRequest(req, res) {
  let user_id = req.user.user_data.user_id;
  const projection = {
    _id: 1,
    sender: 1,
    reciever: 1,
    isFriend: 1,
    userId: "$user._id",
    first_name: "$user.first_name",
    phone: "$user.phone",
    email: "$user.email",
    image: "$user.image",
  };
  try {
    const friends = await Friends.find({ reciever: user_id, isFriend: false });
    const result = await Friends.aggregate([
      {
        $match: { reciever: user_id, isFriend: false },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender", // Field in the Friends collection
          foreignField: "_id", // Field in the User collection
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: projection, // Apply the projection here
      },
    ]);

    // const is_list = friends.map((item) => item.sender);
    // const result = await User.find({ _id: { $in: is_list } }, projection);

    // const modifiedResult = result.map((doc) => {
    //   const correspondingSender = friends.find(
    //     (sender) => sender.sender === doc._id?.toString()
    //   );
    //   return {
    //     ...doc.toObject(),
    //     request_id: correspondingSender ? correspondingSender._id : null,
    //     isFriend: correspondingSender?.isFriend,
    //   };
    // });

    await res.status(200).json({
      status: 200,
      success: true,
      data: result,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
}

export async function acceptRequest(req, res) {
  let user_id = req.user.user_data.user_id;
  const { request_id, accept } = req.body;

  // Create a filter for the update
  const filter = {
    $and: [{ _id: request_id }, { reciever: user_id }],
  };

  try {
    const updatedRequest = await Friends.findOneAndUpdate(
      filter,
      { $set: { isFriend: accept, isRequested: accept } },
      { new: true }
    );

    await res.status(201).json({
      status: 200,
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
}

export async function getMutualFriends(req, res) {
  let user_id = req.user.user_data.user_id;
  const projection = {
    _id: 1,
    sender: 1,
    reciever: 1,
    isFriend: 1,
    userId: "$user._id",
    first_name: "$user.first_name",
    phone: "$user.phone",
    email: "$user.email",
    image: "$user.image",
  };
  try {
    const result = await Friends.aggregate([
      {
        $match: { reciever: user_id, isFriend: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender", // Field in the Friends collection
          foreignField: "_id", // Field in the User collection
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: projection, // Apply the projection here
      },
    ]);

    await res.status(200).json({
      status: 200,
      success: true,
      data: result,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
}
