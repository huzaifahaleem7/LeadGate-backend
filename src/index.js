import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connection from "./db/index.js";
import { port } from "./constants.js";

// Add test route BEFORE starting the server
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "ok" });
});

// Connect to DB and start server
connection()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(`DB Connection failed: ${error}`);
  });
