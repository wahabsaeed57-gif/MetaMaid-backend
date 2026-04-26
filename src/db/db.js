// import mongoose from "mongoose";

// import { DB_name } from "../constant.js";

// const connectDb = async () => {
//   console.log("URI:", process.env.MONGODB_URI);

//   try {
//     const connectionInstance = await mongoose.connect(
//       `${process.env.MONGODB_URI}`,
//     );

//     console.log("MongoDB connected:", connectionInstance.connection.host);
//   } catch (error) {
//     console.log("Mongo DB connection error:", error);
//     process.exit(1);
//   }
// };
// console.log(
//   "user model is created by from user and this is the error we show ",
// );

// export default connectDb;

import mongoose from "mongoose";

let cached =
  global.mongoose || (global.mongoose = { conn: null, promise: null });

const connectDb = async () => {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGODB_URI, {
        dbName: "metamaid", // 🔥 apna database name
        bufferCommands: false,
      });
    }

    cached.conn = await cached.promise;

    console.log("MongoDB Connected:", cached.conn.connection.host);

    return cached.conn;
  } catch (error) {
    console.log("Mongo DB connection error:", error.message);
    throw error; // ❌ Vercel friendly (no process.exit)
  }
};

export default connectDb;