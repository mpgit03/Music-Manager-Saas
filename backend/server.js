// 1. DNS Fix (Must stay at the top)
import dns from "node:dns/promises"
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";    
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import dotenv from "dotenv"
dotenv.config() 
import express from "express"
import { connectDB } from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import spotifyRoutes from "./routes/spotifyRoutes.js"
import notFound from "./middleware/notFound.js"
import {errorhandler} from "./middleware/errorHandler.js" 
import projectRoutes from "./routes/projectRoutes.js"
import taskRoutes from "./routes/taskRoutes.js"
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { timeStamp } from "node:console";


const app = express();
const PORT = process.env.PORT || 5000;



//  Connect to Database
connectDB();

//  Built-in Middleware
app.use(express.json());


//  security helmet ,cors and ratelimiting
app.use(morgan("dev"));
app.use(helmet());

app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}))

app.get("/", (req, res) => {
  res.json({
    message: "Project Management API",
    docs: "/api-docs"
  });
});

const limiter = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    message:"Too many requests from this IP, please try again later.",
    standardHeaders:true,
    legacyHeaders:false
});

app.use("/api",limiter);

//swagger api docs
app.use("/api-docs",swaggerUi.serve, swaggerUi.setup(swaggerSpec));


//  Routes


app.get("/health",(req,res)=>{
    res.status(201).json({
        status:"UP",
        timeStamp: new Date().toISOString(),
    });
});


app.get("/", (req, res) => {
    res.send("api running");
});

app.use("/api/admin",adminRoutes); 

//rate limiting login route
app.use("/api/auth/login",rateLimit({
    windowMs:10*60*1000,
    max: 10,
    message:"Too many login attempted . try again later",
    
}));

app.use("/api/spotify",spotifyRoutes);

app.use("/api/auth", authRoutes); // login register

app.use("/api/users",userRoutes) // user routes

app.use("/api/projects",projectRoutes); //project route and taskroutes 

app.use("/uploads",express.static("uploads"));


// 5. Error Middleware (Must be last)
app.use(notFound);      // Catches 404s
app.use(errorhandler);  // Catches actual code errors

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});