import { Customer, DeliveryPatner } from "../../models/user.js";
import Order from "../../models/order.js";
import Branch from "../../models/branch.js";

export const createOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { items, branch, totalPrice } = req.body;

    const customerData = await Customer.findById(userId);
    const branchData = await Branch.findById(branch);

    if (!customerData) {
      return reply.status(404).send("Customer not found");
    }

    const newOrder = new Order({
      customer: userId,
      items: items.map((item) => ({
        id: item.id,
        item: item.item,
        count: item.count,
      })),
      branch,
      totalPrice,
      deliveryLocation: {
        latitude: customerData.liveLocation.latitude,
        longitude: customerData.liveLocation.longitude,
        address: customerData.address || "No address available",
      },
      pickupLocation: {
        latitude: branchData.liveLocation.latitude,
        longitude: branchData.liveLocation.longitude,
        address: branchData.address || "No address available",
      },
    });
    const savedOrder = await newOrder.save();
    return reply.status(201).send(savedOrder);
  } catch (error) {
    console.log(error);
    return reply.status(500).send({ message: "An error accured", error });
  }
};

export const confirmOrder = async (req, reply) => {
  try {
    const { userId } = req.user;
    const { orderId } = req.params;
    const { deliveryPersonLocation } = req.body;

    const deliveryPerson = await DeliveryPatner.findById(userId);

    if (!deliveryPerson) {
      return reply.status(404).send({
        message: "Delivery Person not found",
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return reply.status(404).send({
        message: "Order not found",
      });
    }

    if (order.status !== "available") {
      return reply.status(400).send({ message: "Order is not available" });
    }

    order.status = "confirmed";

    order.deliveryPatner = userId;
    order.deliveryPersonLocation = {
      latitude: deliveryPerson.latitude,
      longitude: deliveryPerson.longitude,
      address: deliveryPerson.address || "",
    };

    req.server.io.to(orderId).emit("orderConfirmed", order);
    await order.save();

    return reply.send(order);
  } catch (error) {
    return reply.status(500).send({ message: "An error accured", error });
  }
};

export const updateOrderstatus = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const { status, deliveryPersonLocation } = req.body;
    const { userId } = req.user;

    const deliveryPerson = await DeliveryPatner.findById(userId);

    if (!deliveryPerson) {
      return reply.status(404).send({ message: "Delivery Person not found" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    if (["cancelled", "delivered"].includes(order.status)) {
      return reply.status(400).send({ message: "Order cannot be updated" });
    }

    if (order.deliveryPatner.toString() !== userId) {
      return reply.status(403).send({ message: "Unauthorized" });
    }

    order.status = status;
    order.deliveryPersonLocation = deliveryPersonLocation;
    await order.save();

    req.server.io.to(orderId).emit("liveTrackingUpdates", order);
    return reply.send(order);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Failed to update order status", error });
  }
};

export const getOrders = async (req, reply) => {
  try {
    const { status, customerId, deliveryPatnerId, branchId } = req.body;
    let query = {};
    if (status) {
      query.status = status;
    }

    if (customerId) {
      query.customer = customerId;
    }

    if (deliveryPatnerId) {
      query.deliveryPatner = deliveryPatnerId;
      query.branch = branchId;
    }

    const order = await Order.find(query).populate(
      "customer branch items.item deliveryPartner"
    );

    return reply.send(order);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Failed to update order status", error });
  }
};

export const getOrderById = async (req, reply) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate(
      "customer branch items.item deliveryPartner"
    );

    if (!order) {
      return reply.status(404).send("Order not found");
    }

    return reply.send(order);
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Failed to update order status", error });
  }
};
