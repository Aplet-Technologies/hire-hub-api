import Order from "../model/auth/order.model.js";

export const create = async (req, res) => {
  const { name, division, address } = req.body;
  try {
    const ordersItem = new Order({
      name: name,
      division: division,
    });
    const saveOrder = await ordersItem.save();
    if (!saveOrder) throw new Error("Error creating order");
    return res.status(201).json({
      status: 201,
      success: true,
      message: "User registred successfully",
      data: saveOrder,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
};

export const get = async (req, res) => {
  try {
    const saveOrder = await Order.find({});
    if (!saveOrder) throw new Error("Error creating order");
    return res.status(200).json({
      status: 200,
      success: true,
      data: saveOrder,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
};

export const update = async (req, res) => {
  const { city } = req.body;
  try {
    const items = { city: city };
    const saveOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $push: { address: items } },
      { new: true }
    );
    if (!saveOrder) throw new Error("Error creating order");
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Succesfully Added",
      data: saveOrder,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
};

export const table = async (req, res) => {
  const { id } = req.body;
  try {
    const items = { _id: id };
    const saveOrder = await Order.findByIdAndDelete(req.params.id);
    if (!saveOrder) throw new Error("Error creating order");
    return res.status(200).json({
      status: 200,
      success: true,
      message: " removed",
      data: saveOrder,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
};

export const remove = async (req, res) => {
  const { id } = req.body;
  try {
    const items = { _id: id };
    const saveOrder = await Order.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { address: items } },
      { new: true }
    );
    if (!saveOrder) throw new Error("Error creating order");
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Succesfully removed",
      data: saveOrder,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
};

export const getById = async (req, res) => {
  try {
    const saveOrder = await Order.findOne({ _id: req.params.id });
    if (!saveOrder) throw new Error("Error creating order");
    return res.status(200).json({
      status: 200,
      success: true,
      data: saveOrder,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
};

export const assign = async (req, res) => {
  const { dealer } = req.body;
  try {
    const items = { dealer: dealer };
    const saveOrder = await Order.findByIdAndUpdate(req.params.id, items, {
      new: true,
    });
    if (!saveOrder) throw new Error("Error creating order");
    return res.status(200).json({
      status: 200,
      success: true,
      message: "Succesfully Added",
      data: saveOrder,
    });
  } catch (error) {
    await res.status(400).json({ message: error?.message });
  }
};
