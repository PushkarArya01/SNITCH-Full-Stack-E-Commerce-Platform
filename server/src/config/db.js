import dns from "dns";
import mongoose from "mongoose";
import config from "./config.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export async function connectToDB() {
    await mongoose.connect(config.MONGO_URI);

    console.log("Connected to database");
}