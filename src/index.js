import "dotenv/config";
import app from "./app.js";

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Sutra Backend App is Up & Listening on port ${port}`);
});
