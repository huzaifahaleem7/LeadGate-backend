import mongoose from "mongoose";
import { DB_NAME, MONGO_URI } from "../constants.js";

const connection = async () => {
  try {
    const connectionInfo = await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
    console.log(
      `Mongo DB Coneect !! DB Host ${connectionInfo.connection.host}`
    );
  } catch (error) {
    console.error("MonoDb Connection Failed", error);
    process.exit(1);
  }
};

export default connection;
