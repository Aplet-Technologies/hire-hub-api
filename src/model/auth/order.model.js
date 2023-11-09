import mongoose from "mongoose";
// Define the address subdocument schema
const addressSchema = new mongoose.Schema({
  city: { type: String, required: false },
});

// Define the main schema for your model
const orderModel = new mongoose.Schema({
  name: {
    type: String,
    required: false, // 'name' is required
  },
  division: {
    type: String,
    required: true, // 'division' is required
  },
  address: [addressSchema], // 'address' is an array of address objects
  dealer: mongoose.Schema.Types.Mixed,
});

const Order = mongoose.model("Order", orderModel);
export default Order;
