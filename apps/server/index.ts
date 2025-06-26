import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user-routes.js";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/v1", userRoutes);


app.listen(8080, () => {
  console.log("Server is running on port 8080");
});