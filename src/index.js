import "dotenv/config";
import expres from "express";

const app = expres();
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Sutra Backend App is Up & Listening on port ${port}`);
})
