import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import users from "./data/users.js";
import products from "./data/products.js";
import User from "./models/userModel.js";
import Product from "./models/productModel.js";
import Order from "./models/orderModel.js";
import connectDB from "./config/db.js";

dotenv.config();

// Safety guard: refuse to run seeder against a production database.
// The MONGO_URI database name must contain "dev", "test", or "staging".
const mongoUri = process.env.MONGO_URI || "";
const dbNameMatch = mongoUri.match(/\/([^/?]+)(\?|$)/);
const dbName = dbNameMatch ? dbNameMatch[1] : "";
const isSafeDb = /dev|test|staging/i.test(dbName);

if (!isSafeDb) {
  console.error(
    `\n⛔  SEEDER BLOCKED: The database "${dbName}" does not look like a dev/test database.`.red.bold
  );
  console.error(
    `   Update MONGO_URI to point to a database with "dev", "test", or "staging" in its name.\n`.red
  );
  process.exit(1);
}

connectDB();

const importData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.insertMany(users);

    const adminUser = createdUsers[0]._id;

    const sampleProducts = products.map((products) => {
      return { ...products, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log("Data Imported!".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log("Data Destroyed".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
