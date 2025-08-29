import { Customer, DeliveryPatner } from "../../models/user.js";
export const updateUser = async (req, reply) => {
  try {
    const { userId } = req.user;
    const updateData = req.body;

    let user =
      (await Customer.findById(userId)) || DeliveryPatner.findById(userId);

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    let UserModel;

    if (user.role === "Customer") {
      UserModel = Customer;
    } else if (user.role === "DeliveryPatner") {
      UserModel = DeliveryPatner;
    } else {
      return reply.status(400).send({ message: "Invalid role" });
    }

    const updatetdUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updateUser) {
      return reply.status(404).send({ message: "User not found" });
    }

    return reply.send({
      message: "User updated successfully",
      user: updatetdUser,
    });
  } catch (error) {
    return reply.status(500).send({ message: "An error accured", error });
  }
};
