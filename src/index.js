import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connection from "./db/index.js";
import { port } from "./constants.js";

connection()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(`DB Connection failed ${error}`);
  });

app.get("/ping", (req, res) => {
  res.status(200).json({ message: "ok" });
});
