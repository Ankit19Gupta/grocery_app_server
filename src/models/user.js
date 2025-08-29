import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  role: {
    type: String,
    enum: ["Customer", "Admin", "DeliveryPatner"],
    required: true,
  },
  isActivated: {
    type: Boolean,
    default: false,
  },
});

// Customer Schema
const customerSchema = new mongoose.Schema({
  ...userSchema.obj,
  phone: {
    type: Number,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    enum: ["Customer"],
    default: "Customer",
  },
  liveLocation: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  address: {
    type: String,
  },
});

// Delivery Patner Schema
const deleviryPatnerSchema = new mongoose.Schema({
  ...userSchema.obj,
  email: {
    type: String,
    unique: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    enum: ["DeliveryPatner"],
    default: "DeliveryPatner",
  },
  liveLocation: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  address: {
    type: String,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
  },
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  ...userSchema.obj,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin"],
    default: "Admin",
  },
});

export const Customer = mongoose.model("Customer", customerSchema);
export const DeliveryPatner = mongoose.model(
  "DeliveryPatner",
  deleviryPatnerSchema
);
export const Admin = mongoose.model("Admin", adminSchema);
