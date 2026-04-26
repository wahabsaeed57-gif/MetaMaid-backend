import app from "../src/app.js";
import connectDb from "../src/db/db.js";

export default async function handler(req, res) {
  await connectDb(); // 🔥 pehle DB connect karo
  return app(req, res); // phir express run
}
