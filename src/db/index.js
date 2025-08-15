import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import { MONGO_URI } from "../constants.js";

const connection = async () => {
  try {
    console.log(MONGO_URI);
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
