import express from "express";
import {createServer} from "node:http";
import userRoutes from "./routes/user.routes.js"

import {Server} from "socket.io";
import { connectToSocket } from "./controllers/socketManager.js";

import mongoose from "mongoose";

import cors from "cors";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended:true}));
app.use("/api/v1/users",userRoutes);



const start = async()=>{
    const connectionDb = await mongoose.connect("mongodb+srv://mkvcinema140_db_user:ritesh22@cluster0.vgg9l5b.mongodb.net/");
    console.log("Connected to mongoDb");
    server.listen((app.get("port")),()=>{
        console.log("App is listening...");
});}

start();