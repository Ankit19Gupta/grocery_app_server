import jwt, { decode } from "jsonwebtoken";
import { Customer, DeliveryPatner } from "../../models/user.js";

const generateToken = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

export const loginCustomer = async (req, reply) => {
  try {
    const { phone } = req.body;
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = new Customer({
        phone,
        role: "Customer",
        isActivated: true,
      });
      await customer.save();

      const { accessToken, refreshToken } = generateToken(customer);
      return reply.send({
        message: "LoggedIn Successful",
        accessToken,
        refreshToken,
        customer,
      });
    }
  } catch (error) {
    return reply.status(500).send({ message: "An error accured", error });
  }
};

export const loginDeliveryPartner = async (req, reply) => {
  try {
    const { email, password } = req.body;
    const deliviryPatner = await DeliveryPatner.findOne({ email });

    if (!deliviryPatner) {
      return reply.status(404).send({ message: "Delivery Partner not found" });
    }

    const isMatch = password === deliviryPatner.password;

    if (!isMatch) {
      return reply.status(400).send({ message: "Invalid Credentials" });
    }

    const { accessToken, refreshToken } = generateToken(deliviryPatner);

    return reply.send({
      message: "LoggedIn successful",
      accessToken,
      refreshToken,
      deliviryPatner,
    });
  } catch (error) {
    return reply.status(500).send({ message: "An error accured", error });
  }
};

export const refreshToken = async (req, reply) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return reply.status(401).send({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    let user;

    if (decoded.role === "Customer") {
      user = await Customer.findById(decoded.userId);
    } else if (decode.role === "DeliveryPatner") {
      user = await DeliveryPatner.findById(decode.userId);
    } else {
      return reply.status(403).send({ message: "Invalid role" });
    }

    if (!user) {
      return reply.status(403).send({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateToken(user);
    return reply.send({
      message: "Token Refreshed",
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return reply.status(500).send({ message: "An error accured", error });
  }
};

export const fetchUser = async (req, reply) => {
  const { userId, role } = req.body;
  let user;

  if (role === "Customer") {
    user = await Customer.findById(userId);
  } else if (role === "DeliveryPatner") {
    user = await DeliveryPatner.findById(userId);
  } else {
    return reply.send({ message: "Invalid role" });
  }

  if (!user) {
    return reply.status(404).send({ message: "User not found." });
  }

  return reply.send({
    message: "User fetch successfully",
    user,
  });
};
