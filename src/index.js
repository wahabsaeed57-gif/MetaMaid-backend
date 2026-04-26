// import connectDb from "./db/db.js";
// import { app } from "./app.js";
// import dotenv from "dotenv";

// dotenv.config();

// const PORT =  6000;

// connectDb()
//   .then(() => {
//     app.on("error", (err) => {
//       console.log("server error :", err);
//     });
//     app.listen(PORT,"0.0.0.0", () => {
//       console.log(`Server is running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.log("monogo db connection is failed ", error);
//   });
import app from "../src/app.js";
import connectDb from "../src/db/db.js";

export default async function handler(req, res) {
  try {
    console.log("Connecting to DB...");

    await connectDb(); // 🔥 IMPORTANT (await yahin lagta hai)

    console.log("DB Connected ✔");

    return app(req, res);
  } catch (error) {
    console.log("DB Connection Error:", error.message);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}