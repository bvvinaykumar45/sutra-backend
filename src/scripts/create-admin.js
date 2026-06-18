import "dotenv/config.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      existingAdmin.isAdmin = true;
      await existingAdmin.save({ validateBeforeSave: false });

      console.log("Existing User promoted to Admin.");
      process.exit(0);
    }

    await User.create({
      userName: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      fullName: process.env.ADMIN_FULLNAME,
      password: process.env.ADMIN_PASSWORD,
      isEmailVerified: true,
      isAdmin: true,
    });

    console.log("Admin User created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Admin User creation failed:", error);
    process.exit(1);
  }
};

createAdmin();
