import mongoose from "mongoose";

const CompanyAddressSchema = new mongoose.Schema({
  company_name: String,
  state: String,
  city: String,
  company_type: String,
  phone: String,
  employee_size: String,
  email: String,
});

const userModel = new mongoose.Schema(
  {
    first_name: { type: String, required: false },
    last_name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: false },
    phone: { type: String, required: true, unique: true },
    isEmployer: { type: Boolean, required: false },
    password: { type: String, required: true },
    access_token: { type: String, default: "" },
    refresh_token: { type: String, default: "" },
    company_address: [
      {
        type: CompanyAddressSchema,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userModel);
export default User;
