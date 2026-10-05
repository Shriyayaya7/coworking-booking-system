require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("../config/database");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@coworking.com";
    const adminPassword = "Admin@12345";

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();

        console.log(
          `Existing user ${adminEmail} has been promoted to admin.`
        );
      } else {
        console.log(
          `Admin user ${adminEmail} already exists.`
        );
      }

      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      adminPassword,
      12
    );

    const admin = await User.create({
      name: "System Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin user created successfully.");
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  }
};

createAdmin();