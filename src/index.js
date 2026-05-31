import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.js";

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Sutra Backend App is Up & Listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error", error);
    process.exit(1);
  });
