import mongoose from "mongoose";

const friendsModel = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    reciever: { type: String, required: true },
    isFriend: { type: Boolean, required: false },
    isRequested: { type: Boolean, required: false },
  },
  {
    timestamps: true,
  }
);

const Friends = mongoose.model("Friends", friendsModel);
export default Friends;
