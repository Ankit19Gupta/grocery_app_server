import mongoose from "mongoose";

export const connectDB = async (uri) => {
  try {
    const database = await mongoose.connect(uri);
    console.log("Connected database: ", database.connection.host);
  } catch (err) {
    console.log("Error while connecting database");
  }
};
