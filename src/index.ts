import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import ownerRoute from "./Routes/ownerRoute";
import userRouter from "./Routes/userRoutes";
import cors from "cors";
import adminRoute from './Routes/adminRoutes'
import upload from "./Middleware/uploadMulter";



const app = express();
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//owner apis
app.use("/api", userRouter);
app.use("/api/admin", adminRoute);
app.use("/api/owner", ownerRoute);

app.get("/hello", (req, res) => {
  res.json("www");
});

//owner apis
app.use("/api/admin", adminRoute);
app.use("/api/owner", ownerRoute);
// app.use("/api", userRouter);
app.get("/hello", (req, res) => {
  res.json("www");
});

// app.use('/api/owner',upload.array('image',5),ownerRoute)
// app.use('/api' , userRouter)
app.get('/hello',(req,res)=>{
  res.json("www")
})


const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
